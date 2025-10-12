# main.py
# 作用：FastAPI应用入口
# 功能：定义API路由、配置CORS、启动WebSocket端点、健康检查接口

from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings, validate_config
from app.models import (
    SearchRequest, SearchResponse, TEDCandidate,
    BatchProcessRequest, BatchProcessResponse,
    TaskStatusResponse
)
from app.agent import process_ted_text
from app.tools.ted_txt_parsers import parse_ted_file
from app.utils import initialize_key_manager
from app.workflows import create_search_workflow
from app.task_manager import task_manager
from app.websocket_manager import ws_manager
from app.batch_processor import process_urls_batch
from app.monitoring.api_key_dashboard import router as monitoring_router
from app.routers.memory import router as memory_router
from app.memory import MemoryService, get_global_store
from app.enums import TaskStatus, MessageType
import time
import os
import tempfile
import asyncio

# 创建FastAPI应用
app = FastAPI(
    title="TED Shadow Writing API",
    description="TED Shadow Writing API",
    version="1.0.0"
)

# 配置CORS（允许前端跨域访问）
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册监控路由
app.include_router(monitoring_router)

# 注册Memory路由
app.include_router(memory_router)

# 启动时验证配置
@app.on_event("startup")
async def startup_event():
    validate_config()
    
    # 初始化 API Key 管理器
    initialize_key_manager(cooldown_seconds=60)
    
    print("[OK] TED Agent API 启动成功！")
    print("[INFO] 访问文档：http://localhost:8000/docs")

# 1. 健康检查接口
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "model": settings.model_name,
        "temperature": settings.temperature
    }

# 2. 文件上传处理接口
@app.post("/process-file")
async def process_file(file: UploadFile = File(...)):
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
    # 验证文件类型
    if not file.filename.endswith('.txt'):
        raise HTTPException(
            status_code=400,
            detail="只支持 .txt 文件格式"
        )
    
    # 记录处理时间
    start_time = time.time()
    
    try:
        # 1. 创建临时文件保存上传内容
        with tempfile.NamedTemporaryFile(mode='wb', delete=False, suffix='.txt') as temp_file:
            # 读取上传的文件内容
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # 2. 调用 parse_ted_file() 解析文件
        ted_data = parse_ted_file(temp_file_path)
        
        # 3. 删除临时文件
        os.unlink(temp_file_path)
        
        # 4. 验证解析结果
        if not ted_data:
            raise HTTPException(
                status_code=400,
                detail="文件解析失败：请检查文件格式是否正确"
            )
        
        # 5. 提取 transcript
        transcript = ted_data.transcript
        
        if not transcript or len(transcript.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Transcript 内容太短，至少需要50个字符"
            )
        
        # 6. 调用 process_ted_text() 处理（传递 TED 元数据）
        result = process_ted_text(
            text=transcript,
            target_topic="",
            ted_title=ted_data.title,
            ted_speaker=ted_data.speaker,
            ted_url=ted_data.url
        )
        
        # 7. 添加 TED 元数据和处理时间
        result["ted_info"] = {
            "title": ted_data.title,
            "speaker": ted_data.speaker,
            "url": ted_data.url,
            "duration": ted_data.duration,
            "views": ted_data.views,
            "transcript_length": len(transcript)
        }
        result["processing_time"] = time.time() - start_time
        
        return result
        
    except HTTPException:
        # 重新抛出 HTTP 异常
        raise
    except Exception as e:
        # 捕获其他异常
        raise HTTPException(
            status_code=500,
            detail=f"处理文件时发生错误: {str(e)}"
        )

# 3. 测试Groq连接（可选）
@app.get("/test-groq")
def test_groq_connection():
    """测试Groq API连接"""
    if not settings.groq_api_key or settings.groq_api_key == "":
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY未配置"
        )
    
    return {
        "status": "configured",
        "model": settings.model_name,
        "api_key_length": len(settings.groq_api_key)
    }


# ============ 新增：搜索和批量处理端点 ============

