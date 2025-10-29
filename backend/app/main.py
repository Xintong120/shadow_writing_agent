# main.py
# 作用：FastAPI应用入口
# 功能：应用配置、路由注册、WebSocket端点、中间件配置

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings, validate_config
from app.utils import initialize_key_manager
from app.websocket_manager import ws_manager
from app.task_manager import task_manager
from app.enums import TaskStatus, MessageType
from app.routers.core import router as core_router
from app.routers.memory import router as memory_router
from app.routers.config import router as config_router
from app.monitoring.api_key_dashboard import router as monitoring_router
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

# 注册路由（按功能分组）
app.include_router(core_router)         # 核心业务路由 (/api/v1/...)
app.include_router(memory_router)       # Memory路由 (/api/memory/...)
app.include_router(config_router)       # 配置路由 (/api/config/...)
app.include_router(monitoring_router)   # 监控路由 (/api/monitoring/...)

# 兼容性路由：保留原有路径
@app.get("/health")
def health_check():
    """健康检查（兼容性保留）"""
    return {
        "status": "ok",
        "model": settings.model_name,
        "temperature": settings.temperature,
        "note": "Please use /api/v1/health for new implementations"
    }

# 启动时验证配置
@app.on_event("startup")
async def startup_event():
    validate_config()

    # 初始化 API Key 管理器
    initialize_key_manager(cooldown_seconds=60)

    print("[OK] TED Agent API 启动成功！")
    print("[INFO] 访问文档：http://localhost:8000/docs")
    print("[INFO] API v1 端点：http://localhost:8000/api/v1/...")


# ============ WebSocket处理 ============

# WebSocket端点（必须在main.py中定义，不能放在APIRouter中）
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


# 运行方式：
# uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000