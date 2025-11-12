/**
 * RecentSearches - 最近搜索面板组件
 * 显示最近的搜索历史记录，支持快速重新搜索
 */

import * as React from "react"
import { Box, Group, useMantineTheme } from '@mantine/core'
import { Card } from '@/components/atoms/card'
import { Text } from '@/components/atoms/Text'
import { Badge } from '@/components/atoms/badge'
import { cn } from '@/lib/utils'
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'

// 简化的类型定义
interface SearchItem {
  topic: string
  resultCount: number
  searchedAt: string | number | Date
}

interface RecentSearchesProps {
  searches: SearchItem[]
  onSelect: (topic: string) => void
  className?: string
  maxItems?: number
}

const RecentSearches = React.forwardRef<HTMLDivElement, RecentSearchesProps>(
  ({
    searches,
    onSelect,
    className,
    maxItems = 5,
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)
    const spacing = getSpacing(theme)

    if (!searches || searches.length === 0) {
      return null
    }

    const formatDate = (date: string | number | Date) => {
      const d = new Date(date)
      const now = new Date()
      const diffTime = now.getTime() - d.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return '今天'
      } else if (diffDays === 1) {
        return '昨天'
      } else if (diffDays < 7) {
        return `${diffDays}天前`
      } else {
        return d.toLocaleDateString()
      }
    }

    return (
      <Card
        ref={ref}
        className={cn("p-4", className)}
        variant="outline"
        {...props}
      >
        <Group gap="xs" className="mb-3">
          <Text size="sm" weight="semibold" color="dimmed">
            📚 最近搜索
          </Text>
        </Group>

        <Box className="space-y-2">
          {searches.slice(0, maxItems).map((search, index) => (
            <Box
              key={index}
              className="p-3 rounded-md cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => onSelect(search.topic)}
            >
              <Group justify="space-between" align="center">
                <Box className="flex-1">
                  <Group gap="xs" align="center">
                    <Text size="sm">
                      {search.topic}
                    </Text>
                    <Badge variant="outline" size="xs" className="px-2 py-0">
                      {search.resultCount} 个演讲
                    </Badge>
                  </Group>
                </Box>

                <Text size="xs" color="dimmed">
                  {formatDate(search.searchedAt)}
                </Text>
              </Group>
            </Box>
          ))}
        </Box>
      </Card>
    )
  }
)

RecentSearches.displayName = "RecentSearches"

export { RecentSearches }
export type { RecentSearchesProps, SearchItem }

// 为了向后兼容，也导出为默认导出
export default RecentSearches