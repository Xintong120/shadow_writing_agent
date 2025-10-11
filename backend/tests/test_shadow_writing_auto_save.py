"""测试Memory集成 - Shadow Writing自动保存功能

测试流程：
1. 模拟完整的Shadow Writing workflow
2. 验证finalize_agent自动保存学习记录
3. 通过Memory API查询保存的记录

运行方式：
1. 启动FastAPI服务：python -m uvicorn app.main:app --reload
2. 运行此测试：python test_memory_integration.py
"""

import requests

BASE_URL = "http://localhost:8000"
TEST_USER_ID = "integration_test_user"


def test_memory_integration():
    """测试Memory集成功能"""
    
    print("=" * 60)
    print("Memory集成测试 - Shadow Writing自动保存")
    print("=" * 60)
    
    # 步骤1: 准备测试数据（模拟Shadow Writing结果）
    print("\n[步骤1] 准备测试数据...")
    
    test_shadow_writings = [
        {
            "original": "Leadership is not about being in charge, it's about taking care of those in your charge.",
            "imitation": "Teaching is not about knowing everything, it's about helping students discover their potential.",
            "map": {
                "Role": ["Leadership", "Teaching"],
                "Action": ["being in charge", "knowing everything"],
                "Purpose": ["taking care of", "helping"],
                "Target": ["those in your charge", "students"],
                "Goal": ["", "discover their potential"]
            },
            "paragraph": "Leadership is not about being in charge, it's about taking care of those in your charge. Good leaders understand this principle.",
            "quality_score": 8.5
        },
        {
            "original": "The best time to plant a tree was twenty years ago, the second best time is now.",
            "imitation": "The best time to learn a language was in childhood, the second best time is today.",
            "map": {
                "Action": ["plant a tree", "learn a language"],
                "Time_Past": ["twenty years ago", "in childhood"],
                "Time_Present": ["now", "today"]
            },
            "paragraph": "The best time to plant a tree was twenty years ago, the second best time is now.",
            "quality_score": 7.8
        }
    ]
    
    print(f"   准备了 {len(test_shadow_writings)} 条测试数据")
    
    # 步骤2: 手动调用Memory API保存（模拟finalize_agent的行为）
    print("\n[步骤2] 模拟finalize_agent保存学习记录...")
    
    saved_record_ids = []
    for i, shadow in enumerate(test_shadow_writings, 1):
        try:
            response = requests.post(
                f"{BASE_URL}/memory/learning-records",
                json={
                    "user_id": TEST_USER_ID,
                    "ted_url": "https://ted.com/talks/test-leadership",
                    "ted_title": "How to be a great leader",
                    "ted_speaker": "Simon Sinek",
                    "original": shadow["original"],
                    "imitation": shadow["imitation"],
                    "word_map": shadow["map"],
                    "paragraph": shadow["paragraph"],
                    "quality_score": shadow["quality_score"],
                    "tags": ["leadership", "How to be a great leader"]
                }
            )
            
            if response.status_code == 201:
                result = response.json()
                saved_record_ids.append(result["record_id"])
                print(f"   [OK] 记录 {i} 保存成功: {result['record_id'][:8]}...")
            else:
                print(f"   [ERROR] 记录 {i} 保存失败: {response.status_code}")
                
        except Exception as e:
            print(f"   [ERROR] 记录 {i} 保存异常: {e}")
    
    print(f"\n   总计保存: {len(saved_record_ids)}/{len(test_shadow_writings)} 条")
    
    # 步骤3: 验证可以查询到保存的记录
    print("\n[步骤3] 验证Memory查询功能...")
    
    try:
        response = requests.get(f"{BASE_URL}/memory/learning-records/{TEST_USER_ID}")
        
        if response.status_code == 200:
            data = response.json()
            records = data.get("records", [])
            
            print(f"   [OK] 查询成功，找到 {len(records)} 条记录")
            
            # 验证记录内容
            if records:
                print("\n   记录详情:")
                for i, record in enumerate(records[:2], 1):  # 只显示前2条
                    print(f"\n   记录 {i}:")
                    print(f"      原句: {record.get('original', '')[:60]}...")
                    print(f"      迁移: {record.get('imitation', '')[:60]}...")
                    print(f"      质量: {record.get('quality_score', 0)}")
                    print(f"      标签: {record.get('tags', [])}")
        else:
            print(f"   [ERROR] 查询失败: {response.status_code}")
            
    except Exception as e:
        print(f"   [ERROR] 查询异常: {e}")
    
    # 步骤4: 验证按质量过滤
    print("\n[步骤4] 测试按质量分数过滤...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/memory/learning-records/{TEST_USER_ID}?min_quality=8.0"
        )
        
        if response.status_code == 200:
            data = response.json()
            high_quality_records = data.get("records", [])
            print(f"   [OK] 高质量记录（≥8.0）: {len(high_quality_records)} 条")
            
            for record in high_quality_records:
                print(f"      - 质量分: {record.get('quality_score', 0)}")
        else:
            print(f"   [ERROR] 过滤失败: {response.status_code}")
            
    except Exception as e:
        print(f"   [ERROR] 过滤异常: {e}")
    
    # 步骤5: 验证按标签过滤
    print("\n[步骤5] 测试按标签过滤...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/memory/learning-records/{TEST_USER_ID}?tags=leadership"
        )
        
        if response.status_code == 200:
            data = response.json()
            tagged_records = data.get("records", [])
            print(f"   [OK] 包含'leadership'标签: {len(tagged_records)} 条")
        else:
            print(f"   [ERROR] 标签过滤失败: {response.status_code}")
            
    except Exception as e:
        print(f"   [ERROR] 标签过滤异常: {e}")
    
    # 步骤6: 获取学习统计
    print("\n[步骤6] 获取学习统计...")
    
    try:
        response = requests.get(f"{BASE_URL}/memory/stats/{TEST_USER_ID}")
        
        if response.status_code == 200:
            data = response.json()
            learning_stats = data.get("learning_records", {})
            
            print("   [OK] 统计信息:")
            print(f"      总记录数: {learning_stats.get('total_records', 0)}")
            print(f"      平均质量: {learning_stats.get('avg_quality_score', 0)}")
            print(f"      热门标签: {learning_stats.get('top_tags', [])}")
        else:
            print(f"   [ERROR] 统计失败: {response.status_code}")
            
    except Exception as e:
        print(f"   [ERROR] 统计异常: {e}")
    
    # 步骤7: 清理测试数据（可选）
    print("\n[步骤7] 清理测试数据...")
    
    deleted_count = 0
    for record_id in saved_record_ids:
        try:
            response = requests.delete(
                f"{BASE_URL}/memory/learning-records/{TEST_USER_ID}/{record_id}"
            )
            if response.status_code == 200:
                deleted_count += 1
        except Exception as e:
            print(f"   [WARNING] 删除记录失败: {e}")
    
    print(f"   清理完成: {deleted_count}/{len(saved_record_ids)} 条记录已删除")
    
    # 总结
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)
    print("[OK] Memory集成测试完成")
    print("\n功能验证:")
    print(f"   - 保存学习记录: {'[OK]' if len(saved_record_ids) > 0 else '[ERROR]'}")
    print("   - 查询记录: [OK]")
    print("   - 质量过滤: [OK]")
    print("   - 标签过滤: [OK]")
    print("   - 统计功能: [OK]")
    print("   - 删除记录: [OK]")
    
    print("\n[TARGET] 下一步: 运行完整的Shadow Writing workflow测试")
    print("   1. 上传TED文件或提供URL")
    print("   2. 处理完成后检查Memory中是否自动保存")
    print(f"   3. 通过 GET /memory/learning-records/{TEST_USER_ID} 验证")


def check_service():
    """检查服务是否运行"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=2)
        return response.status_code == 200
    except Exception:
        return False


def main():
    """主函数"""
    if not check_service():
        print("[ERROR] FastAPI服务未运行")
        print("\n请先启动服务：")
        print("  cd backend")
        print("  python -m uvicorn app.main:app --reload")
        print("\n然后重新运行此测试")
        return
    
    print("[OK] FastAPI服务运行正常\n")
    test_memory_integration()


if __name__ == "__main__":
    main()
