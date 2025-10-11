# -*- coding: utf-8 -*-
"""调试脚本 - 测试每个环节"""
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.tools.ted_txt_parsers import parse_ted_file
from app.agents.shared.semantic_chunking import Semantic_Chunking_Agent
from app.agents.serial.sentence_shadow_writing import TED_shadow_writing_agent

# 测试文件
test_file = r"d:\转码\AI-all\English_news_Agent\data\How to spot fake AI photos.txt"

print("=" * 60)
print("调试测试：逐步检查每个环节")
print("=" * 60)

# 步骤1：解析文件
print("\n[步骤1] 解析 TED 文件")
ted_data = parse_ted_file(test_file)
print(f"  [OK] 标题: {ted_data.title}")
print(f"  [OK] 文本长度: {len(ted_data.transcript)} 字符")

# 步骤2：语义分块
print("\n[步骤2] 语义分块")
chunker = Semantic_Chunking_Agent()
state = {"text": ted_data.transcript}
result = chunker(state)
chunks = result.get("semantic_chunks", [])
print(f"  [OK] 生成 {len(chunks)} 个语义块")
for i, chunk in enumerate(chunks[:3], 1):
    print(f"    块{i}: {len(chunk)} 字符, 预览: {chunk[:60]}...")

# 步骤3：测试 Shadow Writing（只处理前2个块）
print("\n[步骤3] Shadow Writing 测试（只处理前2个块）")
state_with_chunks = {
    "text": ted_data.transcript,
    "semantic_chunks": chunks[:2],  # 只测试前2个
    "ted_title": ted_data.title,
    "ted_speaker": ted_data.speaker,
    "ted_url": ted_data.url
}

try:
    shadow_result = TED_shadow_writing_agent(state_with_chunks)
    raw_results = shadow_result.get("raw_shadows_chunks", [])
    errors = shadow_result.get("errors", [])
    
    print("\n  结果:")
    print(f"    成功: {len(raw_results)} 个")
    print(f"    错误: {len(errors)} 个")
    
    if errors:
        print("\n  错误信息:")
        for err in errors:
            print(f"    - {err}")
    
    if raw_results:
        print("\n  第一个结果:")
        first = raw_results[0]
        print(f"    原句: {first.get('original', '')[:100]}")
        print(f"    迁移: {first.get('imitation', '')[:100]}")
        print(f"    映射: {first.get('map', {})}")
    
except Exception as e:
    print(f"\n  [ERROR] 处理失败: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
