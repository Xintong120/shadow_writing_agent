import * as React from "react"
import { Alert, useMantineTheme } from '@mantine/core'
import { cn } from "@/lib/utils"
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'

/**
 * StatusBar - 应用状态栏组件
 * 使用Mantine Alert组件重构，显示应用状态的底部栏
 */

type StatusType = 'ready' | 'processing' | 'success' | 'error' | 'warning' | 'info'

interface StatusBarProps {
  status?: StatusType
  message?: string
  className?: string
  showIcon?: boolean
  closable?: boolean
  onClose?: () => void
}

const StatusBar = React.forwardRef<HTMLDivElement, StatusBarProps>(
  ({
    status = 'ready',
    message = '系统就绪',
    className,
    showIcon = true,
    closable = false,
    onClose,
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)
    const spacing = getSpacing(theme)

    const getStatusConfig = () => {
      switch (status) {
        case 'success':
          return {
            color: 'green' as const,
            title: '成功',
            variant: 'filled' as const,
          }
        case 'error':
          return {
            color: 'red' as const,
            title: '错误',
            variant: 'filled' as const,
          }
        case 'warning':
          return {
            color: 'orange' as const,
            title: '警告',
            variant: 'filled' as const,
          }
        case 'info':
          return {
            color: 'blue' as const,
            title: '信息',
            variant: 'filled' as const,
          }
        case 'processing':
          return {
            color: 'blue' as const,
            title: '处理中',
            variant: 'filled' as const,
          }
        case 'ready':
        default:
          return {
            color: 'gray' as const,
            title: '就绪',
            variant: 'light' as const,
          }
      }
    }

    const config = getStatusConfig()

    return (
      <div
        ref={ref}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40",
          className
        )}
        role="status"
        aria-live="polite"
        aria-label={`应用状态：${config.title} - ${message}`}
        {...props}
      >
        <Alert
          color={config.color}
          variant={config.variant}
          withCloseButton={closable}
          onClose={onClose}
          styles={{
            root: {
              borderRadius: 0,
              border: 'none',
              backgroundColor: colors.surface,
              color: colors.text,
              padding: `${spacing.sm} ${spacing.md}`,
              boxShadow: `0 -2px 8px rgba(0, 0, 0, 0.1)`,
            },
            message: {
              fontSize: theme.fontSizes.sm,
              lineHeight: 1.4,
            },
            closeButton: {
              color: colors.textMuted,
            },
          }}
        >
          {message}
        </Alert>
      </div>
    )
  }
)

StatusBar.displayName = "StatusBar"

export { StatusBar }
export type { StatusBarProps, StatusType }