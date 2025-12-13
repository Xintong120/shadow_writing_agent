# config.py
# 作用：配置管理
# 功能：
#   - 读取环境变量（GROQ_API_KEY）
#   - 模型配置（model_name: llama-3.1-8b-instant）
#   - 系统参数配置

from pydantic_settings import BaseSettings
from typing import Any, List
import os
from pathlib import Path
from dotenv import load_dotenv

# 显式加载根目录的.env文件
env_path = Path(__file__).parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    print(f"[OK] 已加载配置文件: {env_path}")
else:
    print(f"[WARNING] 未找到配置文件: {env_path}")

class Settings(BaseSettings):
    # api配置
    groq_api_key: str = ""
    groq_api_keys: list[str] = []
    tavily_api_key: str = ""  # Tavily API Key
    openai_api_key: str = ""  # OpenAI API Key
    deepseek_api_key: str = ""  # DeepSeek API Key
    
    # 模型配置
    model_name: str = "llama-3.3-70b-versatile"  # 12K TPM (2倍于3.1-8b)，更强大的70B模型
    system_prompt: str = "You are a helpful assistant."
    temperature: float = 0.1
    max_tokens: int = 4096
    top_p: float = 1.0
    frequency_penalty: float = 0.0
    
    # API配置
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    
    # CORS配置
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # API轮换配置
    api_rotation_enabled: bool = False
    current_api_provider: str = "groq"
    api_providers: list[str] = ["groq", "openai", "deepseek"]
    
    # TED文件管理（缓存、删除）
    ted_cache_dir: str = "./data/ted_cache"
    auto_delete_ted_files: bool = False
    max_cache_size_mb: int = 500
    
    # 外观设置
    theme_mode: str = "light"  # light, dark, system
    font_size: str = "medium"  # small, medium, large
    
    # 学习偏好
    auto_save_progress: bool = True
    show_learning_stats: bool = True
    enable_keyboard_shortcuts: bool = True
    
    class Config:
        # .env文件在项目根目录（backend的父目录）
        env_file = "../.env"
        env_file_encoding = "utf-8"  # 文件编码
        case_sensitive = False  # 环境变量不区分大小写
        extra = "allow"  # 允许额外的环境变量（用于 GROQ_API_KEY_1, GROQ_API_KEY_2 等）

    def model_post_init(self, __context: Any) -> None:
        """初始化后自动读取多个 API Key"""
        keys = []
        
        # 方法1: 尝试读取 GROQ_API_KEYS（逗号分隔格式，推荐）
        api_keys_str = os.getenv("GROQ_API_KEYS", "")
        if api_keys_str:
            keys = [k.strip() for k in api_keys_str.split(",") if k.strip()]
            print(f"从 GROQ_API_KEYS 读取到 {len(keys)} 个 API Key")
        
        # 方法2: 尝试读取 GROQ_API_KEY_1, GROQ_API_KEY_2... 格式（向后兼容）
        if not keys:
            i = 1
            while True:
                key = os.getenv(f"GROQ_API_KEY_{i}")
                if key:
                    keys.append(key)
                    i += 1
                else:
                    break
            if keys:
                print(f"从 GROQ_API_KEY_* 读取到 {len(keys)} 个 API Key")
        
        # 方法3: 尝试读取单个 GROQ_API_KEY（向后兼容）
        if not keys and self.groq_api_key:
            keys = [self.groq_api_key]
            print("从 GROQ_API_KEY 读取到 1 个 API Key")
        
        # 设置API Keys
        if keys:
            self.groq_api_keys = keys
            # 设置默认Key（第一个）
            if not self.groq_api_key:
                self.groq_api_key = keys[0]
        else:
            print("[WARNING] 未找到任何 GROQ API Key 配置")
            print("请在 .env 文件中配置: GROQ_API_KEYS=gsk_xxxxx1,gsk_xxxxx2")

    def get_available_api_providers(self) -> List[str]:
        """获取可用的API提供商列表"""
        providers = []
        if self.groq_api_key or self.groq_api_keys:
            providers.append("groq")
        if self.openai_api_key:
            providers.append("openai")
        if self.deepseek_api_key:
            providers.append("deepseek")
        return providers

    def rotate_api_key(self) -> str:
        """轮换到下一个可用的API Key"""
        available_providers = self.get_available_api_providers()
        if not available_providers:
            return self.groq_api_key  # 返回默认key
        
        current_index = available_providers.index(self.current_api_provider) if self.current_api_provider in available_providers else -1
        next_index = (current_index + 1) % len(available_providers)
        next_provider = available_providers[next_index]
        
        self.current_api_provider = next_provider
        
        # 返回对应提供商的API key
        if next_provider == "groq":
            return self.groq_api_key
        elif next_provider == "openai":
            return self.openai_api_key
        elif next_provider == "deepseek":
            return self.deepseek_api_key
        
        return self.groq_api_key

    def get_current_api_key(self) -> str:
        """获取当前使用的API Key"""
        if self.current_api_provider == "openai":
            return self.openai_api_key
        elif self.current_api_provider == "deepseek":
            return self.deepseek_api_key
        else:
            return self.groq_api_key

settings = Settings()

# 验证配置
def validate_config():
    if not settings.groq_api_key:
        raise ValueError("GROQ_API_KEY not set")
    print(f"Using model: {settings.model_name}")
    print(f"Temperature: {settings.temperature}")
    print(f"API Rotation: {settings.api_rotation_enabled}")
    print(f"Current Provider: {settings.current_api_provider}")

# 获取设置字典（用于前端）
def get_settings_dict():
    """返回前端需要的设置字典"""
    return {
        # API配置
        "backend_api_url": f"http://{settings.api_host}:{settings.api_port}",
        "openai_api_key": settings.openai_api_key,
        "deepseek_api_key": settings.deepseek_api_key,
        "api_rotation_enabled": settings.api_rotation_enabled,
        "current_api_provider": settings.current_api_provider,
        
        # 外观设置
        "theme_mode": settings.theme_mode,
        "font_size": settings.font_size,
        
        # 学习偏好
        "auto_save_progress": settings.auto_save_progress,
        "show_learning_stats": settings.show_learning_stats,
        "enable_keyboard_shortcuts": settings.enable_keyboard_shortcuts,
        
        # LLM配置
        "model_name": settings.model_name,
        "temperature": settings.temperature,
        "max_tokens": settings.max_tokens,
        "top_p": settings.top_p,
        "frequency_penalty": settings.frequency_penalty,
        
        # 可用API提供商
        "available_providers": settings.get_available_api_providers() if settings else [],
    }

# 更新设置（从前端接收）
def update_settings(settings_dict: dict):
    """更新设置"""
    global settings
    
    for key, value in settings_dict.items():
        if hasattr(settings, key):
            setattr(settings, key, value)
        else:
            print(f"[WARNING] Unknown setting: {key}")
    
    print("Settings updated successfully")