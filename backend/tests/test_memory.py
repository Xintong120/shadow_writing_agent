"""Memory Service测试"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.memory import MemoryService
from langgraph.store.memory import InMemoryStore

def test_seen_urls():
    """测试TED观看历史功能"""
    print("\n=== 测试1: TED观看历史 ===")
    
    store = InMemoryStore()
    memory_service = MemoryService(store=store)
    user_id = "test_user_1"
    
    # 添加观看记录
    memory_service.add_seen_ted(
        user_id=user_id,
        url="https://ted.com/talks/test1",
        title="Test Talk 1",
        speaker="Speaker 1",
        search_topic="leadership",
        chunks_processed=10,
        shadow_writing_count=8
    )
    
    memory_service.add_seen_ted(
        user_id=user_id,
        url="https://ted.com/talks/test2",
        title="Test Talk 2",
        speaker="Speaker 2",
        search_topic="innovation",
        chunks_processed=15,
        shadow_writing_count=12
    )
    
    # 获取观看历史
    seen_urls = memory_service.get_seen_ted_urls(user_id)
    print(f"用户 {user_id} 看过的TED数量: {len(seen_urls)}")
    print(f"URL列表: {seen_urls}")
    
    # 检查是否已看过
    is_seen = memory_service.is_ted_seen(user_id, "https://ted.com/talks/test1")
    print(f"是否看过test1: {is_seen}")
    
    is_seen2 = memory_service.is_ted_seen(user_id, "https://ted.com/talks/test3")
    print(f"是否看过test3: {is_seen2}")
    
    # 获取详细信息
    ted_info = memory_service.get_ted_info(user_id, "https://ted.com/talks/test1")
    print(f"test1详细信息: {ted_info}")
    
    assert len(seen_urls) == 2
    assert is_seen == True
    assert is_seen2 == False
    assert ted_info is not None
    assert ted_info["chunks_processed"] == 10
    print("[PASS] TED观看历史测试通过")

def test_search_history():
    """测试搜索历史功能"""
    print("\n=== 测试2: 搜索历史 ===")
    
    store = InMemoryStore()
    memory_service = MemoryService(store=store)
    user_id = "test_user_2"
    
    # 添加搜索记录
    record_id1 = memory_service.add_search_history(
        user_id=user_id,
        original_query="leadership",
        optimized_query="effective leadership strategies",
        alternative_queries=["team management", "leadership skills"],
        results_count=5,
        selected_url="https://ted.com/talks/test1",
        selected_title="Test Talk 1",
        new_results=5,
        filtered_seen=2,
        search_duration_ms=1500
    )
    
    print(f"搜索记录ID: {record_id1}")
    
    # 添加第二个搜索记录
    record_id2 = memory_service.add_search_history(
        user_id=user_id,
        original_query="innovation",
        optimized_query="innovation in technology",
        alternative_queries=["tech innovation"],
        results_count=3,
        new_results=3,
        filtered_seen=0,
        search_duration_ms=1200
    )
    
    # 获取搜索历史
    history = memory_service.get_recent_searches(user_id, limit=10)
    print(f"搜索历史数量: {len(history)}")
    print(f"最近搜索: {history[0]['original_query']}")
    
    # 更新选择结果
    memory_service.update_search_selected_url(
        user_id=user_id,
        search_id=record_id2,
        selected_url="https://ted.com/talks/test2",
        selected_title="Test Talk 2"
    )
    
    assert len(history) == 2
    # 最近的搜索应该是innovation（后添加的）
    assert history[0]['original_query'] == "innovation"
    print("[PASS] 搜索历史测试通过")

def test_multi_user():
    """测试多用户隔离"""
    print("\n=== 测试3: 多用户隔离 ===")
    
    store = InMemoryStore()
    memory_service = MemoryService(store=store)
    
    # 用户1
    memory_service.add_seen_ted(
        user_id="user1",
        url="https://ted.com/talks/test1",
        title="Talk 1",
        speaker="Speaker 1",
        search_topic="topic1"
    )
    
    # 用户2
    memory_service.add_seen_ted(
        user_id="user2",
        url="https://ted.com/talks/test2",
        title="Talk 2",
        speaker="Speaker 2",
        search_topic="topic2"
    )
    
    # 验证隔离
    user1_urls = memory_service.get_seen_ted_urls("user1")
    user2_urls = memory_service.get_seen_ted_urls("user2")
    
    print(f"用户1的TED数量: {len(user1_urls)}")
    print(f"用户2的TED数量: {len(user2_urls)}")
    
    assert len(user1_urls) == 1
    assert len(user2_urls) == 1
    assert "https://ted.com/talks/test1" in user1_urls
    assert "https://ted.com/talks/test2" in user2_urls
    print("[PASS] 多用户隔离测试通过")

def test_update_processing_stats():
    """测试更新处理统计"""
    print("\n=== 测试4: 更新处理统计 ===")
    
    store = InMemoryStore()
    memory_service = MemoryService(store=store)
    user_id = "test_user_4"
    url = "https://ted.com/talks/test1"
    
    # 先添加记录
    memory_service.add_seen_ted(
        user_id=user_id,
        url=url,
        title="Test Talk",
        speaker="Speaker",
        search_topic="test",
        chunks_processed=0,
        shadow_writing_count=0
    )
    
    # 更新统计
    memory_service.update_ted_processing_stats(
        user_id=user_id,
        url=url,
        chunks_processed=20,
        shadow_writing_count=15
    )
    
    # 验证更新
    ted_info = memory_service.get_ted_info(user_id, url)
    print(f"更新后的统计: chunks={ted_info['chunks_processed']}, shadows={ted_info['shadow_writing_count']}")
    
    assert ted_info["chunks_processed"] == 20
    assert ted_info["shadow_writing_count"] == 15
    print("[PASS] 更新处理统计测试通过")

def test_learning_records_not_implemented():
    """测试学习记录（已实现）"""
    print("\n=== 测试5: 学习记录功能 ===")
    
    store = InMemoryStore()
    memory_service = MemoryService(store=store)
    user_id = "test_user_learning"
    
    # 添加学习记录
    record_id = memory_service.add_learning_record(
        user_id=user_id,
        ted_url="https://ted.com/test",
        ted_title="Test Title",
        ted_speaker="Test Speaker",
        original="test original",
        imitation="test imitation",
        word_map={"test": ["测试"]},
        paragraph="test paragraph",
        quality_score=8.0,
        tags=["test"]
    )
    
    assert record_id is not None
    print(f"[PASS] 成功添加学习记录: {record_id}")

if __name__ == "__main__":
    test_seen_urls()
    test_search_history()
    test_multi_user()
    test_update_processing_stats()
    test_learning_records_not_implemented()
    
    print("\n" + "="*50)
    print("所有Memory测试通过！")
    print("="*50)
