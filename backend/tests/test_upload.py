# -*- coding: utf-8 -*-
"""测试文件上传接口"""
import requests

# 测试文件路径
test_file_path = r"d:\转码\AI-all\English_news_Agent\data\How to spot fake AI photos.txt"

# 上传文件
print("正在上传文件...")
with open(test_file_path, 'rb') as f:
    files = {'file': ('test.txt', f, 'text/plain')}
    response = requests.post('http://localhost:8000/process-file', files=files)

# 输出结果
print(f"\n状态码: {response.status_code}")

if response.status_code == 200:
    result = response.json()
    print("\n[OK] 处理成功！")
    print("\nTED信息:")
    ted_info = result.get('ted_info', {})
    print(f"  标题: {ted_info.get('title', 'N/A')}")
    print(f"  演讲者: {ted_info.get('speaker', 'N/A')}")
    print(f"  时长: {ted_info.get('duration', 'N/A')}")
    print(f"  浏览量: {ted_info.get('views', 'N/A'):,}")
    print(f"  文本长度: {ted_info.get('transcript_length', 'N/A')} 字符")
    
    print("\n处理结果:")
    print(f"  成功: {result.get('success', False)}")
    print(f"  结果数量: {result.get('result_count', 0)}")
    print(f"  处理时间: {result.get('processing_time', 0):.2f} 秒")
    
    # 显示前2个结果
    results = result.get('results', [])
    if results:
        print(f"\n前 {min(2, len(results))} 个 Shadow Writing 结果:")
        for i, item in enumerate(results[:2], 1):
            print(f"\n  [{i}]")
            print(f"    原句: {item.get('original', 'N/A')[:100]}...")
            print(f"    迁移: {item.get('imitation', 'N/A')[:100]}...")
            print(f"    映射数: {len(item.get('map', {}))}")
            print(f"    质量分: {item.get('quality_score', 'N/A')}")
else:
    print("\n[ERROR] 请求失败")
    print(f"响应: {response.text}")
