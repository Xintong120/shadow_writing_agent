import * as React from "react"
import { Badge as MantineBadge, Box, Text } from "@mantine/core"
import { cn } from "@/lib/utils"

// 简化的类型定义
type BadgeVariant = "filled" | "outline"
type BadgeSize = "xs" | "sm" | "md" | "lg" | "xl"

// 简化的核心接口
interface SimpleBadgeProps {
  children?: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  color?: string
  onClick?: () => void
  className?: string
  disabled?: boolean
}

// 简化的徽章组接口
interface SimpleBadgeGroupProps {
  children: React.ReactNode
  spacing?: string | number
  className?: string
}

// 简化的计数徽章接口
interface SimpleBadgeCountProps {
  count?: number
  max?: number
  variant?: BadgeVariant
  size?: BadgeSize
  color?: string
  showZero?: boolean
  className?: string
}

// 简化的通知徽章接口
interface SimpleBadgeNotificationProps {
  children: React.ReactNode
  count?: number
  max?: number
  variant?: BadgeVariant
  size?: BadgeSize
  color?: string
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left"
  hidden?: boolean
  className?: string
  style?: React.CSSProperties
}

// 简化的Badge组件
const BadgeRoot = React.forwardRef<HTMLDivElement, SimpleBadgeProps>(
  ({
    children,
    variant = "filled",
    size = "md",
    color = "blue",
    onClick,
    className,
    disabled = false,
    ...props
  }, ref) => {
    return (
      <MantineBadge
        ref={ref}
        className={cn(
          onClick && !disabled && "cursor-pointer hover:opacity-80 transition-opacity",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        variant={variant}
        color={color}
        size={size}
        onClick={disabled ? undefined : onClick}
        {...props}
      >
        {children}
      </MantineBadge>
    )
  }
)
BadgeRoot.displayName = "Badge"

// 简化的Badge组组件
const BadgeGroup = React.forwardRef<HTMLDivElement, SimpleBadgeGroupProps>(
  ({ children, spacing = "sm", className, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children)
    
    return (
      <Box
        ref={ref}
        className={cn("flex items-center gap-2", className)}
        {...props}
      >
        {childrenArray}
      </Box>
    )
  }
)
BadgeGroup.displayName = "BadgeGroup"

// 简化的Badge计数组件
const BadgeCount = React.forwardRef<HTMLDivElement, SimpleBadgeCountProps>(
  ({ 
    count = 0, 
    max = 99, 
    variant = "filled", 
    size = "sm", 
    color = "red",
    showZero = false,
    className,
    ...props 
  }, ref) => {
    const displayCount = count > max ? `${max}+` : count
    
    if (count === 0 && !showZero) {
      return null
    }
    
    return (
      <BadgeRoot
        ref={ref}
        variant={variant}
        size={size}
        color={color}
        className={cn("min-w-5 h-5 flex items-center justify-center", className)}
        {...props}
      >
        {displayCount}
      </BadgeRoot>
    )
  }
)
BadgeCount.displayName = "BadgeCount"

// 简化的Badge通知组件
const BadgeNotification = React.forwardRef<HTMLDivElement, SimpleBadgeNotificationProps>(
  ({ 
    children,
    count = 0,
    max = 99,
    variant = "filled",
    size = "sm",
    color = "red",
    position = "top-right",
    hidden = false,
    className,
    ...props
  }, ref) => {
    const positionStyles = {
      "top-right": { top: 0, right: 0 },
      "top-left": { top: 0, left: 0 },
      "bottom-right": { bottom: 0, right: 0 },
      "bottom-left": { bottom: 0, left: 0 },
    }
    
    if (hidden || count === 0) {
      return <>{children}</>
    }
    
    return (
      <div
        ref={ref}
        className={cn("relative inline-flex", className)}
        {...props}
      >
        {children}
        <div className="absolute" style={positionStyles[position]}>
          <BadgeCount
            count={count}
            max={max}
            variant={variant}
            size={size}
            color={color}
          />
        </div>
      </div>
    )
  }
)
BadgeNotification.displayName = "BadgeNotification"

// 组合导出
const Badge = Object.assign(BadgeRoot, {
  Group: BadgeGroup,
  Count: BadgeCount,
  Notification: BadgeNotification,
})

// 导出组件和类型
export { Badge }
export type { 
  SimpleBadgeProps as BadgeProps,
  SimpleBadgeGroupProps as BadgeGroupProps,
  SimpleBadgeCountProps as BadgeCountProps,
  SimpleBadgeNotificationProps as BadgeNotificationProps,
  BadgeVariant,
  BadgeSize
}
