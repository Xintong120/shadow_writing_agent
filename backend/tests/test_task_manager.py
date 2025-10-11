# test_task_manager.py
# 作用：测试TaskManager任务管理器
# 测试目标：app/task_manager.py

from datetime import datetime
from app.task_manager import TaskManager, Task, task_manager
from app.enums import TaskStatus


class TestTask:
    """测试Task数据类"""
    
    def test_task_creation(self):
        """测试任务创建"""
        task = Task(
            task_id="test-123",
            status=TaskStatus.PENDING,
            total=5,
            current=0,
            urls=["url1", "url2"],
            user_id="user123"
        )
        
        assert task.task_id == "test-123"
        assert task.status == TaskStatus.PENDING
        assert task.total == 5
        assert task.current == 0
        assert len(task.urls) == 2
        assert task.user_id == "user123"
        assert task.results == []
        assert task.errors == []
        assert task.current_url is None
    
    def test_task_to_dict(self):
        """测试任务转换为字典"""
        task = Task(
            task_id="test-456",
            status=TaskStatus.PROCESSING,
            total=3,
            current=1,
            urls=["url1", "url2", "url3"],
            user_id="user456"
        )
        
        task_dict = task.to_dict()
        
        assert task_dict["task_id"] == "test-456"
        assert task_dict["status"] == "processing"  # 枚举转换为字符串
        assert task_dict["total"] == 3
        assert task_dict["current"] == 1
        assert task_dict["user_id"] == "user456"
        assert isinstance(task_dict["created_at"], str)
    
    def test_task_with_results(self):
        """测试带结果的任务"""
        task = Task(
            task_id="test-789",
            status=TaskStatus.COMPLETED,
            total=2,
            current=2,
            urls=["url1", "url2"],
            user_id="user789",
            results=[{"url": "url1", "count": 10}, {"url": "url2", "count": 15}]
        )
        
        assert len(task.results) == 2
        assert task.results[0]["count"] == 10
    
    def test_task_with_errors(self):
        """测试带错误的任务"""
        task = Task(
            task_id="test-error",
            status=TaskStatus.FAILED,
            total=2,
            current=1,
            urls=["url1", "url2"],
            user_id="user_error",
            errors=["Error processing url1"]
        )
        
        assert len(task.errors) == 1
        assert "url1" in task.errors[0]


class TestTaskManager:
    """测试TaskManager类"""
    
    def setup_method(self):
        """每个测试前重置任务管理器"""
        self.manager = TaskManager()
    
    def test_create_task(self):
        """测试创建任务"""
        urls = ["url1", "url2", "url3"]
        task_id = self.manager.create_task(urls, "user123")
        
        assert task_id is not None
        assert len(task_id) > 0
        
        task = self.manager.get_task(task_id)
        assert task is not None
        assert task.status == TaskStatus.PENDING
        assert task.total == 3
        assert task.current == 0
        assert task.user_id == "user123"
    
    def test_create_multiple_tasks(self):
        """测试创建多个任务"""
        task_id_1 = self.manager.create_task(["url1"], "user1")
        task_id_2 = self.manager.create_task(["url2", "url3"], "user2")
        
        assert task_id_1 != task_id_2
        assert len(self.manager.tasks) == 2
    
    def test_get_task_exists(self):
        """测试获取存在的任务"""
        task_id = self.manager.create_task(["url1"], "user123")
        task = self.manager.get_task(task_id)
        
        assert task is not None
        assert task.task_id == task_id
    
    def test_get_task_not_exists(self):
        """测试获取不存在的任务"""
        task = self.manager.get_task("nonexistent-id")
        assert task is None
    
    def test_update_status(self):
        """测试更新任务状态"""
        task_id = self.manager.create_task(["url1"], "user123")
        
        self.manager.update_status(task_id, TaskStatus.PROCESSING)
        task = self.manager.get_task(task_id)
        assert task.status == TaskStatus.PROCESSING
        
        self.manager.update_status(task_id, TaskStatus.COMPLETED)
        task = self.manager.get_task(task_id)
        assert task.status == TaskStatus.COMPLETED
    
    def test_update_status_nonexistent_task(self):
        """测试更新不存在任务的状态（应该不报错）"""
        self.manager.update_status("nonexistent", TaskStatus.PROCESSING)
        # 不应该抛出异常
    
    def test_update_progress(self):
        """测试更新任务进度"""
        task_id = self.manager.create_task(["url1", "url2", "url3"], "user123")
        
        self.manager.update_progress(task_id, 1, "url1")
        task = self.manager.get_task(task_id)
        
        assert task.current == 1
        assert task.current_url == "url1"
        assert task.status == TaskStatus.PROCESSING
    
    def test_update_progress_multiple_times(self):
        """测试多次更新进度"""
        task_id = self.manager.create_task(["url1", "url2", "url3"], "user123")
        
        self.manager.update_progress(task_id, 1, "url1")
        self.manager.update_progress(task_id, 2, "url2")
        self.manager.update_progress(task_id, 3, "url3")
        
        task = self.manager.get_task(task_id)
        assert task.current == 3
        assert task.current_url == "url3"
    
    def test_add_result(self):
        """测试添加处理结果"""
        task_id = self.manager.create_task(["url1"], "user123")
        
        result = {"url": "url1", "count": 10, "data": [1, 2, 3]}
        self.manager.add_result(task_id, result)
        
        task = self.manager.get_task(task_id)
        assert len(task.results) == 1
        assert task.results[0]["count"] == 10
    
    def test_add_multiple_results(self):
        """测试添加多个结果"""
        task_id = self.manager.create_task(["url1", "url2"], "user123")
        
        self.manager.add_result(task_id, {"url": "url1", "count": 10})
        self.manager.add_result(task_id, {"url": "url2", "count": 20})
        
        task = self.manager.get_task(task_id)
        assert len(task.results) == 2
        assert task.results[1]["count"] == 20
    
    def test_add_error(self):
        """测试添加错误信息"""
        task_id = self.manager.create_task(["url1"], "user123")
        
        error_msg = "Failed to process url1"
        self.manager.add_error(task_id, error_msg)
        
        task = self.manager.get_task(task_id)
        assert len(task.errors) == 1
        assert error_msg in task.errors
    
    def test_add_multiple_errors(self):
        """测试添加多个错误"""
        task_id = self.manager.create_task(["url1", "url2"], "user123")
        
        self.manager.add_error(task_id, "Error 1")
        self.manager.add_error(task_id, "Error 2")
        
        task = self.manager.get_task(task_id)
        assert len(task.errors) == 2
    
    def test_complete_task(self):
        """测试完成任务"""
        task_id = self.manager.create_task(["url1"], "user123")
        
        self.manager.complete_task(task_id)
        task = self.manager.get_task(task_id)
        
        assert task.status == TaskStatus.COMPLETED
    
    def test_fail_task(self):
        """测试任务失败"""
        task_id = self.manager.create_task(["url1"], "user123")
        
        error_msg = "Critical error occurred"
        self.manager.fail_task(task_id, error_msg)
        
        task = self.manager.get_task(task_id)
        assert task.status == TaskStatus.FAILED
        assert error_msg in task.errors
    
    def test_cleanup_old_tasks(self):
        """测试清理旧任务"""
        # 创建一个任务
        task_id = self.manager.create_task(["url1"], "user123")
        
        # 修改创建时间（模拟旧任务）
        from datetime import timedelta
        old_time = datetime.now() - timedelta(hours=25)
        self.manager.tasks[task_id].created_at = old_time
        
        # 清理24小时前的任务
        self.manager.cleanup_old_tasks(max_age_hours=24)
        
        # 任务应该被删除
        assert self.manager.get_task(task_id) is None


