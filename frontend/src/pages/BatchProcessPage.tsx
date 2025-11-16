import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/atoms/button'
import { ProgressOverview } from '@/components/molecules/ProgressOverview'
import { TaskList } from '@/components/organisms/TaskList'
import { LiveLogPanel } from '@/components/organisms/LiveLogPanel'
import { websocketService } from '@/services/websocket'
import { api, flattenBatchResults } from '@/services/api'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { BatchProgressMessage, TaskStatusResponse } from '@/types'

/**
 * BatchProcessPage - 批量处理进度页面
 * 显示实时处理进度、任务列表、日志和WebSocket状态
 */
function BatchProcessPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()

  // 页面状态
  const [taskData, setTaskData] = useState<TaskStatusResponse | null>(null)
  const [logs, setLogs] = useState<Array<{
    timestamp: string
    message: string
    type: 'info' | 'success' | 'error' | 'warning'
    step?: string
  }>>([])
  const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected')
  const [isLoading, setIsLoading] = useState(true)

  // WebSocket 回调
  const wsCallbacks = {
    onConnected: () => {
      setWsStatus('connected')
    },

    onProgress: (data: BatchProgressMessage) => {
      // 更新任务进度
      setTaskData(prev => {
        if (!prev) return null
        return {
          ...prev,
          progress: data.progress ?? prev.progress,
          current: data.current ?? prev.current,
          total: data.total ?? prev.total,
          currentUrl: data.currentUrl
        }
      })

      // 添加进度日志
      if (data.currentUrl) {
        addLog(`处理进度: ${data.current}/${data.total} - ${data.currentUrl}`, 'info')
      }
    },

    onStep: (data: BatchProgressMessage) => {
      addLog(data.log || data.message || '处理中...', 'info', data.step)
    },

    onUrlCompleted: (data: BatchProgressMessage) => {
      addLog(`✅ 完成: ${data.url} - ${data.result_count || 0} 个结果`, 'success')
    },

    onCompleted: (data: BatchProgressMessage) => {
      addLog('🎉 批量处理全部完成！', 'success')
      setWsStatus('connected') // 保持连接状态显示

      // 自动跳转到结果页面
      setTimeout(() => {
        navigate(`/results/${taskId}`)
      }, 2000)
    },

    onError: (error: string) => {
      addLog(`❌ 错误: ${error}`, 'error')
      setWsStatus('error')
    },

    onClose: () => {
      setWsStatus('disconnected')
    }
  }

  // 添加日志
  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', step?: string) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
      type,
      step
    }
    setLogs(prev => [...prev, logEntry])
  }

  // 清空日志
  const clearLogs = () => {
    setLogs([])
  }

  // 加载任务状态
  useEffect(() => {
    if (!taskId) return

    const loadTask = async () => {
      try {
        const response = await api.getTaskStatus(taskId)

        if (response) {
          setTaskData(response)

          // 如果任务已完成，直接跳转
          if (response.status === 'completed') {
            navigate(`/results/${taskId}`)
            return
          }
        } else {
          toast.error('加载任务失败')
          navigate('/')
        }
      } catch (error) {
        console.error('Failed to load task:', error)
        toast.error('加载任务失败')
        navigate('/')
      } finally {
        setIsLoading(false)
      }
    }

    loadTask()
  }, [taskId, navigate])

  // WebSocket 连接
  useEffect(() => {
    if (!taskId || isLoading) return

    // 连接 WebSocket
    websocketService.connect(taskId, wsCallbacks)

    // 组件卸载时断开连接
    return () => {
      websocketService.disconnect()
    }
  }, [taskId, isLoading])

  // 返回搜索页
  const handleBack = () => {
    navigate('/')
  }

  // 如果正在加载
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  // 如果没有任务数据
  if (!taskData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>任务不存在</p>
          <Button onClick={handleBack} className="mt-4">
            返回搜索
          </Button>
        </div>
      </div>
    )
  }

  const { status, progress = 0, current = 0, total = 0 } = taskData
  const isCompleted = status === 'completed'

  // 构建任务列表（简化版，实际项目中应从API获取详细的TED信息）
  const taskItems = Array.from({ length: total }, (_, index) => ({
    id: `${taskId}_${index}`,
    url: `ted_${index + 1}`,
    status: status === 'completed' ? 'completed' as const :
            status === 'running' && index === current - 1 ? 'processing' as const :
            index < current ? 'completed' as const : 'pending' as const,
    tedInfo: { title: `TED ${index + 1}`, speaker: '加载中...' } // 简化版，实际应从API获取
  }))

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* WebSocket 状态指示器 */}
      <WebSocketStatus status={wsStatus} />

      {/* 顶部导航 */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回搜索
        </Button>

        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {isCompleted ? '✅ 批量处理完成' : `正在处理 ${total} 个TED演讲`}
          </h1>
        </div>
      </div>

      {/* 总体进度 */}
      <div className="mb-8">
        <ProgressOverview
          total={total}
          current={current}
          status={status}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：任务列表 */}
        <div className="lg:col-span-2">
          <TaskList
            tasks={taskItems}
            currentTaskId={status === 'running' ? `${taskId}_${current - 1}` : null}
          />
        </div>

        {/* 右侧：实时日志 */}
        <div>
          <LiveLogPanel
            logs={logs}
            onClearLogs={clearLogs}
          />
        </div>
      </div>

      {/* 完成状态 */}
      {isCompleted && (
        <div className="mt-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">处理完成！</h2>
          <p className="text-muted-foreground mb-6">
            处理完成，共提取 Shadow Writing 结果
          </p>
          <Button onClick={() => navigate(`/results/${taskId}`)}>
            查看学习结果 →
          </Button>
        </div>
      )}
    </div>
  )
}

export default BatchProcessPage