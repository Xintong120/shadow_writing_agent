/**
 * 进度点指示器组件：
 * - 显示当前进度
 * - 点击跳转到指定卡片
 * - 响应式显示（过多时省略）
 * - 动画过渡效果
 */

function ProgressDots({
  total,
  current,
  onChange,
  className = '',
  maxVisible = 12,
  ...props
}) {
  // 如果总数不超过最大可见数量，直接显示全部
  if (total <= maxVisible) {
    return (
      <div className={`flex justify-center gap-2 ${className}`} {...props}>
        {Array.from({ length: total }, (_, index) => (
          <button
            key={index}
            onClick={() => onChange?.(index)}
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${index === current
                ? 'bg-primary scale-125'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 scale-100'
              }
            `}
            aria-label={`跳转到第 ${index + 1} 个结果`}
            aria-current={index === current ? 'page' : undefined}
          />
        ))}
      </div>
    )
  }

  // 如果总数超过最大可见数量，需要省略
  const halfVisible = Math.floor((maxVisible - 2) / 2) // 减去省略号占用的位置
  const showStart = current < halfVisible
  const showEnd = current >= total - halfVisible

  let visibleDots = []

  if (showStart) {
    // 显示开头 + 省略号 + 结尾
    visibleDots = [
      ...Array.from({ length: maxVisible - 2 }, (_, i) => i),
      '...',
      total - 1
    ]
  } else if (showEnd) {
    // 显示开头 + 省略号 + 结尾
    visibleDots = [
      0,
      '...',
      ...Array.from({ length: maxVisible - 2 }, (_, i) => total - (maxVisible - 2) + i)
    ]
  } else {
    // 显示开头 + 省略号 + 当前附近 + 省略号 + 结尾
    const start = current - Math.floor((maxVisible - 4) / 2)
    const end = start + (maxVisible - 4)
    visibleDots = [
      0,
      '...',
      ...Array.from({ length: maxVisible - 4 }, (_, i) => start + i),
      '...',
      total - 1
    ]
  }

  return (
    <div className={`flex justify-center gap-2 ${className}`} {...props}>
      {visibleDots.map((item, index) => {
        if (item === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="text-muted-foreground/50 px-1"
              aria-hidden="true"
            >
              ⋯
            </span>
          )
        }

        return (
          <button
            key={item}
            onClick={() => onChange?.(item)}
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${item === current
                ? 'bg-primary scale-125'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 scale-100'
              }
            `}
            aria-label={`跳转到第 ${item + 1} 个结果`}
            aria-current={item === current ? 'page' : undefined}
          />
        )
      })}
    </div>
  )
}

export default ProgressDots