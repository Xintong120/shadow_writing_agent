/**
 * 卡片导航容器组件
 *
 * 功能：
 * - 使用 shadcn/ui Carousel 实现卡片翻页
 * - 键盘导航支持（← → 方向键）
 * - 进度点指示器
 * - 导航按钮
 * - 平滑动画过渡
 *
 * 技术实现：
 * - 基于 embla-carousel 的 Carousel 组件
 * - 自动监听 slide 变化
 * - 完整的无障碍支持
 */

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/molecules/carousel'
import { Button } from '@/components/atoms/button'
import ShadowWritingCard from './ShadowWritingCard'
import ProgressDots from '../molecules/ProgressDots'
import type { ShadowWritingResult } from '@/types'
import { ComponentProps } from 'react'

interface TEDInfo {
  title: string
  speaker: string
  url: string
}

interface CardNavigatorProps extends Omit<ComponentProps<'div'>, 'children'> {
  results: ShadowWritingResult[]
  tedInfo: TEDInfo
  initialIndex?: number
  className?: string
}

function CardNavigator({
  results,
  tedInfo,
  initialIndex = 0,
  className = '',
  ...props
}: CardNavigatorProps) {
  const [api, setApi] = useState<any>(null)
  const [current, setCurrent] = useState(initialIndex)
  const [highlightEnabled, setHighlightEnabled] = useState(true)

  // 设置初始索引
  useEffect(() => {
    if (api && initialIndex !== current) {
      api.scrollTo(initialIndex)
    }
  }, [api, initialIndex])

  // 监听 slide 变化
  useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!api) return

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          api.scrollPrev()
          break
        case 'ArrowRight':
          event.preventDefault()
          api.scrollNext()
          break
        case 'Home':
          event.preventDefault()
          api.scrollTo(0)
          break
        case 'End':
          event.preventDefault()
          api.scrollTo(results.length - 1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [api, results.length])

  const handleToggleHighlight = useCallback(() => {
    setHighlightEnabled(prev => !prev)
  }, [])

  const handleViewParagraph = useCallback((result) => {
    // 这里可以实现查看完整段落的逻辑
    console.log('查看段落:', result.paragraph)
  }, [])

  const handleCopy = useCallback(() => {
    // 这里可以添加复制成功的提示
    console.log('复制成功')
  }, [])

  const canGoPrev = current > 0
  const canGoNext = current < results.length - 1

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`} {...props}>
      {/* 自定义导航按钮 */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => api?.scrollPrev()}
          disabled={!canGoPrev}
          aria-label={`上一个卡片 (当前第 ${current + 1} / ${results.length} 个)`}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          上一个
        </Button>

        <span className="text-sm text-muted-foreground px-4">
          {current + 1} / {results.length}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => api?.scrollNext()}
          disabled={!canGoNext}
          aria-label={`下一个卡片 (当前第 ${current + 1} / ${results.length} 个)`}
        >
          下一个
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Carousel 容器 */}
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: false,
        }}
      >
        <CarouselContent>
          {results.map((result, index) => (
            <CarouselItem key={index}>
              <ShadowWritingCard
                result={result}
                highlightEnabled={highlightEnabled}
                onToggleHighlight={handleToggleHighlight}
                onViewParagraph={() => handleViewParagraph(result)}
                onCopy={handleCopy}
                className="h-full"
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Carousel 内置导航按钮 */}
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>

      {/* 进度点指示器 */}
      <ProgressDots
        total={results.length}
        current={current}
        onChange={(index) => api?.scrollTo(index)}
        className="mt-6"
      />

      {/* 键盘提示 */}
      <div className="text-center mt-4 text-xs text-muted-foreground">
        💡 使用 ← → 方向键快速导航 • H 键切换高亮显示
      </div>
    </div>
  )
}

export { CardNavigator }
export default CardNavigator