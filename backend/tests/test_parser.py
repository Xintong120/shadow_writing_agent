# -*- coding: utf-8 -*-
"""测试 TED 文件解析器"""
import sys
import os

# 添加项目路径到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.tools.ted_txt_parsers import parse_ted_file, validate_ted_file

# 测试文件路径
test_file_path = r"d:\转码\AI-all\English_news_Agent\data\How to spot fake AI photos.txt"

print("=" * 60)
print("测试：TED 文件解析器")
print("=" * 60)

# 检查文件是否存在
if not os.path.exists(test_file_path):
    print(f"[ERROR] 测试文件不存在: {test_file_path}")
    exit(1)

print(f"测试文件: {os.path.basename(test_file_path)}")

# 测试1：验证文件格式
print("\n[TEST 1] 验证文件格式")
is_valid = validate_ted_file(test_file_path)
print(f"  结果: {'[PASS]' if is_valid else '[FAIL]'}")

if not is_valid:
    print("  文件格式不正确")
    exit(1)

# 测试2：解析文件
print("\n[TEST 2] 解析文件内容")
ted_data = parse_ted_file(test_file_path)

if ted_data:
    print("  结果: [PASS]")
    print("\n解析结果:")
    print(f"  标题: {ted_data.title}")
    print(f"  演讲者: {ted_data.speaker}")
    print(f"  URL: {ted_data.url}")
    print(f"  时长: {ted_data.duration}")
    print(f"  浏览量: {ted_data.views:,}")
    print(f"  Transcript 长度: {len(ted_data.transcript):,} 字符")
    print(f"  Transcript 预览: {ted_data.transcript[:200]}...")
else:
    print("  结果: [FAIL]")
    print("  解析失败")
    exit(1)

# 测试3：数据完整性检查
print("\n[TEST 3] 数据完整性检查")
checks = {
    "标题非空": bool(ted_data.title),
    "演讲者非空": bool(ted_data.speaker),
    "URL非空": bool(ted_data.url),
    "Transcript非空": bool(ted_data.transcript),
    "Transcript长度>100": len(ted_data.transcript) > 100
}

all_pass = all(checks.values())
for check_name, result in checks.items():
    print(f"  {check_name}: {'[PASS]' if result else '[FAIL]'}")

print(f"\n{'='*60}")
print(f"测试结果: {'[ALL PASS]' if all_pass else '[SOME FAIL]'}")
print('='*60)
