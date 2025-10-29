import { cn } from '@/lib/utils'

/**
 * RecentSearches - 最近搜索面板组件
 * 显示最近的搜索历史记录，支持快速重新搜索
 */
export function RecentSearches({
  searches,
  onSelect,
  className,
  ...props
}) {
  if (!searches || searches.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        "bg-muted/50 rounded-lg p-lg",
        className
      )}
      {...props}
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-md">
        📚 最近搜索
      </h3>

      <div className="space-y-sm">
        {searches.slice(0, 5).map((search, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-sm rounded hover:bg-background cursor-pointer transition-colors"
            onClick={() => onSelect(search.topic)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(search.topic)
              }
            }}
            aria-label={`重新搜索: ${search.topic} (${search.resultCount} 个结果)`}
          >
            <div className="flex items-center gap-sm">
              <span className="text-sm">
                • {search.topic}
              </span>
              <span className="text-xs text-muted-foreground">
                ({search.resultCount} 个演讲)
              </span>
            </div>

            <span className="text-xs text-muted-foreground">
              {new Date(search.searchedAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}