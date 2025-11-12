import * as React from "react"
import { Pagination as MantinePagination, Text, useMantineTheme } from '@mantine/core'
import { cn } from "@/lib/utils"

// 简化的类型定义
type PaginationSize = "xs" | "sm" | "md" | "lg" | "xl"
type PaginationRadius = "xs" | "sm" | "md" | "lg" | "xl"

// 简化的核心接口
interface SimplePaginationProps {
  total: number
  value: number
  boundaries?: number
  color?: string
  size?: PaginationSize
  radius?: PaginationRadius
  className?: string
  showTotal?: boolean
  disabled?: boolean
  onChange: (page: number) => void
}

// 主Pagination组件
const Pagination = React.forwardRef<HTMLDivElement, SimplePaginationProps>(
  ({
    total,
    value,
    boundaries = 1,
    color,
    size = "md",
    radius,
    className,
    showTotal = false,
    disabled = false,
    onChange,
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    const defaultColor = color || theme.colors.primary[6]
    const defaultRadius = radius || theme.radius.sm

    return (
      <div ref={ref} className={cn("flex items-center", className)} {...props}>
        <MantinePagination
          total={total}
          value={value}
          boundaries={boundaries}
          color={defaultColor}
          size={size}
          radius={defaultRadius}
          disabled={disabled}
          onChange={onChange}
        />
        {showTotal && (
          <Text size={size} className="ml-4">
            Total: {total} pages
          </Text>
        )}
      </div>
    )
  }
)
Pagination.displayName = "Pagination"

// 导出组件和类型
export { Pagination }
export type {
  SimplePaginationProps as PaginationProps,
  PaginationSize,
  PaginationRadius
}
