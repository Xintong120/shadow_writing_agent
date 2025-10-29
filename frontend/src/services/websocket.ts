import type { BatchProgressMessage } from '@/types'

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
const IS_DEBUG = import.meta.env.VITE_ENABLE_DEBUG === 'true'

export interface WebSocketCallbacks {
  onConnected?: (data: any) => void
  onProgress?: (data: BatchProgressMessage) => void
  onStep?: (data: BatchProgressMessage) => void
  onUrlCompleted?: (data: BatchProgressMessage) => void
  onCompleted?: (data: BatchProgressMessage) => void
  onError?: (error: string) => void
  onClose?: (code: number, reason: string) => void
}

export class WebSocketService {
  private ws: WebSocket | null = null
  private taskId: string | null = null
  private callbacks: WebSocketCallbacks = {}
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private heartbeatInterval: number | null = null
  private isManualClose = false

  /**
   * 连接到WebSocket服务器
   * @param taskId 任务ID
   * @param callbacks 回调函数集合
   */
  connect(taskId: string, callbacks: WebSocketCallbacks): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      if (IS_DEBUG) console.warn('WebSocket already connected')
      return
    }

    this.taskId = taskId
    this.callbacks = callbacks
    this.isManualClose = false

    const wsUrl = `${WS_BASE}/ws/progress/${taskId}`

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        if (IS_DEBUG) console.log('WebSocket connected:', taskId)
        this.reconnectAttempts = 0
        this.startHeartbeat()
        this.callbacks.onConnected?.({ taskId, timestamp: Date.now() })
      }

      this.ws.onmessage = (event) => {
        try {
          const message: BatchProgressMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
            this.callbacks.onError?.('WebSocket连接错误')
      }

      this.ws.onclose = (event) => {
        if (IS_DEBUG) console.log('WebSocket closed:', event.code, event.reason)
        this.stopHeartbeat()

        this.callbacks.onClose?.(event.code, event.reason)

        // 非正常关闭且非手动关闭时尝试重连
        if (!this.isManualClose && event.code !== 1000) {
          this.attemptReconnect()
        }
      }
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      this.callbacks.onError?.('无法建立WebSocket连接')
    }
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(message: BatchProgressMessage): void {
    if (IS_DEBUG) console.log('WebSocket message:', message)

    switch (message.type) {
      case 'started':
        this.callbacks.onProgress?.(message)
        break

      case 'progress':
        this.callbacks.onProgress?.(message)
        break

      case 'step':
        this.callbacks.onStep?.(message)
        break

      case 'url_completed':
        this.callbacks.onUrlCompleted?.(message)
        break

      case 'completed':
        this.callbacks.onCompleted?.(message)
        this.disconnect() // 任务完成，主动断开连接
        break

      case 'error':
        this.callbacks.onError?.(message.error || '处理过程中发生错误')
        break

      default:
        if (IS_DEBUG) console.warn('Unknown message type:', message.type)
    }
  }

  /**
   * 尝试重连
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket reconnection failed: max attempts reached')
      this.callbacks.onError?.('无法重新连接到服务器')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * this.reconnectAttempts

    if (IS_DEBUG) {
      console.log(`Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`)
    }

    setTimeout(() => {
      if (this.taskId) {
        this.connect(this.taskId, this.callbacks)
      }
    }, delay)
  }

  /**
   * 启动心跳检测
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()

    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: 'ping' }))
        } catch (error) {
          console.error('Failed to send heartbeat:', error)
        }
      }
    }, 30000) // 每30秒发送一次心跳
  }

  /**
   * 停止心跳检测
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.isManualClose = true
    this.stopHeartbeat()

    if (this.ws) {
      try {
        this.ws.close(1000, 'Client closed connection')
      } catch (error) {
        console.error('Failed to close WebSocket:', error)
      }
      this.ws = null
    }

    this.taskId = null
    this.callbacks = {}
    this.reconnectAttempts = 0
  }

  /**
   * 获取当前连接状态
   */
  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// 创建单例实例
export const websocketService = new WebSocketService()

export default websocketService