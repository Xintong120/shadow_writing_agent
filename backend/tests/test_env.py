"""测试.env文件加载"""
import os
from pathlib import Path
from dotenv import load_dotenv

# 显示当前工作目录
print(f"当前目录: {os.getcwd()}")

# 计算.env路径
env_path = Path(__file__).parent.parent / ".env"
print(f"\n.env路径: {env_path}")
print(f".env存在: {env_path.exists()}")

# 加载.env
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    print("\n[OK] 已加载.env文件")
    
    # 测试读取
    print("\n读取环境变量:")
    for i in range(1, 8):
        key_name = f"GROQ_API_KEY_{i}"
        value = os.getenv(key_name)
        if value:
            print(f"  {key_name} = {value[:20]}...")
        else:
            print(f"  {key_name} = (未找到)")
    
    # 读取GROQ_API_KEYS
    api_keys = os.getenv("GROQ_API_KEYS")
    if api_keys:
        print(f"\n  GROQ_API_KEYS = {api_keys[:30]}...")
    else:
        print("\n  GROQ_API_KEYS = (未找到)")
else:
    print("\n[ERROR] .env文件不存在")
    print("\n请确认文件路径:")
    print(f"  预期位置: {env_path}")
    print("  实际位置: D:\\转码\\AI-all\\shadow_writing_agent\\.env")
