/**
 * 卡片导航容器组件
 *
 * 功能：
 * - 简单的翻页实现，确保可靠性
 * - 键盘导航支持（← → 方向键）
 * - 导航按钮
 * - 平滑动画过渡
 * - 优化嵌套结构，避免重复的容器
 */

import React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import ShadowWritingCard from './ShadowWritingCard'
import type { ShadowWritingResult } from '@/types'
import { Text, useMantineTheme } from '@mantine/core'
import { getSemanticColors, getSpacing, getResponsiveProps } from '@/theme/mantine-theme'

interface TEDInfo {
  title: string
  speaker: string
  url: string
}

interface CardNavigatorProps {
  results: ShadowWritingResult[]
  tedInfo: TEDInfo
  initialIndex?: number
  className?: string
}

const CardNavigator: React.FC<CardNavigatorProps> = ({
  results,
  tedInfo,
  initialIndex = 0,
  className = '',
  ...props
}) => {
  const theme = useMantineTheme()
  const colors = getSemanticColors(theme)
  const spacing = getSpacing(theme)
  const responsive = getResponsiveProps(theme)

  const [current, setCurrent] = useState(initialIndex)
  const [highlightEnabled, setHighlightEnabled] = useState(true)

  const handleToggleHighlight = useCallback(() => {
    setHighlightEnabled(prev => !prev)
  }, [])

  const handleCopy = useCallback(() => {
    console.log('复制成功')
  }, [])

  const canGoPrev = current > 0
  const canGoNext = current < results.length - 1

  const handleNext = useCallback(() => {
    if (canGoNext) {
      setCurrent(prev => prev + 1)
    }
  }, [canGoNext])

  const handlePrev = useCallback(() => {
    if (canGoPrev) {
      setCurrent(prev => prev - 1)
    }
  }, [canGoPrev])

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          handlePrev()
          break
        case 'ArrowRight':
          event.preventDefault()
          handleNext()
          break
        case 'Home':
          event.preventDefault()
          setCurrent(0)
          break
        case 'End':
          event.preventDefault()
          setCurrent(results.length - 1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev, results.length])

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '80rem',
        margin: '0 auto',
        padding: spacing.xs, // 统一padding，避免重复
        transition: 'all 0.3s ease',
      }}
      className={className}
      {...props}
    >
      {/* 当前卡片 - 移除多余的嵌套容器 */}
      <ShadowWritingCard
        result={results[current]}
        highlightEnabled={highlightEnabled}
        onToggleHighlight={handleToggleHighlight}
        onCopy={handleCopy}
        style={{
          width: '100%',
          marginBottom: spacing.sm, // 卡片与导航按钮的间距
        }}
      />

      {/* 自定义导航按钮 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.md,
          marginTop: spacing.lg,
          ...responsive.stackOnMobile.container,
        }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={!canGoPrev}
          aria-label={`上一个卡片 (当前第 ${current + 1} / ${results.length} 个)`}
        >
          <ChevronLeft style={{ height: '1rem', width: '1rem', marginRight: spacing.xs }} />
          上一个
        </Button>

        <Text
          style={{
            fontSize: theme.fontSizes.sm,
            lineHeight: theme.lineHeights.sm,
            color: colors.textMuted,
            padding: `0 ${spacing.md}`,
          }}
        >
          {current + 1} / {results.length}
        </Text>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!canGoNext}
          aria-label={`下一个卡片 (当前第 ${current + 1} / ${results.length} 个)`}
        >
          下一个
          <ChevronRight style={{ height: '1rem', width: '1rem', marginLeft: spacing.xs }} />
        </Button>
      </div>

      {/* 键盘提示 */}
      <div
        style={{
          textAlign: 'center',
          marginTop: spacing.md,
        }}
      >
        <Text
          style={{
            fontSize: theme.fontSizes.xs,
            lineHeight: theme.lineHeights.xs,
            color: colors.textMuted,
          }}
        >
          💡 使用 ← → 方向键快速导航 • H 键切换高亮显示
        </Text>
      </div>
    </div>
  )
}

export { CardNavigator }
export default CardNavigator