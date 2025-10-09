# state.py - 工作流状态定义

from typing import TypedDict, List, Optional
from app.models import Ted_Shadows

class Shadow_Writing_State(TypedDict):
    """shadow writing工作流状态"""
  
    topic: Optional[str]                   # 用户输入的搜索主题
    user_id: Optional[str]                 # 用户ID（用于memory namespace）
    
    # Communication结果
    ted_candidates: Optional[List[dict]]   # 搜索到的TED演讲候选列表
    selected_ted_url: Optional[str]        # 用户选择的TED URL
    awaiting_user_selection: Optional[bool] # 是否等待用户选择
    search_context: Optional[dict]         # 搜索上下文（原始topic、优化query等）
    file_path: Optional[str]               # 保存的TED文件路径
    
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
    processing_logs: Optional[List[str]]   # 处理日志
    errors: Optional[List[str]]            # 错误列表
    error_message: Optional[str]           # 错误信息