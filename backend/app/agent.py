# agent.py
# 作用：TED Agent核心逻辑封装
# 功能：
#   - 集成news-agent-TED-9.0代码
#   - 调用Groq API执行LangGraph工作流
#   - 包装SemanticChunkingAgent、句子改写、质量检查等节点
#   - 返回结构化结果

# TODO: 实现TED Agent
# 1. 从news-agent-TED-9.0.py迁移核心逻辑
# 2. 替换本地模型为Groq API调用
# 3. 包装LangGraph工作流
# 4. 添加进度回调接口

from langgraph.graph import StateGraph, END , START
from app.state import Shadow_Writing_State
from app.agents.semantic_chunking import Semantic_Chunking_Agent
from app.agents.sentence_shadow_writing import TED_shadow_writing_agent
from app.agents.validation import validation_agent
from app.agents.quality import quality_agent
from app.agents.correction import correction_agent
from app.agents.finalize import finalize_agent

def create_shadow_writing_workflow():
    """创建sentence shadow writing 工作流"""

    # 创建StateGraph
    builder = StateGraph(Shadow_Writing_State)

    # 添加节点
    builder.add_node("semantic_chunking", Semantic_Chunking_Agent())
    builder.add_node("sentence_shadow_writing", TED_shadow_writing_agent)
    builder.add_node("validation", validation_agent)
    builder.add_node("quality", quality_agent)
    builder.add_node("correction", correction_agent)
    builder.add_node("finalize", finalize_agent)

    # 条件路由函数
    def should_correct(state: Shadow_Writing_State) -> str:
        """决定是否需要修正"""
        validated_chunks = state.get("validated_shadow_chunks", [])
        quality_chunks = state.get("quality_shadow_chunks", [])
        
        # 如果有被拒绝的语块，进入修正流程
        if len(validated_chunks) > len(quality_chunks):
            return "correction"
        else:
            return "finalize"
    
    # 设置工作流路径
    builder.add_edge(START, "semantic_chunking")
    builder.add_edge("semantic_chunking", "sentence_shadow_writing")
    builder.add_edge("sentence_shadow_writing", "validation")
    builder.add_edge("validation", "quality")
    
    # 条件路由：quality -> correction 或 finalize
    builder.add_conditional_edges(
        "quality",
        should_correct,
        {
            "correction": "correction",
            "finalize": "finalize"
        }
    )
    
    # correction 后回到 finalize
    builder.add_edge("correction", "finalize")
    builder.add_edge("finalize", END)
    
    return builder.compile()


# 暴露给main.py的处理函数
def process_ted_text(
    text: str, 
    target_topic: str = "",
    ted_title: str = None,
    ted_speaker: str = None,
    ted_url: str = None
) -> dict:
    """
    处理TED文本的主函数
    
    Args:
        text: TED演讲文本
        target_topic: 目标话题（可选）
        ted_title: TED演讲标题（可选）
        ted_speaker: TED演讲者（可选）
        ted_url: TED演讲URL（可选）
        
    Returns:
        dict: 包含处理结果的字典
    """
    
    # 创建工作流
    workflow = create_shadow_writing_workflow()
    
    # 初始状态
    initial_state = {
        "text": text,
        "target_topic": target_topic,
        "ted_title": ted_title,
        "ted_speaker": ted_speaker,
        "ted_url": ted_url,        
        "semantic_chunks": [],
        "raw_shadows_chunks": [],
        "validated_shadow_chunks": [],
        "quality_shadow_chunks": [],
        "failed_quality_chunks": [],
        "corrected_shadow_chunks": [],
        "final_shadow_chunks": [],
        "current_node": "",
        "error_message": None
    }
    
    # 运行工作流
    result = workflow.invoke(initial_state)
    
    # 提取最终结果
    final = result.get("final_shadow_chunks", [])
    
    # 处理返回值：final 可能是字典列表或对象列表
    results = []
    for item in final:
        if isinstance(item, dict):
            results.append(item)
        elif hasattr(item, 'dict'):
            results.append(item.dict())
        elif hasattr(item, 'model_dump'):
            results.append(item.model_dump())
        else:
            results.append(str(item))
    
    return {
        "success": True,
        "results": results,
        "result_count": len(results)
    }