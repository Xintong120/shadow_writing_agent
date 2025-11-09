import * as React from "react"
import { Divider as MantineDivider } from '@mantine/core'
import { cn } from "@/lib/utils"

// 简化的类型定义
type DividerSize = "xs" | "sm" | "md" | "lg" | "xl"
type DividerOrientation = "horizontal" | "vertical"
type DividerLabelPosition = "left" | "center" | "right"

// 简化的核心接口
interface SimpleDividerProps {
  label?: string
  labelPosition?: DividerLabelPosition
  size?: DividerSize
  orientation?: DividerOrientation
  color?: string
  className?: string
}

// 主Divider组件
const Divider = React.forwardRef<HTMLDivElement, SimpleDividerProps>(
  ({
    label,
    labelPosition = "center",
    size = "md",
    orientation = "horizontal",
    color,
    className,
    ...props
  }, ref) => {
    return (
      <MantineDivider
        ref={ref}
        label={label}
        labelPosition={labelPosition}
        size={size}
        orientation={orientation}
        color={color}
        className={cn(className)}
        {...props}
      />
    )
  }
)
Divider.displayName = "Divider"

// 导出组件和类型
export { Divider }
export type {
  SimpleDividerProps as DividerProps,
  DividerSize,
  DividerOrientation,
  DividerLabelPosition
}
