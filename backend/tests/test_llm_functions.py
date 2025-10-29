"""
测试不同的LLM调用函数
"""

import sys
from pathlib import Path

# 添加项目根目录到路径
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.utils import (
    create_llm_function_light,
    create_llm_function_advanced,
    create_llm_function_native
)


def test_light_model():
    """测试轻量级模型（8B）"""
    print("\n" + "="*80)
    print("测试 1: 轻量级模型 (llama-3.1-8b-instant)")
    print("="*80)
    
    llm = create_llm_function_light()
    
    prompt = """
Convert this Chinese topic to English keywords for TED search:
"我想学习关于人工智能伦理的英语"

Output 2-5 keywords in JSON format.
"""
    
    try:
        result = llm(prompt, {"keywords": "English keywords for TED search, str"})
        print("\n输入: 我想学习关于人工智能伦理的英语")
        print(f"输出: {result.get('keywords', 'N/A')}")
        print("\n测试通过 - 轻量级模型工作正常")
    except Exception as e:
        print(f"\n测试失败: {e}")


def test_advanced_model():
    """测试高级模型（70B）"""
    print("\n" + "="*80)
    print("测试 2: 高级模型 (llama-3.3-70b-versatile)")
    print("="*80)
    
    llm = create_llm_function_advanced()
    
    prompt = """
Analyze the quality of this sentence migration:

Original: "Climate change is reshaping our planet."
Migration: "Artificial intelligence is transforming our society."

Rate the quality (1-10) and explain why.
Output JSON format.
"""
    
    try:
        result = llm(prompt, {"score": "Quality score 1-10, int", "reason": "Explanation, str"})
        print("\n输入: Sentence migration analysis")
        print(f"评分: {result.get('score', 'N/A')}")
        print(f"理由: {result.get('reason', 'N/A')}")
        print("\n测试通过 - 高级模型工作正常")
    except Exception as e:
        print(f"\n测试失败: {e}")


def test_native_model():
    """测试原生模型（默认配置）"""
    print("\n" + "="*80)
    print("测试 3: 原生模型 (使用settings.model_name配置)")
    print("="*80)
    
    llm = create_llm_function_native()
    
    prompt = "Say 'Hello World' in JSON format."
    
    try:
        result = llm(prompt, {"message": "greeting message, str"})
        print("\n输入: Say Hello World")
        print(f"输出: {result.get('message', 'N/A')}")
        print("\n测试通过 - 原生模型工作正常")
    except Exception as e:
        print(f"\n测试失败: {e}")


def test_speed_comparison():
    """对比不同模型的速度"""
    print("\n" + "="*80)
    print("测试 4: 速度对比")
    print("="*80)
    
    import time
    
    simple_task = "Translate '你好' to English. Output JSON."
    output_format = {"translation": "English translation, str"}
    
    # 测试8B模型
    print("\n测试 8B 模型速度...")
    llm_light = create_llm_function_light()
    start = time.time()
    try:
        result = llm_light(simple_task, output_format)
        light_time = time.time() - start
        print(f"8B 模型耗时: {light_time:.2f}秒")
        print(f"结果: {result.get('translation', 'N/A')}")
    except Exception as e:
        print(f"8B 模型失败: {e}")
        light_time = None
    
    # 测试70B模型
    print("\n测试 70B 模型速度...")
    llm_advanced = create_llm_function_advanced()
    start = time.time()
    try:
        result = llm_advanced(simple_task, output_format)
        advanced_time = time.time() - start
        print(f"70B 模型耗时: {advanced_time:.2f}秒")
        print(f"结果: {result.get('translation', 'N/A')}")
    except Exception as e:
        print(f"70B 模型失败: {e}")
        advanced_time = None
    
    # 对比
    if light_time and advanced_time:
        speedup = advanced_time / light_time
        print(f"\n速度对比: 8B 模型比 70B 模型快 {speedup:.1f}x")


def main():
    """运行所有测试"""
    print("\n" + "="*80)
    print("LLM 函数测试套件")
    print("="*80)
    
    test_light_model()
    test_advanced_model()
    test_native_model()
    test_speed_comparison()
    
    print("\n" + "="*80)
    print("所有测试完成")
    print("="*80 + "\n")


if __name__ == "__main__":
    main()
