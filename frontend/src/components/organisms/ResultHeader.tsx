/**
 * 结果页面头部组件
 *
 * 功能：
 * - 显示 TED 演讲标题和演讲者
 * - 显示结果总数
 * - 提供返回按钮
 * - 响应式布局
 */

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Text, useMantineTheme } from '@mantine/core'
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'

function ResultHeader({
  tedInfo,
  totalCount,
  currentIndex,
  onBack,
  className = '',
  ...props
}) {
  const theme = useMantineTheme()
  const colors = getSemanticColors(theme)
  const spacing = getSpacing(theme)
  const displayIndex = currentIndex !== undefined ? currentIndex + 1 : null

  return (
    <div className={`flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 ${className}`} {...props}>
      {/* TED 信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回搜索
          </Button>
          <Text
            size="xl"
            fw={700}
            style={{ color: colors.primary }}
            className="truncate"
          >
            Shadow Writing 学习卡片
          </Text>
        </div>

        {/* TED 标题和演讲者 */}
        {tedInfo.title && (
          <div className="mb-3">
            <Text
              size="lg"
              fw={600}
              style={{ color: colors.text }}
              className="truncate"
            >
              📖 {tedInfo.title}
            </Text>
            {tedInfo.speaker && (
              <Text
                size="sm"
                style={{ color: colors.textMuted, marginTop: spacing.xs }}
              >
                👤 {tedInfo.speaker}
              </Text>
            )}
          </div>
        )}

        {/* 结果统计 */}
        <div className="flex items-center gap-4">
          <Text size="sm" style={{ color: colors.textMuted }}>
            📊 共 {totalCount} 个结果
          </Text>
          {displayIndex && (
            <Text size="sm" style={{ color: colors.textMuted }}>
              当前：{displayIndex}/{totalCount}
            </Text>
          )}
        </div>
      </div>

      {/* 右侧操作区 - 预留给将来扩展 */}
      <div className="flex gap-2 lg:gap-3 shrink-0">
        {/* 可以在这里添加更多操作按钮，比如导出、打印等 */}
      </div>
    </div>
  )
}

export { ResultHeader }
export default ResultHeader