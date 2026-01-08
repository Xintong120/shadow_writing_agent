# tests/test_end_to_end.py
# 端到端测试 - 从HTTP请求到服务层再到数据库的完整流程

import pytest
from fastapi.testclient import TestClient
from app.main import app


class TestEndToEndAPI:
    """端到端API测试"""

    def setup_method(self):
        """设置测试客户端"""
        self.client = TestClient(app)

    def test_health_endpoint_e2e(self):
        """测试健康检查端点端到端"""
        response = self.client.get("/api/v1/health")

        assert response.status_code == 200
        data = response.json()

        # 验证健康检查响应
        assert data["status"] == "ok"
        assert "model" in data
        assert "dependency_injection" in data
        assert data["dependency_injection"] == "enabled"

    def test_full_api_workflow_simulation(self):
        """测试完整API工作流模拟（不依赖外部LLM）"""
        # 注意：由于没有配置API Key，这些端点会失败
        # 但我们测试路由和依赖注入是否正常工作

        # 1. 测试文件处理端点路由
        response = self.client.post("/api/v1/process-file", files={})
        # 预期会失败（因为没有文件或API Key），但路由应该存在
        assert response.status_code in [200, 400, 422, 500]

        # 2. 测试搜索端点路由
        response = self.client.post(
            "/api/v1/search-ted",
            json={"topic": "test topic"}
        )
        assert response.status_code in [200, 500]

        # 3. 测试批量处理端点路由
        response = self.client.post(
            "/api/v1/process-batch",
            json={"urls": ["https://ted.com/talks/test"]}
        )
        assert response.status_code in [200, 500]

        # 4. 测试任务状态端点路由
        response = self.client.get("/api/v1/task/test_task_id")
        assert response.status_code == 404  # 任务不存在

    def test_dependency_injection_e2e(self):
        """测试依赖注入的端到端工作"""
        # 健康检查应该显示依赖注入已启用
        response = self.client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["dependency_injection"] == "enabled"

    def test_cors_headers_e2e(self):
        """测试CORS头端到端"""
        # 发送OPTIONS预检请求
        response = self.client.options(
            "/api/v1/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET"
            }
        )

        # 验证CORS头（如果配置了CORS）
        if "access-control-allow-origin" in response.headers:
            assert "localhost" in response.headers["access-control-allow-origin"]


class TestServiceLayerIntegration:
    """服务层集成测试"""

    def test_service_imports_e2e(self):
        """测试服务层完整导入"""
        try:
            from app.services import TEDProcessingService, TEDSearchService, TEDBatchService
            from app.utils import (
                get_ted_processing_service,
                get_ted_search_service,
                get_ted_batch_service,
                get_memory_service
            )

            # 测试服务实例化
            processing_svc = get_ted_processing_service()
            search_svc = get_ted_search_service()
            batch_svc = get_ted_batch_service()
            memory_svc = get_memory_service()

            # 验证服务类型
            assert isinstance(processing_svc, TEDProcessingService)
            assert isinstance(search_svc, TEDSearchService)
            assert isinstance(batch_svc, TEDBatchService)

            # 验证依赖注入
            assert processing_svc.llm is not None
            assert processing_svc.memory_service is not None
            assert search_svc.llm is not None
            assert search_svc.memory_service is not None
            assert batch_svc.task_manager is not None

        except ImportError as e:
            pytest.fail(f"Service layer import failed: {e}")

    def test_memory_service_e2e(self):
        """测试记忆服务端到端"""
        from app.memory.service import MemoryService

        memory_svc = MemoryService()

        # 测试记忆服务方法存在
        assert hasattr(memory_svc, 'save_ted_result')
        assert hasattr(memory_svc, 'add_search_history')
        assert hasattr(memory_svc, 'get_seen_ted_urls')


class TestArchitectureVerification:
    """架构验证测试"""

    def test_service_layer_isolation(self):
        """测试服务层隔离性"""
        # 验证服务不直接依赖HTTP层
        from app.services import TEDProcessingService, TEDSearchService, TEDBatchService

        # 服务类不应该导入fastapi相关模块
        import inspect

        processing_source = inspect.getsource(TEDProcessingService)
        search_source = inspect.getsource(TEDSearchService)
        batch_source = inspect.getsource(TEDBatchService)

        # 验证不包含HTTP相关导入（除了测试中可能需要的）
        assert "from fastapi" not in processing_source
        assert "from fastapi" not in search_source
        assert "from fastapi" not in batch_source

    def test_dependency_injection_coverage(self):
        """测试依赖注入覆盖率"""
        from app.utils import (
            get_settings, get_llm, get_llm_light, get_llm_advanced,
            get_task_manager, get_sse_manager, get_api_monitor,
            get_concurrency_limiter, get_memory_service,
            get_ted_processing_service, get_ted_search_service, get_ted_batch_service
        )

        # 所有依赖注入函数都应该可用
        functions = [
            get_settings, get_llm, get_llm_light, get_llm_advanced,
            get_task_manager, get_sse_manager, get_api_monitor,
            get_concurrency_limiter, get_memory_service,
            get_ted_processing_service, get_ted_search_service, get_ted_batch_service
        ]

        for func in functions:
            assert callable(func), f"{func.__name__} should be callable"

    def test_service_responsibility_separation(self):
        """测试服务职责分离"""
        from app.services import TEDProcessingService, TEDSearchService, TEDBatchService

        # 每个服务应该有独特的方法
        processing_methods = [method for method in dir(TEDProcessingService) if not method.startswith('_')]
        search_methods = [method for method in dir(TEDSearchService) if not method.startswith('_')]
        batch_methods = [method for method in dir(TEDBatchService) if not method.startswith('_')]

        # ProcessingService 应该有 process_single_file
        assert 'process_single_file' in processing_methods

        # SearchService 应该有 search_talks
        assert 'search_talks' in search_methods

        # BatchService 应该有 create_batch_task
        assert 'create_batch_task' in batch_methods