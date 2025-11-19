import * as React from "react"
import { Notification as MantineNotification, useMantineTheme } from '@mantine/core'
import { cn } from "@/lib/utils"
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'

// 简化的类型定义
type NotificationRadius = "xs" | "sm" | "md" | "lg" | "xl"

// 简化的核心接口
interface SimpleNotificationProps {
  title?: React.ReactNode
  message: React.ReactNode
  color?: string
  radius?: NotificationRadius
  className?: string
  onClose?: () => void
  disallowClose?: boolean
  icon?: React.ReactNode
  loading?: boolean
  withBorder?: boolean
}

// 主Notification组件
const Notification = React.forwardRef<HTMLDivElement, SimpleNotificationProps>(
  ({
    title,
    message,
    color,
    radius,
    className,
    onClose,
    disallowClose = false,
    icon,
    loading = false,
    withBorder = false,
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)
    const spacing = getSpacing(theme)
    const defaultColor = color || theme.colors.primary[6]
    
    // 使用主题圆角系统
    const notificationRadius = radius ? theme.radius[radius] : theme.radius.sm

    return (
      <MantineNotification
        ref={ref}
        title={title}
        color={defaultColor}
        radius={notificationRadius}
        className={cn(className)}
        onClose={onClose}
        icon={icon}
        loading={loading}
        withBorder={withBorder}
        {...props}
      >
        {message}
      </MantineNotification>
    )
  }
)
Notification.displayName = "Notification"

// 导出组件和类型
export { Notification }
export type {
  SimpleNotificationProps as NotificationProps,
  NotificationRadius,
}
