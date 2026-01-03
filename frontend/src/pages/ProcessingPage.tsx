// frontend/src/pages/ProcessingPage.tsx
// 处理中页面 - 显示实时进度条和处理状态（通过WebSocket连接后端）

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { websocketService } from '@/services/websocket'
import { api } from '@/services/api'
import type { BatchProgressMessage } from '@/types'

interface ProcessingPageProps {
  taskId?: string | null
  onFinish?: () => void
}

let renderCount = 0

const ProcessingPage = ({ taskId, onFinish }: ProcessingPageProps) => {
  renderCount++
  const currentTime = Date.now()
  console.log(`[ProcessingPage] 组件渲染 #${renderCount} - taskId: ${taskId} 时间: ${new Date(currentTime).toLocaleTimeString()}`)

  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState<string>('连接服务器...')
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useFallbackProgress, setUseFallbackProgress] = useState(false)
  const [lastProgressUpdate, setLastProgressUpdate] = useState(Date.now())
  const [connectionTimeout, setConnectionTimeout] = useState<NodeJS.Timeout | null>(null)
  const [wsConnectionStatus, setWsConnectionStatus] = useState<string>('未连接')
  const [wsError, setWsError] = useState<string | null>(null)

  useEffect(() => {
    const useEffectStartTime = Date.now()
    console.log(`[ProcessingPage] useEffect开始执行 - 时间: ${new Date(useEffectStartTime).toLocaleTimeString()}, taskId:`, taskId)

    if (!taskId) {
      console.error('[ProcessingPage] taskId缺失')
      setError('任务ID缺失')
      toast.error('任务ID缺失，请重新开始')
      setTimeout(() => onFinish?.(), 1000)
      return
    }

    console.log('[ProcessingPage] 开始并行执行WebSocket连接和API检查')

    // ========== 并行执行：WebSocket连接 ==========
    console.log('[ProcessingPage] 启动WebSocket连接流程')
    const setupWebSocket = () => {
      // 检查是否已经有WebSocket连接
      const checkConnectionStart = Date.now()
      const isAlreadyConnected = websocketService.isConnected()
      const checkConnectionEnd = Date.now()
      console.log(`[ProcessingPage] WebSocket连接检查完成 - 耗时: ${checkConnectionEnd - checkConnectionStart}ms, 已连接状态:`, isAlreadyConnected)
      console.log('[ProcessingPage] WebSocket当前taskId:', websocketService.getCurrentTaskId())

      // 如果没有连接，则建立连接
      if (!isAlreadyConnected) {
        console.log('[ProcessingPage] 需要建立WebSocket连接，时间:', Date.now())
        connectWebSocket()
      } else {
        console.log('[ProcessingPage] WebSocket已连接，使用现有连接，时间:', Date.now())
        // WebSocket已经连接，更新回调函数来处理消息
        setIsConnected(true)
        setWsConnectionStatus('已连接')
        addLog('已连接到服务器')

        // 更新WebSocket回调函数，让它处理ProcessingPage的消息
        websocketService.updateCallbacks({
          onConnected: () => {
            console.log('[ProcessingPage] WebSocket连接确认')
            setIsConnected(true)
            setWsConnectionStatus('已连接')
            setCurrentStep('开始处理...')
            addLog('已连接到服务器')
          },

          onProgress: (data: BatchProgressMessage) => {
            console.log('[ProcessingPage] 收到进度消息:', data)
            setLastProgressUpdate(Date.now())
            setUseFallbackProgress(false)

            if (data.progress !== undefined) {
              setProgress(data.progress)
              addLog(`进度更新: ${data.progress}%`)
            } else if (data.current !== undefined && data.total !== undefined) {
              const percentage = Math.round((data.current / data.total) * 100)
              setProgress(percentage)
              addLog(`处理进度: ${data.current}/${data.total} (${percentage}%)`)
            }

            if (data.url) {
              addLog(`当前处理: ${data.url}`)
            }
          },

          onStep: (data: BatchProgressMessage) => {
            console.log('[ProcessingPage] 收到步骤消息:', data)
            if (data.step) {
              setCurrentStep(data.step)
              addLog(`执行步骤: ${data.step}`)
            }
            if (data.log) addLog(data.log)
            if (data.message) addLog(data.message)
          },

          onUrlCompleted: (data: BatchProgressMessage) => {
            if (data.url) addLog(`完成处理: ${data.url}`)
          },

          onCompleted: (data: BatchProgressMessage) => {
            console.log('[ProcessingPage] 收到完成消息:', data)
            setProgress(100)
            setCurrentStep('处理完成')
            addLog('所有任务处理完成！')

            if (data.successful !== undefined && data.failed !== undefined) {
              addLog(`处理结果: 成功 ${data.successful} 个, 失败 ${data.failed} 个`)
            }

            setTimeout(() => onFinish?.(), 1000)
          },

          onError: async (errorMsg: string) => {
            console.error('[ProcessingPage] WebSocket错误:', errorMsg)
            setError(errorMsg)
            addLog(`错误: ${errorMsg}`)
            toast.error(`处理错误: ${errorMsg}`)
          },

          onClose: async (code: number, reason: string) => {
            console.log('[ProcessingPage] WebSocket连接关闭, code:', code, 'reason:', reason)
            setIsConnected(false)
            if (code !== 1000) {
              addLog(`连接断开 (${code}): ${reason}`)
            }
          }
        })
      }
    }

    // ========== 并行执行：API检查任务状态 ==========
    const checkTaskStatusAsync = async () => {
      try {
        console.log('[ProcessingPage] 开始检查任务状态（异步），时间:', Date.now())
        console.log('[ProcessingPage] 调用API: api.getTaskStatus，taskId:', taskId)
        const task = await api.getTaskStatus(taskId)
        console.log('[ProcessingPage] API调用完成，收到任务数据:', task, '时间:', Date.now())
        console.log('[ProcessingPage] 任务状态:', task.status, '时间:', Date.now())

        if (task.status === 'completed') {
          console.log('[ProcessingPage] 任务已完成，设置最终状态，时间:', Date.now())
          setProgress(100)
          setCurrentStep('处理完成')
          addLog('处理已完成')
          setTimeout(() => onFinish?.(), 1000)
        }
        // 如果任务还没完成，WebSocket连接会处理进度消息
      } catch (error) {
        console.log('[ProcessingPage] 检查任务状态失败，1秒后重试，时间:', Date.now(), '错误:', error)
        setTimeout(checkTaskStatusAsync, 1000)
      }
    }

    // ========== 定义WebSocket连接函数 ==========
    const connectWebSocket = () => {
      console.log('[ProcessingPage] 执行connectWebSocket函数')
      // WebSocket 回调函数
      const callbacks = {
        onConnected: () => {
          const connectedTime = Date.now()
          console.log(`[ProcessingPage] WebSocket连接确认 - 时间: ${new Date(connectedTime).toLocaleTimeString()}`)
          console.log('[ProcessingPage] WebSocket连接成功，设置状态')
          setIsConnected(true)
          setWsConnectionStatus('已连接')
          setCurrentStep('开始处理...')
          console.log('[ProcessingPage] 添加日志: 已连接到服务器')
          addLog('已连接到服务器')

          // 设置超时检查：如果30秒内没有收到任何消息，检查任务状态
          console.log('[ProcessingPage] 设置30秒超时检查')
          const timeout = setTimeout(async () => {
            console.log('[ProcessingPage] WebSocket超时检查开始')
            try {
              const task = await api.getTaskStatus(taskId)
              console.log('[ProcessingPage] 超时检查结果:', task.status)
              if (task.status === 'completed') {
                console.log('[ProcessingPage] 任务已完成，设置进度100%')
                setProgress(100)
                setCurrentStep('处理完成')
                addLog('处理已完成')
                setTimeout(() => {
                  console.log('[ProcessingPage] 调用onFinish跳转')
                  onFinish?.()
                }, 1000)
              }
            } catch (error) {
              console.error('[ProcessingPage] 超时检查失败:', error)
            }
          }, 30000)

          setConnectionTimeout(timeout)
        },

        onProgress: (data: BatchProgressMessage) => {
          console.log('[ProcessingPage] 收到进度消息:', data) // 调试日志
          console.log('[ProcessingPage] 清除超时检查定时器')

          // 收到消息，清除超时检查
          if (connectionTimeout) {
            clearTimeout(connectionTimeout)
            setConnectionTimeout(null)
          }

          console.log('[ProcessingPage] 更新进度状态')
          setLastProgressUpdate(Date.now()) // 更新最后进度时间
          setUseFallbackProgress(false) // 收到真实进度，停止模拟

          // 优先使用直接的progress字段（如果后端发送）
          if (data.progress !== undefined) {
            console.log('[ProcessingPage] 设置进度:', data.progress)
            setProgress(data.progress)
            addLog(`进度更新: ${data.progress}%`)
          }
          // 否则通过current/total计算百分比
          else if (data.current !== undefined && data.total !== undefined) {
            const percentage = Math.round((data.current / data.total) * 100)
            console.log('[ProcessingPage] 计算进度:', percentage, `(${data.current}/${data.total})`)
            setProgress(percentage)
            addLog(`处理进度: ${data.current}/${data.total} (${percentage}%)`)
          }

          // 显示URL信息
          if (data.url) {
            console.log('[ProcessingPage] 当前处理URL:', data.url)
            addLog(`当前处理: ${data.url}`)
          }
        },

        onStep: (data: BatchProgressMessage) => {
          console.log('[ProcessingPage] 收到步骤消息:', data)
          if (data.step) {
            setCurrentStep(data.step)
            addLog(`执行步骤: ${data.step}`)
          }
          if (data.log) {
            addLog(data.log)
          }
          if (data.message) {
            addLog(data.message)
          }
        },

        onUrlCompleted: (data: BatchProgressMessage) => {
          if (data.url) {
            addLog(`完成处理: ${data.url}`)
          }
        },

        onCompleted: (data: BatchProgressMessage) => {
          console.log('[ProcessingPage] 收到完成消息:', data)
          console.log('[ProcessingPage] 设置最终状态: progress=100, step=处理完成')
          setProgress(100)
          setCurrentStep('处理完成')
          addLog('所有任务处理完成！')

          if (data.successful !== undefined && data.failed !== undefined) {
            console.log('[ProcessingPage] 处理结果统计:', { successful: data.successful, failed: data.failed })
            addLog(`处理结果: 成功 ${data.successful} 个, 失败 ${data.failed} 个`)
          }

          // 延迟跳转到预览页面
          console.log('[ProcessingPage] 1秒后调用onFinish跳转')
          setTimeout(() => {
            console.log('[ProcessingPage] 执行onFinish回调')
            onFinish?.()
          }, 1000)
        },

        onError: async (errorMsg: string) => {
          console.error('[ProcessingPage] WebSocket错误:', errorMsg)
          console.log('[ProcessingPage] 开始降级到API检查任务状态')

          // WebSocket失败时，尝试通过API检查任务状态
          try {
            const task = await api.getTaskStatus(taskId)
            console.log('[ProcessingPage] 通过API获取任务状态:', task)

            if (task.status === 'completed') {
              console.log('[ProcessingPage] 任务完成，设置最终状态')
              setProgress(100)
              setCurrentStep('处理完成')
              addLog('处理已完成')
              setTimeout(() => {
                console.log('[ProcessingPage] 降级模式下调用onFinish')
                onFinish?.()
              }, 1500)
            } else if (task.status === 'failed') {
              console.log('[ProcessingPage] 任务失败')
              setError('处理失败')
              addLog('处理失败')
            } else {
              console.log('[ProcessingPage] 任务状态未知')
              setError('连接服务器失败，请重试')
              addLog('连接失败，请稍后重试')
            }
          } catch (apiError) {
            console.error('[ProcessingPage] API检查也失败:', apiError)
            console.log('[ProcessingPage] 设置错误状态')
            setError(errorMsg)
            addLog(`错误: ${errorMsg}`)
            toast.error(`处理错误: ${errorMsg}`)
          }
        },

        onClose: async (code: number, reason: string) => {
          console.log('[ProcessingPage] WebSocket连接关闭, code:', code, 'reason:', reason)
          setIsConnected(false)
          if (code !== 1000) { // 非正常关闭
            console.log('[ProcessingPage] 非正常关闭，开始API检查')
            addLog(`连接断开 (${code}): ${reason}`)

            // 连接断开时，尝试通过API检查最终状态
            try {
              const task = await api.getTaskStatus(taskId)
              console.log('[ProcessingPage] 连接断开后API检查结果:', task.status)
              if (task.status === 'completed') {
                console.log('[ProcessingPage] 设置完成状态')
                setProgress(100)
                setCurrentStep('处理完成')
                addLog('处理已完成')
                setTimeout(() => {
                  console.log('[ProcessingPage] 连接断开后调用onFinish')
                  onFinish?.()
                }, 1000)
              }
            } catch (error) {
              console.error('[ProcessingPage] 连接断开后API检查失败:', error)
            }
          } else {
            console.log('[ProcessingPage] 正常关闭WebSocket连接')
          }
        }
      }

      console.log('[ProcessingPage] 调用websocketService.connect，taskId:', taskId)

      // 连接WebSocket
      websocketService.connect(taskId, callbacks)

      // 添加初始日志
      console.log('[ProcessingPage] 添加初始日志: 正在连接服务器...')
      addLog('正在连接服务器...')
    }

    // ========== 执行并行任务 ==========
    console.log('[ProcessingPage] 同时启动WebSocket连接和API检查')
    setupWebSocket()
    checkTaskStatusAsync()

    // 清理函数
    return () => {
      websocketService.disconnect()
      if (connectionTimeout) {
        clearTimeout(connectionTimeout)
      }
    }
  }, [taskId])

  // 添加日志的辅助函数
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 10)) // 保留最近10条日志
  }

  // 如果有错误，显示错误状态
  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="text-red-500 mb-4">⚠️ 处理出错</div>
        <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
        <button
          onClick={() => onFinish?.()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
        >
          返回首页
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <div className="text-center mb-8">
        <div className="relative w-40 h-40 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="80" cy="80" r="70" stroke="#e2e8f0" strokeWidth="8" fill="none" className="dark:stroke-slate-700" />
            <circle
              cx="80" cy="80" r="70" stroke="#6366f1" strokeWidth="8" fill="none"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * progress) / 100}
              className="transition-all duration-200 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{Math.round(progress)}%</span>
            <div className={`w-3 h-3 rounded-full mt-2 ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">正在生成学习内容</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">{currentStep}</p>
        <div className="text-sm text-slate-400 space-y-1">
          <div>连接状态: {wsConnectionStatus}</div>
          {wsError && <div className="text-red-400">错误: {wsError}</div>}
        </div>
      </div>

      {/* 日志区域 */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 max-h-64 overflow-y-auto">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">处理日志</h4>
        <div className="space-y-1">
          {logs.length === 0 ? (
            <p className="text-slate-500 text-sm">等待日志...</p>
          ) : (
            logs.map((log, index) => (
              <p key={index} className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                {log}
              </p>
            ))
          )}
        </div>
      </div>

      {/* 任务ID显示 */}
      <div className="text-center mt-6">
        <p className="text-xs text-slate-400">任务ID: {taskId}</p>
      </div>
    </div>
  )
}

export default ProcessingPage
