/**
 * 批量操作栏组件：
 * 显示已选择TED数量，提供清空和开始处理操作
 */
import * as React from "react"
import { Group, Box, Text, useMantineTheme } from '@mantine/core'
import { Button } from '@/components/atoms/button'
import { cn } from '@/lib/utils'
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'

// 简化的类型定义
interface BatchActionBarProps {
  selectedCount: number
  onStartBatch: () => void
  onClear: () => void
  disabled?: boolean
  className?: string
}

const BatchActionBar = React.forwardRef<HTMLDivElement, BatchActionBarProps>(
  ({
    selectedCount,
    onStartBatch,
    onClear,
    disabled = false,
    className,
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)
    const spacing = getSpacing(theme)

    return (
      <Box
        ref={ref}
        className={cn(
          "flex flex-col lg:flex-row items-center justify-between gap-3 p-3 lg:p-4",
          className
        )}
        style={{
          backgroundColor: colors.background,
          borderTop: `1px solid ${colors.border}`,
          borderRadius: theme.radius.lg,
        }}
        {...props}
      >
        {/* 已选择数量 */}
        <Text
          size="sm"
          className="text-sm lg:text-base"
          style={{
            color: colors.textSecondary,
          }}
        >
          已选择 <strong>{selectedCount}</strong> 个演讲
        </Text>

        {/* 操作按钮组 */}
        <Group gap="sm" className="w-full lg:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={selectedCount === 0}
            className="flex-1 lg:flex-none"
          >
            清空
          </Button>
          <Button
            size="sm"
            disabled={disabled || selectedCount === 0}
            onClick={onStartBatch}
            className="flex-1 lg:flex-none"
          >
            开始处理 ➤
          </Button>
        </Group>
      </Box>
    )
  }
)

BatchActionBar.displayName = "BatchActionBar"

export { BatchActionBar }
export type { BatchActionBarProps }

// 为了向后兼容，也导出为默认导出
export default BatchActionBar