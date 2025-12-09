 /**
 * 对话输入框组件：
 * 支持多行输入、键盘快捷键和自动发送
 */

import * as React from "react"
import { Textarea, Box, useMantineTheme } from '@mantine/core'
import { IconButton } from '@/components/atoms/iconbutton'
import { Loader2 } from 'lucide-react'
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
          "relative border rounded-xl bg-background shadow-sm",
          className
        )}
        style={{
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        }}
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
              padding: `${spacing.md} ${spacing.md} ${spacing.md} ${spacing.md}`,
              fontSize: theme.fontSizes.sm,
              lineHeight: 1.5,
              borderRadius: theme.radius.xl,
              border: 'none !important',
              boxShadow: 'none',
              backgroundColor: 'transparent',
              color: 'inherit',
              '::placeholder': {
                color: colors.textMuted,
              },
              '&:focus': {
                outline: 'none',
                border: 'none !important',
                boxShadow: 'none',
                backgroundColor: 'transparent',
              },
              '&:disabled': {
                backgroundColor: 'transparent',
                border: 'none !important',
                boxShadow: 'none',
              },
              '&[data-loading="true"]': {
                backgroundColor: 'transparent',
                border: 'none !important',
                boxShadow: 'none',
              },
              '@media(min-width:1024px)': {
                fontSize: theme.fontSizes.md,
                padding: `${spacing.lg} ${spacing.lg} ${spacing.lg} ${spacing.lg}`,
              },
            },
          }}
          aria-label="输入学习主题"
          aria-describedby="input-hint input-error"
        />

        <IconButton
          icon={
            <svg
              viewBox="0 0 1045 1024"
              className="h-full w-full"
            >
              <path
                d="M989.184 87.530667c30.421333-10.154667 60.736 15.637333 55.594667 47.296l-128 789.333333a42.666667 42.666667 0 0 1-63.082667 30.336l-340.736-192.213333-154.837333 66.282666a42.666667 42.666667 0 0 1-59.349334-36.181333L298.666667 789.269333l0.256-147.733333-277.226667-156.373333c-31.168-17.6-27.882667-62.890667 4.181333-76.394667l3.306667-1.237333z m-39.936 103.232L147.349333 458.069333l215.253334 121.408a42.666667 42.666667 0 0 1 21.546666 33.706667l0.149334 3.541333-0.192 107.882667 114.666666-49.066667a42.666667 42.666667 0 0 1 34.218667 0.277334l3.541333 1.792 305.792 172.501333 106.922667-659.349333z m-127.146667 123.264a42.666667 42.666667 0 0 1-2.858666 57.728l-2.602667 2.346666-256 213.333334a42.666667 42.666667 0 0 1-57.216-63.189334l2.602667-2.346666 256-213.333334a42.666667 42.666667 0 0 1 60.074666 5.461334z"
                fill="currentColor"
              />
            </svg>
          }
          size="sm"
          loading={loading}
          disabled={!value.trim() || disabled}
          onClick={handleSend}
          className="absolute right-2 bottom-2"
          aria-label="发送消息"
        />

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