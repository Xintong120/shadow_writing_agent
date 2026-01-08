# services/ted_batch_service.py
# TEDBatchService - 专门负责批量任务管理和异步处理

from typing import List, Optional
from app.models import BatchProcessResponse, BatchProcessRequest
from app.task_manager import task_manager
from app.batch_processor import process_urls_batch


class TEDBatchService:
    """TED批量处理服务 - 专注批量任务管理和异步处理业务逻辑"""

    def __init__(self, task_manager_instance):
        """初始化TED批量处理服务

        Args:
            task_manager_instance: 任务管理器实例
        """
        self.task_manager = task_manager_instance

    async def create_batch_task(self, urls: List[str], user_id: Optional[str] = None) -> BatchProcessResponse:
        """创建批量处理任务

        Args:
            urls: TED URLs列表
            user_id: 用户ID（可选）

        Returns:
            BatchProcessResponse: 批量处理响应
        """
        try:
            print(f"\n[TEDBatchService] 创建批量处理任务: {len(urls)} 个URLs")

            # 创建任务
            task_id = self.task_manager.create_task(urls, user_id or "default")

            return BatchProcessResponse(
                success=True,
                task_id=task_id,
                total=len(urls),
                message=f"Processing started. Connect to /ws/progress/{task_id} for updates."
            )

        except Exception as e:
            print(f"[TEDBatchService] 创建任务失败: {e}")
            return BatchProcessResponse(
                success=False,
                task_id="",
                total=0,
                message=f"Failed to create task: {str(e)}"
            )

    def get_batch_task_status(self, task_id: str):
        """获取批量任务状态

        Args:
            task_id: 任务ID

        Returns:
            TaskStatusResponse: 任务状态响应
        """
        from app.models import TaskStatusResponse

        task = self.task_manager.get_task(task_id)
        if not task:
            from fastapi import HTTPException
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

    async def start_async_batch_processing(self, task_id: str, urls: List[str], background_tasks):
        """启动异步批量处理

        Args:
            task_id: 任务ID
            urls: TED URLs列表
            background_tasks: FastAPI BackgroundTasks实例
        """
        print(f"[TEDBatchService] 启动异步批量处理: {task_id}")

        # 后台异步处理
        background_tasks.add_task(process_urls_batch, task_id, urls)