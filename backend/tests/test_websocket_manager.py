# test_websocket_manager.py
# 作用：测试WebSocket管理器
# 测试目标：app/websocket_manager.py

import pytest
from unittest.mock import Mock, AsyncMock
from app.websocket_manager import WebSocketManager, ws_manager
from app.enums import MessageType


class TestWebSocketManager:
    """测试WebSocketManager类"""
    
    def setup_method(self):
        """每个测试前创建新的管理器实例"""
        self.manager = WebSocketManager()
    
    def test_init(self):
        """测试初始化"""
        assert self.manager.active_connections == {}
    
    @pytest.mark.asyncio
    async def test_connect(self):
        """测试WebSocket连接"""
        mock_websocket = AsyncMock()
        task_id = "task-123"
        
        await self.manager.connect(mock_websocket, task_id)
        
        # 验证连接已添加
        assert task_id in self.manager.active_connections
        assert mock_websocket in self.manager.active_connections[task_id]
        assert len(self.manager.active_connections[task_id]) == 1
        
        # 验证accept被调用
        mock_websocket.accept.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_connect_multiple_clients_same_task(self):
        """测试同一任务的多个客户端连接"""
        mock_ws1 = AsyncMock()
        mock_ws2 = AsyncMock()
        task_id = "task-123"
        
        await self.manager.connect(mock_ws1, task_id)
        await self.manager.connect(mock_ws2, task_id)
        
        assert len(self.manager.active_connections[task_id]) == 2
        assert mock_ws1 in self.manager.active_connections[task_id]
        assert mock_ws2 in self.manager.active_connections[task_id]
    
    @pytest.mark.asyncio
    async def test_connect_different_tasks(self):
        """测试不同任务的连接"""
        mock_ws1 = AsyncMock()
        mock_ws2 = AsyncMock()
        task_id_1 = "task-1"
        task_id_2 = "task-2"
        
        await self.manager.connect(mock_ws1, task_id_1)
        await self.manager.connect(mock_ws2, task_id_2)
        
        assert len(self.manager.active_connections) == 2
        assert task_id_1 in self.manager.active_connections
        assert task_id_2 in self.manager.active_connections
    
    def test_disconnect(self):
        """测试断开连接"""
        mock_websocket = Mock()
        task_id = "task-123"
        
        # 手动添加连接
        self.manager.active_connections[task_id] = [mock_websocket]
        
        # 断开连接
        self.manager.disconnect(mock_websocket, task_id)
        
        # 验证连接已移除，key已删除
        assert task_id not in self.manager.active_connections
    
    def test_disconnect_multiple_clients(self):
        """测试断开多个客户端中的一个"""
        mock_ws1 = Mock()
        mock_ws2 = Mock()
        task_id = "task-123"
        
        self.manager.active_connections[task_id] = [mock_ws1, mock_ws2]
        
        self.manager.disconnect(mock_ws1, task_id)
        
        # 验证只有ws1被移除
        assert task_id in self.manager.active_connections
        assert mock_ws1 not in self.manager.active_connections[task_id]
        assert mock_ws2 in self.manager.active_connections[task_id]
    
    def test_disconnect_nonexistent_task(self):
        """测试断开不存在的任务连接（不应报错）"""
        mock_websocket = Mock()
        self.manager.disconnect(mock_websocket, "nonexistent-task")
        # 不应该抛出异常
    
    @pytest.mark.asyncio
    async def test_send_json(self):
        """测试发送JSON数据"""
        mock_websocket = AsyncMock()
        task_id = "task-123"
        
        self.manager.active_connections[task_id] = [mock_websocket]
        
        data = {"type": "test", "message": "Hello"}
        await self.manager.send_json(task_id, data)
        
        mock_websocket.send_json.assert_called_once_with(data)
    
    @pytest.mark.asyncio
    async def test_send_json_multiple_clients(self):
        """测试向多个客户端发送数据"""
        mock_ws1 = AsyncMock()
        mock_ws2 = AsyncMock()
        task_id = "task-123"
        
        self.manager.active_connections[task_id] = [mock_ws1, mock_ws2]
        
        data = {"type": "test", "message": "Hello"}
        await self.manager.send_json(task_id, data)
        
        # 两个客户端都应该收到
        mock_ws1.send_json.assert_called_once_with(data)
        mock_ws2.send_json.assert_called_once_with(data)
    
    @pytest.mark.asyncio
    async def test_send_json_nonexistent_task(self):
        """测试向不存在的任务发送数据（不应报错）"""
        await self.manager.send_json("nonexistent-task", {"test": "data"})
        # 不应该抛出异常
    
    @pytest.mark.asyncio
    async def test_send_json_with_failed_connection(self):
        """测试发送数据时连接失败"""
        mock_ws_good = AsyncMock()
        mock_ws_bad = AsyncMock()
        mock_ws_bad.send_json.side_effect = Exception("Connection closed")
        
        task_id = "task-123"
        self.manager.active_connections[task_id] = [mock_ws_good, mock_ws_bad]
        
        await self.manager.send_json(task_id, {"test": "data"})
        
        # 好的连接应该收到数据
        mock_ws_good.send_json.assert_called_once()
        
        # 失败的连接应该被移除
        assert mock_ws_bad not in self.manager.active_connections[task_id]
        assert mock_ws_good in self.manager.active_connections[task_id]
    
    @pytest.mark.asyncio
    async def test_broadcast_progress_with_enum(self):
        """测试使用枚举类型广播进度"""
        mock_websocket = AsyncMock()
        task_id = "task-123"
        
        self.manager.active_connections[task_id] = [mock_websocket]
        
        data = {"current": 1, "total": 5}
        await self.manager.broadcast_progress(task_id, MessageType.PROGRESS, data)
        
        # 验证send_json被调用
        assert mock_websocket.send_json.call_count == 1
        
        # 获取实际发送的数据
        call_args = mock_websocket.send_json.call_args[0][0]
        assert call_args["type"] == "progress"
        assert call_args["current"] == 1
        assert call_args["total"] == 5
        assert "timestamp" in call_args
    
    @pytest.mark.asyncio
    async def test_broadcast_progress_with_string(self):
        """测试使用字符串类型广播进度"""
        mock_websocket = AsyncMock()
        task_id = "task-123"
        
        self.manager.active_connections[task_id] = [mock_websocket]
        
        data = {"message": "Test"}
        await self.manager.broadcast_progress(task_id, "custom_type", data)
        
        call_args = mock_websocket.send_json.call_args[0][0]
        assert call_args["type"] == "custom_type"
        assert call_args["message"] == "Test"
    
    @pytest.mark.asyncio
    async def test_broadcast_progress_all_message_types(self):
        """测试所有消息类型的广播"""
        mock_websocket = AsyncMock()
        task_id = "task-123"
        self.manager.active_connections[task_id] = [mock_websocket]
        
        message_types = [
            MessageType.CONNECTED,
            MessageType.STARTED,
            MessageType.PROGRESS,
            MessageType.STEP,
            MessageType.URL_COMPLETED,
            MessageType.ERROR,
            MessageType.COMPLETED,
            MessageType.TASK_COMPLETED
        ]
        
        for msg_type in message_types:
            await self.manager.broadcast_progress(task_id, msg_type, {"test": "data"})
        
        assert mock_websocket.send_json.call_count == len(message_types)
    
    def test_get_connection_count(self):
        """测试获取连接数"""
        task_id = "task-123"
        
        # 没有连接
        assert self.manager.get_connection_count(task_id) == 0
        
        # 添加连接
        self.manager.active_connections[task_id] = [Mock(), Mock(), Mock()]
        assert self.manager.get_connection_count(task_id) == 3
    
    def test_get_connection_count_nonexistent_task(self):
        """测试获取不存在任务的连接数"""
        assert self.manager.get_connection_count("nonexistent") == 0
    
    def test_get_timestamp(self):
        """测试获取时间戳"""
        timestamp = self.manager._get_timestamp()
        
        assert isinstance(timestamp, str)
        assert len(timestamp) > 0
        # 验证是ISO格式
        from datetime import datetime
        parsed = datetime.fromisoformat(timestamp)
        assert parsed is not None


