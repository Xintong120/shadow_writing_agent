/**
 * 学习统计摘要组件
 * 显示学习统计数据（TED数量、学习记录、时长、打卡天数）
 */

import * as React from "react"
import { Group, SimpleGrid, useMantineTheme } from '@mantine/core'
import { Card } from '@/components/atoms/card'
import { Text } from '@/components/atoms/Text'
import { BookOpen, TrendingUp, Clock, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'

// 简化的类型定义
interface StatsData {
  total_teds_watched?: number
  total_records?: number
  learning_time?: number
  streak_days?: number
}

interface StatsSummaryProps {
  stats: StatsData
  className?: string
}

const StatsSummary = React.forwardRef<HTMLDivElement, StatsSummaryProps>(
  ({ stats, className, ...props }, ref) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)
    const spacing = getSpacing(theme)

    const statItems = [
      {
        title: 'TED 演讲',
        value: stats?.total_teds_watched || 0,
        description: '已观看',
        icon: BookOpen,
        color: theme.colors.primary[6],
        bgColor: theme.colors.primary[0],
      },
      {
        title: '学习记录',
        value: stats?.total_records || 0,
        description: 'Shadow Writing',
        icon: TrendingUp,
        color: theme.colors.success[6],
        bgColor: theme.colors.success[0],
      },
      {
        title: '学习时长',
        value: stats?.learning_time || 0,
        description: '分钟（估算）',
        icon: Clock,
        color: theme.colors.info[6],
        bgColor: theme.colors.info[0],
      },
      {
        title: '连续打卡',
        value: stats?.streak_days || 0,
        description: '天',
        icon: Flame,
        color: theme.colors.warning[6],
        bgColor: theme.colors.warning[0],
      },
    ]

    return (
      <SimpleGrid
        ref={ref}
        cols={{ base: 1, sm: 2, lg: 4 }}
        spacing={spacing.md}
        className={cn(className)}
        {...props}
      >
        {statItems.map((item, index) => (
          <Card key={index} variant="outline" className="p-4">
            <Group justify="space-between" align="flex-start" className="mb-3">
              <div>
                <Text size="sm" weight="semibold" color={colors.textSecondary}>
                  {item.title}
                </Text>
              </div>
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: item.bgColor }}
              >
                <item.icon size={20} style={{ color: item.color }} />
              </div>
            </Group>

            <div className="space-y-1">
              <Text
                size="xl"
                weight="bold"
                color={colors.text}
              >
                {item.value.toLocaleString()}
              </Text>
              <Text
                size="xs"
                color="dimmed"
              >
                {item.description}
              </Text>
            </div>
          </Card>
        ))}
      </SimpleGrid>
    )
  }
)

StatsSummary.displayName = "StatsSummary"

export { StatsSummary }
export type { StatsSummaryProps, StatsData }

// 为了向后兼容，也导出为默认导出
export default StatsSummary