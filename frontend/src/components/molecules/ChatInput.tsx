import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/atoms/button'
import { Loader2, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * ChatInput - 对话输入框组件
 * 支持多行输入、键盘快捷键和自动发送
 */
export function ChatInput({
  onSend,
  placeholder = "告诉我你想搜索或者学习的TED演讲主题...",
  disabled = false,
  loading = false,
  className,
  ...props
}) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  // 自动调整高度
  useEffect(() => {
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

  const handleKeyDown = (e) => {
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
    <div
      className={cn(
        "relative border rounded-lg bg-background",
        className
      )}
      {...props}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || loading}
        rows={1}
        className={cn(
          "w-full resize-none border-0 bg-transparent px-lg py-md pr-12",
          "text-sm lg:text-base placeholder:text-muted-foreground",
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
          "min-h-[60px] lg:min-h-[80px] max-h-32",
          (disabled || loading) && "opacity-50 cursor-not-allowed"
        )}
        aria-label="输入学习主题"
        aria-describedby="input-hint input-error"
      />

      <Button
        size="icon"
        variant="ghost"
        className="absolute right-sm bottom-sm h-8 w-8 lg:h-10 lg:w-10"
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
    </div>
  )
}