# 4. 搜索TED演讲
@app.post("/search-ted", response_model=SearchResponse)
async def search_ted(request: SearchRequest):
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
    try:
        print(f"\n[API] 搜索TED演讲: {request.topic}")
        
        # 使用Communication Agent搜索
        workflow = create_search_workflow()
        
        # 初始状态
        initial_state = {
            "topic": request.topic,
            "user_id": request.user_id,
            "ted_candidates": [],
            "selected_ted_url": None,
            "awaiting_user_selection": False,
            "search_context": {},
            "file_path": None,
            "text": "",
            "target_topic": "",
            "ted_title": None,
            "ted_speaker": None,
            "ted_url": None,
            "semantic_chunks": [],
            "raw_shadows_chunks": [],
            "validated_shadow_chunks": [],
            "quality_shadow_chunks": [],
            "failed_quality_chunks": [],
            "corrected_shadow_chunks": [],
            "final_shadow_chunks": [],
            "current_node": "",
            "processing_logs": [],
            "errors": [],
            "error_message": None
        }
        
        # 运行工作流
        result = workflow.invoke(initial_state)
        
        # 提取候选列表
        candidates_raw = result.get("ted_candidates", [])
        search_context = result.get("search_context", {})
        
        # 转换为TEDCandidate格式
        candidates = []
        for c in candidates_raw:
            try:
                candidates.append(TEDCandidate(
                    title=c.get("title", ""),
                    speaker=c.get("speaker", "Unknown"),
                    url=c.get("url", ""),
                    duration=c.get("duration", ""),
                    views=c.get("views"),
                    description=c.get("description", ""),
                    relevance_score=c.get("score", 0.0)
                ))
            except Exception as e:
                print(f"[WARNING] 候选转换失败: {e}")
                continue
        
        print(f"[API] 找到 {len(candidates)} 个候选")
        
        return SearchResponse(
            success=True,
            candidates=candidates,
            search_context=search_context,
            total=len(candidates)
        )
        
    except Exception as e:
        print(f"[ERROR] 搜索失败: {e}")
        return SearchResponse(
            success=False,
            candidates=[],
            search_context={"error": str(e)},
            total=0
        )


# 5. 批量处理选中的TED URLs
@app.post("/process-batch", response_model=BatchProcessResponse)
async def process_batch(request: BatchProcessRequest, background_tasks: BackgroundTasks):
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
    try:
        print(f"\n[API] 批量处理 {len(request.urls)} 个URLs")
        
        # 创建任务
        task_id = task_manager.create_task(request.urls, request.user_id)
        
        # 后台异步处理
        background_tasks.add_task(process_urls_batch, task_id, request.urls)
        
        return BatchProcessResponse(
            success=True,
            task_id=task_id,
            total=len(request.urls),
            message=f"Processing started. Connect to /ws/progress/{task_id} for updates."
        )
        
    except Exception as e:
        print(f"[ERROR] 创建任务失败: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create task: {str(e)}"
        )


# 6. WebSocket进度推送
@app.websocket("/ws/progress/{task_id}")
async def websocket_progress(websocket: WebSocket, task_id: str):
    """
    WebSocket端点，实时推送处理进度
    
    使用方法：
        const ws = new WebSocket('ws://localhost:8000/ws/progress/{task_id}');
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Progress:', data);
        };
    
    消息格式：
        {
            "type": "connected" | "started" | "progress" | "step" | 
                    "url_completed" | "error" | "completed",
            "timestamp": "2025-10-09T11:30:00",
            ...  // 其他数据
        }
    """
    await ws_manager.connect(websocket, task_id)
    
    try:
        # 发送连接成功消息
        task = task_manager.get_task(task_id)
        if task:
            await websocket.send_json({
                "type": MessageType.CONNECTED.value,
                "task": task.to_dict(),
                "message": f"Connected to task {task_id}"
            })
        else:
            await websocket.send_json({
                "type": MessageType.ERROR.value,
                "message": f"Task {task_id} not found"
            })
            return
        
        # 保持连接，等待任务完成或客户端断开
        while True:
            # 检查任务状态
            task = task_manager.get_task(task_id)
            if task and task.status == TaskStatus.COMPLETED:
                # 任务完成，发送最终消息
                await websocket.send_json({
                    "type": MessageType.TASK_COMPLETED.value,
                    "task": task.to_dict()
                })
                break
            
            # 等待1秒
            await asyncio.sleep(1)
            
            # 接收客户端消息（保持连接活跃）
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
                # 可以处理客户端发来的消息，如取消任务等
            except asyncio.TimeoutError:
                pass
            
    except WebSocketDisconnect:
        print(f"[WS] 客户端断开: task_id={task_id}")
        ws_manager.disconnect(websocket, task_id)
    except Exception as e:
        print(f"[WS] 错误: {e}")
        ws_manager.disconnect(websocket, task_id)


