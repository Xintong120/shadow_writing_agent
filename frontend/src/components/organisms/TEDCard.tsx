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

// 简化的类型定义
type TEDCardVariant = 'default' | 'compact' | 'minimal'
type TEDCardSize = 'sm' | 'md' | 'lg'

interface TEDData {
  title: string
  speaker: string
  duration: string
  views: string
  relevance_score?: number
}

interface TEDCardProps {
  ted: TEDData
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

    const handleClick = () => {
      if (!disabled) {
        onToggle()
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault()
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
          backgroundColor: theme.colors.base[0],
          borderColor: theme.colors.base[2],
          cursor: 'pointer',
          borderRadius: theme.radius.md,
          border: `1px solid ${theme.colors.base[2]}`,
          transition: 'all 0.2s ease',
          // 状态样式
          ...(isSelected && {
            backgroundColor: theme.colors.primary[0],
            borderColor: theme.colors.primary[6],
            boxShadow: `0 0 0 2px ${theme.colors.primary[6]}`,
          }),
          ...(disabled && {
            opacity: 0.5,
            cursor: 'not-allowed',
            pointerEvents: 'none',
          }),
          // 悬停和焦点样式
          '&:hover': {
            boxShadow: theme.shadows.md,
          },
          '&:focus-visible': {
            outline: `2px solid ${theme.colors.primary[6]}`,
            outlineOffset: 2,
          },
        }}
        {...props}
      >
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: theme.spacing.sm,
            '@media (min-width: 1024px)': {
              flexDirection: 'row',
              gap: theme.spacing.md,
            },
          }}
        >
          <Box style={{ flexShrink: 0, marginTop: 2 }}>
            <Checkbox
              checked={isSelected}
              disabled={disabled}
              aria-hidden="true"
            />
          </Box>

          <Box className="flex-1 min-w-0 w-full">
            <Text
              style={{
                fontWeight: 500,
                fontSize: size === 'sm' ? theme.fontSizes.sm : size === 'lg' ? theme.fontSizes.md : theme.fontSizes.sm,
              }}
              className="truncate"
            >
              {ted.title}
            </Text>

            <Text
              style={{
                color: theme.colors.base[5],
                fontSize: theme.fontSizes.xs,
              }}
            >
              演讲者：{ted.speaker}
            </Text>

            <Group
              gap="sm"
              style={{
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <Text size="xs" style={{ color: theme.colors.base[5] }}>
                时长：{ted.duration}
              </Text>
              <Text size="xs" style={{ color: theme.colors.base[5] }}>
                观看：{ted.views}
              </Text>
            </Group>
          </Box>

          {ted.relevance_score && (
            <Text
              style={{
                fontWeight: 500,
                color: theme.colors.primary[6],
                fontSize: theme.fontSizes.xs,
                flexShrink: 0,
              }}
            >
              ⭐ {ted.relevance_score.toFixed(1)}
            </Text>
          )}
        </Box>
      </Box>
    )
  }
)

TEDCard.displayName = "TEDCard"

export { TEDCard }
export type { TEDCardProps, TEDData }

// 为了向后兼容，也导出为默认导出
export default TEDCard