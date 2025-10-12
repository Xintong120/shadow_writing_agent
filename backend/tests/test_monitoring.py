#!/usr/bin/env python3
"""
API Key监控系统测试脚本
"""

import requests
from datetime import datetime

BASE_URL = "http://localhost:8000"


def print_section(title):
    """打印分隔线"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def test_monitoring_summary():
    """测试监控总览"""
    print_section("1. 监控总览")
    
    try:
        response = requests.get(f"{BASE_URL}/monitoring/summary")
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] 总Key数量: {data['total_keys']}")
            print(f"[OK] 活跃Key数量: {data['active_keys']}")
            print(f"[OK] 冷却中Key数量: {data['cooling_keys']}")
            print(f"[OK] 失效Key数量: {data['invalid_keys']}")
            print(f"[OK] 总调用次数: {data['total_calls']}")
            print(f"[OK] 总成功次数: {data['total_successes']}")
            print(f"[OK] 总失败次数: {data['total_failures']}")
            print(f"[OK] 平均成功率: {data['avg_success_rate']:.2f}%")
            print(f"[OK] 运行时长: {data['uptime_seconds']:.2f}秒")
        else:
            print(f"[ERROR] 请求失败: {response.status_code}")
    except Exception as e:
        print(f"[ERROR] 错误: {e}")


def test_all_keys():
    """测试所有Key统计"""
    print_section("2. 所有Key统计")
    
    try:
        response = requests.get(f"{BASE_URL}/monitoring/keys")
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] 获取到 {len(data)} 个Key的统计数据\n")
            
            # 显示前5个Key
            for i, (key_id, stats) in enumerate(list(data.items())[:5]):
                print(f"  [{key_id}] (后缀: ...{stats['key_suffix']})")
                print(f"    - 总调用: {stats['total_calls']}")
                print(f"    - 成功率: {stats['successful_calls']}/{stats['total_calls']} ({stats['total_calls'] and stats['successful_calls']/stats['total_calls']*100:.1f}%)")
                print(f"    - 失败次数: {stats['failed_calls']}")
                print(f"    - 速率限制: {stats['rate_limit_hits']}")
                print(f"    - 平均响应时间: {stats['avg_response_time']:.3f}秒")
                print(f"    - 是否有效: {'[OK]' if stats['is_valid'] else '[ERROR]'}")
                print(f"    - 是否冷却: {'🧊' if stats['is_cooling'] else '🔥'}")
                print()
            
            if len(data) > 5:
                print(f"  ... 还有 {len(data) - 5} 个Key")
        else:
            print(f"[ERROR] 请求失败: {response.status_code}")
    except Exception as e:
        print(f"[ERROR] 错误: {e}")


def test_single_key(key_id="KEY_1"):
    """测试单个Key统计"""
    print_section(f"3. 单个Key统计 ({key_id})")
    
    try:
        response = requests.get(f"{BASE_URL}/monitoring/keys/{key_id}")
        if response.status_code == 200:
            stats = response.json()
            print(f"[OK] Key ID: {stats['key_id']}")
            print(f"[OK] 后缀: ...{stats['key_suffix']}")
            print(f"[OK] 总调用: {stats['total_calls']}")
            print(f"[OK] 成功: {stats['successful_calls']}")
            print(f"[OK] 失败: {stats['failed_calls']}")
            print(f"[OK] 成功率: {stats['total_calls'] and stats['successful_calls']/stats['total_calls']*100:.2f}%")
            print(f"[OK] 速率限制: {stats['rate_limit_hits']}")
            print(f"[OK] 平均响应时间: {stats['avg_response_time']:.3f}秒")
            print(f"[OK] 是否有效: {stats['is_valid']}")
            print(f"[OK] 是否冷却: {stats['is_cooling']}")
            if stats['last_used_at']:
                print(f"[OK] 最后使用: {stats['last_used_at']}")
        else:
            print(f"[ERROR] 请求失败: {response.status_code}")
            print(f"   {response.text}")
    except Exception as e:
        print(f"[ERROR] 错误: {e}")


def test_top_keys():
    """测试TOP Keys"""
    print_section("4. TOP 5 Keys (按使用次数)")
    
    try:
        response = requests.get(f"{BASE_URL}/monitoring/keys/top/usage?limit=5")
        if response.status_code == 200:
            data = response.json()
            for i, stats in enumerate(data, 1):
                print(f"  #{i} {stats['key_id']} (后缀: ...{stats['key_suffix']})")
                print(f"      调用次数: {stats['total_calls']}, 成功率: {stats['total_calls'] and stats['successful_calls']/stats['total_calls']*100:.1f}%")
        else:
            print(f"[ERROR] 请求失败: {response.status_code}")
    except Exception as e:
        print(f"[ERROR] 错误: {e}")


def test_healthy_keys():
    """测试健康Keys"""
    print_section("5. 健康的Keys")
    
    try:
        response = requests.get(f"{BASE_URL}/monitoring/keys/healthy")
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] 健康Key数量: {len(data)}")
            for key_id, stats in list(data.items())[:5]:
                print(f"  - {key_id} (后缀: ...{stats['key_suffix']}): 调用{stats['total_calls']}次")
        else:
            print(f"[ERROR] 请求失败: {response.status_code}")
    except Exception as e:
        print(f"[ERROR] 错误: {e}")


def test_invalid_keys():
    """测试失效Keys"""
    print_section("6. 失效的Keys")
    
    try:
        response = requests.get(f"{BASE_URL}/monitoring/keys/invalid")
        if response.status_code == 200:
            data = response.json()
            if len(data) > 0:
                print(f"[WARNING] 失效Key数量: {len(data)}")
                for key_id, stats in data.items():
                    print(f"  - {key_id} (后缀: ...{stats['key_suffix']})")
                    print(f"    失效原因: {stats['invalidation_reason']}")
                    print(f"    失效时间: {stats['invalidated_at']}")
            else:
                print("[OK] 没有失效的Key")
        else:
            print(f"[ERROR] 请求失败: {response.status_code}")
    except Exception as e:
        print(f"[ERROR] 错误: {e}")


def test_health_check():
    """测试健康检查"""
    print_section("7. 健康检查")
    
    try:
        response = requests.get(f"{BASE_URL}/monitoring/health")
        if response.status_code == 200:
            data = response.json()
            print(f"[OK] 状态: {data['status']}")
            print(f"[OK] 总Key数: {data['total_keys']}")
            print(f"[OK] 活跃Key数: {data['active_keys']}")
            print(f"[OK] 失效Key数: {data['invalid_keys']}")
            print(f"[OK] 运行时长: {data['uptime_seconds']:.2f}秒")
        else:
            print(f"[ERROR] 请求失败: {response.status_code}")
    except Exception as e:
        print(f"[ERROR] 错误: {e}")


def main():
    """主函数"""
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║" + " " * 10 + "API Key 监控系统测试" + " " * 28 + "║")
    print("╚" + "=" * 58 + "╝")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"API地址: {BASE_URL}")
    
    # 运行所有测试
    test_monitoring_summary()
    test_all_keys()
    test_single_key("KEY_1")
    test_top_keys()
    test_healthy_keys()
    test_invalid_keys()
    test_health_check()
    
    print_section("测试完成")
    print("[OK] 所有测试已执行完毕！")
    print()


if __name__ == "__main__":
    main()
