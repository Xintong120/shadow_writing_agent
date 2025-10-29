/**
 * 导航按钮组件
 *
 * 功能：
 * - 上一个/下一个按钮
 * - 禁用状态处理
 * - 键盘快捷键提示
 * - 动画效果
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

function NavigationButtons({
  onPrev,
  onNext,
  hasPrev = true,
  hasNext = true,
  currentIndex,
  totalCount,
  showLabels = true,
  showKeyboardHints = false,
  className = '',
  ...props
}) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} {...props}>
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={!hasPrev}
        aria-label={`上一个卡片 (当前第 ${currentIndex + 1} / ${totalCount} 个)`}
        aria-keyshortcuts="ArrowLeft"
        className="min-w-[100px]"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        {showLabels && '上一个'}
      </Button>

      <div className="flex items-center gap-2 text-sm text-muted-foreground px-2">
        <span className="font-medium">{currentIndex + 1}</span>
        <span>/</span>
        <span>{totalCount}</span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!hasNext}
        aria-label={`下一个卡片 (当前第 ${currentIndex + 1} / ${totalCount} 个)`}
        aria-keyshortcuts="ArrowRight"
        className="min-w-[100px]"
      >
        {showLabels && '下一个'}
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>

      {showKeyboardHints && (
        <div className="text-xs text-muted-foreground ml-4">
          💡 使用 ← → 键导航
        </div>
      )}
    </div>
  )
}

export default NavigationButtons