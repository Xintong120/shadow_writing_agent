# models.py
# 作用：Pydantic数据模型定义
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict
from dataclasses import dataclass

@dataclass
class TedTxt:
    """TED文本文件数据结构"""
    title: str
    speaker: str
    url: str
    duration: str
    views: int
    transcript: str

class Ted_Shadows(BaseModel):
    """TED句子迁移数据模型"""
    original: str = Field(..., min_length=12, description="原始TED句子")
    imitation: str = Field(..., min_length=12, description="话题迁移后的句子")
    map: dict = Field(..., description="词汇映射字典")
    paragraph: str = Field(..., min_length=10, description="原始段落")
    quality_score: float = Field(default=6.0, ge=0, le=8, description="质量评分")

    @field_validator('original')
    @classmethod
    def validate_original(cls, v):
        word_count = len(v.split())
        if word_count < 8:
            raise ValueError("原始句子应包含至少8个单词")
        return v.strip()

    @field_validator('imitation')
    @classmethod
    def validate_imitation(cls, v):
        word_count = len(v.split())
        if word_count < 8:
            raise ValueError("迁移句子应包含至少8个单词")
        return v.strip()

    @field_validator('map')
    @classmethod
    def validate_map(cls, v):
        if not isinstance(v, dict):
            raise ValueError("映射必须是字典格式")
        if len(v) < 2:
            raise ValueError("至少需要2个词汇映射")
        for key, values in v.items():
            if not isinstance(values, list) or len(values) < 1:
                raise ValueError(f"词汇'{key}'的同义词列表至少包含1个词")
        return v

class Ted_Shadows_Result(BaseModel):
    """TED句子迁移结果数据模型"""
    original: str = Field(..., min_length=12, description="完整原句")
    imitation: str = Field(..., min_length=12, description="话题迁移后的新句")
    map: Dict[str, List[str]] = Field(..., description="词汇映射字典")
    paragraph: str = Field(..., min_length=10, description="原始段落")
    quality_score: float = Field(default=6.0, ge=0, le=8, description="质量评分")

    @field_validator('original')
    @classmethod
    def validate_original(cls, v):
        if not v or len(v.strip()) < 12:
            raise ValueError("原句长度至少12个字符")
        word_count = len(v.split())
        if word_count < 8:
            raise ValueError("原句应包含至少8个单词")
        return v.strip()

    @field_validator('imitation')
    @classmethod
    def validate_imitation(cls, v):
        if not v or len(v.strip()) < 12:
            raise ValueError("迁移句长度至少12个字符")
        word_count = len(v.split())
        if word_count < 8:
            raise ValueError("迁移句应包含至少8个单词")
        return v.strip()

    @field_validator('map')
    @classmethod
    def validate_map(cls, v):
        if not isinstance(v, dict):
            raise ValueError("映射必须是字典格式")
        # 放宽验证：只要有映射即可，不强制要求每个词都有2个同义词
        for key, values in v.items():
            if not isinstance(values, list) or len(values) < 1:
                raise ValueError(f"词汇'{key}'的同义词列表至少包含1个词")
        return v


# ============ API请求/响应模型 ============

class SearchRequest(BaseModel):
    """搜索TED演讲请求"""
    topic: str = Field(..., min_length=1, max_length=200, description="搜索主题")
    user_id: Optional[str] = Field(default="default", description="用户ID")


class TEDCandidate(BaseModel):
    """TED演讲候选"""
    title: str = Field(..., description="演讲标题")
    speaker: str = Field(..., description="演讲者")
    url: str = Field(..., description="TED URL")
    duration: str = Field(default="", description="时长")
    views: Optional[str] = Field(default=None, description="观看次数")
    description: Optional[str] = Field(default="", description="简介")
    relevance_score: Optional[float] = Field(default=0.0, description="相关性评分")


class SearchResponse(BaseModel):
    """搜索响应"""
    success: bool = Field(..., description="是否成功")
    candidates: List[TEDCandidate] = Field(default_factory=list, description="候选列表")
    search_context: Dict = Field(default_factory=dict, description="搜索上下文")
    total: int = Field(default=0, description="结果总数")


class BatchProcessRequest(BaseModel):
    """批量处理请求"""
    urls: List[str] = Field(..., min_items=1, max_items=10, description="TED URL列表（1-10个）")
    user_id: Optional[str] = Field(default="default", description="用户ID")


class BatchProcessResponse(BaseModel):
    """批量处理响应"""
    success: bool = Field(..., description="是否成功")
    task_id: str = Field(..., description="任务ID")
    total: int = Field(..., description="URL总数")
    message: str = Field(..., description="提示信息")


class TaskStatusResponse(BaseModel):
    """任务状态响应"""
    task_id: str
    status: str  # "pending" | "processing" | "completed" | "failed"
    total: int
    current: int
    urls: List[str]
    results: List[Dict]
    errors: List[str]
    current_url: Optional[str] = None
