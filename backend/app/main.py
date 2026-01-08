# main.py
# 作用：FastAPI应用入口
# 功能：应用配置、路由注册、WebSocket端点、中间件配置

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
import json
import time
import uuid
from app.config import ConfigProvider, validate_config
from app.utils import initialize_key_manager
from app.sse_manager import sse_manager, start_cleanup_task
from app.task_manager import task_manager
from app.enums import TaskStatus, MessageType
from app.routers.core import router as core_router
from app.routers.memory import router as memory_router
from app.routers.config import router as config_router
from app.routers.settings import router as settings_router
from app.monitoring.api_key_dashboard import router as monitoring_router
from app.exceptions import (
    app_exception_handler, http_exception_handler, general_exception_handler,
    AppException, ErrorCode, ValidationError
)
import asyncio

# 创建配置提供者
config_provider = ConfigProvider()

# 创建FastAPI应用
app = FastAPI(
    title="TED Shadow Writing API",
    description="TED Shadow Writing API",
    version="1.0.0"
)

# 将配置提供者存储在应用状态中
app.state.config_provider = config_provider

# 配置CORS（允许前端跨域访问）
app.add_middleware(
    CORSMiddleware,
    allow_origins=config_provider.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ 统一错误处理 ============

# 添加请求ID中间件
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """为每个请求添加唯一ID"""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id

    response = await call_next(request)

    # 在响应头中添加请求ID
    response.headers["X-Request-ID"] = request_id
    return response

# 添加时间戳中间件
@app.middleware("http")
async def add_timestamp(request: Request, call_next):
    """为响应添加时间戳"""
    response = await call_next(request)

    # 如果响应是JSONResponse，添加时间戳
    if hasattr(response, 'body'):
        try:
            import json
            body = json.loads(response.body.decode())
            if isinstance(body, dict) and "error" in body:
                body["timestamp"] = time.time()
                response.body = json.dumps(body).encode()
        except:
            pass

    return response

# 注册异常处理器
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# 处理Pydantic验证错误
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """处理请求验证错误"""
    from app.exceptions import create_error_response, ErrorCode
    import logging

    logger = logging.getLogger(__name__)
    logger.error(
        f"Validation error: {exc.errors()}",
        extra={
            "errors": exc.errors(),
            "path": request.url.path,
            "method": request.method
        }
    )

    error_response = create_error_response(
        status_code=422,
        error_code=ErrorCode.VALIDATION_ERROR,
        message="Request validation failed",
        details={"validation_errors": exc.errors()},
        request_id=getattr(request.state, 'request_id', None)
    )

    return JSONResponse(
        status_code=422,
        content=error_response
    )

# 注册路由（按功能分组）
app.include_router(core_router)         # 核心业务路由 (/api/v1/...)
app.include_router(memory_router)       # Memory路由 (/api/memory/...)
app.include_router(config_router)       # 配置路由 (/api/config/...)
app.include_router(settings_router)     # 设置路由 (/api/settings/...)
app.include_router(monitoring_router)   # 监控路由 (/api/monitoring/...)

# 兼容性路由：保留原有路径
@app.get("/health")
def health_check():
    """健康检查（兼容性保留）"""
    return {
        "status": "ok",
        "model": config_provider.get_model_name(),
        "temperature": config_provider.get_temperature(),
        "note": "Please use /api/v1/health for new implementations"
    }

# 启动时验证配置
@app.on_event("startup")
async def startup_event():
    # 在Electron环境下跳过API验证（演示模式）
    import os
    if os.getenv("ELECTRON_DEMO") != "true":
        validate_config()
    else:
        print("[DEMO] Electron演示模式，跳过API配置验证")

    # 初始化 API Key 管理器
    initialize_key_manager(cooldown_seconds=60)

    # 启动SSE消息清理任务
    start_cleanup_task()

    print("[OK] TED Agent API 启动成功！")
    print("[INFO] 访问文档：http://localhost:8000/docs")
    print("[INFO] API v1 端点：http://localhost:8000/api/v1/...")


# ============ SSE处理 ============

# SSE端点 - 替换WebSocket，使用流式响应推送进度消息
@app.get("/api/v1/progress/{task_id}")
async def progress_stream(task_id: str, last_event_id: str | None = None):
    """
    SSE端点，实时推送处理进度，支持断点续传

    使用方法：
        const eventSource = new EventSource('/api/v1/progress/task_123');
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Progress:', data);
        };

    支持断点续传：
        const eventSource = new EventSource('/api/v1/progress/task_123', {
            headers: { 'Last-Event-ID': 'last_received_id' }
        });

    消息格式：
        id: message_id
        data: {"type": "started|progress|step|url_completed|completed", ...}

        例如：
        id: task_123_1640995200000
        data: {"type": "started", "timestamp": 1640995200.123}
    """

    async def generate():
        """生成SSE消息流"""
        try:
            # 获取缓存的消息，支持断点续传
            messages = await sse_manager.get_messages(task_id, last_event_id)

            print(f"[SSE] [{task_id}] 发送 {len(messages)} 条缓存消息")

            # 发送缓存的消息
            for message in messages:
                event_data = f"id: {message['id']}\ndata: {json.dumps(message)}\n\n"
                yield event_data

            # 如果没有断点续传，发送连接确认消息
            if not last_event_id:
                connected_message = {
                    "id": f"{task_id}_connected_{int(time.time() * 1000)}",
                    "type": "connected",
                    "task_id": task_id,
                    "message": f"Connected to progress stream for task {task_id}",
                    "timestamp": time.time()
                }
                event_data = f"id: {connected_message['id']}\ndata: {json.dumps(connected_message)}\n\n"
                yield event_data

            # 持续监听新消息（保持连接活跃）
            last_sent_id = messages[-1]['id'] if messages else (last_event_id or "0")

            while True:
                try:
                    # 检查是否有新消息
                    latest_message = await sse_manager.get_latest_message(task_id)
                    if latest_message and latest_message['id'] != last_sent_id:
                        # 发送新消息
                        event_data = f"id: {latest_message['id']}\ndata: {json.dumps(latest_message)}\n\n"
                        yield event_data
                        last_sent_id = latest_message['id']
                        print(f"[SSE] [{task_id}] 发送新消息: {latest_message['type']}")

                        # 如果是完成消息，结束流
                        if latest_message.get('type') == 'completed':
                            break

                    await asyncio.sleep(0.1)  # 短暂延迟，避免CPU占用过高

                except Exception as e:
                    print(f"[SSE] [{task_id}] 流式响应错误: {e}")
                    break

        except Exception as e:
            print(f"[SSE] [{task_id}] SSE端点错误: {e}")
            error_message = {
                "id": f"{task_id}_error_{int(time.time() * 1000)}",
                "type": "error",
                "message": f"SSE stream error: {str(e)}",
                "timestamp": time.time()
            }
            yield f"id: {error_message['id']}\ndata: {json.dumps(error_message)}\n\n"

    # 返回SSE流式响应
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Last-Event-ID"
        }
    )

