"""Learning Records Memory测试"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.memory import MemoryService
from langgraph.store.memory import InMemoryStore

def test_add_learning_record():
    """测试添加学习记录"""
    print("\n=== 测试1: 添加学习记录 ===")
    
    store = InMemoryStore()
    memory_service = MemoryService(store=store)
    user_id = "test_user_learning"
    
    # 添加单条记录（两级标签）
    record_id = memory_service.add_learning_record(
        user_id=user_id,
        ted_url="https://ted.com/talks/test",
        ted_title="Test Talk",
        ted_speaker="Speaker",
        original="Every morning, I wake up with a purpose.",
        imitation="Every evening, I reflect on my achievements.",
        word_map={
            "Time": ["morning", "evening"],
            "Action": ["wake up", "reflect"],
            "Focus": ["purpose", "achievements"]
        },
        paragraph="Original paragraph text...",
        quality_score=7.5,
        tags=["leadership", "Test Talk"]  # 一级：主题，二级：TED标题
    )
    
    print(f"记录ID: {record_id}")
    
    # 验证记录
    record = memory_service.get_learning_record_by_id(user_id, record_id)
    print(f"记录内容: {record}")
    
    assert record is not None
    assert record["original"] == "Every morning, I wake up with a purpose."
    assert record["quality_score"] == 7.5
    assert "leadership" in record["tags"]
    assert "Test Talk" in record["tags"]
    
    print("[PASS] 添加学习记录测试通过")

def test_batch_add_learning_records():
    """测试批量添加学习记录"""
    print("\n=== 测试2: 批量添加学习记录 ===")
    
    store = InMemoryStore()
    memory_service = MemoryService(store=store)
    user_id = "test_user_batch"
    
    # 准备批量数据
    shadow_writings = [
        {
            "original": "Leadership is about empowering others.",
            "imitation": "Management is about organizing teams.",
            "map": {"Concept": ["Leadership", "Management"]},
            "paragraph": "Para 1...",
            "quality_score": 7.0
        },
        {
            "original": "Innovation drives progress.",
            "imitation": "Creativity enables breakthroughs.",
            "map": {"Force": ["Innovation", "Creativity"]},
            "paragraph": "Para 2...",
            "quality_score": 6.5
        },
        {
            "original": "Communication builds trust.",
            "imitation": "Dialogue fosters understanding.",
            "map": {"Action": ["Communication", "Dialogue"]},
            "paragraph": "Para 3...",
            "quality_score": 5.0
        }
    ]
    
    # 批量添加（带默认两级标签）
    record_ids = memory_service.add_batch_learning_records(
        user_id=user_id,
        ted_url="https://ted.com/talks/batch_test",
        ted_title="Batch Test Talk",
        ted_speaker="Batch Speaker",
        shadow_writings=shadow_writings,
        default_tags=["innovation", "Batch Test Talk"]  # 一级：主题，二级：TED标题
    )
    
    print(f"批量添加 {len(record_ids)} 条记录")
    
    # 验证
    records = memory_service.get_learning_records(user_id, limit=10)
    print(f"获取到 {len(records)} 条记录")
    
    assert len(records) == 3
    assert len(record_ids) == 3
    
    print("[PASS] 批量添加学习记录测试通过")

def test_get_records_with_filters():
    """测试带过滤条件查询学习记录"""
    print("\n=== 测试3: 过滤查询学习记录（两级标签）===")
    
    store = InMemoryStore()
    memory_service = MemoryService(store=store)
    user_id = "test_user_filter"
    
    # 添加多条不同质量分数和标签的记录
    test_data = [
        (5.0, ["leadership", "Talk 1"]),
        (6.0, ["leadership", "Talk 2"]),
        (7.0, ["innovation", "Talk 3"]),
        (7.5, ["innovation", "Talk 4"]),
        (8.0, ["communication", "Talk 5"])
    ]
    
    for i, (score, tags) in enumerate(test_data, 1):
        memory_service.add_learning_record(
            user_id=user_id,
            ted_url=f"https://ted.com/talks/test{i}",
            ted_title=f"Talk {i}",
            ted_speaker="Speaker",
            original=f"Original sentence {i}",
            imitation=f"Imitation sentence {i}",
            word_map={"Category": [f"word{i}a", f"word{i}b"]},
            paragraph=f"Paragraph {i}",
            quality_score=score,
            tags=tags
        )
    
    # 测试1: 按最小质量分数过滤
    high_quality = memory_service.get_learning_records(
        user_id, 
        limit=10, 
        min_quality=7.0
    )
    print(f"质量>=7.0的记录: {len(high_quality)} 条")
    assert len(high_quality) == 3  # 7.0, 7.5, 8.0
    
    # 测试2: 按一级标签（主题）过滤
    leadership_records = memory_service.get_learning_records(
        user_id,
        limit=10,
        tags=["leadership"]
    )
    print(f"leadership主题的记录: {len(leadership_records)} 条")
    assert len(leadership_records) == 2  # Talk 1, Talk 2
    
    # 测试3: 按二级标签（TED标题）过滤
    talk1 = memory_service.get_learning_records(
        user_id,
        limit=10,
        tags=["Talk 1"]
    )
    print(f"Talk 1的记录: {len(talk1)} 条")
    assert len(talk1) == 1
    
    # 测试4: 按多个标签过滤（OR逻辑）
    multi_tags = memory_service.get_learning_records(
        user_id,
        limit=10,
        tags=["leadership", "innovation"]
    )
    print(f"leadership或innovation的记录: {len(multi_tags)} 条")
    assert len(multi_tags) == 4  # Talk 1, 2, 3, 4
    
    print("[PASS] 过滤查询学习记录测试通过")

def test_get_learning_stats():
    """测试学习统计"""
    print("\n=== 测试4: 学习统计 ===")
    
    store = InMemoryStore()
    memory_service = MemoryService(store=store)
    user_id = "test_user_stats"
    
    # 添加多条记录（带两级标签）
    for i in range(10):
        topic = ["leadership", "innovation", "communication"][i % 3]
        talk_title = f"Talk {i % 3}"
        
        memory_service.add_learning_record(
            user_id=user_id,
            ted_url=f"https://ted.com/talks/test{i % 3}",  # 3个不同的TED
            ted_title=talk_title,
            ted_speaker="Speaker",
            original=f"Original {i}",
            imitation=f"Imitation {i}",
            word_map={"Cat": [f"w{i}"]},
            paragraph=f"Para {i}",
            quality_score=5.0 + i * 0.3,  # 5.0 到 7.7
            tags=[topic, talk_title]  # 两级标签
        )
    
    # 获取统计
    stats = memory_service.get_learning_stats(user_id)
    
    print(f"总记录数: {stats['total_records']}")
    print(f"平均质量分数: {stats['avg_quality_score']}")
    print(f"Top标签: {stats['top_tags']}")
    print(f"按TED统计: {list(stats['records_by_ted'].keys())}")
    
    assert stats["total_records"] == 10
    assert 5.0 <= stats["avg_quality_score"] <= 8.0
    assert len(stats["top_tags"]) > 0
    assert len(stats["records_by_ted"]) == 3  # 3个不同的TED
    assert len(stats["quality_trend"]) == 10
    
    # 验证两级标签都在top_tags中
    assert "leadership" in stats["top_tags"]
    assert "innovation" in stats["top_tags"]
    
    print("[PASS] 学习统计测试通过")

def test_empty_stats():
    """测试空用户的统计"""
    print("\n=== 测试5: 空用户统计 ===")
    
    store = InMemoryStore()
    memory_service = MemoryService(store=store)
    user_id = "test_user_empty"
    
    # 获取空用户的统计
    stats = memory_service.get_learning_stats(user_id)
    
    print(f"空用户统计: {stats}")
    
    assert stats["total_records"] == 0
    assert stats["avg_quality_score"] == 0.0
    assert len(stats["top_tags"]) == 0
    
    print("[PASS] 空用户统计测试通过")

if __name__ == "__main__":
    try:
        test_add_learning_record()
        test_batch_add_learning_records()
        test_get_records_with_filters()
        test_get_learning_stats()
        test_empty_stats()
        
        print("\n" + "="*60)
        print("所有Learning Records测试通过！")
        print("="*60)
    except Exception as e:
        print(f"\n[ERROR] 测试失败: {e}")
        import traceback
        traceback.print_exc()
