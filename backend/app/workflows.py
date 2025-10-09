# workflows.py
# 作用：定义所有LangGraph工作流

from langgraph.graph import StateGraph, END, START
from app.state import Shadow_Writing_State
from app.agents.semantic_chunking import Semantic_Chunking_Agent
from app.agents.sentence_shadow_writing import TED_shadow_writing_agent
from app.agents.validation import validation_agent
from app.agents.quality import quality_agent
from app.agents.correction import correction_agent
from app.agents.finalize import finalize_agent
from app.agents.communication import communication_agent


def create_search_workflow():
    """
    创建搜索工作流
    
    功能：搜索TED演讲，返回候选列表
    
    流程：
    START → communication_agent → END
    
    Returns:
        编译后的工作流
    """
    builder = StateGraph(Shadow_Writing_State)
    
    # 添加communication节点
    builder.add_node("communication", communication_agent)
    
    # 设置路径
    builder.add_edge(START, "communication")
    builder.add_edge("communication", END)
    
    return builder.compile()


def create_shadow_writing_workflow():
    """
    创建Shadow Writing工作流
    
    功能：处理单个TED文本，生成shadow writing结果
    
    流程：
    START → semantic_chunking → sentence_shadow_writing 
          → validation → quality → [correction] → finalize → END
    
    Returns:
        编译后的工作流
    """
    builder = StateGraph(Shadow_Writing_State)
    
    # 添加所有处理节点
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
    
    # 条件路由：quality → correction 或 finalize
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


def create_full_workflow():
    """
    创建完整的端到端工作流（包含搜索）
    
    功能：从搜索到Shadow Writing的完整流程
    
    流程：
    START → communication → [等待用户选择] 
          → semantic_chunking → sentence_shadow_writing 
          → validation → quality → [correction] → finalize → END
    
    注意：此工作流需要外部处理用户选择逻辑
    当前版本不使用此工作流，而是分离为search + shadow_writing两个工作流
    
    Returns:
        编译后的工作流
    """
    builder = StateGraph(Shadow_Writing_State)
    
    # 添加所有节点
    builder.add_node("communication", communication_agent)
    builder.add_node("semantic_chunking", Semantic_Chunking_Agent())
    builder.add_node("sentence_shadow_writing", TED_shadow_writing_agent)
    builder.add_node("validation", validation_agent)
    builder.add_node("quality", quality_agent)
    builder.add_node("correction", correction_agent)
    builder.add_node("finalize", finalize_agent)
    
    # 条件路由函数
    def has_user_selection(state: Shadow_Writing_State) -> str:
        """检查是否有用户选择"""
        if state.get("selected_ted_url"):
            return "continue"
        else:
            return "wait"
    
    def should_correct(state: Shadow_Writing_State) -> str:
        """决定是否需要修正"""
        validated_chunks = state.get("validated_shadow_chunks", [])
        quality_chunks = state.get("quality_shadow_chunks", [])
        
        if len(validated_chunks) > len(quality_chunks):
            return "correction"
        else:
            return "finalize"
    
    # 设置工作流路径
    builder.add_edge(START, "communication")
    
    # Communication后等待用户选择
    builder.add_conditional_edges(
        "communication",
        has_user_selection,
        {
            "continue": "semantic_chunking",
            "wait": END  # 返回候选列表，等待用户选择
        }
    )
    
    builder.add_edge("semantic_chunking", "sentence_shadow_writing")
    builder.add_edge("sentence_shadow_writing", "validation")
    builder.add_edge("validation", "quality")
    
    builder.add_conditional_edges(
        "quality",
        should_correct,
        {
            "correction": "correction",
            "finalize": "finalize"
        }
    )
    
    builder.add_edge("correction", "finalize")
    builder.add_edge("finalize", END)
    
    return builder.compile()
