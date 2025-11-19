import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/atoms/button'
import { ProgressOverview } from '@/components/molecules/ProgressOverview'
import { TaskList } from '@/components/organisms/TaskList'
import { LiveLogPanel } from '@/components/organisms/LiveLogPanel'
import { WebSocketStatus } from '@/components/atoms/websocket_status'
import { websocketService } from '@/services/websocket'
import { api, flattenBatchResults } from '@/services/api'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useMantineTheme, Box, Group, Text, SimpleGrid, Title } from '@mantine/core'
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'
import type { BatchProgressMessage, TaskStatusResponse } from '@/types'

/**
 * BatchProcessPage - 批量处理进度页面
 * 显示实时处理进度、任务列表、日志和WebSocket状态
 */
function BatchProcessPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const theme = useMantineTheme()
  const colors = getSemanticColors(theme)
  const spacing = getSpacing(theme)

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
      <Box
        maw="1200px"
        mx="auto"
        p="xl"
        style={{
          backgroundColor: colors.background,
          minHeight: '100vh'
        }}
      >
        <Text size="lg" ta="center" style={{ color: colors.text }}>
          加载中...
        </Text>
      </Box>
    )
  }

  // 如果没有任务数据
  if (!taskData) {
    return (
      <Box
        maw="1200px"
        mx="auto"
        p="xl"
        style={{
          backgroundColor: colors.background,
          minHeight: '100vh'
        }}
      >
        <Text size="lg" ta="center" style={{ color: colors.text, marginBottom: spacing.md }}>
          任务不存在
        </Text>
        <Button onClick={handleBack} style={{ marginTop: spacing.md }}>
          返回搜索
        </Button>
      </Box>
    )
  }

  const { status, progress = 0, current = 0, total = 0 } = taskData
  const isCompleted = status === 'completed'

  // 状态映射：将API状态转换为ProgressOverview期望的状态类型
  const mappedStatus: 'processing' | 'completed' | 'failed' | 'pending' =
    status === 'running' ? 'processing' :
    status === 'failed' ? 'failed' :
    status === 'completed' ? 'completed' : 'pending'

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
    <Box
      maw="1200px"
      mx="auto"
      p="xl"
      style={{
        backgroundColor: colors.background,
        minHeight: '100vh'
      }}
    >
      {/* WebSocket 状态指示器 */}
      <WebSocketStatus status={wsStatus} />

      {/* 顶部导航 */}
      <Group gap="sm" mb="md" align="center">
        <Button
          variant="outline"
          onClick={handleBack}
          leftSection={<ArrowLeft className="h-4 w-4" />}
        >
          返回搜索
        </Button>

        <Box style={{ flex: 1 }}>
          <Title 
            order={1} 
            size="xl" 
            fw={700}
            style={{ color: colors.text }}
          >
            {isCompleted ? '✅ 批量处理完成' : `正在处理 ${total} 个TED演讲`}
          </Title>
        </Box>
      </Group>

      {/* 总体进度 */}
      <Box mb="xl">
        <ProgressOverview
          total={total}
          current={current}
          status={mappedStatus}
        />
      </Box>

      <Group gap="lg">
        {/* 左侧：任务列表 */}
        <Box style={{ flex: 2 }}>
          <TaskList
            tasks={taskItems}
            currentTaskId={status === 'running' ? `${taskId}_${current - 1}` : null}
          />
        </Box>

        {/* 右侧：实时日志 */}
        <Box style={{ flex: 1 }}>
          <LiveLogPanel
            logs={logs}
            onClearLogs={clearLogs}
          />
        </Box>
      </Group>

      {/* 完成状态 */}
      {isCompleted && (
        <Box ta="center" mt="xl">
          <CheckCircle 
            size={64} 
            color={colors.success}
            style={{ 
              width: 64, 
              height: 64,
              margin: '0 auto',
              marginBottom: spacing.md
            }}
          />
          <Title 
            order={2} 
            size="xl" 
            fw={600}
            style={{ color: colors.text, marginBottom: spacing.md }}
          >
            处理完成！
          </Title>
          <Text 
            size="md" 
            c="dimmed"
            style={{ 
              color: colors.textMuted, 
              marginBottom: spacing.lg 
            }}
          >
            处理完成，共提取 Shadow Writing 结果
          </Text>
          <Button onClick={() => navigate(`/results/${taskId}`)}>
            查看学习结果 →
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default BatchProcessPage