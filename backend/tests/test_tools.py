"""
测试 TED Tools
"""

import sys
from pathlib import Path

# 添加项目根目录到路径
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.tools.ted_tavily_search import ted_tavily_search
from app.tools.ted_tavily_extract import ted_tavily_extract
from app.tools.ted_transcript_tool import extract_ted_transcript
from app.tools.ted_file_manager import TEDFileManager


def test_tavily_search():
    """测试 Tavily 搜索功能"""
    print("\n" + "="*80)
    print("测试 1: TED Tavily Search")
    print("="*80)
    
    try:
        query = "artificial intelligence"
        print(f"\n搜索主题: {query}")
        
        results = ted_tavily_search(query, max_results=5)
        
        if results:
            print(f"\n[OK] 搜索成功！找到 {len(results)} 个结果")
            for i, result in enumerate(results, 1):
                print(f"\n结果 {i}:")
                print(f"  标题: {result['title']}")
                print(f"  URL: {result['url']}")
                print(f"  相关度: {result['score']:.2f}")
            return results  # 返回所有结果
        else:
            print("\n[ERROR] 搜索失败：未找到结果")
            return None
            
    except Exception as e:
        print(f"\n[ERROR] 搜索失败: {e}")
        return None


def test_tavily_extract(url: str):
    """测试 Tavily 提取功能"""
    print("\n" + "="*80)
    print("测试 2: TED Tavily Extract")
    print("="*80)
    
    if not url:
        print("\n跳过测试（无URL）")
        return False
    
    try:
        print(f"\n提取URL: {url}")
        
        result = ted_tavily_extract(url)
        
        if result.get('success'):
            print("\n[OK] 提取成功！")
            print(f"  内容长度: {len(result['raw_content'])} 字符")
            print(f"  预览: {result['raw_content'][:200]}...")
            return True
        else:
            print(f"\n[ERROR] 提取失败: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"\n[ERROR] 提取失败: {e}")
        return False


def test_transcript_extractor(url: str = None):
    """测试 TED Transcript 提取功能"""
    print("\n" + "="*80)
    print("测试 3: TED Transcript Extractor")
    print("="*80)
    
    # 使用示例URL（如果没有提供）
    test_url = url or "https://www.ted.com/talks/brene_brown_the_power_of_vulnerability"
    
    try:
        print(f"\n提取URL: {test_url}")
        
        ted_data = extract_ted_transcript(test_url)
        
        if ted_data:
            print("\n[OK] 提取成功！")
            print(f"  标题: {ted_data.title}")
            print(f"  演讲者: {ted_data.speaker}")
            print(f"  时长: {ted_data.duration}")
            print(f"  观看次数: {ted_data.views}")
            print(f"  Transcript长度: {len(ted_data.transcript)} 字符")
            print(f"  Transcript预览: {ted_data.transcript[:200]}...")
            return ted_data
        else:
            print("\n[ERROR] 提取失败")
            return None
            
    except Exception as e:
        print(f"\n[ERROR] 提取失败: {e}")
        import traceback
        traceback.print_exc()
        return None


def test_file_manager(ted_data):
    """测试文件管理器"""
    print("\n" + "="*80)
    print("测试 4: TED File Manager")
    print("="*80)
    
    if not ted_data:
        print("\n跳过测试（无数据）")
        return
    
    try:
        manager = TEDFileManager()
        
        # 测试保存
        print("\n4.1 测试保存文件...")
        filepath = manager.save_ted_file(ted_data)
        print(f"[OK] 保存成功: {filepath}")
        
        # 测试缓存检查
        print("\n4.2 测试缓存检查...")
        cached = manager.get_cached_file(ted_data.url)
        if cached:
            print(f"[OK] 找到缓存: {cached}")
        else:
            print("[ERROR] 未找到缓存")
        
        # 测试缓存大小
        print("\n4.3 测试缓存大小...")
        size = manager.get_cache_size()
        print(f"[OK] 缓存大小: {size / 1024:.2f} KB")
        
        # 测试删除（不会真的删除，除非配置了auto_delete）
        print("\n4.4 测试删除功能...")
        manager.delete_file(filepath)
        
        print("\n[OK] 文件管理器测试完成")
        
    except Exception as e:
        print(f"\n[ERROR] 文件管理器测试失败: {e}")
        import traceback
        traceback.print_exc()


def main():
    """运行所有测试"""
    print("\n" + "="*80)
    print("TED TOOLS 测试套件")
    print("="*80)
    
    # 测试1: Tavily搜索
    search_results = test_tavily_search()
    
    # 测试2: 尝试提取搜索结果中的transcript
    ted_data = None
    if search_results:
        print("\n" + "="*80)
        print("测试 2: 批量提取Transcript（从搜索结果）")
        print("="*80)
        
        for i, result in enumerate(search_results, 1):
            print(f"\n尝试提取第 {i} 个结果: {result['title']}")
            print(f"URL: {result['url']}")
            
            # 尝试提取transcript
            ted_data = test_transcript_extractor(result['url'])
            
            if ted_data:
                print("[OK] 成功提取！将使用此演讲进行后续测试")
                break  # 找到一个有transcript的就停止
            else:
                print("[ERROR] 提取失败，尝试下一个...")
        
        if not ted_data:
            print("\n所有搜索结果都无法提取transcript，使用备用URL测试...")
            ted_data = test_transcript_extractor()
    else:
        print("\n搜索失败，使用备用URL进行Transcript提取...")
        ted_data = test_transcript_extractor()
    
    # 测试3: 文件管理器
    if ted_data:
        test_file_manager(ted_data)
    
    print("\n" + "="*80)
    print("测试完成")
    print("="*80 + "\n")


if __name__ == "__main__":
    main()
