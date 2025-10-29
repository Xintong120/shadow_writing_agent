"""Communication Agent - 用户与TED内容的交互桥梁

负责：
1. 接收用户输入的搜索主题
2. 搜索TED演讲并过滤重复
3. 返回候选列表等待用户选择
4. 处理用户选择并提取transcript
"""

from app.state import Shadow_Writing_State
from app.tools.ted_search_optimizer import optimize_search_query, generate_alternative_queries
from app.tools.ted_tavily_search import ted_tavily_search
from app.tools.ted_transcript_tool import extract_ted_transcript
from app.tools.ted_file_manager import TEDFileManager
from app.memory import MemoryService, get_global_store


def communication_agent(state: Shadow_Writing_State) -> Shadow_Writing_State:
    """
    通信节点 - 搜索TED演讲
    
    流程：
    1. PreloadMemory: 加载用户历史（TODO: 集成Store）
    2. LLM优化搜索词
    3. 搜索TED演讲
    4. 过滤已看过的演讲
    5. 结果不足时尝试替代搜索
    6. 返回候选列表，等待用户选择
    
    Args:
        state: 工作流状态
        
    Returns:
        更新后的状态
    """
    topic = state.get("topic", "")
    user_id = state.get("user_id", "default_user")
    
    print("\n[COMMUNICATION NODE] 搜索TED演讲")
    print(f"   用户: {user_id}")
    print(f"   主题: {topic}")
    
    if not topic:
        return {
            "errors": ["未提供搜索主题"],
            "processing_logs": ["通信节点: 缺少topic参数"]
        }
    
    try:
        # 步骤1 - PreloadMemory: 从Store加载用户历史
        memory_service = MemoryService(store=get_global_store())
        seen_urls = memory_service.get_seen_ted_urls(user_id)
        print(f"   已加载用户历史: {len(seen_urls)} 个已看过的TED")
        
        # 步骤2 - LLM优化搜索词
        optimized_query = optimize_search_query(topic)
        
        # 步骤3 - 搜索TED演讲
        print("   搜索中...")
        results = ted_tavily_search(optimized_query, max_results=10)
        
        if not results:
            print("   未找到结果")
            return {
                "errors": [f"未找到关于 '{topic}' 的TED演讲"],
                "processing_logs": ["通信节点: 搜索无结果"]
            }
        
        # 步骤4 - 过滤已看过的演讲（当前版本跳过，保留所有结果）
        new_results = [r for r in results if r.get('url') not in seen_urls]
        
        print(f"   找到 {len(results)} 个结果，{len(new_results)} 个新演讲")
        
        # 步骤5 - 如果结果不足，尝试替代搜索
        if len(new_results) < 3:
            print("   结果不足，尝试替代搜索...")
            alternative_queries = generate_alternative_queries(topic)
            
            for alt_query in alternative_queries[:2]:  # 最多尝试2个
                if not alt_query:
                    continue
                print(f"   尝试替代词: {alt_query}")
                alt_results = ted_tavily_search(alt_query, max_results=5)
                
                # 去重后添加
                for r in alt_results:
                    if r.get('url') not in seen_urls and r not in new_results:
                        new_results.append(r)
                
                if len(new_results) >= 5:
                    break
        
        # 步骤6 - 返回结果
        if len(new_results) == 0:
            return {
                "errors": [f"未找到关于 '{topic}' 的新TED演讲"],
                "processing_logs": [f"通信节点: 无新结果 (已看过 {len(seen_urls)} 个)"]
            }
        
        final_results = new_results[:5]  # 最多返回5个
        print(f"   返回 {len(final_results)} 个候选演讲")
        
        # 步骤7 - 记录搜索历史
        memory_service.add_search_history(
            user_id=user_id,
            original_query=topic,
            optimized_query=optimized_query,
            alternative_queries=generate_alternative_queries(topic) if len(new_results) < 3 else [],
            results_count=len(final_results),
            new_results=len(new_results),
            filtered_seen=len(results) - len(new_results)
        )
        print("   搜索历史已记录")
        
        return {
            "ted_candidates": final_results,
            "awaiting_user_selection": True,
            "search_context": {
                "original_topic": topic,
                "optimized_query": optimized_query,
                "seen_count": len(seen_urls),
                "filtered_count": len(results) - len(new_results)
            },
            "processing_logs": [f"通信节点: 找到 {len(final_results)} 个候选演讲"]
        }
        
    except Exception as e:
        print(f"   错误: {e}")
        return {
            "errors": [f"通信节点出错: {e}"],
            "processing_logs": ["通信节点: 搜索失败"]
        }


def communication_continue_agent(state: Shadow_Writing_State) -> Shadow_Writing_State:
    """
    通信节点 - 处理用户选择的TED演讲
    
    流程：
    1. 提取用户选择的URL
    2. 使用ted-transcript-extractor爬取transcript
    3. 保存文件到缓存
    4. 保存到Long-term Memory（TODO: 集成Store）
    5. 传递给下游节点
    
    Args:
        state: 工作流状态
        
    Returns:
        更新后的状态
    """
    selected_url = state.get("selected_ted_url", "")
    user_id = state.get("user_id", "default_user")
    search_context = state.get("search_context", {})
    
    print("\n[COMMUNICATION NODE] 处理用户选择")
    print(f"   URL: {selected_url}")
    
    if not selected_url:
        return {
            "errors": ["未提供选择的TED URL"],
            "processing_logs": ["通信节点: 缺少selected_ted_url参数"]
        }
    
    try:
        # 步骤1 - 提取transcript
        print("   爬取transcript...")
        ted_data = extract_ted_transcript(selected_url)
        
        if not ted_data:
            return {
                "errors": ["提取transcript失败"],
                "processing_logs": ["通信节点: transcript提取失败"]
            }
        
        # 步骤2 - 保存文件
        print("   保存文件...")
        file_manager = TEDFileManager()
        filepath = file_manager.save_ted_file(ted_data)
        
        # 步骤3 - 保存到Long-term Memory
        print("   保存到用户历史记录...")
        memory_service = MemoryService(store=get_global_store())
        memory_service.add_seen_ted(
            user_id=user_id,
            url=selected_url,
            title=ted_data.title,
            speaker=ted_data.speaker,
            search_topic=search_context.get("original_topic", ""),
            metadata={
                "duration": ted_data.duration,
                "views": ted_data.views,
                "transcript_length": len(ted_data.transcript)
            }
        )
        print("   用户历史记录已更新")
        
        # 步骤4 - 传递给下游节点
        print("   准备传递给下游节点")
        print(f"   标题: {ted_data.title}")
        print(f"   演讲者: {ted_data.speaker}")
        print(f"   Transcript长度: {len(ted_data.transcript)} 字符")
        
        return {
            "file_path": filepath,
            "text": ted_data.transcript,
            "ted_title": ted_data.title,
            "ted_speaker": ted_data.speaker,
            "ted_url": ted_data.url,
            "awaiting_user_selection": False,
            "processing_logs": [f"通信节点: 成功处理 {ted_data.title}"]
        }
        
    except Exception as e:
        print(f"   错误: {e}")
        return {
            "errors": [f"通信节点处理失败: {e}"],
            "processing_logs": ["通信节点: 处理出错"]
        }
