/**
 * 单个任务项组件：
 * 显示TED演讲的任务状态、进度和结果信息
 */

import { CheckCircle, Loader2, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'



interface TEDInfo {
  title?: string
  speaker?: string
}

interface TaskItemProps extends Omit<ComponentProps<'div'>, 'children'> {
  url?: string
  tedInfo?: TEDInfo
  status?: 'pending' | 'processing' | 'completed' | 'failed'
  resultCount?: number
  error?: string
  className?: string
}

function TaskItem({
  url,
  tedInfo,
  status = 'pending',
  resultCount,
  error,
  className,
  ...props
}: TaskItemProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'processing':
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />
      case 'pending':
        return <Clock className="h-5 w-5 text-muted-foreground" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return `完成时间：${new Date().toLocaleTimeString()}`
      case 'processing':
        return '当前步骤：处理中...'
      case 'pending':
        return '状态：等待中'
      case 'failed':
        return `错误：${error || '未知错误'}`
      default:
        return '状态：未知'
    }
  }

  const getResultText = () => {
    if (status === 'completed' && resultCount !== undefined) {
      return `结果：${resultCount} 个Shadow Writing`
    }
    return null
  }

  return (
    <div
      className={cn(
        "bg-card border rounded-lg p-4 space-y-3",
        className
      )}
      {...props}
    >
      {/* 标题行 */}
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate pr-2">
            {tedInfo?.title || '未知TED演讲'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {tedInfo?.speaker && `演讲者：${tedInfo.speaker}`}
          </p>
        </div>
      </div>

      {/* 状态信息 */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>{getStatusText()}</p>
        {getResultText() && (
          <p className="text-green-600 font-medium">
            {getResultText()}
          </p>
        )}
      </div>

      {/* 错误信息 */}
      {status === 'failed' && error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded p-2">
          <p className="text-xs text-destructive">
            {error}
          </p>
        </div>
      )}
    </div>
  )
}

export { TaskItem }
export default TaskItem