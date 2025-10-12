#!/usr/bin/env python3
"""测试并行工作流性能"""

import requests
import time

def test_parallel_workflow():
    """测试并行Shadow Writing工作流"""
    
    print("=" * 60)
    print("测试并行Shadow Writing工作流")
    print("=" * 60)
    
    # 测试URL（较短的演讲，便于快速测试）
    test_url = "https://www.ted.com/talks/tristan_harris_why_ai_is_our_ultimate_test_and_greatest_invitation"
    
    payload = {
        "urls": [test_url]
    }
    
    print(f"\n[INFO] 测试URL: {test_url}")
    print(f"[TIME] 开始时间: {time.strftime('%H:%M:%S')}")
    print("\n处理中...\n")
    
    start_time = time.time()
    
    try:
        response = requests.post(
            "http://localhost:8000/process-batch",
            json=payload,
            timeout=600  # 10分钟超时
        )
        
        elapsed_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            task_id = result.get("task_id", "")
            
            print("[OK] 批处理任务已创建")
            print(f"[INFO] 任务ID: {task_id}")
            print(f"[TIME] 耗时: {elapsed_time:.2f} 秒")
            
            # 查询任务结果
            print("\n查询任务结果...")
            time.sleep(2)  # 等待处理
            
            result_response = requests.get(f"http://localhost:8000/task/{task_id}")
            if result_response.status_code == 200:
                task_result = result_response.json()
                print(f"\n任务状态: {task_result.get('status', 'unknown')}")
                print(f"处理进度: {task_result.get('current', 0)}/{task_result.get('total', 0)}")
                
                results = task_result.get('results', [])
                if results:
                    print(f"\n[OK] 成功生成 {len(results)} 个Shadow Writing结果")
                    if results[0].get('results'):
                        print(f"   第一个URL的结果数: {results[0].get('result_count', 0)}")
        else:
            print(f"[ERROR] 错误: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.Timeout:
        print("[TIMEOUT] 超时 (>10分钟)")
    except Exception as e:
        print(f"[ERROR] 错误: {e}")
    
    print("\n" + "=" * 60)
    print(f"总耗时: {time.time() - start_time:.2f} 秒")
    print("=" * 60)


if __name__ == "__main__":
    test_parallel_workflow()
