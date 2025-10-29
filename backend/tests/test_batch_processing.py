# test_batch_processing.py
# 测试批量处理和搜索功能

import requests
import json
import time
from websocket import create_connection

BASE_URL = "http://localhost:8000"

def test_health():
    """测试健康检查"""
    print("\n[TEST 1] 测试健康检查...")
    response = requests.get(f"{BASE_URL}/health")
    assert response.status_code == 200
    data = response.json()
    print(f"   状态: {data['status']}")
    print(f"   模型: {data['model']}")
    print("   [OK] 健康检查通过")


def test_search_ted():
    """测试搜索TED演讲"""
    print("\n[TEST 2] 测试搜索TED演讲...")
    
    payload = {
        "topic": "artificial intelligence",
        "user_id": "test_user"
    }
    
    response = requests.post(
        f"{BASE_URL}/search-ted",
        json=payload
    )
    
    assert response.status_code == 200
    data = response.json()
    
    print(f"   成功: {data['success']}")
    print(f"   候选数量: {data['total']}")
    
    if data['total'] > 0:
        print("\n   前3个候选:")
        for i, candidate in enumerate(data['candidates'][:3], 1):
            print(f"   {i}. {candidate['title']}")
            print(f"      演讲者: {candidate['speaker']}")
            print(f"      URL: {candidate['url']}")
            print(f"      相关性: {candidate.get('relevance_score', 0):.2f}")
    
    print("   [OK] 搜索测试通过")
    return data['candidates']


def test_batch_process(urls):
    """测试批量处理"""
    print("\n[TEST 3] 测试批量处理...")
    
    # 只选择前2个URL（快速测试）
    test_urls = [c['url'] for c in urls[:2]]
    
    payload = {
        "urls": test_urls,
        "user_id": "test_user"
    }
    
    response = requests.post(
        f"{BASE_URL}/process-batch",
        json=payload
    )
    
    assert response.status_code == 200
    data = response.json()
    
    print(f"   成功: {data['success']}")
    print(f"   任务ID: {data['task_id']}")
    print(f"   URL数量: {data['total']}")
    print(f"   消息: {data['message']}")
    
    print("   [OK] 批量处理任务创建成功")
    return data['task_id']


def test_task_status(task_id):
    """测试任务状态查询"""
    print("\n[TEST 4] 测试任务状态查询...")
    
    response = requests.get(f"{BASE_URL}/task/{task_id}")
    
    assert response.status_code == 200
    data = response.json()
    
    print(f"   任务ID: {data['task_id']}")
    print(f"   状态: {data['status']}")
    print(f"   进度: {data['current']}/{data['total']}")
    print(f"   当前URL: {data.get('current_url', 'N/A')}")
    
    print("   [OK] 状态查询成功")
    return data


def test_websocket_progress(task_id, timeout=300):
    """测试WebSocket进度推送"""
    print("\n[TEST 5] 测试WebSocket进度推送...")
    print(f"   连接到: ws://localhost:8000/ws/progress/{task_id}")
    
    try:
        ws = create_connection(f"ws://localhost:8000/ws/progress/{task_id}")
        print("   [OK] WebSocket连接成功")
        
        start_time = time.time()
        message_count = 0
        
        while True:
            # 检查超时
            if time.time() - start_time > timeout:
                print(f"   ⏱️ 超时 ({timeout}秒)")
                break
            
            # 接收消息
            try:
                result = ws.recv()
                data = json.loads(result)
                message_count += 1
                
                msg_type = data.get('type')
                print(f"\n   [{message_count}] 收到消息: {msg_type}")
                
                if msg_type == 'connected':
                    print(f"       消息: {data.get('message')}")
                
                elif msg_type == 'started':
                    print(f"       总数: {data.get('total')}")
                    print(f"       消息: {data.get('message')}")
                
                elif msg_type == 'progress':
                    print(f"       进度: {data.get('current')}/{data.get('total')}")
                    print(f"       URL: {data.get('url')}")
                
                elif msg_type == 'step':
                    print(f"       步骤: {data.get('step')}")
                    print(f"       消息: {data.get('message')}")
                
                elif msg_type == 'url_completed':
                    print(f"       完成URL: {data.get('url')}")
                    print(f"       结果数: {data.get('result_count')}")
                
                elif msg_type == 'error':
                    print(f"       [ERROR] 错误: {data.get('error')}")
                
                elif msg_type == 'completed':
                    print("       [OK] 全部完成!")
                    print(f"       成功: {data.get('successful')}/{data.get('total')}")
                    print(f"       失败: {data.get('failed')}")
                    break
                
                elif msg_type == 'task_completed':
                    print("       [OK] 任务完成!")
                    break
                
            except Exception as e:
                print(f"   接收消息错误: {e}")
                break
        
        ws.close()
        print(f"\n   [OK] WebSocket测试完成 (共{message_count}条消息)")
        
    except Exception as e:
        print(f"   [ERROR] WebSocket错误: {e}")
        raise


def run_all_tests():
    """运行所有测试"""
    print("="*60)
    print("Shadow Writing Agent - 批量处理测试套件")
    print("="*60)
    
    try:
        # 测试1: 健康检查
        test_health()
        
        # 测试2: 搜索TED
        candidates = test_search_ted()
        
        if not candidates:
            print("\n[WARNING] 未找到候选，跳过后续测试")
            return
        
        # 测试3: 批量处理
        task_id = test_batch_process(candidates)
        
        # 等待1秒
        time.sleep(1)
        
        # 测试4: 查询任务状态
        test_task_status(task_id)
        
        # 测试5: WebSocket进度（会等待任务完成）
        test_websocket_progress(task_id)
        
        # 最终状态
        print("\n[FINAL] 检查最终状态...")
        final_status = test_task_status(task_id)
        
        print("\n" + "="*60)
        print("[OK] 所有测试通过!")
        print("="*60)
        print("\n最终结果:")
        print(f"  - 成功处理: {len(final_status['results'])} 个URL")
        print(f"  - 错误数量: {len(final_status['errors'])}")
        
        if final_status['results']:
            print("\n第一个结果预览:")
            first_result = final_status['results'][0]
            print(f"  URL: {first_result['url']}")
            print(f"  TED标题: {first_result['ted_info']['title']}")
            print(f"  演讲者: {first_result['ted_info']['speaker']}")
            print(f"  Shadow Writing数量: {first_result['result_count']}")
        
    except AssertionError as e:
        print(f"\n[ERROR] 测试失败: {e}")
        raise
    except Exception as e:
        print(f"\n[ERROR] 错误: {e}")
        raise


if __name__ == "__main__":
    print("\n确保后端服务已启动:")
    print("  uvicorn app.main:app --reload --port 8000\n")
    
    input("按Enter开始测试...")
    
    run_all_tests()