# 7. 查询任务状态（备选，供轮询使用）
@app.get("/task/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
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
    task = task_manager.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
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


# ============ Memory API接口 ============

# 8. 获取用户TED观看历史
@app.get("/api/memory/ted-history")
async def get_ted_history(user_id: str = "default"):
    """
    获取用户的TED观看历史
    
    请求参数：
        - user_id: 用户ID（默认"default"）
    
    返回格式：
        {
            "success": true,
            "user_id": "user123",
            "total": 5,
            "seen_teds": [
                {
                    "url": "https://ted.com/talks/...",
                    "title": "...",
                    "speaker": "...",
                    "watched_at": "2025-10-10T09:00:00",
                    "search_topic": "...",
                    "chunks_processed": 15,
                    "shadow_writing_count": 12
                },
                ...
            ]
        }
    """
    try:
        memory_service = MemoryService(store=get_global_store())
        seen_urls = memory_service.get_seen_ted_urls(user_id)
        
        # 获取每个TED的详细信息
        seen_teds = []
        for url in seen_urls:
            ted_info = memory_service.get_ted_info(user_id, url)
            if ted_info:
                seen_teds.append(ted_info)
        
        # 按观看时间倒序排序
        seen_teds.sort(key=lambda x: x.get("watched_at", ""), reverse=True)
        
        return {
            "success": True,
            "user_id": user_id,
            "total": len(seen_teds),
            "seen_teds": seen_teds
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "user_id": user_id,
            "total": 0,
            "seen_teds": []
        }


# 9. 获取用户搜索历史
@app.get("/api/memory/search-history")
async def get_search_history(user_id: str = "default", limit: int = 20):
    """
    获取用户的搜索历史
    
    请求参数：
        - user_id: 用户ID（默认"default"）
        - limit: 返回数量限制（默认20）
    
    返回格式：
        {
            "success": true,
            "user_id": "user123",
            "total": 10,
            "searches": [
                {
                    "original_query": "leadership",
                    "optimized_query": "effective leadership strategies",
                    "alternative_queries": ["team management"],
                    "results_count": 5,
                    "selected_url": "...",
                    "selected_title": "...",
                    "searched_at": "2025-10-10T09:00:00",
                    "new_results": 5,
                    "filtered_seen": 2
                },
                ...
            ]
        }
    """
    try:
        memory_service = MemoryService(store=get_global_store())
        searches = memory_service.get_recent_searches(user_id, limit=limit)
        
        return {
            "success": True,
            "user_id": user_id,
            "total": len(searches),
            "searches": searches
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "user_id": user_id,
            "total": 0,
            "searches": []
        }


# 10. 获取用户学习统计
@app.get("/api/memory/learning-stats")
async def get_learning_stats(user_id: str = "default"):
    """
    获取用户的学习统计数据
    
    请求参数：
        - user_id: 用户ID（默认"default"）
    
    返回格式：
        {
            "success": true,
            "user_id": "user123",
            "stats": {
                "total_teds_watched": 15,
                "total_searches": 30,
                "total_chunks_processed": 250,
                "total_shadow_writings": 200,
                "avg_quality_score": 7.2,
                "favorite_topics": ["leadership", "AI", "innovation"],
                "recent_activity": "2025-10-10T09:00:00"
            }
        }
    """
    try:
        memory_service = MemoryService(store=get_global_store())
        
        # 获取TED观看历史
        seen_urls = memory_service.get_seen_ted_urls(user_id)
        
        # 计算统计数据
        total_chunks = 0
        total_shadows = 0
        topics = []
        
        for url in seen_urls:
            ted_info = memory_service.get_ted_info(user_id, url)
            if ted_info:
                total_chunks += ted_info.get("chunks_processed", 0)
                total_shadows += ted_info.get("shadow_writing_count", 0)
                topic = ted_info.get("search_topic")
                if topic:
                    topics.append(topic)
        
        # 获取搜索历史
        searches = memory_service.get_recent_searches(user_id, limit=100)
        
        # 统计最喜欢的主题
        from collections import Counter
        topic_counts = Counter(topics)
        favorite_topics = [topic for topic, count in topic_counts.most_common(5)]
        
        # 获取最近活动时间
        recent_activity = None
        if searches:
            recent_activity = searches[0].get("searched_at")
        
        stats = {
            "total_teds_watched": len(seen_urls),
            "total_searches": len(searches),
            "total_chunks_processed": total_chunks,
            "total_shadow_writings": total_shadows,
            "favorite_topics": favorite_topics,
            "recent_activity": recent_activity
        }
        
        return {
            "success": True,
            "user_id": user_id,
            "stats": stats
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "user_id": user_id,
            "stats": {}
        }


# 11. 清除用户Memory（开发/测试用）
@app.delete("/api/memory/clear")
async def clear_user_memory(user_id: str):
    """
    清除用户的所有Memory数据（仅开发/测试环境使用）
    
    请求参数：
        - user_id: 用户ID
    
    返回格式：
        {
            "success": true,
            "message": "User memory cleared successfully"
        }
    
    警告：此操作不可逆！
    """
    try:
        # TODO: 实现清除逻辑（需要在MemoryService中添加方法）
        return {
            "success": False,
            "message": "清除功能未实现，请联系管理员"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ============ Learning Records API接口（新增）============

# 12. 获取学习记录
@app.get("/api/learning/records")
async def get_learning_records(
    user_id: str = "default",
    limit: int = 50,
    ted_url: str = None,
    min_quality: float = None,
    tags: str = None
):
    """
    获取用户的Shadow Writing学习记录
    
    请求参数：
        - user_id: 用户ID（默认"default"）
        - limit: 返回数量限制（默认50）
        - ted_url: 按TED URL过滤（可选）
        - min_quality: 最小质量分数过滤（可选）
        - tags: 按标签过滤，多个标签用逗号分隔（可选）
    
    返回格式：
        {
            "success": true,
            "user_id": "user123",
            "total": 25,
            "records": [
                {
                    "record_id": "uuid",
                    "ted_title": "How to be a great leader",
                    "original": "Leadership is about empowering others.",
                    "imitation": "Management is about organizing teams.",
                    "map": {"Concept": ["Leadership", "Management"]},
                    "quality_score": 7.5,
                    "learned_at": "2025-10-10T09:00:00",
                    "tags": ["leadership", "How to be a great leader"]
                },
                ...
            ]
        }
    """
    try:
        memory_service = MemoryService(store=get_global_store())
        
        # 解析tags（逗号分隔）
        tag_list = None
        if tags:
            tag_list = [t.strip() for t in tags.split(",")]
        
        records = memory_service.get_learning_records(
            user_id=user_id,
            limit=limit,
            ted_url=ted_url,
            min_quality=min_quality,
            tags=tag_list
        )
        
        return {
            "success": True,
            "user_id": user_id,
            "total": len(records),
            "records": records
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "user_id": user_id,
            "total": 0,
            "records": []
        }


# 13. 获取学习统计（替代路径，与 /api/memory/learning-stats 相同）
@app.get("/api/learning/stats")
async def get_learning_stats_alt(user_id: str = "default"):
    """
    获取用户的学习统计数据（替代路径）
    
    注意：此端点与 /api/memory/learning-stats 功能相同，为兼容性保留
    
    请求参数：
        - user_id: 用户ID（默认"default"）
    
    返回格式：
        {
            "success": true,
            "user_id": "user123",
            "stats": {
                "total_records": 150,
                "avg_quality_score": 6.8,
                "top_tags": ["leadership", "innovation", "communication"],
                "records_by_ted": {
                    "https://ted.com/talks/1": {
                        "count": 12,
                        "title": "How to be a great leader"
                    }
                },
                "recent_activity": "2025-10-10T09:00:00",
                "quality_trend": [
                    {"learned_at": "...", "quality_score": 6.5},
                    ...
                ]
            }
        }
    """
    try:
        memory_service = MemoryService(store=get_global_store())
        stats = memory_service.get_learning_stats(user_id)
        
        return {
            "success": True,
            "user_id": user_id,
            "stats": stats
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "user_id": user_id,
            "stats": {}
        }


# 14. 获取单条学习记录
@app.get("/api/learning/record/{record_id}")
async def get_learning_record(record_id: str, user_id: str = "default"):
    """
    获取单条学习记录详情
    
    请求参数：
        - record_id: 记录ID（路径参数）
        - user_id: 用户ID（默认"default"）
    
    返回格式：
        {
            "success": true,
            "record": {
                "record_id": "uuid",
                "ted_url": "...",
                "ted_title": "...",
                "original": "...",
                "imitation": "...",
                "map": {...},
                "paragraph": "...",
                "quality_score": 7.5,
                "learned_at": "...",
                "tags": [...]
            }
        }
    """
    try:
        memory_service = MemoryService(store=get_global_store())
        record = memory_service.get_learning_record_by_id(user_id, record_id)
        
        if record is None:
            return {
                "success": False,
                "error": "Record not found",
                "record": None
            }
        
        return {
            "success": True,
            "record": record
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "record": None
        }


# 15. 删除学习记录
@app.delete("/api/learning/record/{record_id}")
async def delete_learning_record(record_id: str, user_id: str = "default"):
    """
    删除单条学习记录
    
    请求参数：
        - record_id: 记录ID（路径参数）
        - user_id: 用户ID（默认"default"）
    
    返回格式：
        {
            "success": true,
            "message": "Record deleted successfully"
        }
    """
    try:
        memory_service = MemoryService(store=get_global_store())
        success = memory_service.delete_learning_record(user_id, record_id)
        
        if success:
            return {
                "success": True,
                "message": "Record deleted successfully"
            }
        else:
            return {
                "success": False,
                "error": "Failed to delete record"
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# 运行方式：
# uvicorn app.main:app --reload --host 0.0.0.0 --port 8000