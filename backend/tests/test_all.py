# -*- coding: utf-8 -*-
"""测试文件上传接口"""
import requests
import os

# 测试文件路径
test_file_path = r"d:\转码\AI-all\English_news_Agent\data\How to spot fake AI photos.txt"

# 检查文件是否存在
if not os.path.exists(test_file_path):
    print(f"错误：测试文件不存在: {test_file_path}")
    exit(1)

# 上传文件
print("=" * 60)
print("测试：文件上传接口")
print("=" * 60)
print(f"上传文件: {os.path.basename(test_file_path)}")
print("正在处理...")

try:
    with open(test_file_path, 'rb') as f:
        files = {'file': ('test.txt', f, 'text/plain')}
        response = requests.post('http://localhost:8000/process-file', files=files, timeout=300)

    # 输出结果
    print(f"\n状态码: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print("\n[SUCCESS] 处理成功！")
        
        # TED 信息
        print(f"\n{'='*60}")
        print("TED 演讲信息")
        print('='*60)
        ted_info = result.get('ted_info', {})
        print(f"  标题: {ted_info.get('title', 'N/A')}")
        print(f"  演讲者: {ted_info.get('speaker', 'N/A')}")
        print(f"  URL: {ted_info.get('url', 'N/A')}")
        print(f"  时长: {ted_info.get('duration', 'N/A')}")
        print(f"  浏览量: {ted_info.get('views', 0):,}")
        print(f"  文本长度: {ted_info.get('transcript_length', 0):,} 字符")
        
        # 处理结果
        print(f"\n{'='*60}")
        print("处理结果")
        print('='*60)
        print(f"  成功: {result.get('success', False)}")
        print(f"  结果数量: {result.get('result_count', 0)}")
        print(f"  处理时间: {result.get('processing_time', 0):.2f} 秒")
        
        # 显示 Shadow Writing 结果
        results = result.get('results', [])
        if results:
            print(f"\n{'='*60}")
            print(f"Shadow Writing 结果 (共 {len(results)} 个)")
            print('='*60)
            for i, item in enumerate(results[:3], 1):  # 只显示前3个
                print(f"\n[{i}]")
                print(f"  原句: {item.get('original', 'N/A')[:100]}...")
                print(f"  迁移: {item.get('imitation', 'N/A')[:100]}...")
                print(f"  映射词汇数: {len(item.get('map', {}))}")
                print(f"  质量评分: {item.get('quality_score', 'N/A')}/8")
                
                # 显示词汇映射
                word_map = item.get('map', {})
                if word_map:
                    print(f"  词汇映射: {dict(list(word_map.items())[:3])}...")
        else:
            print("\n[WARNING] 没有生成 Shadow Writing 结果")
            
    else:
        print("\n[FAIL] 请求失败")
        print(f"响应: {response.text}")

except requests.exceptions.Timeout:
    print("\n[ERROR] 请求超时（300秒）")
except requests.exceptions.ConnectionError:
    print("\n[ERROR] 无法连接到服务器，请确认服务是否启动")
    print("启动命令: python -m uvicorn app.main:app --reload")
except Exception as e:
    print(f"\n[ERROR] 发生错误: {e}")

print("\n" + "=" * 60)
