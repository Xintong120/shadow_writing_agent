/**
 * 导航按钮组件：
 * - 上一个/下一个按钮
 * - 禁用状态处理
 * - 键盘快捷键提示
 * - 动画效果
 */
import * as React from "react"
import { Group, Text, Box, useMantineTheme } from '@mantine/core'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { cn } from "@/lib/utils"

// 简化的类型定义
interface NavigationButtonsProps {
  onPrev: () => void
  onNext: () => void
  hasPrev?: boolean
  hasNext?: boolean
  currentIndex: number
  totalCount: number
  showLabels?: boolean
  showKeyboardHints?: boolean
  className?: string
}

const NavigationButtons = React.forwardRef<HTMLDivElement, NavigationButtonsProps>(
  ({
    onPrev,
    onNext,
    hasPrev = true,
    hasNext = true,
    currentIndex,
    totalCount,
    showLabels = true,
    showKeyboardHints = false,
    className,
    ...props
  }, ref) => {
    const theme = useMantineTheme()

    return (
      <Box
        ref={ref}
        className={cn("flex items-center justify-center gap-4", className)}
        {...props}
      >
        <Group gap="md" align="center" wrap="nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label={`上一个卡片 (当前第 ${currentIndex + 1} / ${totalCount} 个)`}
            aria-keyshortcuts="ArrowLeft"
            className="min-w-[100px]"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {showLabels && '上一个'}
          </Button>

          {/* 当前位置指示器 */}
          <Box
            className="flex items-center gap-2 px-3 py-1 rounded-md"
            style={{
              backgroundColor: theme.colors.base[1],
              border: `1px solid ${theme.colors.base[2]}`,
            }}
          >
            <Text
              size="sm"
              style={{
                color: theme.colors.base[7],
                fontWeight: 600,
              }}
            >
              {currentIndex + 1}
            </Text>
            <Text
              size="sm"
              style={{
                color: theme.colors.base[5],
              }}
            >
              /
            </Text>
            <Text
              size="sm"
              style={{
                color: theme.colors.base[6],
              }}
            >
              {totalCount}
            </Text>
          </Box>

          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={!hasNext}
            aria-label={`下一个卡片 (当前第 ${currentIndex + 1} / ${totalCount} 个)`}
            aria-keyshortcuts="ArrowRight"
            className="min-w-[100px]"
          >
            {showLabels && '下一个'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>

          {showKeyboardHints && (
            <Text
              size="xs"
              style={{
                color: theme.colors.base[5],
                marginLeft: theme.spacing.md,
              }}
            >
              💡 使用 ← → 键导航
            </Text>
          )}
        </Group>
      </Box>
    )
  }
)

NavigationButtons.displayName = "NavigationButtons"

export { NavigationButtons }
export type { NavigationButtonsProps }

// 为了向后兼容，也导出为默认导出
export default NavigationButtons