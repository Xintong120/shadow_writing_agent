# shadow_writing_agent.py
# 并行处理的Shadow Writing Agent

from app.state import ChunkProcessState
from app.utils import ensure_dependencies, create_llm_function_native
from app.prompts import prompt_manager


def shadow_writing_single_chunk(state: ChunkProcessState) -> dict:
    """
    处理单个语义块的Shadow Writing（并行版本）

    【重要】：移除 time.sleep(15) 强制等待
    LangGraph的并发控制 + API Key轮换机制已足够

    【Prompt保持不变】：使用与原版完全相同的Shadow Writing prompt
    """
    chunk_text = state.get("chunk_text", "")
    chunk_id = state.get("chunk_id", 0)
    task_id = state.get("task_id")
    total_chunks = state.get("total_chunks", 1)  # 从state获取总数，避免除零错误

    print(f"\n[Pipeline {chunk_id}] Shadow Writing...")
    print(f"[Pipeline {chunk_id}] task_id: {task_id}, chunk_length: {len(chunk_text)}, total_chunks: {total_chunks}")

    # 推送单个语义块开始处理消息
    if task_id and total_chunks > 0:
        import asyncio
        from app.sse_manager import sse_manager
        asyncio.create_task(
            sse_manager.add_message(task_id, {
                "type": "chunk_progress",
                "current_chunk": chunk_id + 1,
                "total_chunks": total_chunks,
                "stage": "shadow_writing",
                "message": f"处理语义块 {chunk_id + 1}/{total_chunks}: 生成Shadow Writing"
            })
        )
        print(f"[Pipeline {chunk_id}] 推送语义块进度消息到task_id: {task_id}, 进度: {chunk_id + 1}/{total_chunks}")

    if not chunk_text:
        return {"raw_shadow": None, "error": "Empty chunk"}
    
    try:
        # 从state获取注入的LLM函数，如果没有则使用默认创建
        llm_function = state.get("llm_function")
        if llm_function is None:
            ensure_dependencies()
            llm_function = create_llm_function_native()
        
        output_format = {
            "original": "完整原句, str",
            "imitation": "把原句话题换成任意话题的完整新句（≥12词）, str", 
            "map": "词汇映射字典，键为原词，值为同义词列表, dict"
        }
        
        # 使用Prompt管理系统获取Shadow Writing模板
        shadow_prompt = prompt_manager.render_prompt(
            "shadow_writing.main",
            chunk_text=chunk_text
        )
        
        # 直接调用LLM，不再强制等待
        result = llm_function(shadow_prompt, output_format)
        
        if result and isinstance(result, dict):
            # 标准化结果（添加paragraph字段）
            standardized_result = {
                'original': str(result.get('original', '')).strip(),
                'imitation': str(result.get('imitation', '')).strip(),
                'map': result.get('map', {}),
                'paragraph': chunk_text
            }
            
            print(f"[Pipeline {chunk_id}] [OK] Shadow Writing完成")
            print(f"   原句: {standardized_result['original'][:60]}...")
            
            return {"raw_shadow": standardized_result}
        else:
            print(f"[Pipeline {chunk_id}] [ERROR] LLM返回无效结果")
            return {"raw_shadow": None, "error": "Invalid LLM response"}
        
    except Exception as e:
        print(f"[Pipeline {chunk_id}] [ERROR] Shadow Writing失败: {e}")
        return {"raw_shadow": None, "error": str(e)}
