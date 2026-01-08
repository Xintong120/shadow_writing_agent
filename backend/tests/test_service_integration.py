# tests/test_service_integration.py
# Service层集成测试

import pytest
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from app.main import app

from app.services import TEDProcessingService, TEDSearchService, TEDBatchService
from app.utils import get_ted_processing_service, get_ted_search_service, get_ted_batch_service


class TestServiceIntegration:
    """服务集成测试"""

    def setup_method(self):
        """设置测试环境"""
        self.client = TestClient(app)

    @patch('app.services.ted_processing_service.parse_ted_file')
    @patch('app.services.ted_processing_service.process_ted_text')
    def test_processing_service_with_dependency_injection(self, mock_process_ted, mock_parse):
        """测试通过依赖注入获取的ProcessingService"""
        # 模拟成功处理
        mock_parse.return_value = {
            'title': 'Integration Test Talk',
            'speaker': 'Integration Speaker',
            'url': 'https://ted.com/talks/integration',
            'duration': '15:00',
            'views': 50000,
            'transcript': 'This is an integration test transcript with sufficient length.'
        }
        mock_process_ted.return_value = {
            'success': True,
            'results': [{'original': 'test', 'shadow': 'integration shadow'}],
            'result_count': 1
        }

        # 测试依赖注入函数
        service = get_ted_processing_service()
        assert isinstance(service, TEDProcessingService)
        assert service.llm is not None
        assert service.memory_service is not None

    @patch('app.services.ted_search_service.create_search_workflow')
    def test_search_service_with_dependency_injection(self, mock_create_workflow):
        """测试通过依赖注入获取的SearchService"""
        # 模拟搜索工作流
        mock_workflow = Mock()
        mock_workflow.invoke.return_value = {
            'ted_candidates': [{
                'title': 'Integration Search Talk',
                'speaker': 'Search Speaker',
                'url': 'https://ted.com/talks/search',
                'score': 0.9
            }],
            'search_context': {'optimized_query': 'integration search'}
        }
        mock_create_workflow.return_value = mock_workflow

        # 测试依赖注入函数
        service = get_ted_search_service()
        assert isinstance(service, TEDSearchService)
        assert service.llm is not None
        assert service.memory_service is not None

    def test_batch_service_with_dependency_injection(self):
        """测试通过依赖注入获取的BatchService"""
        service = get_ted_batch_service()
        assert isinstance(service, TEDBatchService)
        assert service.task_manager is not None

    @patch('app.services.ted_processing_service.parse_ted_file')
    @patch('app.services.ted_processing_service.process_ted_text')
    def test_processing_service_memory_integration(self, mock_process_ted, mock_parse):
        """测试ProcessingService与MemoryService的集成"""
        # 模拟文件处理
        mock_parse.return_value = {
            'title': 'Memory Integration Talk',
            'speaker': 'Memory Speaker',
            'url': 'https://ted.com/talks/memory',
            'duration': '12:00',
            'views': 75000,
            'transcript': 'This transcript tests memory service integration.'
        }
        mock_process_ted.return_value = {
            'success': True,
            'results': [{'original': 'memory', 'shadow': 'service integration'}],
            'result_count': 1
        }

        service = get_ted_processing_service()

        # 验证memory_service有save_ted_result方法
        assert hasattr(service.memory_service, 'save_ted_result')

    @patch('app.services.ted_search_service.create_search_workflow')
    def test_search_service_memory_integration(self, mock_create_workflow):
        """测试SearchService与MemoryService的集成"""
        # 模拟搜索结果
        mock_workflow = Mock()
        mock_workflow.invoke.return_value = {
            'ted_candidates': [{
                'title': 'Search Memory Talk',
                'speaker': 'Memory Speaker',
                'url': 'https://ted.com/talks/search_memory',
                'score': 0.95
            }],
            'search_context': {'optimized_query': 'search memory integration'}
        }
        mock_create_workflow.return_value = mock_workflow

        service = get_ted_search_service()

        # 验证memory_service有add_search_history方法
        assert hasattr(service.memory_service, 'add_search_history')

    def test_batch_service_task_manager_integration(self):
        """测试BatchService与TaskManager的集成"""
        service = get_ted_batch_service()

        # 验证task_manager有create_task方法
        assert hasattr(service.task_manager, 'create_task')
        assert hasattr(service.task_manager, 'get_task')


class TestServiceCollaboration:
    """服务间协作测试"""

    @patch('app.services.ted_batch_service.process_urls_batch')
    @pytest.mark.asyncio
    async def test_batch_processing_workflow(self, mock_process_batch):
        """测试批量处理完整工作流"""
        service = get_ted_batch_service()

        # 创建批量任务
        result = await service.create_batch_task(
            ["https://ted.com/talks/test1", "https://ted.com/talks/test2"],
            "test_user"
        )

        assert result.success == True
        assert result.task_id is not None
        assert result.total == 2

        # 验证异步处理会被调用
        if result.success:
            mock_background_tasks = Mock()
            await service.start_async_batch_processing(result.task_id, ["https://ted.com/talks/test1", "https://ted.com/talks/test2"], mock_background_tasks)
            mock_background_tasks.add_task.assert_called_once()

    def test_services_dependency_chain(self):
        """测试服务依赖链"""
        # 获取所有服务
        processing_svc = get_ted_processing_service()
        search_svc = get_ted_search_service()
        batch_svc = get_ted_batch_service()

        # 验证每个服务都有正确的依赖
        assert processing_svc.llm is not None
        assert processing_svc.memory_service is not None

        assert search_svc.llm is not None
        assert search_svc.memory_service is not None

        assert batch_svc.task_manager is not None

        # 验证服务类型
        assert isinstance(processing_svc, TEDProcessingService)
        assert isinstance(search_svc, TEDSearchService)
        assert isinstance(batch_svc, TEDBatchService)