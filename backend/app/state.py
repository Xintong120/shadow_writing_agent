# state.py - 工作流状态定义

from typing import TypedDict, List, Optional
from app.models import Ted_Shadows

class Shadow_Writing_State(TypedDict):
    """shadow writing工作流状态"""
    # 输入
    text: str                              # 原始TED文本
    target_topic: Optional[str]
    ted_title: Optional[str]
    ted_speaker: Optional[str]
    ted_url: Optional[str]          
    
    # 语义分块结果
    semantic_chunks: List[str]             # 语义块列表
    
    # shadow结果
    raw_shadows_chunks: List[dict]             # 原始LLM输出
    validated_shadow_chunks: List[Ted_Shadows]  # 验证通过的
    quality_shadow_chunks: List[Ted_Shadows]    # 质量合格的
    failed_quality_chunks: List[dict]           # 质量检查失败的（含详细评分）
    corrected_shadow_chunks: List[Ted_Shadows]  # 修正后的
    
    # 最终结果
    final_shadow_chunks: List[Ted_Shadows]   # 最终输出
    
    # 元数据
    current_node: str                      # 当前节点名称
    error_message: Optional[str]           # 错误信息