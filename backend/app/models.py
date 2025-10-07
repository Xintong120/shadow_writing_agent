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

