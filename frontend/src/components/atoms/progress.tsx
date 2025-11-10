import * as React from "react"
import { Progress as MantineProgress, MantineColor, useMantineTheme } from '@mantine/core'
import { cn } from "@/lib/utils"

// 简化的类型定义
type ProgressSize = "xs" | "sm" | "md" | "lg" | "xl"
type ProgressRadius = "xs" | "sm" | "md" | "lg" | "xl"

// 简化的核心接口
interface SimpleProgressProps {
  value?: number
  animated?: boolean
  size?: ProgressSize
  radius?: ProgressRadius
  color?: MantineColor
  className?: string
}

// 主Progress组件
const ProgressRoot = React.forwardRef<HTMLDivElement, SimpleProgressProps>(
  ({
    value = 0,
    animated = false,
    size = "md",
    radius = "sm",
    color,
    className,
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    const defaultColor = color || theme.colors.primary[6]

    return (
      <MantineProgress
        ref={ref}
        value={value}
        animated={animated}
        color={defaultColor}
        radius={radius}
        size={size}
        className={cn(className)}
        {...props}
      />
    )
  }
)
ProgressRoot.displayName = "Progress"

// 组合导出
const Progress = ProgressRoot

// 导出组件和类型
export { Progress }
export type {
  SimpleProgressProps as ProgressProps,
  ProgressSize,
  ProgressRadius,
}
