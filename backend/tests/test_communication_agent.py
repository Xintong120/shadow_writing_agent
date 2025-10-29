"""
测试 Communication Agent

测试：
1. communication_agent - 搜索TED演讲
2. communication_continue_agent - 处理用户选择
"""

import sys
from pathlib import Path

# 添加项目根目录到路径
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.agents.serial.communication import communication_agent, communication_continue_agent


def test_communication_agent_basic():
    """测试1: 基础搜索功能"""
    print("\n" + "="*80)
    print("测试 1: 基础搜索功能")
    print("="*80)
    
    state = {
        "topic": "artificial intelligence",
        "user_id": "test_user_001"
    }
    
    print("\n输入state:")
    print(f"  topic: {state['topic']}")
    print(f"  user_id: {state['user_id']}")
    
    try:
        result = communication_agent(state)
        
        print("\n返回结果:")
        print(f"  ted_candidates: {len(result.get('ted_candidates', []))} 个")
        print(f"  awaiting_user_selection: {result.get('awaiting_user_selection')}")
        print(f"  search_context: {result.get('search_context')}")
        
        if result.get('ted_candidates'):
            print("\n候选演讲列表:")
            for i, candidate in enumerate(result['ted_candidates'][:3], 1):
                print(f"  {i}. {candidate.get('title', 'N/A')}")
                print(f"     URL: {candidate.get('url', 'N/A')}")
        
        # 验证返回结果
        if result.get('awaiting_user_selection') == True:
            print("\n测试通过 - 成功返回候选列表")
            return True
        elif result.get('errors'):
            print(f"\n测试失败 - 出现错误: {result.get('errors')}")
            return False
        else:
            print("\n测试失败 - 未返回预期结果")
            return False
            
    except Exception as e:
        print(f"\n测试失败 - 异常: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_communication_agent_chinese():
    """测试2: 中文搜索"""
    print("\n" + "="*80)
    print("测试 2: 中文主题搜索")
    print("="*80)
    
    state = {
        "topic": "人工智能伦理",
        "user_id": "test_user_002"
    }
    
    print("\n输入state:")
    print(f"  topic: {state['topic']}")
    
    try:
        result = communication_agent(state)
        
        print("\n返回结果:")
        print(f"  ted_candidates: {len(result.get('ted_candidates', []))} 个")
        print(f"  optimized_query: {result.get('search_context', {}).get('optimized_query')}")
        
        if result.get('ted_candidates'):
            print("\n前3个候选演讲:")
            for i, candidate in enumerate(result['ted_candidates'][:3], 1):
                print(f"  {i}. {candidate.get('title', 'N/A')}")
        
        if result.get('awaiting_user_selection'):
            print("\n测试通过 - 成功处理中文输入")
            return True
        else:
            print("\n测试失败")
            return False
            
    except Exception as e:
        print(f"\n测试失败 - 异常: {e}")
        return False


def test_communication_agent_no_topic():
    """测试3: 缺少topic参数"""
    print("\n" + "="*80)
    print("测试 3: 缺少topic参数（错误处理）")
    print("="*80)
    
    state = {
        "user_id": "test_user_003"
        # 故意不提供 topic
    }
    
    print(f"\n输入state: {state}")
    
    try:
        result = communication_agent(state)
        
        print("\n返回结果:")
        print(f"  errors: {result.get('errors')}")
        print(f"  processing_logs: {result.get('processing_logs')}")
        
        if result.get('errors'):
            print("\n测试通过 - 正确处理缺少参数错误")
            return True
        else:
            print("\n测试失败 - 未捕获错误")
            return False
            
    except Exception as e:
        print(f"\n测试失败 - 异常: {e}")
        return False


def test_communication_continue_agent():
    """测试4: 处理用户选择"""
    import pytest
    pytest.skip("此测试需要用户交互和真实API调用，跳过自动化测试")
    
    print("\n" + "="*80)
    print("测试 4: 处理用户选择")
    print("="*80)
    
    # 使用一个真实的TED演讲URL
    state = {
        "selected_ted_url": "https://www.ted.com/talks/brene_brown_the_power_of_vulnerability",
        "user_id": "test_user_004",
        "search_context": {
            "original_topic": "vulnerability",
            "optimized_query": "vulnerability courage"
        }
    }
    
    print("\n输入state:")
    print(f"  selected_ted_url: {state['selected_ted_url']}")
    
    print("\n警告: 此测试将实际爬取TED网站，可能需要20-30秒")
    
    try:
        result = communication_continue_agent(state)
        
        print("\n返回结果:")
        print(f"  file_path: {result.get('file_path')}")
        print(f"  ted_title: {result.get('ted_title')}")
        print(f"  ted_speaker: {result.get('ted_speaker')}")
        print(f"  text length: {len(result.get('text', ''))} 字符")
        print(f"  awaiting_user_selection: {result.get('awaiting_user_selection')}")
        
        if result.get('text') and result.get('file_path'):
            print("\n测试通过 - 成功提取transcript并保存文件")
            return True
        elif result.get('errors'):
            print(f"\n测试失败 - 出现错误: {result.get('errors')}")
            return False
        else:
            print("\n测试失败 - 未返回预期结果")
            return False
            
    except Exception as e:
        print(f"\n测试失败 - 异常: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_communication_continue_agent_no_url():
    """测试5: 缺少URL参数"""
    print("\n" + "="*80)
    print("测试 5: 缺少URL参数（错误处理）")
    print("="*80)
    
    state = {
        "user_id": "test_user_005"
        # 故意不提供 selected_ted_url
    }
    
    print(f"\n输入state: {state}")
    
    try:
        result = communication_continue_agent(state)
        
        print("\n返回结果:")
        print(f"  errors: {result.get('errors')}")
        print(f"  processing_logs: {result.get('processing_logs')}")
        
        if result.get('errors'):
            print("\n测试通过 - 正确处理缺少参数错误")
            return True
        else:
            print("\n测试失败 - 未捕获错误")
            return False
            
    except Exception as e:
        print(f"\n测试失败 - 异常: {e}")
        return False


def test_full_workflow():
    """测试6: 完整工作流（搜索 -> 选择）"""
    print("\n" + "="*80)
    print("测试 6: 完整工作流")
    print("="*80)
    
    # 步骤1: 搜索
    print("\n步骤1: 搜索TED演讲")
    state1 = {
        "topic": "climate change",
        "user_id": "test_user_006"
    }
    
    try:
        result1 = communication_agent(state1)
        
        if not result1.get('ted_candidates'):
            print("搜索失败，无法继续测试")
            return False
        
        print(f"搜索成功，找到 {len(result1['ted_candidates'])} 个候选")
        
        # 步骤2: 模拟用户选择第一个
        print("\n步骤2: 模拟用户选择第一个演讲")
        selected_url = result1['ted_candidates'][0]['url']
        print(f"选择的URL: {selected_url}")
        
        print("\n警告: 此步骤将实际爬取TED网站")
        user_input = input("是否继续? (y/n): ")
        if user_input.lower() != 'y':
            print("跳过此测试")
            return None
        
        state2 = {
            "selected_ted_url": selected_url,
            "user_id": "test_user_006",
            "search_context": result1.get('search_context')
        }
        
        result2 = communication_continue_agent(state2)
        
        if result2.get('text') and result2.get('awaiting_user_selection') == False:
            print("\n测试通过 - 完整工作流成功")
            print(f"  标题: {result2.get('ted_title')}")
            print(f"  演讲者: {result2.get('ted_speaker')}")
            print(f"  文件: {result2.get('file_path')}")
            return True
        else:
            print("\n测试失败")
            return False
            
    except Exception as e:
        print(f"\n测试失败 - 异常: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """运行所有测试"""
    print("\n" + "="*80)
    print("Communication Agent 测试套件")
    print("="*80)
    
    results = []
    
    # 快速测试（不需要爬取网站）
    results.append(("基础搜索功能", test_communication_agent_basic()))
    results.append(("中文主题搜索", test_communication_agent_chinese()))
    results.append(("缺少topic参数", test_communication_agent_no_topic()))
    results.append(("缺少URL参数", test_communication_continue_agent_no_url()))
    
    # 慢速测试（需要爬取网站）
    print("\n" + "="*80)
    print("慢速测试（需要爬取TED网站）")
    print("="*80)
    results.append(("处理用户选择", test_communication_continue_agent()))
    results.append(("完整工作流", test_full_workflow()))
    
    # 汇总结果
    print("\n" + "="*80)
    print("测试结果汇总")
    print("="*80)
    
    for name, result in results:
        if result is True:
            status = "通过"
        elif result is False:
            status = "失败"
        else:
            status = "跳过"
        print(f"  {name}: {status}")
    
    passed = sum(1 for _, r in results if r is True)
    failed = sum(1 for _, r in results if r is False)
    skipped = sum(1 for _, r in results if r is None)
    
    print(f"\n总计: {passed} 通过, {failed} 失败, {skipped} 跳过")
    print("="*80 + "\n")


if __name__ == "__main__":
    main()
