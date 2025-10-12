from app.config import settings
from tavily import TavilyClient


def _is_valid_ted_talk_url(url: str) -> bool:
    """
    验证URL是否为有效的TED演讲
    
    有效格式：https://www.ted.com/talks/xxx
    无效格式：
    - https://www.ted.com/playlists/xxx (播放列表)
    - https://www.ted.com/speakers/xxx (演讲者页面)
    - https://www.ted.com/events/xxx (活动页面)
    - https://www.ted.com/series/xxx (系列页面)
    
    Args:
        url: 待验证的URL
        
    Returns:
        bool: URL是否为有效的TED演讲
    """
    if not url:
        return False
    
    # 必须包含 /talks/
    if '/talks/' not in url:
        return False
    
    # 排除特殊页面
    invalid_patterns = ['/playlists/', '/speakers/', '/events/', '/series/']
    for pattern in invalid_patterns:
        if pattern in url:
            return False
    
    return True


def ted_tavily_search(query: str, max_results: int = 5) -> list:
    """
    搜索TED演讲（适配FastAPI环境）
    
    Args:
        query: 搜索关键词/主题
        max_results: 最多返回结果数
        
    Returns:
        list: 搜索结果列表，每个结果包含title, url, content, score
        
    Raises:
        ValueError: 如果TAVILY_API_KEY未配置
    """
    # 1. 检查API密钥
    if not settings.tavily_api_key:
        raise ValueError("TAVILY_API_KEY not configured in .env file")
    
    # 2. 初始化Tavily客户端
    try:
        tavily_client = TavilyClient(api_key=settings.tavily_api_key)
        print(f"[TAVILY SEARCH] 正在搜索: '{query}'")
        
    except Exception as e:
        print(f"[ERROR] Tavily客户端初始化失败: {e}")
        raise
    
    # 3. 执行搜索
    try:
        search_response = tavily_client.search(
            query=f"TED talk {query}",
            topic="general",  # 通用主题
            search_depth="advanced",
            max_results=max_results,
            include_domains=["ted.com"]
        )
        
        # 4. 处理搜索结果
        results = search_response.get('results', [])
        
        if not results:
            print("[WARNING] 未找到任何结果")
            return []
        
        print(f"[SUCCESS] 找到 {len(results)} 个相关TED演讲\n")
        
        # 5. 简化并过滤返回结果
        simplified_results = []
        filtered_count = 0
        
        for i, result in enumerate(results, 1):
            simplified_result = {
                "title": result.get('title', ''),
                "url": result.get('url', ''),
                "content": result.get('content', ''),
                "score": result.get('score', 0)
            }
            
            # 验证URL是否为有效的TED演讲
            if _is_valid_ted_talk_url(simplified_result['url']):
                simplified_results.append(simplified_result)
                
                # 打印有效结果的日志
                print(f"  [{len(simplified_results)}] {simplified_result['title']}")
                print(f"      URL: {simplified_result['url']}")
                print(f"      相关度: {simplified_result['score']:.2f}\n")
            else:
                # 跳过无效URL
                filtered_count += 1
                print(f"  [SKIP] 非演讲URL: {simplified_result['url']}\n")
        
        if filtered_count > 0:
            print(f"[INFO] 过滤掉 {filtered_count} 个非演讲URL，返回 {len(simplified_results)} 个有效结果\n")
        
        return simplified_results
        
    except Exception as e:
        print(f"[ERROR] 搜索失败: {e}")
        raise