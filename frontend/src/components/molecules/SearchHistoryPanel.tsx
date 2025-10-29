/**
 * 搜索历史面板组件
 *
 * 功能：
 * - 显示最近的搜索主题
 * - 点击重新搜索
 * - 显示搜索结果数量
 * - 支持删除历史记录
 */

import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

function SearchHistoryPanel({
  searchHistory = [],
  onSelectSearch,
  onClearHistory,
  maxItems = 5,
  className = '',
  ...props
}) {
  const displayHistory = searchHistory.slice(0, maxItems)

  if (displayHistory.length === 0) {
    return null
  }

  return (
    <div className={`bg-muted/30 rounded-lg p-4 ${className}`} {...props}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          📚 最近搜索
        </h3>
        {onClearHistory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            aria-label="清空搜索历史"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {displayHistory.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelectSearch?.(item.topic)}
            className="
              w-full text-left p-2 rounded-md
              hover:bg-muted transition-colors
              flex items-center justify-between gap-3
              group
            "
            aria-label={`重新搜索 ${item.topic}`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm truncate">
                {item.topic}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{item.resultCount} 个演讲</span>
              <div className="w-4 h-4 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors" />
            </div>
          </button>
        ))}
      </div>

      {searchHistory.length > maxItems && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          还有 {searchHistory.length - maxItems} 条历史记录
        </p>
      )}
    </div>
  )
}

export default SearchHistoryPanel