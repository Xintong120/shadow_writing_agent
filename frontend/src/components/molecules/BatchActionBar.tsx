import { Button } from '@/components/atoms/button'
import { cn } from '@/lib/utils'

/**
 * BatchActionBar - 批量操作栏组件
 * 显示已选择TED数量，提供清空和开始处理操作
 */
function BatchActionBar({
  selectedCount,
  onStartBatch,
  onClear,
  disabled = false,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "bg-card border-t border-border px-3 py-3 lg:px-4 lg:py-4",
        className
      )}
      {...props}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* 已选择数量 */}
        <div className="text-sm lg:text-base">
          已选择 <strong>{selectedCount}</strong> 个演讲
        </div>

        {/* 操作按钮 -  小窗口全宽 */}
        <div className="flex gap-2 w-full lg:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={selectedCount === 0}
            className="flex-1 lg:flex-none"
          >
            清空
          </Button>
          <Button
            size="sm"
            disabled={disabled || selectedCount === 0}
            onClick={onStartBatch}
            className="flex-1 lg:flex-none"
          >
            开始处理 ➤
          </Button>
        </div>
      </div>
    </div>
  )
}

export { BatchActionBar }
export default BatchActionBar