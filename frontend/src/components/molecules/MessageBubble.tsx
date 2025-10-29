import { Avatar, AvatarFallback } from '@/components/atoms/avatar'
import { UserRound, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * MessageBubble - 消息气泡组件
 * 显示用户和Agent的消息，支持头像、时间戳和不同样式
 */
export function MessageBubble({
  message,
  variant = 'default',
  size = 'md',
  showAvatar = true,
  showTimestamp = true,
  className,
  ...props
}) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        "flex items-start gap-sm lg:gap-md",
        isUser && "flex-row-reverse",
        className
      )}
      {...props}
    >
      {/* Avatar - 小窗口适配：略小 */}
      {showAvatar && (
        <Avatar className="h-8 w-8 lg:h-10 lg:w-10 shrink-0" style={{width: '2rem', height: '2rem'}} >
          <AvatarFallback>
            {isUser ? <UserRound className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      )}

      {/* 消息内容 -  小窗口适配：减小padding */}
      <div className="flex flex-col gap-xs max-w-[80%] lg:max-w-[70%]">
        <div
          className={cn(
            "p-md lg:p-lg rounded-lg max-w-full break-words",
            "text-sm lg:text-base",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          {message.content}
        </div>

        {/* 时间戳 */}
        {showTimestamp && message.timestamp && (
          <span className="text-xs text-muted-foreground px-1">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  )
}