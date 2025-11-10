import * as React from "react"
import { Skeleton as MantineSkeleton, useMantineTheme } from '@mantine/core'
import { cn } from "@/lib/utils"

// 简化的类型定义
type SkeletonHeight = number | string
type SkeletonWidth = number | string
type SkeletonRadius = number | string

// 简化的核心接口
interface SimpleSkeletonProps {
  height?: SkeletonHeight
  width?: SkeletonWidth
  radius?: SkeletonRadius
  className?: string
  visible?: boolean
  animated?: boolean
  circle?: boolean
}

// 主Skeleton组件
const Skeleton = React.forwardRef<HTMLDivElement, SimpleSkeletonProps>(
  ({
    height,
    width,
    radius,
    className,
    visible = true,
    animated = true,
    circle = false,
    ...props
  }, ref) => {
    return (
      <MantineSkeleton
        ref={ref}
        height={height}
        width={width}
        radius={radius}
        className={cn(className)}
        visible={visible}
        animate={animated}
        circle={circle}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

// 导出组件和类型
export { Skeleton }
export type {
  SimpleSkeletonProps as SkeletonProps,
  SkeletonHeight,
  SkeletonWidth,
  SkeletonRadius,
}

