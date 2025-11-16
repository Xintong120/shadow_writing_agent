import { useState, useEffect, useRef } from 'react'
import { Card as MantineCard, Text, useMantineTheme } from '@mantine/core'
import { ScrollArea } from '@/components/atoms/scrollarea'
import { MessageSquare } from 'lucide-react'
import { MessageBubble } from '../molecules/MessageBubble'
import { QuickSuggestions } from '../molecules/QuickSuggestions'
import { RecentSearches } from '../molecules/RecentSearches'
import { ChatInput } from '../molecules/ChatInput'
import { TEDList } from './TEDList'
import { BatchActionBar } from '../molecules/BatchActionBar'
import { cn } from '@/lib/utils'
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'

/**
 * ChatInterface - 对话界面容器组件
 * 管理整个对话流程，显示消息历史，集成TED卡片列表
 */
export function ChatInterface({
  messages = [],
  searchResults = new Map(),
  selectedUrls = [],
  recentSearches = [],
  onSendMessage,
  onToggleTED,
  onStartBatch,
  onClearSelection,
  isTyping = false,
  isSearching = false,
  isLoadingHistory = false,
  className,
  ...props
}) {
  const messagesEndRef = useRef(null)
  const theme = useMantineTheme()
  const colors = getSemanticColors(theme)
  const spacing = getSpacing(theme)
  const [showSuggestions, setShowSuggestions] = useState(true)

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, searchResults])

  // 解析消息中的搜索主题
  const extractSearchTopic = (messageContent: string): string | null => {
    // 调试日志
    console.log('[DEBUG ChatInterface] 提取搜索主题:', {
      messageContent,
      hasSearchKeyword: messageContent.includes('搜索关于'),
      hasQuotes: messageContent.includes('"'),
      fullMatch: messageContent.match(/搜索关于"([^"]+)"/),
      fallbackMatch: messageContent.match(/关于"([^"]+)"/)
    })
    
    // 首先尝试匹配包含"搜索关于"的完整格式
    let searchMatch = messageContent.match(/搜索关于"([^"]+)"/)
    if (searchMatch) {
      console.log('[DEBUG ChatInterface] 找到搜索主题:', searchMatch[1])
      return searchMatch[1]
    }
    
    // 备选：只匹配"关于"的格式
    searchMatch = messageContent.match(/关于"([^"]+)"/)
    if (searchMatch) {
      console.log('[DEBUG ChatInterface] 找到备选搜索主题:', searchMatch[1])
      return searchMatch[1]
    }
    
    console.log('[DEBUG ChatInterface] 未找到搜索主题')
    return null
  }

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
    <MantineCard
      className={cn("flex flex-col h-full", className)}
      style={{
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
      }}
      {...props}
    >
      {/* Card Content - 无标题，直接显示内容 */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* 消息区域 */}
        <ScrollArea className="flex-1 h-0 px-1 py-1">
          <div className="space-y-3 py-2">
            {/* 加载历史消息状态 */}
            {isLoadingHistory && (
              <div className="text-center py-8 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p>正在加载聊天记录...</p>
              </div>
            )}

            {/* 消息历史 */}
            {!isLoadingHistory && messages.map((message, index) => {
              const searchTopic = extractSearchTopic(message.content)
              const hasResults = message.content.includes('找到了') && message.content.includes('演讲')
              
              // 调试日志
              console.log('[DEBUG ChatInterface] 消息处理:', {
                index,
                messageContent: message.content,
                searchTopic,
                hasResults,
                searchResultsKeys: Array.from(searchResults.keys()),
                hasSearchResults: searchResults.size > 0
              })
              
              const tedCandidates = searchTopic ? searchResults.get(searchTopic) : null
              
              // 额外调试
              if (hasResults) {
                console.log('[DEBUG ChatInterface] 搜索结果消息详情:', {
                  searchTopic,
                  tedCandidates,
                  tedCandidatesLength: tedCandidates?.length || 0,
                  shouldShowTED: hasResults && tedCandidates && tedCandidates.length > 0
                })
              }

              return (
                <div key={index}>
                  <MessageBubble
                    message={message}
                    size="md"
                  />

                  {/* 如果是搜索结果消息且有对应的TED候选列表，则显示 */}
                  {hasResults && tedCandidates && tedCandidates.length > 0 && (
                    <div className="mt-4 mb-6">
                      <TEDList
                        teds={tedCandidates}
                        selectedUrls={selectedUrls}
                        onToggle={onToggleTED}
                        onSelectAll={(selectAll) => {
                          if (selectAll) {
                            // 全选当前搜索结果的所有TED
                            tedCandidates.forEach(ted => {
                              if (!selectedUrls.includes(ted.url)) {
                                onToggleTED(ted.url)
                              }
                            })
                          } else {
                            // 取消全选当前搜索结果的所有TED
                            tedCandidates.forEach(ted => {
                              if (selectedUrls.includes(ted.url)) {
                                onToggleTED(ted.url)
                              }
                            })
                          }
                        }}
                        className=""
                      />

                      {/* 快速操作建议 */}
                      <div className="mt-4">
                        <QuickSuggestions
                          suggestions={actionSuggestions}
                          onSelect={onSendMessage}
                          type="actions"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

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

      </div>
    </MantineCard>
  )
}

export default ChatInterface