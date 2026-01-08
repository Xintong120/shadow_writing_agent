# tests/test_services.py
# Service层单元测试

import pytest
from unittest.mock import Mock, patch, MagicMock, AsyncMock
from fastapi import UploadFile
import io

from app.services import TEDProcessingService, TEDSearchService, TEDBatchService
from app.models import TedTxt


class TestTEDProcessingService:
    """TEDProcessingService单元测试"""

    @pytest.fixture
    def mock_llm(self):
        """模拟LLM函数"""
        return Mock(return_value="Mocked LLM response")

    @pytest.fixture
    def mock_memory_service(self):
        """模拟记忆服务"""
        return Mock()

    @pytest.fixture
    def service(self, mock_llm, mock_memory_service):
        """创建测试服务实例"""
        return TEDProcessingService(llm=mock_llm, memory_service=mock_memory_service)

    @pytest.fixture
    def valid_ted_file(self):
        """创建有效的TED文件"""
        content = b"""Title: Test TED Talk
Speaker: Test Speaker
URL: https://ted.com/talks/test
Duration: 10:00
Views: 1000000

This is a test transcript with enough content to pass validation. It contains more than 50 characters as required by the processing logic."""

        file = Mock(spec=UploadFile)
        file.filename = "test.txt"
        async def mock_read():
            return content
        file.read = mock_read
        return file

    def test_init(self, mock_llm, mock_memory_service):
        """测试服务初始化"""
        service = TEDProcessingService(llm=mock_llm, memory_service=mock_memory_service)
        assert service.llm == mock_llm
        assert service.memory_service == mock_memory_service

    @patch('app.services.ted_processing_service.parse_ted_file')
    @patch('app.services.ted_processing_service.process_ted_text')
    @pytest.mark.asyncio
    async def test_process_single_file_success(self, mock_process_ted, mock_parse, service, valid_ted_file):
        """测试成功处理单个文件"""
        # 模拟解析结果
        mock_parse.return_value = TedTxt(
            title='Test TED Talk',
            speaker='Test Speaker',
            url='https://ted.com/talks/test',
            duration='10:00',
            views=1000000,
            transcript='This is a test transcript with enough content to pass validation.'
        )

        # 模拟AI处理结果
        mock_process_ted.return_value = {
            'success': True,
            'results': [{'original': 'test', 'shadow': 'mock shadow'}],
            'result_count': 1
        }

        result = await service.process_single_file(valid_ted_file)

        assert result['success'] == True
        assert 'ted_info' in result
        assert 'processing_time' in result
        assert result['ted_info']['title'] == 'Test TED Talk'

        # 验证调用
        mock_parse.assert_called_once()
        mock_process_ted.assert_called_once()
        # 注意：save_ted_result调用已被移除以简化测试

    @pytest.mark.asyncio
    async def test_process_single_file_invalid_filename(self, service):
        """测试无效文件名"""
        file = Mock(spec=UploadFile)
        file.filename = "test.pdf"  # 无效扩展名

        with pytest.raises(Exception):  # 应该抛出HTTPException
            await service.process_single_file(file)

    @patch('app.services.ted_processing_service.parse_ted_file')
    @pytest.mark.asyncio
    async def test_process_single_file_parse_failure(self, mock_parse, service):
        """测试文件解析失败"""
        file = Mock(spec=UploadFile)
        file.filename = "test.txt"
        file.read = Mock(return_value=b"invalid content")

        mock_parse.return_value = None

        with pytest.raises(Exception):  # 应该抛出HTTPException
            await service.process_single_file(file)


