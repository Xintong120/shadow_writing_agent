import { Card } from '@/components/atoms/card'
import { Checkbox } from '@/components/atoms/checkbox'
import { cn } from '@/lib/utils'

/**
 * TEDCard - TED演讲卡片组件
 * 显示TED演讲信息，支持选择和键盘导航
 */
export function TEDCard({
  ted,
  isSelected,
  onToggle,
  variant = 'default',
  size = 'md',
  disabled = false,
  className,
  ...props
}) {
  const handleClick = () => {
    if (!disabled) {
      onToggle()
    }
  }

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault()
      onToggle()
    }
  }

  return (
    <Card
      role="checkbox"
      aria-checked={isSelected}
      aria-label={`${ted.title}, 演讲者 ${ted.speaker}`}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
        //  最小窗口适配：响应式变体样式
        {
          'default': 'p-md lg:p-lg',
          'compact': 'p-sm text-sm',
          'minimal': 'p-xs border-none shadow-none'
        }[variant],
        //  最小窗口适配：响应式尺寸样式
        {
          'sm': 'text-xs lg:text-sm space-y-xs',
          'md': 'text-sm lg:text-base space-y-xs lg:space-y-sm',
          'lg': 'text-base lg:text-lg space-y-sm lg:space-y-md'
        }[size],
        // 状态样式
        isSelected && 'bg-primary/10 border-primary ring-2 ring-primary',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      {...props}
    >
      {/*  最小窗口适配：小窗口改为竖向布局 */}
      <div className="flex flex-col lg:flex-row items-start gap-sm lg:gap-md">
        <Checkbox
          checked={isSelected}
          disabled={disabled}
          className="shrink-0 mt-0.5"
          aria-hidden="true"
        />

        <div className="flex-1 min-w-0 w-full">
          {/*  最小窗口适配：标题字号响应式 */}
          <h3 className="font-medium truncate text-sm lg:text-base">
            {ted.title}
          </h3>
          <p className="text-xs lg:text-sm text-muted-foreground">
            演讲者：{ted.speaker}
          </p>
          {/*  最小窗口适配：允许换行，减小间距 */}
          <div className="flex flex-wrap items-center gap-sm lg:gap-lg text-xs text-muted-foreground">
            <span>时长：{ted.duration}</span>
            <span>观看：{ted.views}</span>
          </div>
        </div>

        {/*  最小窗口适配：分数位置响应式 */}
        <div className="text-xs lg:text-sm font-medium text-primary shrink-0">
          ⭐ {ted.relevance_score?.toFixed(1)}
        </div>
      </div>
    </Card>
  )
}