"""测试Memory API接口

运行方式：
1. 启动FastAPI服务：python -m uvicorn app.main:app --reload
2. 运行此测试脚本：python test_memory_api.py
"""

import requests
import json

BASE_URL = "http://localhost:8000"
USER_ID = "test_user_001"


def test_add_learning_record():
    """测试添加学习记录"""
    print("\n=== 测试1: 添加学习记录 ===")
    
    url = f"{BASE_URL}/memory/learning-records"
    data = {
        "user_id": USER_ID,
        "ted_url": "https://ted.com/talks/test-leadership",
        "ted_title": "How to be a great leader",
        "ted_speaker": "Simon Sinek",
        "original": "leadership is about service",
        "imitation": "true leadership means serving others",
        "word_map": {
            "noun": ["leadership", "service"],
            "verb": ["be", "serve"]
        },
        "paragraph": "Leadership is not about being in charge. Leadership is about taking care of those in your charge.",
        "quality_score": 8.5,
        "tags": ["leadership", "management"]
    }
    
    response = requests.post(url, json=data)
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    
    return response.status_code == 201


def test_get_learning_records():
    """测试获取学习记录"""
    print("\n=== 测试2: 获取学习记录 ===")
    
    url = f"{BASE_URL}/memory/learning-records/{USER_ID}"
    response = requests.get(url)
    print(f"状态码: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"总记录数: {data['total']}")
        print(f"记录数量: {len(data['records'])}")
        if data['records']:
            print(f"第一条记录: {json.dumps(data['records'][0], indent=2, ensure_ascii=False)}")
    
    return response.status_code == 200


def test_get_learning_stats():
    """测试获取学习统计"""
    print("\n=== 测试3: 获取学习统计 ===")
    
    url = f"{BASE_URL}/memory/stats/{USER_ID}"
    response = requests.get(url)
    print(f"状态码: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"统计数据: {json.dumps(data, indent=2, ensure_ascii=False)}")
    
    return response.status_code == 200


def test_get_user_summary():
    """测试获取用户总览"""
    print("\n=== 测试4: 获取用户总览 ===")
    
    url = f"{BASE_URL}/memory/summary/{USER_ID}"
    response = requests.get(url)
    print(f"状态码: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"用户总览: {json.dumps(data, indent=2, ensure_ascii=False)}")
    
    return response.status_code == 200


def test_filter_by_quality():
    """测试按质量分数过滤"""
    print("\n=== 测试5: 按质量分数过滤 (>= 8.0) ===")
    
    url = f"{BASE_URL}/memory/learning-records/{USER_ID}?min_quality=8.0"
    response = requests.get(url)
    print(f"状态码: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"高质量记录数: {data['total']}")
    
    return response.status_code == 200


def test_filter_by_tags():
    """测试按标签过滤"""
    print("\n=== 测试6: 按标签过滤 (leadership) ===")
    
    url = f"{BASE_URL}/memory/learning-records/{USER_ID}?tags=leadership"
    response = requests.get(url)
    print(f"状态码: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"匹配标签的记录数: {data['total']}")
    
    return response.status_code == 200


def test_api_docs():
    """测试API文档是否可访问"""
    print("\n=== 测试7: 检查API文档 ===")
    
    url = f"{BASE_URL}/docs"
    response = requests.get(url)
    print(f"状态码: {response.status_code}")
    
    if response.status_code == 200:
        print("[OK] API文档可访问: http://localhost:8000/docs")
        print("   请在浏览器中打开查看Memory相关的8个端点")
    
    return response.status_code == 200


def main():
    """运行所有测试"""
    print("=" * 60)
    print("Memory API 测试")
    print("=" * 60)
    
    try:
        # 检查服务是否运行
        health_url = f"{BASE_URL}/health"
        health_response = requests.get(health_url, timeout=2)
        if health_response.status_code != 200:
            print("[ERROR] FastAPI服务未运行或不健康")
            print("请先启动服务：python -m uvicorn app.main:app --reload")
            return
        
        print("[OK] FastAPI服务运行正常")
        
        # 运行测试
        tests = [
            ("添加学习记录", test_add_learning_record),
            ("获取学习记录", test_get_learning_records),
            ("获取学习统计", test_get_learning_stats),
            ("获取用户总览", test_get_user_summary),
            ("按质量过滤", test_filter_by_quality),
            ("按标签过滤", test_filter_by_tags),
            ("API文档", test_api_docs),
        ]
        
        results = []
        for name, test_func in tests:
            try:
                success = test_func()
                results.append((name, success))
            except Exception as e:
                print(f"[ERROR] 测试失败: {e}")
                results.append((name, False))
        
        # 汇总结果
        print("\n" + "=" * 60)
        print("测试结果汇总")
        print("=" * 60)
        
        passed = sum(1 for _, success in results if success)
        total = len(results)
        
        for name, success in results:
            status = "[OK] 通过" if success else "[ERROR] 失败"
            print(f"{status}: {name}")
        
        print(f"\n总计: {passed}/{total} 测试通过")
        
        if passed == total:
            print("\n🎉 所有测试通过！Memory API已准备就绪")
        else:
            print("\n[WARNING] 部分测试失败，请检查错误信息")
    
    except requests.exceptions.ConnectionError:
        print("[ERROR] 无法连接到FastAPI服务")
        print("请先启动服务：")
        print("  cd backend")
        print("  python -m uvicorn app.main:app --reload")
    except Exception as e:
        print(f"[ERROR] 测试过程中发生错误: {e}")


if __name__ == "__main__":
    main()
