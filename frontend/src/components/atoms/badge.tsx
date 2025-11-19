import * as React from "react"
import { Badge as MantineBadge } from "@mantine/core"
import { useMantineTheme } from '@mantine/core'
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'
import { cn } from "@/lib/utils"

// 简化的类型定义
type BadgeVariant = "filled" | "outline" | "default" | "secondary"
type BadgeSize = "xs" | "sm" | "md" | "lg" | "xl"

interface BadgeProps {
  children?: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  color?: string
  onClick?: () => void
  className?: string
  disabled?: boolean
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ children, variant = "filled", size = "md", color, onClick, className, disabled, ...props }, ref) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)
    const spacing = getSpacing(theme)

    // 根据variant映射到Mantine的variant
    const mantineVariant = variant === "default" ? "filled" : 
                          variant === "secondary" ? "light" : 
                          variant

    // 如果没有指定color，根据variant使用主题颜色
    const badgeColor = color || (variant === "secondary" ? "gray" : "primary")

    // 自定义样式以使用主题令牌
    const customStyles = {
      root: {
        fontSize: theme.fontSizes[size === 'xs' ? 'xs' : size === 'sm' ? 'xs' : size === 'md' ? 'sm' : size === 'lg' ? 'md' : 'lg'],
        lineHeight: theme.lineHeights.sm,
        borderRadius: theme.radius.sm,
        padding: `${spacing.xs} ${spacing.sm}`,
        cursor: onClick && !disabled ? 'pointer' : 'default',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: (disabled ? 'none' : 'auto') as React.CSSProperties['pointerEvents'],
      }
    }

    return (
      <MantineBadge
        ref={ref}
        variant={mantineVariant}
        size={size}
        color={badgeColor}
        className={className}
        onClick={disabled ? undefined : onClick}
        styles={customStyles}
        {...props}
      >
        {children}
      </MantineBadge>
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
export type { BadgeProps, BadgeVariant, BadgeSize }
