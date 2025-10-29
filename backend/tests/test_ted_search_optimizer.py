"""
测试 TED 搜索优化工具

测试：
1. optimize_search_query - 优化搜索词
2. generate_alternative_queries - 生成替代搜索词
"""

import sys
from pathlib import Path

# 添加项目根目录到路径
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.tools.ted_search_optimizer import optimize_search_query, generate_alternative_queries


def test_optimize_search_query_chinese():
    """测试1: 中文输入优化"""
    print("\n" + "="*80)
    print("测试 1: 中文输入优化")
    print("="*80)
    
    test_cases = [
        "我想学习关于人工智能伦理的英语",
        "气候变化",
        "如何提高领导力",
    ]
    
    for i, topic in enumerate(test_cases, 1):
        print(f"\n测试用例 {i}:")
        print(f"输入: {topic}")
        result = optimize_search_query(topic)
        print(f"优化结果: {result}")
        
        if result:
            print("测试通过")
        else:
            print("测试失败: 返回空结果")


def test_optimize_search_query_english():
    """测试2: 英文输入优化"""
    print("\n" + "="*80)
    print("测试 2: 英文输入优化")
    print("="*80)
    
    test_cases = [
        "artificial intelligence",
        "quantum computing",
        "leadership and management",
    ]
    
    for i, topic in enumerate(test_cases, 1):
        print(f"\n测试用例 {i}:")
        print(f"输入: {topic}")
        result = optimize_search_query(topic)
        print(f"优化结果: {result}")
        
        if result:
            print("测试通过")
        else:
            print("测试失败: 返回空结果")


def test_optimize_search_query_mixed():
    """测试3: 中英文混合输入"""
    print("\n" + "="*80)
    print("测试 3: 中英文混合输入")
    print("="*80)
    
    test_cases = [
        "AI伦理",
        "climate change 相关的演讲",
        "quantum computing 量子计算",
    ]
    
    for i, topic in enumerate(test_cases, 1):
        print(f"\n测试用例 {i}:")
        print(f"输入: {topic}")
        result = optimize_search_query(topic)
        print(f"优化结果: {result}")
        
        if result:
            print("测试通过")
        else:
            print("测试失败: 返回空结果")


def test_generate_alternative_queries():
    """测试4: 生成替代搜索词"""
    print("\n" + "="*80)
    print("测试 4: 生成替代搜索词")
    print("="*80)
    
    test_cases = [
        "AI ethics",
        "climate change",
        "leadership",
    ]
    
    for i, topic in enumerate(test_cases, 1):
        print(f"\n测试用例 {i}:")
        print(f"输入: {topic}")
        alternatives = generate_alternative_queries(topic)
        print(f"替代搜索词数量: {len(alternatives)}")
        
        if alternatives:
            for j, alt in enumerate(alternatives, 1):
                print(f"  {j}. {alt}")
            print("测试通过")
        else:
            print("测试失败: 未生成替代搜索词")


def test_error_handling():
    """测试5: 错误处理"""
    print("\n" + "="*80)
    print("测试 5: 错误处理")
    print("="*80)
    
    # 测试空输入
    print("\n测试空输入:")
    result = optimize_search_query("")
    print(f"空输入结果: '{result}'")
    if result == "":
        print("测试通过 - 返回空字符串")
    
    # 测试超长输入
    print("\n测试超长输入:")
    long_input = "这是一个非常非常长的输入" * 50
    result = optimize_search_query(long_input)
    print(f"超长输入结果长度: {len(result)} 字符")
    if result:
        print("测试通过 - 成功处理超长输入")


def test_consistency():
    """测试6: 一致性测试（相同输入多次调用）"""
    print("\n" + "="*80)
    print("测试 6: 一致性测试")
    print("="*80)
    
    topic = "artificial intelligence ethics"
    print(f"输入: {topic}")
    print("调用3次，检查结果是否一致:\n")
    
    results = []
    for i in range(3):
        result = optimize_search_query(topic)
        results.append(result)
        print(f"第{i+1}次: {result}")
    
    # 检查是否所有结果相似（由于temperature=0.1，应该很一致）
    unique_results = len(set(results))
    if unique_results <= 2:  # 允许最多2个不同结果（考虑到低温度仍有轻微随机性）
        print(f"\n测试通过 - 结果一致性良好（{unique_results} 个不同结果）")
    else:
        print(f"\n警告 - 结果差异较大（{unique_results} 个不同结果），可能需要调整temperature")


def main():
    """运行所有测试"""
    print("\n" + "="*80)
    print("TED 搜索优化工具测试套件")
    print("="*80)
    
    try:
        test_optimize_search_query_chinese()
        test_optimize_search_query_english()
        test_optimize_search_query_mixed()
        test_generate_alternative_queries()
        test_error_handling()
        test_consistency()
        
        print("\n" + "="*80)
        print("所有测试完成")
        print("="*80 + "\n")
        
    except Exception as e:
        print(f"\n测试过程出错: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