# WebSocket端点（保留用于兼容性）
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
            "task": {...}  // 仅在connected消息中包含
        }
    """
    import time
    connect_time = time.time()
    print(f"[WS] [{task_id}] WebSocket连接请求 - 时间: {time.strftime('%H:%M:%S')}")

    await ws_manager.connect(websocket, task_id)
    connection_established_time = time.time()
    print(f"[WS] [{task_id}] WebSocket连接建立 - 耗时: {connection_established_time - connect_time:.3f}秒")

    try:
        # 发送连接成功消息
        task = task_manager.get_task(task_id)
        connected_msg_time = time.time()
        if task:
            await websocket.send_json({
                "type": MessageType.CONNECTED.value,
                "task": task.to_dict(),
                "message": f"Connected to task {task_id}, waiting for progress updates",
                "server_timestamp": connected_msg_time
            })
            print(f"[WS] [{task_id}] 发送connected消息 - 耗时: {connected_msg_time - connection_established_time:.3f}秒")
        else:
            await websocket.send_json({
                "type": MessageType.ERROR.value,
                "message": f"Task {task_id} not found",
                "server_timestamp": connected_msg_time
            })
            print(f"[WS] [{task_id}] 发送error消息 (task not found) - 耗时: {connected_msg_time - connection_established_time:.3f}秒")
            return

        # 保持连接活跃，等待客户端断开或异常
        # 所有进度消息都由ws_manager.broadcast_progress()直接发送
        last_ping_time = time.time()
        while True:
            try:
                # 30秒超时接收客户端消息（保持连接活跃）
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                # 可以处理客户端发来的消息，如取消任务等
                client_msg_time = time.time()
                print(f"[WS] [{task_id}] 收到客户端消息: {data} - 时间: {time.strftime('%H:%M:%S')}")
            except asyncio.TimeoutError:
                # 30秒超时，发送ping保持连接活跃
                current_time = time.time()
                if current_time - last_ping_time >= 30:
                    try:
                        ping_msg = {
                            "type": "ping",
                            "timestamp": current_time,
                            "server_time": time.strftime('%H:%M:%S')
                        }
                        await websocket.send_json(ping_msg)
                        last_ping_time = current_time
                        print(f"[WS] [{task_id}] 发送ping消息 - 时间: {time.strftime('%H:%M:%S')}")
                    except Exception as ping_error:
                        print(f"[WS] [{task_id}] 发送ping失败: {ping_error}")
                        break

    except WebSocketDisconnect:
        disconnect_time = time.time()
        total_connection_time = disconnect_time - connect_time
        print(f"[WS] [{task_id}] 客户端断开连接 - 总连接时间: {total_connection_time:.1f}秒")
        ws_manager.disconnect(websocket, task_id)
    except Exception as e:
        error_time = time.time()
        total_connection_time = error_time - connect_time
        print(f"[WS] [{task_id}] 连接错误: {e} - 总连接时间: {total_connection_time:.1f}秒")
        ws_manager.disconnect(websocket, task_id)


# 运行方式：
# uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
