/**
 * Shadow Writing 卡片组件
 *
 * 功能：
 * - 显示原文和改写文本
 * - 彩色高亮映射显示
 * - 切换高亮映射功能
 * - 操作按钮（复制、取消高亮）
 *
 * 技术实现：
 * - 使用彩色高亮映射（HSL色相环自动生成）
 * - 支持高亮切换
 * - 响应式设计
 */

import { useState, useMemo } from 'react'
import { Eye, Copy, EyeOff } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Card, CardContent } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { convertMapToHighlightMapping } from '@/services/api'

function ShadowWritingCard({
  result,
  highlightEnabled = true,
  onToggleHighlight,
  onCopy,
  className = '',
  ...props
}) {
  // 转换映射数据为高亮映射
  const highlights = useMemo(() => {
    if (!result.map) return []
    return convertMapToHighlightMapping(result.map)
  }, [result.map])

  // 高亮文本渲染 - 修复版本
  const renderHighlightedText = (text, highlights, isOriginal = true) => {
    if (!text || typeof text !== 'string') {
      return <span>{text}</span>
    }

    if (!highlightEnabled || !highlights.length) {
      return <span>{text}</span>
    }

    // 使用React元素而不是HTML字符串，避免XSS和显示问题
    const renderWithHighlights = () => {
      const parts = []
      let currentText = text
      let lastIndex = 0

      // 收集所有匹配项
      const matches = []

      highlights.forEach((highlight, highlightIndex) => {
        const words = isOriginal ? highlight.original : highlight.imitation
        const color = highlight.color

        words.forEach((word, wordIndex) => {
          if (typeof word === 'string' && word.trim()) {
            // 转义正则表达式特殊字符
            const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi')
            
            let match
            while ((match = regex.exec(text)) !== null) {
              matches.push({
                start: match.index,
                end: match.index + match[0].length,
                text: match[0],
                color: color,
                key: `${highlightIndex}-${wordIndex}-${match.index}`
              })
            }
          }
        })
      })

      // 按位置排序匹配项
      matches.sort((a, b) => a.start - b.start)

      // 避免重叠的匹配项
      const validMatches = []
      let lastEnd = -1
      
      for (const match of matches) {
        if (match.start >= lastEnd) {
          validMatches.push(match)
          lastEnd = match.end
        }
      }

      // 构建React元素
      validMatches.forEach((match, index) => {
        // 添加匹配前的文本
        if (match.start > lastIndex) {
          parts.push(text.slice(lastIndex, match.start))
        }

        // 添加高亮的词
        parts.push(
          <span
            key={match.key}
            style={{
              backgroundColor: match.color,
              padding: '0 2px',
              borderRadius: '2px',
              fontWeight: 'bold'
            }}
          >
            {match.text}
          </span>
        )

        lastIndex = match.end
      })

      // 添加剩余的文本
      if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex))
      }

      return <span>{parts}</span>
    }

    return renderWithHighlights()
  }

  const handleCopy = () => {
    const content = `原文: ${result.original}\nShadow Writing: ${result.imitation}\n映射: ${highlights.map(h => `${h.category}: ${h.original.join(', ')} → ${h.imitation.join(', ')}`).join('; ')}`
    navigator.clipboard.writeText(content)
    onCopy?.()
  }

  return (
    <Card className={`w-full max-w-10xl mx-auto ${className}`} {...props}>
      <CardContent className="p-1 sm:p-2" style={{ padding: '12px' }}>
        {/* 原文部分 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg lg:text-xl font-semibold text-primary">
              Original Sentence
            </h3>
          </div>
          <div className="bg-muted/50 p-4 lg:p-6 rounded-lg border-l-4 border-primary">
            <p className="text-base lg:text-lg leading-relaxed">
              {renderHighlightedText(result.original, highlights, true)}
            </p>
          </div>
        </div>

        {/* Shadow Writing 部分 */}
        <div className="mb-6">
          <h3 className="text-lg lg:text-xl font-semibold text-accent mb-3">
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
              <div className="flex flex-col gap-2">
                {highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full shrink-0 mt-1"
                      style={{ backgroundColor: highlight.color }}
                    ></div>
                    <span className="text-blue-800 dark:text-blue-200 font-medium shrink-0">
                      {highlight.category}:
                    </span>
                    <span className="text-blue-700 dark:text-blue-300 break-words">
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