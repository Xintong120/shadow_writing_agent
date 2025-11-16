/**
 * TEDCard - TED演讲卡片组件
 * 显示TED演讲信息，支持选择和键盘导航
 */
import * as React from "react"
import { Box, Text, Group, useMantineTheme } from '@mantine/core'
import { Card } from '@/components/atoms/card'
import { Checkbox } from '@/components/atoms/checkbox'
import { cn } from '@/lib/utils'
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'
import type { TEDCandidate } from '@/types/ted'

// 简化的类型定义
type TEDCardVariant = 'default' | 'compact' | 'minimal'
type TEDCardSize = 'sm' | 'md' | 'lg'

interface TEDCardProps {
  ted: TEDCandidate
  isSelected: boolean
  onToggle: () => void
  variant?: TEDCardVariant
  size?: TEDCardSize
  disabled?: boolean
  className?: string
}

const TEDCard = React.forwardRef<HTMLDivElement, TEDCardProps>(
  ({
    ted,
    isSelected,
    onToggle,
    variant = 'default',
    size = 'md',
    disabled = false,
    className,
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)
    const spacing = getSpacing(theme)

    // 调试日志
    console.log('[DEBUG TEDCard] 渲染TED卡片:', {
      title: ted.title,
      speaker: ted.speaker,
      duration: ted.duration,
      views: ted.views,
      url: ted.url,
      hasDescription: !!ted.description,
      relevance_score: ted.relevance_score
    })

    const handleClick = () => {
      if (!disabled) {
        console.log('[DEBUG TEDCard] 点击切换选择:', ted.url)
        onToggle()
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault()
        console.log('[DEBUG TEDCard] 键盘切换选择:', ted.url)
        onToggle()
      }
    }

    // 获取变体样式
    const getVariantStyles = () => {
      switch (variant) {
        case 'compact':
          return {
            padding: spacing.sm,
            fontSize: theme.fontSizes.sm,
          }
        case 'minimal':
          return {
            padding: spacing.xs,
            border: 'none',
            boxShadow: 'none',
          }
        default:
          return {
            padding: spacing.md,
            '@media (min-width: 1024px)': {
              padding: spacing.lg,
            },
          }
      }
    }

    // 获取尺寸样式
    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return {
            fontSize: theme.fontSizes.xs,
            gap: spacing.xs,
          }
        case 'lg':
          return {
            fontSize: theme.fontSizes.md,
            gap: spacing.sm,
          }
        default:
          return {
            fontSize: theme.fontSizes.sm,
            gap: spacing.xs,
          }
      }
    }

    return (
      <Box
        ref={ref}
        component="div"
        role="checkbox"
        aria-checked={isSelected}
        aria-label={`${ted.title}, 演讲者 ${ted.speaker}`}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={{
          ...getVariantStyles(),
          ...getSizeStyles(),
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          cursor: 'pointer',
          borderRadius: '8px',
          padding: '16px',
          transition: 'all 0.2s ease',
          position: 'relative', // 用于绝对定位的checkbox
          // 状态样式
          ...(isSelected && {
            backgroundColor: '#f0f9ff',
            borderColor: '#0ea5e9',
          }),
          ...(disabled && {
            opacity: 0.5,
            cursor: 'not-allowed',
            pointerEvents: 'none',
          }),
        }}
        {...props}
      >
        {/* 选择框 - 右上角绝对定位 */}
        <Box style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 1
        }}>
          <Checkbox
            checked={isSelected}
            disabled={disabled}
            aria-hidden="true"
          />
        </Box>

        {/* 内容区域 */}
        <Box style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '12px',
          paddingRight: '40px', // 为右上角的checkbox留出空间
        }}>
          <Box className="flex-1 min-w-0 w-full">
            <Text
              style={{
                fontWeight: 600,
                fontSize: size === 'sm' ? theme.fontSizes.sm : size === 'lg' ? theme.fontSizes.md : theme.fontSizes.sm,
                color: colors.text,
                lineHeight: 1.4,
                marginBottom: '4px'
              }}
              className="truncate"
            >
              {ted.title}
            </Text>
            
            <Text
              style={{
                fontSize: theme.fontSizes.xs,
                color: colors.textSecondary,
                marginBottom: '8px'
              }}
            >
              {ted.speaker}
            </Text>
            
            <Group style={{ gap: '16px', marginBottom: '8px' }}>
              <Text style={{ fontSize: theme.fontSizes.xs, color: colors.textMuted }}>
                ⏱️ {ted.duration}
              </Text>
              <Text style={{ fontSize: theme.fontSizes.xs, color: colors.textMuted }}>
                👁️ {ted.views}
              </Text>
              {ted.relevance_score && (
                <Text style={{ fontSize: theme.fontSizes.xs, color: '#10b981' }}>
                  📊 {Math.round(ted.relevance_score * 100)}% 相关
                </Text>
              )}
            </Group>
            
            {ted.description && (
              <Text
                style={{
                  fontSize: theme.fontSizes.xs,
                  color: colors.textMuted,
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {ted.description}
              </Text>
            )}
          </Box>

        </Box>
      </Box>
    )
  }
)

TEDCard.displayName = "TEDCard"

export { TEDCard }
export type { TEDCardProps }

// 为了向后兼容，也导出为默认导出
export default TEDCard