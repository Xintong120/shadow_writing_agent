# routers/core.py
# 核心业务路由 - TED处理、搜索、任务管理

from fastapi import APIRouter, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect, BackgroundTasks, Depends
from app.exceptions import ConfigurationError, NotFoundError, FileProcessingError
from app.models import (
    SearchRequest, SearchResponse, TEDCandidate,
    BatchProcessRequest, BatchProcessResponse,
    TaskStatusResponse
)
from app.task_manager import task_manager
from app.sse_manager import sse_manager
from app.batch_processor import process_urls_batch
from app.enums import TaskStatus, MessageType
from app.utils import (
    get_settings, get_task_manager, get_sse_manager,
    get_ted_processing_service, get_ted_search_service, get_ted_batch_service
)
from app.services import TEDProcessingService, TEDSearchService, TEDBatchService
from app.config import Settings
from typing import Callable
import time
import os
import tempfile
import asyncio

router = APIRouter(prefix="/api/v1", tags=["core"])

# ============ 核心业务路由 ============

# 1. 健康检查接口（移到v1，但保留原有路径兼容性）
@router.get("/health")
def health_check(settings: Settings = Depends(get_settings)):
    """健康检查"""
    return {
        "status": "ok",
        "model": settings.model_name,
        "temperature": settings.temperature,
        "version": "v1",
        "dependency_injection": "enabled"  # 标记已启用依赖注入
    }

# 2. 文件上传处理接口
@router.post("/process-file", response_model=dict)
async def process_file(
    file: UploadFile = File(...),
    service: TEDProcessingService = Depends(get_ted_processing_service)
):
    """
    上传TED txt文件并处理

    请求格式：
        - 文件类型：.txt
        - 文件格式：TED演讲文本（包含Title, Speaker, Transcript等字段）

    返回格式：
        {
            "success": true,
            "ted_info": {...},
            "results": [...],
            "result_count": 5,
            "processing_time": 12.34
        }
    """
    return await service.process_single_file(file)

# 3. 测试Groq连接（可选）
@router.get("/test-groq")
def test_groq_connection(settings: Settings = Depends(get_settings)):
    """测试Groq API连接"""
    if not settings.groq_api_key or settings.groq_api_key == "":
        raise ConfigurationError(
            message="GROQ_API_KEY未配置",
            config_key="groq_api_key"
        )

    return {
        "status": "configured",
        "model": settings.model_name,
        "api_key_length": len(settings.groq_api_key),
        "dependency_injection": "enabled"
    }


# ============ 搜索和批量处理端点 ============

# 4. 搜索TED演讲
@router.post("/search-ted", response_model=SearchResponse)
async def search_ted(
    request: SearchRequest,
    service: TEDSearchService = Depends(get_ted_search_service)
):
    """
    搜索TED演讲，返回候选列表

    请求格式：
        {
            "topic": "AI ethics",
            "user_id": "user123"  // 可选
        }

    返回格式：
        {
            "success": true,
            "candidates": [
                {
                    "title": "...",
                    "speaker": "...",
                    "url": "...",
                    "duration": "...",
                    "views": "...",
                    "description": "...",
                    "relevance_score": 0.95
                },
                ...
            ],
            "search_context": {
                "original_topic": "AI ethics",
                "optimized_query": "artificial intelligence ethics morality"
            },
            "total": 10
        }
    """
    return await service.search_talks(request.topic, request.user_id)


# 5. 批量处理选中的TED URLs
@router.post("/process-batch", response_model=BatchProcessResponse)
async def process_batch(
    request: BatchProcessRequest,
    background_tasks: BackgroundTasks,
    service: TEDBatchService = Depends(get_ted_batch_service)
):
    """
    批量处理选中的TED URLs（异步）

    请求格式：
        {
            "urls": [
                "https://www.ted.com/talks/...",
                "https://www.ted.com/talks/...",
                ...
            ],
            "user_id": "user123"  // 可选
        }

    返回格式：
        {
            "success": true,
            "task_id": "uuid-string",
            "total": 3,
            "message": "Processing started. Connect to /ws/progress/{task_id} for updates."
        }

    说明：
        - 返回task_id后立即返回
        - 使用WebSocket连接 /ws/progress/{task_id} 获取实时进度
    """
    # 创建批量任务
    response = await service.create_batch_task(request.urls, request.user_id)

    # 启动异步处理
    if response.success:
        await service.start_async_batch_processing(response.task_id, request.urls, background_tasks)

    return response


# 6. 查询任务状态（备选，供轮询使用）
@router.get("/task/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(
    task_id: str,
    task_mgr = Depends(get_task_manager)  # 注入任务管理器
):
    """
    查询任务状态（轮询方式）

    返回格式：
        {
            "task_id": "uuid",
            "status": "processing",
            "total": 3,
            "current": 1,
            "urls": [...],
            "results": [...],
            "errors": [...],
            "current_url": "https://..."
        }
    """
    task = task_mgr.get_task(task_id)
    if not task:
        raise NotFoundError(resource="task", resource_id=task_id)

    return TaskStatusResponse(
        task_id=task.task_id,
        status=task.status.value,  # 转换枚举为字符串
        total=task.total,
        current=task.current,
        urls=task.urls,
        results=task.results,
        errors=task.errors,
        current_url=task.current_url
    )


# ============ WebSocket处理 ============

# 全局WebSocket路由（需要在main.py中特殊处理）
def get_websocket_router():
    """返回WebSocket路由（因为FastAPI APIRouter不支持WebSocket）"""
    return None

# WebSocket端点需要在main.py中直接定义，不能放在APIRouter中