class TestGlobalTaskManager:
    """测试全局任务管理器实例"""
    
    def test_global_instance_exists(self):
        """测试全局实例存在"""
        assert task_manager is not None
        assert isinstance(task_manager, TaskManager)
    
    def test_global_instance_is_singleton(self):
        """测试全局实例是单例"""
        # 导入的应该是同一个实例
        from app.task_manager import task_manager as tm2
        assert task_manager is tm2


class TestTaskLifecycle:
    """测试任务完整生命周期"""
    
    def test_full_task_lifecycle_success(self):
        """测试成功的任务生命周期"""
        manager = TaskManager()
        urls = ["url1", "url2"]
        
        # 1. 创建任务
        task_id = manager.create_task(urls, "user123")
        task = manager.get_task(task_id)
        assert task.status == TaskStatus.PENDING
        
        # 2. 开始处理
        manager.update_status(task_id, TaskStatus.PROCESSING)
        
        # 3. 处理第一个URL
        manager.update_progress(task_id, 1, "url1")
        manager.add_result(task_id, {"url": "url1", "count": 10})
        
        # 4. 处理第二个URL
        manager.update_progress(task_id, 2, "url2")
        manager.add_result(task_id, {"url": "url2", "count": 15})
        
        # 5. 完成任务
        manager.complete_task(task_id)
        
        # 验证最终状态
        task = manager.get_task(task_id)
        assert task.status == TaskStatus.COMPLETED
        assert task.current == 2
        assert len(task.results) == 2
        assert len(task.errors) == 0
    
    def test_full_task_lifecycle_with_errors(self):
        """测试带错误的任务生命周期"""
        manager = TaskManager()
        urls = ["url1", "url2", "url3"]
        
        # 1. 创建并开始
        task_id = manager.create_task(urls, "user123")
        manager.update_status(task_id, TaskStatus.PROCESSING)
        
        # 2. 第一个成功
        manager.update_progress(task_id, 1, "url1")
        manager.add_result(task_id, {"url": "url1", "count": 10})
        
        # 3. 第二个失败
        manager.update_progress(task_id, 2, "url2")
        manager.add_error(task_id, "Failed to process url2")
        
        # 4. 第三个成功
        manager.update_progress(task_id, 3, "url3")
        manager.add_result(task_id, {"url": "url3", "count": 20})
        
        # 5. 完成（虽然有错误）
        manager.complete_task(task_id)
        
        # 验证
        task = manager.get_task(task_id)
        assert task.status == TaskStatus.COMPLETED
        assert len(task.results) == 2
        assert len(task.errors) == 1
