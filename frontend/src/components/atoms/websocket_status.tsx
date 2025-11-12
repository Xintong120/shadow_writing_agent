import * as React from "react"
import { Badge, useMantineTheme } from '@mantine/core'
import { cn } from "@/lib/utils"
import { getSemanticColors } from '@/theme/mantine-theme'

/**
 * WebSocketStatus - WebSocket连接状态指示器组件
 * 使用Mantine Badge组件重构，在页面右上角显示实时连接状态
 */

type WebSocketStatusType = 'connected' | 'disconnected' | 'error'

interface WebSocketStatusProps {
  status?: WebSocketStatusType
  className?: string
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

const WebSocketStatus = React.forwardRef<HTMLDivElement, WebSocketStatusProps>(
  ({
    status = 'disconnected',
    className,
    position = 'top-right',
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)

    const getStatusConfig = () => {
      switch (status) {
        case 'connected':
          return {
            color: 'green' as const,
            variant: 'filled' as const,
            text: '实时连接',
            dotColor: colors.success,
            bgColor: theme.colors.success[0],
          }
        case 'error':
          return {
            color: 'orange' as const,
            variant: 'filled' as const,
            text: '连接错误',
            dotColor: colors.warning,
            bgColor: theme.colors.warning[0],
          }
        case 'disconnected':
        default:
          return {
            color: 'red' as const,
            variant: 'filled' as const,
            text: '连接断开',
            dotColor: colors.error,
            bgColor: theme.colors.error[0],
          }
      }
    }

    const config = getStatusConfig()

    const getPositionClasses = () => {
      switch (position) {
        case 'top-left':
          return 'top-4 left-4'
        case 'bottom-right':
          return 'bottom-4 right-4'
        case 'bottom-left':
          return 'bottom-4 left-4'
        case 'top-right':
        default:
          return 'top-4 right-4'
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "fixed z-50",
          getPositionClasses(),
          className
        )}
        role="status"
        aria-live="polite"
        aria-label={`WebSocket连接状态：${config.text}`}
        {...props}
      >
        <Badge
          color={config.color}
          variant={config.variant}
          size="lg"
          radius="xl"
          leftSection={
            <div className="relative mr-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: config.dotColor }}
              />
              {status === 'connected' && (
                <div
                  className="absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-75"
                  style={{ backgroundColor: config.dotColor }}
                />
              )}
            </div>
          }
          styles={{
            root: {
              backgroundColor: config.bgColor,
              color: config.dotColor,
              border: `1px solid ${config.dotColor}20`,
              fontWeight: 500,
              transition: 'all 0.3s ease',
            },
          }}
        >
          {config.text}
        </Badge>
      </div>
    )
  }
)

WebSocketStatus.displayName = "WebSocketStatus"

export { WebSocketStatus }
export type { WebSocketStatusProps, WebSocketStatusType }