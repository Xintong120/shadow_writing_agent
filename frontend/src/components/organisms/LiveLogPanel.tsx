import { useEffect, useRef } from 'react'
import { Button } from '@/components/atoms/button'
import { ScrollArea } from '@/components/atoms/scrollarea'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

/**
 * LiveLogPanel - 实时日志面板组件
 * 显示WebSocket接收的实时日志信息
 */

interface LogEntry {
  timestamp: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
  step?: string
  log?: string
}

interface LiveLogPanelProps extends Omit<ComponentProps<'div'>, 'children'> {
  logs?: LogEntry[]
  onClearLogs?: () => void
  className?: string
}

function LiveLogPanel({
  logs = [],
  onClearLogs,
  className,
  ...props
}: LiveLogPanelProps) {
  const scrollAreaRef = useRef(null)
  const endRef = useRef(null)

  // 自动滚动到最新日志
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  // 日志类型样式映射
  const getLogStyle = (type: LogEntry['type']): string => {
    switch (type) {
      case 'error':
        return 'text-destructive'
      case 'success':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'info':
      default:
        return 'text-foreground'
    }
  }

  // 格式化时间戳
  const formatTimestamp = (timestamp: string | number | Date): string => {
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp).toLocaleTimeString()
    }
    return new Date().toLocaleTimeString()
  }

  // 只显示最近100条日志，防止内存溢出
  const displayLogs = logs.slice(-100)

  return (
    <div
      className={cn(
        "bg-neutral-950 text-neutral-50 rounded-lg border overflow-hidden",
        className
      )}
      {...props}
    >
      {/* 标题栏 */}
      <div className="flex items-center justify-between p-3 border-b border-neutral-800">
        <h3 className="text-sm font-medium">📋 实时日志</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearLogs}
          disabled={!logs.length}
          className="h-7 px-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
          aria-label="清空日志"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* 日志内容 */}
      <ScrollArea
        ref={scrollAreaRef}
        className="h-48 p-3 font-mono text-xs"
        aria-label="实时日志内容"
        aria-live="polite"
        aria-atomic="false"
      >
        <div className="space-y-1">
          {displayLogs.length === 0 ? (
            <div className="text-neutral-500 italic">
              暂无日志...
            </div>
          ) : (
            displayLogs.map((log, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-2 leading-relaxed",
                  getLogStyle(log.type)
                )}
              >
                <span className="text-neutral-500 shrink-0">
                  [{formatTimestamp(log.timestamp)}]
                </span>
                <span className="break-all">
                  {log.message || log.log || ''}
                </span>
              </div>
            ))
          )}
        </div>

        {/* 滚动锚点 */}
        <div ref={endRef} />
      </ScrollArea>

      {/* 日志数量提示 */}
      {logs.length > 100 && (
        <div className="px-3 py-1 bg-neutral-900 text-xs text-neutral-500 border-t border-neutral-800">
          显示最近 100 条，共 {logs.length} 条
        </div>
      )}
    </div>
  )
}

export { LiveLogPanel }
export default LiveLogPanel