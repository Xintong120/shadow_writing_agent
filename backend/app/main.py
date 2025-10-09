# main.py
# 作用：FastAPI应用入口
# 功能：定义API路由、配置CORS、启动WebSocket端点、健康检查接口

from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings, validate_config
from app.models import (
    Ted_Shadows, 
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
from app.tools.ted_search_optimizer import optimize_search_query
from typing import List, Dict, Any
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

# 启动时验证配置
@app.on_event("startup")
async def startup_event():
    validate_config()
    
    # 初始化 API Key 管理器
    initialize_key_manager(cooldown_seconds=60)
    
    print("✅ TED Agent API 启动成功！")
    print(f"📚 访问文档：http://localhost:8000/docs")

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
                "type": "connected",
                "task": task.to_dict(),
                "message": f"Connected to task {task_id}"
            })
        else:
            await websocket.send_json({
                "type": "error",
                "message": f"Task {task_id} not found"
            })
            return
        
        # 保持连接，等待任务完成或客户端断开
        while True:
            # 检查任务状态
            task = task_manager.get_task(task_id)
            if task and task.status == "completed":
                # 任务完成，发送最终消息
                await websocket.send_json({
                    "type": "task_completed",
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
        status=task.status,
        total=task.total,
        current=task.current,
        urls=task.urls,
        results=task.results,
        errors=task.errors,
        current_url=task.current_url
    )


# 运行方式：
# uvicorn app.main:app --reload --host 0.0.0.0 --port 8000