# config.py
# 作用：配置管理
# 功能：
#   - 读取环境变量（GROQ_API_KEY）
#   - 模型配置（model_name: llama-3.1-8b-instant）
#   - 系统参数配置

from pydantic_settings import BaseSettings
from typing import Optional, Any
import os

class settings(BaseSettings):
    groq_api_key: str = ""
    groq_api_keys: list[str] = []
    tavily_api_key: str = ""  # Tavily API Key
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
    # TED文件管理
    ted_cache_dir: str = "./data/ted_cache"
    auto_delete_ted_files: bool = False
    max_cache_size_mb: int = 500
    
    class Config:
        env_file = ".env"  # 自动加载.env文件
        env_file_encoding = "utf-8"  # 文件编码
        case_sensitive = False  # 环境变量不区分大小写
        extra = "allow"  # 允许额外的环境变量（用于 GROQ_API_KEY_1, GROQ_API_KEY_2 等）

    def model_post_init(self, __context: Any) -> None:
        """初始化后自动读取多个 API Key"""
        # 方法1：从环境变量读取（如果已经加载到系统环境）
        keys = []
        i = 1
        while True:
            key = os.getenv(f"GROQ_API_KEY_{i}")
            if key:
                keys.append(key)
                i += 1
            else:
                break
        
        # 方法2：从 .env 文件直接读取（如果环境变量中没有）
        if not keys:
            from pathlib import Path
            env_path = Path(__file__).parent.parent / ".env"
            if env_path.exists():
                with open(env_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        # 跳过注释和空行
                        if not line or line.startswith('#'):
                            continue
                        # 解析 KEY=VALUE 格式
                        if '=' in line:
                            key_name, value = line.split('=', 1)
                            key_name = key_name.strip()
                            value = value.strip().strip('"').strip("'")  # 去除引号
                            # 匹配 GROQ_API_KEY_1, GROQ_API_KEY_2 等
                            if key_name.startswith('GROQ_API_KEY_') and key_name[-1].isdigit():
                                keys.append(value)
        
        # 如果找到多个 Key，填充到 groq_api_keys
        if keys:
            self.groq_api_keys = keys
            # 如果 groq_api_key 为空，使用第一个 Key 作为默认值（兼容旧代码）
            if not self.groq_api_key:
                self.groq_api_key = keys[0]
            print(f"读取到 {len(keys)} 个 GROQ API Key")
        else:
            # 没有找到 GROQ_API_KEY_* 格式的配置，尝试使用单个 GROQ_API_KEY
            if self.groq_api_key:
                print(f"只找到 1 个 GROQ API Key（建议配置多个 Key 以避免速率限制）")
            else:
                print(f"未找到任何 GROQ API Key 配置")

settings = settings()

# 验证配置
def validate_config():
    if not settings.groq_api_key:
        raise ValueError("GROQ_API_KEY not set")
    print(f"Using model: {settings.model_name}")
    print(f"Temperature: {settings.temperature}")