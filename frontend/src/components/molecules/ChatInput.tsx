/**
 * 对话输入框组件：
 * 支持多行输入、键盘快捷键和自动发送
 */

import * as React from "react"
import { Textarea, Box, useMantineTheme } from '@mantine/core'
import { Button } from '@/components/atoms/button'
import { Loader2, Send } from 'lucide-react'
import { cn } from "@/lib/utils"
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'

// 简化的类型定义
interface ChatInputProps {
  onSend: (message: string) => void
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  className?: string
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({
    onSend,
    placeholder = "告诉我你想搜索或者学习的TED演讲主题...",
    disabled = false,
    loading = false,
    className,
    ...props
  }, ref) => {
    const [value, setValue] = React.useState('')
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)
    const spacing = getSpacing(theme)

    // 自动调整高度 - 使用 useCallback 获取 textarea 元素
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    React.useEffect(() => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, [value])

    const handleSend = () => {
      const trimmedValue = value.trim()
      if (trimmedValue && !disabled && !loading) {
        onSend(trimmedValue)
        setValue('')
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter发送（不包含Shift）
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }

      // Ctrl+K清空
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setValue('')
        textareaRef.current?.focus()
      }

      // Escape取消
      if (e.key === 'Escape') {
        setValue('')
        textareaRef.current?.blur()
      }
    }

    return (
      <Box
        className={cn(
          "relative border rounded-lg bg-background",
          className
        )}
        {...props}
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          autosize
          minRows={1}
          maxRows={4}
          className="border-0 bg-transparent pr-12"
          styles={{
            input: {
              padding: spacing.md,
              fontSize: theme.fontSizes.sm,
              lineHeight: 1.5,
              '::placeholder': {
                color: colors.textMuted,
              },
              '&:focus': {
                outline: 'none',
              },
              '@media(min-width:1024px)': {
                fontSize: theme.fontSizes.md,
                padding: spacing.lg,
              },
            },
          }}
          aria-label="输入学习主题"
          aria-describedby="input-hint input-error"
        />

        <Button
          size="icon"
          variant="subtle"
          className="absolute right-2 bottom-2 h-8 w-8 lg:h-10 lg:w-10"
          onClick={handleSend}
          disabled={!value.trim() || disabled || loading}
          aria-label="发送消息"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>

        {/* 隐藏的辅助文本 */}
        <div id="input-hint" className="sr-only">
          按Enter发送消息，Shift+Enter换行，Ctrl+K清空输入
        </div>
      </Box>
    )
  }
)

ChatInput.displayName = "ChatInput"

export { ChatInput }
export type { ChatInputProps }

// 为了向后兼容，也导出为默认导出
export default ChatInput