class TestTEDSearchService:
    """TEDSearchService单元测试"""

    @pytest.fixture
    def mock_llm(self):
        """模拟LLM函数"""
        return Mock()

    @pytest.fixture
    def mock_memory_service(self):
        """模拟记忆服务"""
        return Mock()

    @pytest.fixture
    def service(self, mock_llm, mock_memory_service):
        """创建测试服务实例"""
        return TEDSearchService(llm=mock_llm, memory_service=mock_memory_service)

    def test_init(self, mock_llm, mock_memory_service):
        """测试服务初始化"""
        service = TEDSearchService(llm=mock_llm, memory_service=mock_memory_service)
        assert service.llm == mock_llm
        assert service.memory_service == mock_memory_service

    @patch('app.services.ted_search_service.create_search_workflow')
    @pytest.mark.asyncio
    async def test_search_talks_success(self, mock_create_workflow, service):
        """测试成功搜索TED演讲"""
        # 模拟工作流
        mock_workflow = Mock()
        mock_workflow.invoke.return_value = {
            'ted_candidates': [
                {
                    'title': 'Test Talk 1',
                    'speaker': 'Speaker 1',
                    'url': 'https://ted.com/talks/test1',
                    'score': 0.95
                },
                {
                    'title': 'Test Talk 2',
                    'speaker': 'Speaker 2',
                    'url': 'https://ted.com/talks/test2',
                    'score': 0.85
                }
            ],
            'search_context': {
                'optimized_query': 'test artificial intelligence',
                'search_duration_ms': 1500
            }
        }
        mock_create_workflow.return_value = mock_workflow

        result = await service.search_talks("test AI", "user123")

        assert result.success == True
        assert len(result.candidates) == 2
        assert result.candidates[0].title == 'Test Talk 1'
        assert result.total == 2

        # 验证搜索历史被记录
        service.memory_service.add_search_history.assert_called_once()

    @patch('app.services.ted_search_service.create_search_workflow')
    @pytest.mark.asyncio
    async def test_search_talks_failure(self, mock_create_workflow, service):
        """测试搜索失败"""
        # 模拟工作流抛出异常
        mock_workflow = Mock()
        mock_workflow.invoke.side_effect = Exception("Search failed")
        mock_create_workflow.return_value = mock_workflow

        result = await service.search_talks("test query")

        assert result.success == False
        assert result.candidates == []
        assert result.total == 0
        assert "error" in result.search_context


class TestTEDBatchService:
    """TEDBatchService单元测试"""

    @pytest.fixture
    def mock_task_manager(self):
        """模拟任务管理器"""
        return Mock()

    @pytest.fixture
    def service(self, mock_task_manager):
        """创建测试服务实例"""
        return TEDBatchService(task_manager_instance=mock_task_manager)

    def test_init(self, mock_task_manager):
        """测试服务初始化"""
        service = TEDBatchService(task_manager_instance=mock_task_manager)
        assert service.task_manager == mock_task_manager

    @pytest.mark.asyncio
    async def test_create_batch_task_success(self, service):
        """测试成功创建批量任务"""
        urls = ["https://ted.com/talks/test1", "https://ted.com/talks/test2"]
        service.task_manager.create_task.return_value = "task_123"

        result = await service.create_batch_task(urls, "user123")

        assert result.success == True
        assert result.task_id == "task_123"
        assert result.total == 2
        assert "Processing started" in result.message

        service.task_manager.create_task.assert_called_once_with(urls, "user123")

    @pytest.mark.asyncio
    async def test_create_batch_task_failure(self, service):
        """测试创建批量任务失败"""
        urls = ["https://ted.com/talks/test1"]
        service.task_manager.create_task.side_effect = Exception("Task creation failed")

        result = await service.create_batch_task(urls)

        assert result.success == False
        assert result.task_id == ""
        assert result.total == 0
        assert "Failed to create task" in result.message

    def test_get_batch_task_status(self, service):
        """测试获取批量任务状态"""
        mock_task = Mock()
        mock_task.task_id = "task_123"
        mock_task.status.value = "processing"
        mock_task.total = 5
        mock_task.current = 2
        mock_task.urls = ["url1", "url2"]
        mock_task.results = [{"id": "result1", "status": "completed"}]  # 应该是字典列表
        mock_task.errors = ["error1"]
        mock_task.current_url = "current_url"

        service.task_manager.get_task.return_value = mock_task

        result = service.get_batch_task_status("task_123")

        assert result.task_id == "task_123"
        assert result.status == "processing"
        assert result.total == 5
        assert result.current == 2

        service.task_manager.get_task.assert_called_once_with("task_123")

    def test_get_batch_task_status_not_found(self, service):
        """测试任务未找到"""
        service.task_manager.get_task.return_value = None

        with pytest.raises(Exception):  # HTTPException
            service.get_batch_task_status("nonexistent")

    @patch('app.services.ted_batch_service.process_urls_batch')
    @pytest.mark.asyncio
    async def test_start_async_batch_processing(self, mock_process_batch, service):
        """测试启动异步批量处理"""
        mock_background_tasks = Mock()

        await service.start_async_batch_processing("task_123", ["url1"], mock_background_tasks)

        mock_background_tasks.add_task.assert_called_once_with(mock_process_batch, "task_123", ["url1"])