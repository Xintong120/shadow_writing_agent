import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

/**
 * WebSocketStatus - WebSocket连接状态指示器组件
 * 在页面右上角显示实时连接状态
 */

interface WebSocketStatusProps extends Omit<ComponentProps<'div'>, 'children'> {
  status?: 'connected' | 'disconnected' | 'error'
  className?: string
}

function WebSocketStatus({
  status = 'disconnected',
  className,
  ...props
}: WebSocketStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          dotColor: 'bg-green-500',
          text: '实时连接',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200'
        }
      case 'error':
        return {
          dotColor: 'bg-orange-500',
          text: '连接错误',
          textColor: 'text-orange-600',
          bgColor: 'bg-orange-50 border-orange-200'
        }
      case 'disconnected':
      default:
        return {
          dotColor: 'bg-red-500',
          text: '连接断开',
          textColor: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium transition-all duration-300",
        config.bgColor,
        config.textColor,
        className
      )}
      {...props}
      role="status"
      aria-live="polite"
      aria-label={`WebSocket连接状态：${config.text}`}
    >
      {/* 状态小圆点 */}
      <div className="relative">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            config.dotColor,
            status === 'connected' && "animate-pulse"
          )}
          aria-hidden="true"
        />
        {status === 'connected' && (
          <div
            className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75"
            aria-hidden="true"
          />
        )}
      </div>

      {/* 状态文字 */}
      <span className="select-none">
        {config.text}
      </span>
    </div>
  )
}

export { WebSocketStatus }
export default WebSocketStatus