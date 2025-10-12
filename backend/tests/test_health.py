# -*- coding: utf-8 -*-
"""测试健康检查接口"""
import requests

print("=" * 60)
print("测试：健康检查接口")
print("=" * 60)

try:
    response = requests.get('http://localhost:8000/health', timeout=5)
    
    print(f"状态码: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("\n[SUCCESS] 服务运行正常")
        print("\n配置信息:")
        print(f"  状态: {result.get('status', 'N/A')}")
        print(f"  模型: {result.get('model', 'N/A')}")
        print(f"  温度: {result.get('temperature', 'N/A')}")
    else:
        print("\n[FAIL] 服务异常")
        print(f"响应: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("\n[ERROR] 无法连接到服务器")
    print("请确认服务是否启动:")
    print("  cd backend")
    print("  python -m uvicorn app.main:app --reload")
except Exception as e:
    print(f"\n[ERROR] 发生错误: {e}")

print("\n" + "=" * 60)
