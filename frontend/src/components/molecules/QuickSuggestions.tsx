/**
 * 快速建议标签组件：
 * 提供热门主题和操作建议的快速点击标签
 */

import * as React from "react"
import { Group, useMantineTheme } from '@mantine/core'
import { Badge } from '@/components/atoms/badge'
import { cn } from '@/lib/utils'
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'

// 简化的类型定义
interface QuickSuggestionsProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
  type?: 'topics' | 'actions'
  className?: string
}

const QuickSuggestions = React.forwardRef<HTMLDivElement, QuickSuggestionsProps>(
  ({
    suggestions,
    onSelect,
    type = 'topics',
    className,
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)
    const spacing = getSpacing(theme)

    return (
      <Group
        ref={ref}
        gap={spacing.sm}
        wrap="wrap"
        justify={type === 'topics' ? 'center' : 'flex-start'}
        className={cn(className)}
        {...props}
      >
        {suggestions.map((suggestion, index) => (
          <Badge
            key={index}
            variant={type === 'topics' ? 'filled' : 'outline'}
            color={type === 'topics' ? 'secondary' : 'primary'}
            className={cn(
              "cursor-pointer transition-all duration-200",
              "hover:opacity-80 hover:scale-105",
              type === 'topics' && "px-3 py-1",
              type === 'actions' && "px-4 py-2 text-sm"
            )}
            onClick={() => onSelect(suggestion)}
          >
            {type === 'topics' ? `# ${suggestion}` : suggestion}
          </Badge>
        ))}
      </Group>
    )
  }
)

QuickSuggestions.displayName = "QuickSuggestions"

export { QuickSuggestions }
export type { QuickSuggestionsProps }

// 为了向后兼容，也导出为默认导出
export default QuickSuggestions