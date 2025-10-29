/**
 * Shadow Writing 卡片组件
 *
 * 功能：
 * - 显示原文和改写文本
 * - 彩色高亮映射显示
 * - 切换高亮映射功能
 * - 质量评分显示
 * - 操作按钮（查看段落、复制、取消高亮）
 *
 * 技术实现：
 * - 使用彩色高亮映射（HSL色相环自动生成）
 * - 支持高亮切换
 * - 响应式设计
 */

import { useState, useMemo } from 'react'
import { Eye, Copy, EyeOff, Star } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Card, CardContent } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { convertMapToHighlightMapping } from '@/services/api'

function ShadowWritingCard({
  result,
  highlightEnabled = true,
  onToggleHighlight,
  onViewParagraph,
  onCopy,
  className = '',
  ...props
}) {
  // 转换映射数据为高亮映射
  const highlights = useMemo(() => {
    if (!result.map) return []
    return convertMapToHighlightMapping(result.map)
  }, [result.map])

  // 高亮文本渲染
  const renderHighlightedText = (text, highlights, isOriginal = true) => {
    if (!highlightEnabled || !highlights.length) {
      return <span>{text}</span>
    }

    // 高亮映射逻辑
    let highlightedText = text
    const parts = []

    // 为每个映射创建高亮样式
    highlights.forEach((highlight) => {
      const words = isOriginal ? highlight.original : highlight.imitation
      const color = highlight.color

      words.forEach(word => {
        // 转义正则表达式特殊字符
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`(${escapedWord})`, 'gi')

        highlightedText = highlightedText.replace(regex, (match) => {
          return `<span style="background-color: ${color}; padding: 0 2px; border-radius: 2px;">${match}</span>`
        })
      })
    })

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />
  }

  const handleCopy = () => {
    const content = `原文: ${result.original}\nShadow Writing: ${result.imitation}\n映射: ${highlights.map(h => `${h.category}: ${h.original.join(', ')} → ${h.imitation.join(', ')}`).join('; ')}`
    navigator.clipboard.writeText(content)
    onCopy?.()
  }

  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`} {...props}>
      <CardContent className="p-6 lg:p-8">
        {/* 原文部分 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg lg:text-xl font-semibold text-primary">
              Original Sentence
            </h3>
            {result.quality_score && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <Badge variant="secondary" className="text-xs">
                  {result.quality_score}/8
                </Badge>
              </div>
            )}
          </div>
          <div className="bg-muted/50 p-4 lg:p-6 rounded-lg border-l-4 border-primary">
            <p className="text-base lg:text-lg leading-relaxed">
              {renderHighlightedText(result.original, highlights, true)}
            </p>
          </div>
        </div>

        {/* Shadow Writing 部分 */}
        <div className="mb-6">
          <h3 className="text-lg lg:text-xl font-semibold text-primary mb-3">
            Shadow Writing
          </h3>
          <div className="bg-accent/10 p-4 lg:p-6 rounded-lg border-l-4 border-accent">
            <p className="text-base lg:text-lg leading-relaxed">
              {renderHighlightedText(result.imitation, highlights, false)}
            </p>
          </div>
        </div>

        {/* 映射提示 */}
        {highlights.length > 0 && highlightEnabled && (
          <div className="mb-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  提示：相同颜色标示对应替换关系
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: highlight.color }}
                    ></div>
                    <span className="text-blue-800 dark:text-blue-200 font-medium">
                      {highlight.category}:
                    </span>
                    <span className="text-blue-700 dark:text-blue-300 truncate">
                      {highlight.original.join(', ')} → {highlight.imitation.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
          {result.paragraph && (
            <Button
              variant="outline"
              onClick={onViewParagraph}
              className="flex-1 sm:flex-none"
            >
              <Eye className="h-4 w-4 mr-2" />
              查看段落
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleCopy}
            className="flex-1 sm:flex-none"
          >
            <Copy className="h-4 w-4 mr-2" />
            复制
          </Button>

          {highlights.length > 0 && (
            <Button
              variant="outline"
              onClick={onToggleHighlight}
              className="flex-1 sm:flex-none"
            >
              {highlightEnabled ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  取消高亮
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  显示高亮
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ShadowWritingCard