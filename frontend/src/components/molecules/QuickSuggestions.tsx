import { Badge } from '@/components/atoms/badge'
import { cn } from '@/lib/utils'

/**
 * QuickSuggestions - 快速建议标签组件
 * 提供热门主题和操作建议的快速点击标签
 */
export function QuickSuggestions({
  suggestions,
  onSelect,
  type = 'topics',
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-sm",
        type === 'topics' && "justify-center",
        type === 'actions' && "justify-start",
        className
      )}
      {...props}
    >
      {suggestions.map((suggestion, index) => (
        <Badge
          key={index}
          variant={type === 'topics' ? 'secondary' : 'outline'}
          className={cn(
            "cursor-pointer transition-all hover:bg-primary hover:text-primary-foreground",
            type === 'topics' && "px-md py-xs",
            type === 'actions' && "px-lg py-sm text-sm"
          )}
          onClick={() => onSelect(suggestion)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelect(suggestion)
            }
          }}
          aria-label={`${type === 'topics' ? '选择主题' : '执行操作'}: ${suggestion}`}
        >
          {type === 'topics' ? `# ${suggestion}` : suggestion}
        </Badge>
      ))}
    </div>
  )
}