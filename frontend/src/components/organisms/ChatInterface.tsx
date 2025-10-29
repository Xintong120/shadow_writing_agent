import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card'
import { ScrollArea } from '@/components/atoms/scroll-area'
import { MessageSquare } from 'lucide-react'
import { MessageBubble } from '../molecules/MessageBubble'
import { QuickSuggestions } from '../molecules/QuickSuggestions'
import { RecentSearches } from '../molecules/RecentSearches'
import { ChatInput } from '../molecules/ChatInput'
import { TEDList } from './TEDList'
import { BatchActionBar } from '../molecules/BatchActionBar'
import { cn } from '@/lib/utils'

/**
 * ChatInterface - 对话界面容器组件
 * 管理整个对话流程，显示消息历史，集成TED卡片列表
 */
export function ChatInterface({
  messages = [],
  tedCandidates = [],
  selectedUrls = [],
  recentSearches = [],
  onSendMessage,
  onToggleTED,
  onStartBatch,
  onClearSelection,
  isTyping = false,
  className,
  ...props
}) {
  const messagesEndRef = useRef(null)
  const [showSuggestions, setShowSuggestions] = useState(true)

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, tedCandidates])

  const hotTopics = [
    '# 人工智能', '# 领导力', '# 创新', '# 沟通技巧',
    '# 心理学', '# 科技', '# 环保', '# 教育'
  ]

  const actionSuggestions = [
    '"只要15分钟以内的"',
    '"换一批演讲"',
    '"显示更多主题"'
  ]

  return (
    <Card className={cn("flex flex-col h-full max-h-[800px] bg-card", className)} {...props}>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Shadow Writing Agent
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        {/* 消息区域 */}
        <ScrollArea className="flex-1 px-6 pb-4">
          <div className="space-y-6 py-4">
            {/* 消息历史 */}
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                message={message}
                size="md"
              />
            ))}

            {/* 正在输入状态 */}
            {isTyping && (
              <MessageBubble
                message={{
                  role: 'agent',
                  content: "正在搜索...",
                  timestamp: Date.now()
                }}
                size="md"
              />
            )}

            {/* TED 候选列表 */}
            {tedCandidates.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                   找到了 <strong>{tedCandidates.length}</strong> 个演讲！请选择你感兴趣的：
                </div>

                <TEDList
                  teds={tedCandidates}
                  selectedUrls={selectedUrls}
                  onToggle={onToggleTED}
                  onSelectAll={(selectAll) => {
                    if (selectAll) {
                      // 全选所有TED
                      tedCandidates.forEach(ted => {
                        if (!selectedUrls.includes(ted.url)) {
                          onToggleTED(ted.url)
                        }
                      })
                    } else {
                      // 取消全选
                      selectedUrls.forEach(url => onToggleTED(url))
                    }
                  }}
                />

                {/* 快速操作建议 */}
                <QuickSuggestions
                  suggestions={actionSuggestions}
                  onSelect={onSendMessage}
                  type="actions"
                />
              </div>
            )}

            {/* 初始快速建议 */}
            {messages.length === 0 && showSuggestions && (
              <div className="space-y-4">
                <QuickSuggestions
                  suggestions={hotTopics}
                  onSelect={onSendMessage}
                  type="topics"
                />

                {/* 最近搜索 */}
                <RecentSearches
                  searches={recentSearches}
                  onSelect={onSendMessage}
                />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* 输入区域 */}
        <div className="flex-shrink-0 px-6 pb-6">
          <ChatInput
            onSend={onSendMessage}
            disabled={isTyping}
            loading={isTyping}
            placeholder="告诉我你想搜索或者学习的TED演讲主题..."
          />
        </div>

        {/* 批量操作栏 */}
        {tedCandidates.length > 0 && (
          <BatchActionBar
            selectedCount={selectedUrls.length}
            onStartBatch={onStartBatch}
            onClear={onClearSelection}
            disabled={isTyping}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default ChatInterface