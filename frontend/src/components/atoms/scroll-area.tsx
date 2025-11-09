import * as React from "react"
import { ScrollArea as MantineScrollArea } from '@mantine/core'
import { cn } from "@/lib/utils"

// 简化的类型定义
type ScrollAreaType = "hover" | "always" | "never" | "scroll" | "auto"
type ScrollAreaOffsetScrollbars = "x" | "y" | "present"
type ScrollAreaScrollbars = false | "x" | "y"

// 简化的核心接口
interface SimpleScrollAreaProps {
  children?: React.ReactNode
  className?: string
  type?: ScrollAreaType
  offsetScrollbars?: ScrollAreaOffsetScrollbars
  scrollbars?: ScrollAreaScrollbars
  scrollbarSize?: number
}

// 主ScrollArea组件
const ScrollAreaRoot = React.forwardRef<HTMLDivElement, SimpleScrollAreaProps>(
  ({
    children,
    className,
    type = "hover",
    offsetScrollbars,
    scrollbars,
    scrollbarSize,
    ...props
  }, ref) => {
    return (
      <MantineScrollArea
        ref={ref}
        className={cn(className)}
        type={type}
        offsetScrollbars={offsetScrollbars}
        scrollbars={scrollbars}
        scrollbarSize={scrollbarSize}
        {...props}
      >
        {children}
      </MantineScrollArea>
    )
  }
)
ScrollAreaRoot.displayName = "ScrollArea"

// 组合导出
const ScrollArea = ScrollAreaRoot

// 导出组件和类型
export { ScrollArea }
export type {
  SimpleScrollAreaProps as ScrollAreaProps,
  ScrollAreaType,
  ScrollAreaOffsetScrollbars,
  ScrollAreaScrollbars,
}