import { Progress } from '@/components/atoms/progress'
import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

/**
 * ProgressOverview - 总体进度面板组件
 * 显示批量处理的总体进度、大标题和预估剩余时间
 */
interface ProgressOverviewProps extends Omit<ComponentProps<'div'>, 'children'> {
  total: number
  current: number
  status?: 'processing' | 'completed' | 'failed' | 'pending' | 'running'
  className?: string
}

export function ProgressOverview({
  total,
  current,
  status = 'processing',
  className,
  ...props
}: ProgressOverviewProps) {
  const progress = total > 0 ? Math.round((current / total) * 100) : 0

  // 预估剩余时间（简化版本）
  const estimateRemainingTime = () => {
    if (status !== 'processing' || current === 0) return null

    const remaining = total - current
    // 假设每个任务平均需要30秒
    const estimatedSeconds = remaining * 30

    if (estimatedSeconds < 60) {
      return `${estimatedSeconds}秒`
    } else {
      const minutes = Math.floor(estimatedSeconds / 60)
      return `${minutes}分钟`
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'processing':
        return `正在处理 ${current}/${total}`
      case 'completed':
        return `处理完成 ${total}/${total}`
      case 'failed':
        return `处理失败 ${current}/${total}`
      default:
        return `准备中 0/${total}`
    }
  }

  return (
    <div
      className={cn(
        "bg-card border rounded-lg p-6 space-y-4",
        className
      )}
      {...props}
    >
      {/* 大标题 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">
          {getStatusText()}
        </h2>
        {status === 'processing' && estimateRemainingTime() && (
          <p className="text-sm text-muted-foreground mt-1">
            预估剩余时间：约 {estimateRemainingTime()}
          </p>
        )}
      </div>

      {/* 百分比进度条 */}
      <div className="space-y-2">
        <Progress
          value={progress}
          className="h-3"
          aria-label={`处理进度 ${progress}%`}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>0%</span>
          <span className="font-medium">{progress}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* 状态指示器 */}
      <div className="flex items-center justify-center">
        {status === 'processing' && (
          <div className="flex items-center gap-2 text-primary">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium">处理中...</span>
          </div>
        )}
        {status === 'completed' && (
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 bg-green-600 rounded-full" />
            <span className="text-sm font-medium">处理完成</span>
          </div>
        )}
        {status === 'failed' && (
          <div className="flex items-center gap-2 text-destructive">
            <div className="w-2 h-2 bg-destructive rounded-full" />
            <span className="text-sm font-medium">处理失败</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProgressOverview