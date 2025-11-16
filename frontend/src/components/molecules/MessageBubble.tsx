/**
 * 消息气泡组件:
 * 显示用户和Agent的消息，支持头像、时间戳和不同样式
 */

import * as React from "react"
import { Group, Box, Text , useMantineTheme} from '@mantine/core'
import { cn } from "@/lib/utils"
import { Avatar } from '@/components/atoms/avatar'
import { Card } from '@/components/atoms/card'
import { Text as TextAtom } from '@/components/atoms/Text'
import { UserRound, Bot } from 'lucide-react'
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'

interface MessageBubbleProps {
  message: {
    role: 'user' | 'agent'
    content: string | React.ReactNode
    timestamp?: string | number
  }
  variant?: 'default' | 'compact'
  size?: 'sm' | 'md' | 'lg'
  showAvatar?: boolean
  showTimestamp?: boolean
  className?: string
}

const MessageBubble = React.forwardRef<HTMLDivElement, MessageBubbleProps>(
  (
    {
      message,
      variant = 'default',
      size = 'md',
      showAvatar = true,
      showTimestamp = true,
      className,
      ...props
    },
    ref
  ) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)
    const spacing = getSpacing(theme)
    const isUser = message.role === 'user'
    const avatarIcon = isUser ? <UserRound size={20} /> : <Bot size={20} />
    const bgColor = isUser ? colors.primary : colors.surface
    const alignItems = isUser ? 'flex-end' : 'flex-start'
    const borderRadius = variant === 'compact' ? theme.radius.sm : theme.radius.md
    const padding = size === 'sm' ? spacing.sm : size === 'lg' ? spacing.lg : spacing.md
    const fontSize = size === 'sm' ? theme.fontSizes.sm : size === 'lg' ? theme.fontSizes.lg : theme.fontSizes.md

    return (
      <Box ref={ref} className={cn("w-full", className)} {...props}>
        <Group
          align="flex-start"
          gap="sm"
          style={{
            justifyContent: alignItems,
            marginLeft: isUser ? '2rem' : '0.5rem', // 用户消息向右，用户消息向左
            marginRight: isUser ? '0.5rem' : '2rem'
          }}
        >
          {/* AI消息：头像在左边 */}
          {!isUser && showAvatar && (
            <Avatar
              size="md"
              variant="filled"
              color="gray"
              alt="AI头像"
            >
              {avatarIcon}
            </Avatar>
          )}

          <div
            className="max-w-[75%] rounded-lg"
            style={{
              backgroundColor: bgColor,
              borderRadius: borderRadius,
              padding: padding,
            }}
          >
            <Text style={{ fontSize: fontSize, lineHeight: 1.5 }}>
              {message.content}
            </Text>
            {showTimestamp && message.timestamp && (
              <TextAtom
                size="xs"
                color="dimmed"
                className="text-right mt-2"
              >
                {typeof message.timestamp === 'number'
                  ? new Date(message.timestamp).toLocaleString()
                  : message.timestamp}
              </TextAtom>
            )}
          </div>

          {/* 用户消息：头像在右边 */}
          {isUser && showAvatar && (
            <Avatar
              size="md"
              variant="filled"
              color="blue"
              alt="用户头像"
            >
              {avatarIcon}
            </Avatar>
          )}
        </Group>
      </Box>
    )
  } 
)
MessageBubble.displayName = "MessageBubble"

export { MessageBubble }
export type { MessageBubbleProps }