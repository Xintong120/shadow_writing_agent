# websocket_manager.py
# 作用：管理WebSocket连接，广播进度更新

from fastapi import WebSocket
from typing import Dict, List
import json

class WebSocketManager:
    """WebSocket连接管理器"""
    
    def __init__(self):
        # 存储每个task_id对应的WebSocket连接列表
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, task_id: str):
        """
        建立WebSocket连接
        
        Args:
            websocket: WebSocket连接对象
            task_id: 任务ID
        """
        await websocket.accept()
        
        if task_id not in self.active_connections:
            self.active_connections[task_id] = []
        
        self.active_connections[task_id].append(websocket)
        print(f"[WS MANAGER] 新连接: task_id={task_id}, 连接数={len(self.active_connections[task_id])}")
    
    def disconnect(self, websocket: WebSocket, task_id: str):
        """
        断开WebSocket连接
        
        Args:
            websocket: WebSocket连接对象
            task_id: 任务ID
        """
        if task_id in self.active_connections:
            if websocket in self.active_connections[task_id]:
                self.active_connections[task_id].remove(websocket)
                print(f"[WS MANAGER] 断开连接: task_id={task_id}, 剩余连接数={len(self.active_connections[task_id])}")
            
            # 如果没有连接了，删除key
            if len(self.active_connections[task_id]) == 0:
                del self.active_connections[task_id]
    
    async def send_json(self, task_id: str, data: dict):
        """
        向指定task_id的所有连接发送JSON数据
        
        Args:
            task_id: 任务ID
            data: 要发送的数据
        """
        if task_id not in self.active_connections:
            return
        
        disconnected = []
        
        for connection in self.active_connections[task_id]:
            try:
                await connection.send_json(data)
            except Exception as e:
                print(f"[WS MANAGER] 发送失败: {e}")
                disconnected.append(connection)
        
        # 清理失败的连接
        for connection in disconnected:
            self.disconnect(connection, task_id)
    
    async def broadcast_progress(self, task_id: str, message_type: str, data: dict):
        """
        广播进度更新
        
        Args:
            task_id: 任务ID
            message_type: 消息类型（progress, step, url_completed, error, completed等）
            data: 消息数据
        """
        message = {
            "type": message_type,
            "timestamp": self._get_timestamp(),
            **data
        }
        
        await self.send_json(task_id, message)
        print(f"[WS MANAGER] 广播消息: task_id={task_id}, type={message_type}")
    
    def _get_timestamp(self) -> str:
        """获取当前时间戳"""
        from datetime import datetime
        return datetime.now().isoformat()
    
    def get_connection_count(self, task_id: str) -> int:
        """获取指定任务的连接数"""
        if task_id in self.active_connections:
            return len(self.active_connections[task_id])
        return 0


# 全局WebSocket管理器实例
ws_manager = WebSocketManager()
