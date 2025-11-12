/**
 * 总体进度面板组件：
 * 显示批量处理的总体进度、大标题和预估剩余时间
 */

import * as React from "react"
import { Box, Text, Group, useMantineTheme } from '@mantine/core'
import { cn } from "@/lib/utils"
import { Progress } from '@/components/atoms/progress'
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'

type StatusType = 'processing' | 'completed' | 'failed' | 'pending'

interface ProgressOverviewProps {
  total: number
  current: number
  status?: StatusType
  // 可选的时间估算函数，由业务层提供
  estimateTimeRemaining?: (remaining: number, current: number) => string | null
  className?: string
}

const ProgressOverview = React.forwardRef<HTMLDivElement, ProgressOverviewProps>(
  ({
    total,
    current,
    status = 'processing',
    estimateTimeRemaining,
    className,
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)
    const spacing = getSpacing(theme)
    const progress = total > 0 ? Math.round((current / total) * 100) : 0

    // 默认的时间估算逻辑（可被覆盖）
    const defaultEstimateTime = (remaining: number) => {
      if (remaining === 0) return null
      // 假设每个任务平均需要30秒
      const estimatedSeconds = remaining * 30

      if (estimatedSeconds < 60) {
        return `${estimatedSeconds}秒`
      } else if (estimatedSeconds < 3600) {
        const minutes = Math.floor(estimatedSeconds / 60)
        return `${minutes}分钟`
      } else {
        const hours = Math.floor(estimatedSeconds / 3600)
        const minutes = Math.floor((estimatedSeconds % 3600) / 60)
        return `${hours}小时${minutes}分钟`
      }
    }

    // 使用提供的估算函数或默认逻辑
    const getEstimatedTime = () => {
      if (status !== 'processing' || current === 0) return null
      const remaining = total - current

      if (estimateTimeRemaining) {
        return estimateTimeRemaining(remaining, current)
      }

      return defaultEstimateTime(remaining)
    }

    const getStatusText = () => {
      switch (status) {
        case 'processing':
          return `正在处理 ${current}/${total}`
        case 'completed':
          return `处理完成 ${total}/${total}`
        case 'failed':
          return `处理失败 ${current}/${total}`
        default:
          return `准备中 0/${total}`
      }
    }

    const getStatusIndicator = () => {
      switch (status) {
        case 'processing':
          return (
            <Group gap="xs" justify="center">
              <Box
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: theme.colors.primary[6],
                  animation: 'pulse 2s infinite',
                }}
              />
              <Text size="sm" style={{ color: theme.colors.primary[6], fontWeight: 500 }}>
                处理中...
              </Text>
            </Group>
          )
        case 'completed':
          return (
            <Group gap="xs" justify="center">
              <Box
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: theme.colors.green[6],
                }}
              />
              <Text size="sm" style={{ color: theme.colors.green[6], fontWeight: 500 }}>
                处理完成
              </Text>
            </Group>
          )
        case 'failed':
          return (
            <Group gap="xs" justify="center">
              <Box
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: theme.colors.red[6],
                }}
              />
              <Text size="sm" style={{ color: theme.colors.red[6], fontWeight: 500 }}>
                处理失败
              </Text>
            </Group>
          )
        default:
          return null
      }
    }

    return (
      <Box
        ref={ref}
        className={cn(
          "bg-card border rounded-lg p-6 space-y-4",
          className
        )}
        style={{
          backgroundColor: colors.background,
          border: `1px solid ${colors.border}`,
          borderRadius: theme.radius.md,
        }}
        {...props}
      >
        {/* 大标题 */}
        <Box className="text-center">
          <Text
            size="xl"
            style={{
              fontWeight: 700,
              color: colors.text,
              marginBottom: status === 'processing' ? spacing.xs : 0,
            }}
          >
            {getStatusText()}
          </Text>
          {status === 'processing' && getEstimatedTime() && (
            <Text
              size="sm"
              style={{
                color: colors.textMuted,
              }}
            >
              预估剩余时间：约 {getEstimatedTime()}
            </Text>
          )}
        </Box>

        {/* 百分比进度条 */}
        <Box className="space-y-2">
          <Progress
            value={progress}
            className="h-3"
            aria-label={`处理进度 ${progress}%`}
          />
          <Group justify="space-between">
            <Text size="sm" style={{ color: colors.textMuted }}>0%</Text>
            <Text size="sm" style={{ color: colors.textSecondary, fontWeight: 500 }}>
              {progress}%
            </Text>
            <Text size="sm" style={{ color: colors.textMuted }}>100%</Text>
          </Group>
        </Box>

        {/* 状态指示器 */}
        {getStatusIndicator()}
      </Box>
    )
  }
)

ProgressOverview.displayName = "ProgressOverview"

export { ProgressOverview }
export type { ProgressOverviewProps }

// 为了向后兼容，也导出为默认导出
export default ProgressOverview