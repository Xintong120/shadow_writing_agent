/**
 * 搜索历史面板组件：
 * - 显示最近的搜索主题
 * - 显示搜索结果数量
 * - 支持删除历史记录
 */

import * as React from "react"
import { Card, Text, Group, Stack, ActionIcon, useMantineTheme } from '@mantine/core'
import { Search, X } from 'lucide-react'
import { cn } from "@/lib/utils"
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'

// 类型定义
interface SearchItem {
  topic: string
  resultCount: number
}

interface SearchHistoryPanelProps {
  searchHistory?: SearchItem[]
  onClearHistory?: () => void
  maxItems?: number
  className?: string
}


const SearchHistoryPanel = React.forwardRef<HTMLDivElement, SearchHistoryPanelProps>(
  ({
    searchHistory = [],
    onClearHistory,
    maxItems = 5,
    className,
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)
    const spacing = getSpacing(theme)

    const displayHistory = searchHistory.slice(0, maxItems)

    if (displayHistory.length === 0) {
      return null
    }

    return (
      <Card
        ref={ref}
        className={cn(className)}
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
        }}
        {...props}
      >
        <Group justify="space-between" mb={spacing.sm}>
          <Text size="sm" fw={500} style={{ color: colors.textMuted }}>
            最近搜索
          </Text>
          {onClearHistory && (
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={onClearHistory}
              aria-label="清空搜索历史"
            >
              <X size={16} />
            </ActionIcon>
          )}
        </Group>

        <Stack gap={spacing.xs}>
          {displayHistory.map((item, index) => (
            <Group key={index} gap={spacing.sm} align="center" wrap="nowrap">
              <Search size={16} style={{ color: colors.textMuted, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" truncate style={{ color: colors.text }}>
                  {item.topic}
                </Text>
              </div>
              <Text size="xs" style={{ color: colors.textMuted, flexShrink: 0 }}>
                {item.resultCount} 个演讲
              </Text>
            </Group>
          ))}
        </Stack>

        {searchHistory.length > maxItems && (
          <Text size="xs" ta="center" mt={spacing.sm} style={{ color: colors.textMuted }}>
            还有 {searchHistory.length - maxItems} 条历史记录
          </Text>
        )}
      </Card>
    )
  }
)

SearchHistoryPanel.displayName = "SearchHistoryPanel"

export { SearchHistoryPanel }
export type { SearchHistoryPanelProps, SearchItem }

// 为了向后兼容，也导出为默认导出
export default SearchHistoryPanel