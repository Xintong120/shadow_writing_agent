import { Button } from '@/components/atoms/button'
import { TEDCard } from './TEDCard'
import { cn } from '@/lib/utils'

/**
 * TEDList - TED列表容器组件
 * 显示TED卡片列表，支持全选和批量操作
 */
function TEDList({
  teds,
  selectedUrls,
  onToggle,
  onSelectAll,
  className,
  ...props
}) {
  const selectedCount = selectedUrls.length
  const totalCount = teds.length
  const isAllSelected = selectedCount === totalCount && totalCount > 0
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount

  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll(!isAllSelected)
    }
  }

  return (
    <div
      className={cn(
        "space-y-3",
        className
      )}
      {...props}
    >
      {/* 全选按钮和统计 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={totalCount === 0}
            aria-label={
              isAllSelected
                ? '取消全选'
                : '全选所有演讲'
            }
          >
            {isAllSelected ? '取消全选' : '全选'}
          </Button>

          <span className="text-sm text-muted-foreground">
            已选择 {selectedCount} / {totalCount} 个演讲
          </span>
        </div>
      </div>

      {/* TED卡片列表 */}
      <div
        className="space-y-2 max-h-96 overflow-y-auto"
        role="list"
        aria-label="TED演讲列表"
      >
        {teds.map((ted) => (
          <TEDCard
            key={ted.url}
            ted={ted}
            isSelected={selectedUrls.includes(ted.url)}
            onToggle={() => onToggle(ted.url)}
          />
        ))}
      </div>
    </div>
  )
}

export { TEDList }
export default TEDList