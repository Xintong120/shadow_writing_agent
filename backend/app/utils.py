from litellm import completion
from app.config import settings
import json
import time
from collections import deque
from typing import Callable, Optional, Dict, Any

def ensure_dependencies():
    """检查 API key 是否配置"""
    if not settings.groq_api_key:
        raise ValueError("GROQ_API_KEY not set")
    print("Groq API already configured")


# ==================== API Key 管理器 ====================

class APIKeyManager:
    """API Key 轮换管理器
    
    功能：
    - 管理多个 API Key 的轮询使用
    - 检测速率限制错误并自动切换
    - 对达到限制的 Key 设置冷却时间
    """
    
    def __init__(self, keys: list[str], cooldown_seconds: int = 60):
        """初始化 API Key 管理器
        
        Args:
            keys: API Key 列表
            cooldown_seconds: 冷却时间（秒），默认60秒
        """
        if not keys:
            raise ValueError("至少需要提供一个 API Key")
        
        self.keys = deque(keys)  # 使用双端队列便于轮询
        self.cooldown_seconds = cooldown_seconds
        self.key_failures = {key: 0 for key in keys}  # 记录每个 Key 的失败次数
        self.key_cooldown = {}  # 记录每个 Key 的冷却结束时间戳
        self.total_calls = 0  # 总调用次数
        self.total_switches = 0  # 总切换次数
        
        print(f"API Key 管理器初始化: {len(keys)} 个 Key, 冷却时间 {cooldown_seconds}秒")
    
    def get_key(self) -> str:
        """获取当前可用的 Key
        
        Returns:
            str: 当前可用的 API Key
        """
        current_time = time.time()
        
        # 尝试找到一个不在冷却期的 Key
        for _ in range(len(self.keys)):
            key = self.keys[0]
            cooldown_until = self.key_cooldown.get(key, 0)
            
            if current_time >= cooldown_until:
                # 找到可用的 Key
                return key
            
            # 当前 Key 还在冷却，尝试下一个
            remaining_time = int(cooldown_until - current_time)
            print(f"Key ***{key[-8:]} 冷却中，剩余 {remaining_time}秒")
            self.keys.rotate(-1)
        
        # 所有 Key 都在冷却，返回第一个并等待
        key = self.keys[0]
        cooldown_until = self.key_cooldown.get(key, 0)
        wait_time = max(0, cooldown_until - current_time)
        
        if wait_time > 0:
            print(f"所有 Key 都在冷却中，等待 {int(wait_time)}秒...")
            time.sleep(wait_time)
        
        return key
    
    def rotate_key(self):
        """切换到下一个 Key"""
        self.keys.rotate(-1)
        self.total_switches += 1
        new_key = self.keys[0]
        print(f"切换到下一个 API Key: ***{new_key[-8:]}")
    
    def mark_failure(self, key: str, error_message: str):
        """标记 Key 失败并处理
        
        Args:
            key: 失败的 API Key
            error_message: 错误信息
        """
        self.key_failures[key] = self.key_failures.get(key, 0) + 1
        
        # 检查是否是速率限制错误
        error_lower = error_message.lower()
        is_rate_limit = any(keyword in error_lower for keyword in [
            'rate', 'limit', 'quota', 'exceeded', 'too many'
        ])
        
        if is_rate_limit:
            # 设置冷却时间
            cooldown_until = time.time() + self.cooldown_seconds
            self.key_cooldown[key] = cooldown_until
            
            print(f" Key ***{key[-8:]} 达到速率限制，冷却 {self.cooldown_seconds}秒")
            print(f"失败次数: {self.key_failures[key]}")
            
            # 切换到下一个 Key
            self.rotate_key()
        else:
            print(f" Key ***{key[-8:]} 调用失败（非速率限制）: {error_message[:100]}")
    
    def get_stats(self) -> dict:
        """获取统计信息
        
        Returns:
            dict: 包含总调用次数、切换次数、失败次数等信息
        """
        return {
            'total_keys': len(self.keys),
            'total_calls': self.total_calls,
            'total_switches': self.total_switches,
            'key_failures': dict(self.key_failures),
            'active_key': f"***{self.keys[0][-8:]}"
        }


# 全局 API Key 管理器实例
api_key_manager: Optional[APIKeyManager] = None


def initialize_key_manager(cooldown_seconds: int = 60):
    """初始化 API Key 管理器
    
    Args:
        cooldown_seconds: 冷却时间（秒）
    """
    global api_key_manager
    
    if settings.groq_api_keys and len(settings.groq_api_keys) > 1:
        api_key_manager = APIKeyManager(settings.groq_api_keys, cooldown_seconds)
        print(f"多 Key 轮换已启用")
    else:
        api_key_manager = None
        if settings.groq_api_key:
            print(f"只有 1 个 API Key，未启用轮换（建议配置多个 Key）")
        else:
            print(f"未配置 API Key")


# ==================== LLM 调用函数 ====================

def create_llm_function(system_prompt: Optional[str] = None) -> Callable:
    """创建 LLM 调用函数
    
    Args:
        system_prompt: 系统提示词（可选）
        
    Returns:
        callable: LLM 调用函数
    """
    
    def call_llm(user_prompt: str, output_format: Optional[Dict] = None, temperature: Optional[float] = None, _retry_count: int = 0) -> Any:
        """调用 LLM（支持自动 Key 切换）
        
        Args:
            user_prompt: 用户提示词
            output_format: 输出格式字典（如果指定，则返回 JSON）
            temperature: 温度参数（可选）
            _retry_count: 重试计数（内部使用）
            
        Returns:
            str or dict: LLM 响应内容
        """
        # 获取当前可用的 API Key
        if api_key_manager:
            current_key = api_key_manager.get_key()
            api_key_manager.total_calls += 1
        else:
            current_key = settings.groq_api_key
        
        try:
            # 构建消息列表
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": user_prompt})
            
            # 调用参数
            kwargs = {
                "model": f"groq/{settings.model_name}",
                "messages": messages,
                "temperature": temperature if temperature is not None else settings.temperature,
                "api_key": current_key,  # 使用当前 Key
            }
            
            # 如果需要 JSON 输出
            if output_format:
                kwargs["response_format"] = {"type": "json_object"}
            
            # 调用 LiteLLM
            response = completion(**kwargs)
            content = response.choices[0].message.content
            
            # 解析 JSON
            if output_format:
                return json.loads(content)
            
            return content
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing failed: {e}")
            return None
            
        except Exception as e:
            error_msg = str(e)
            
            # 检测是否是速率限制错误
            is_rate_limit = any(keyword in error_msg.lower() for keyword in [
                'rate', 'limit', 'quota', 'exceeded', 'too many'
            ])
            
            if is_rate_limit and api_key_manager:
                # 标记当前 Key 失败
                api_key_manager.mark_failure(current_key, error_msg)
                
                # 限制重试次数（最多重试 Key 数量次）
                max_retries = len(api_key_manager.keys)
                if _retry_count < max_retries:
                    print(f"🔄 重试中... ({_retry_count + 1}/{max_retries})")
                    # 递归重试（会自动使用下一个 Key）
                    return call_llm(user_prompt, output_format, temperature, _retry_count + 1)
                else:
                    print(f"❌ 所有 API Key 都已尝试，仍然失败")
                    return None
            else:
                # 非速率限制错误或没有管理器
                print(f"LLM call failed: {e}")
                return None
    
    return call_llm


def create_llm_function_native() -> Callable:
    """创建原生 LLM 函数（兼容旧代码）
    
    Returns:
        callable: LLM 调用函数
    """
    return create_llm_function(system_prompt=settings.system_prompt)