class TestGlobalWebSocketManager:
    """测试全局WebSocket管理器实例"""
    
    def test_global_instance_exists(self):
        """测试全局实例存在"""
        assert ws_manager is not None
        assert isinstance(ws_manager, WebSocketManager)
    
    def test_global_instance_is_singleton(self):
        """测试全局实例是单例"""
        from app.websocket_manager import ws_manager as wm2
        assert ws_manager is wm2


class TestWebSocketIntegration:
    """测试WebSocket集成场景"""
    
    @pytest.mark.asyncio
    async def test_connect_broadcast_disconnect_flow(self):
        """测试连接-广播-断开的完整流程"""
        manager = WebSocketManager()
        mock_websocket = AsyncMock()
        task_id = "task-123"
        
        # 1. 连接
        await manager.connect(mock_websocket, task_id)
        assert manager.get_connection_count(task_id) == 1
        
        # 2. 广播消息
        await manager.broadcast_progress(
            task_id, 
            MessageType.STARTED, 
            {"total": 3}
        )
        assert mock_websocket.send_json.call_count == 1
        
        # 3. 断开
        manager.disconnect(mock_websocket, task_id)
        assert manager.get_connection_count(task_id) == 0
    
    @pytest.mark.asyncio
    async def test_multiple_tasks_isolation(self):
        """测试多任务隔离"""
        manager = WebSocketManager()
        
        mock_ws_task1 = AsyncMock()
        mock_ws_task2 = AsyncMock()
        
        task_id_1 = "task-1"
        task_id_2 = "task-2"
        
        # 连接到不同任务
        await manager.connect(mock_ws_task1, task_id_1)
        await manager.connect(mock_ws_task2, task_id_2)
        
        # 向task-1广播
        await manager.broadcast_progress(task_id_1, MessageType.PROGRESS, {"msg": "1"})
        
        # 只有task-1的websocket应该收到
        assert mock_ws_task1.send_json.call_count == 1
        assert mock_ws_task2.send_json.call_count == 0
