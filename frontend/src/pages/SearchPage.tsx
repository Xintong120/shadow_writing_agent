import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { MessageSquare } from 'lucide-react'
import { api } from '@/services/api'
import { useTasks } from '@/contexts/TaskContext'
import { useIncompleteTasks } from '@/hooks/useIncompleteTasks'
import { handleError } from '@/utils/errorHandler'
import type { TEDCandidate, Message } from '@/types'

// 导入布局组件
import { LayoutContainer, PageSection } from '@/components/templates/Layout'

// 导入已创建的组件
import ChatInterface from '@/components/organisms/ChatInterface'
import ContinueLearningCard from '@/components/organisms/ContinueLearningCard'
import TEDList from '@/components/organisms/TEDList'
import BatchActionBar from '@/components/molecules/BatchActionBar'
import { QuickSuggestions } from '@/components/molecules/QuickSuggestions'
import { ChatInput } from '@/components/molecules/ChatInput'

// 导入聊天存储管理器
import { chatStorage, ChatStorageManager } from '@/utils/chatStorage'

function SearchPage() {
  const navigate = useNavigate()
  const { startSearchTask, startBatchTask } = useTasks()
  
  // 状态管理
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      userId: 'user_123',
      role: 'agent',
      content: '你好！我是你的英语学习助手。告诉我你想学习什么主题，我会帮你找到最合适的TED演讲。',
      timestamp: Date.now(),
      type: 'text'
    }
  ])

  // 修改：使用Map存储每个搜索主题的TED候选列表
  const [searchResults, setSearchResults] = useState<Map<string, TEDCandidate[]>>(new Map())
  const [selectedUrls, setSelectedUrls] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [currentQuery, setCurrentQuery] = useState('')
  
  // 获取未完成任务（用于 ContinueLearningCard）
  const incompleteTasks = useIncompleteTasks()

  // 调试：监听searchResults的变化
  useEffect(() => {
    console.log('[DEBUG SearchPage] searchResults变化:', {
      size: searchResults.size,
      keys: Array.from(searchResults.keys()),
      entries: Array.from(searchResults.entries())
    })
  }, [searchResults])

  // 初始化：从IndexedDB加载历史消息
  useEffect(() => {
    const loadHistory = async () => {
      try {
        // 检查IndexedDB是否支持
        if (!ChatStorageManager.isSupported()) {
          console.warn('IndexedDB is not supported in this browser')
          setIsLoadingHistory(false)
          return
        }

        await chatStorage.init()
        const history = await chatStorage.getRecentMessages('user_123', 100)

        if (history.length === 0) {
          // 首次使用，添加欢迎消息
          const welcomeMessage: Message = {
            id: 'welcome',
            userId: 'user_123',
            role: 'agent',
            content: '你好！我是你的英语学习助手。告诉我你想学习什么主题，我会帮你找到最合适的TED演讲。',
            timestamp: Date.now(),
            type: 'text'
          }
          setMessages([welcomeMessage])
          await chatStorage.saveMessage(welcomeMessage)
        } else {
          setMessages(history)
        }

        console.log('Chat history loaded from IndexedDB:', history.length, 'messages')
      } catch (error) {
        console.error('Failed to load chat history:', error)
        // 如果加载失败，至少显示欢迎消息
        const welcomeMessage: Message = {
          id: 'welcome',
          userId: 'user_123',
          role: 'agent',
          content: '你好！我是你的英语学习助手。告诉我你想学习什么主题，我会帮你找到最合适的TED演讲。',
          timestamp: Date.now(),
          type: 'text'
        }
        setMessages([welcomeMessage])
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadHistory()
  }, [])

  // 添加消息到对话历史
  const addMessage = useCallback(async (role: 'user' | 'agent', content: string, type: 'text' | 'ted_results' = 'text') => {
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      userId: 'user_123',
      role,
      content,
      timestamp: Date.now(),
      type
    }

    // 更新UI
    setMessages(prev => [...prev, newMessage])

    // 保存到IndexedDB
    try {
      await chatStorage.saveMessage(newMessage)
    } catch (error) {
      console.error('Failed to save message to IndexedDB:', error)
      // 不阻止UI更新，即使存储失败
    }
  }, [])

  // 处理用户输入
  const handleSendMessage = async (userInput: string) => {
    if (!userInput.trim()) return
    
    // 添加用户消息
    addMessage('user', userInput)
    setCurrentQuery(userInput)
    
    // 解析用户意图（简化版本）
    const isSearchIntent = /搜索|找|学习|关于|演讲|TED/i.test(userInput)
    
    if (isSearchIntent) {
      await handleSearch(userInput)
    } else {
      // 处理其他意图（筛选、优化等）
      handleFilterOrAction(userInput)
    }
  }

  // 执行TED搜索
  const handleSearch = async (query: string) => {
    setIsSearching(true)
    
    try {
      // 显示搜索状态
      addMessage('agent', `正在为你搜索关于"${query}"的TED演讲... 🔍`, 'text')
      
      // 启动搜索任务（全局状态管理）
      await startSearchTask(query, async () => {
        const response = await api.searchTED(query, 'user_123')

        console.log('[DEBUG SearchPage] API响应数据结构:', {
            query,
            response: response,
            candidates: response.candidates,
            candidatesLength: response.candidates?.length,
            firstCandidate: response.candidates?.[0],
            candidateKeys: response.candidates?.[0] ? Object.keys(response.candidates[0]) : 'no candidates'
        })

        // 修复数据格式，确保字段有合理的默认值
        const normalizedCandidates = response.candidates.map(candidate => ({
          ...candidate,
          speaker: candidate.speaker || '未知演讲者',
          duration: candidate.duration || '未知时长',
          views: candidate.views || '未知观看数',
          description: candidate.description || '暂无描述',
          relevance_score: candidate.relevance_score || 0,
          reasons: candidate.reasons || []
        }))

        // 存储到searchResults Map中，以query为key
        console.log('[DEBUG SearchPage] 存储搜索结果:', {
          query,
          normalizedCandidatesLength: normalizedCandidates.length,
          normalizedCandidates: normalizedCandidates.slice(0, 2) // 只显示前2个用于调试
        })
        
        setSearchResults(prev => {
          const newMap = new Map(prev)
          newMap.set(query, normalizedCandidates)
          console.log('[DEBUG SearchPage] 更新后的searchResults:', {
            size: newMap.size,
            keys: Array.from(newMap.keys()),
            queryInMap: newMap.has(query)
          })
          return newMap
        })

        if (response.candidates.length > 0) {
            addMessage('agent', `找到了 ${response.total} 个关于"${query}"的演讲！请选择你感兴趣的：`, 'text')
        } else {
            addMessage('agent', `抱歉，没有找到关于"${query}"的TED演讲。请尝试其他主题。`, 'text')
        }

        return response.candidates
      })
      
    } catch (error) {
      handleError(error, 'SearchPage.handleSearch')
      addMessage('agent', '搜索过程中出现错误，请稍后重试。', 'text')
    } finally {
      setIsSearching(false)
    }
  }

  // 处理筛选或操作
  const handleFilterOrAction = (userInput: string) => {
    // 暂时简化：只处理重新搜索和清空选择
    if (/换|更多|其他/i.test(userInput)) {
      // 重新搜索当前主题
      if (currentQuery) {
        handleSearch(currentQuery)
      }

    } else if (/清空|重置/i.test(userInput)) {
      // 清空选择
      setSelectedUrls([])
      addMessage('agent', '已清空选择。你可以重新选择演讲。', 'text')

    } else {
      // 默认：当作新搜索主题
      handleSearch(userInput)
    }
  }

  // 处理TED选择/取消选择
  const handleToggleTED = (url: string) => {
    setSelectedUrls(prev => 
      prev.includes(url) 
        ? prev.filter(u => u !== url)
        : [...prev, url]
    )
  }

  // 启动批量处理
  const handleStartBatch = async () => {
    if (selectedUrls.length === 0) {
      toast.error('请至少选择一个演讲')
      return
    }

    try {
      const response = await api.startBatchProcess(selectedUrls, 'user_123')

      // 启动批量任务（全局状态管理）
      startBatchTask(response.task_id, selectedUrls)

      // 跳转到处理页面
      navigate(`/batch/${response.task_id}`)

      toast.success('开始批量处理...')

    } catch (error) {
      handleError(error, 'SearchPage.handleStartBatch')
    }
  }

  // 清空选择
  const handleClearSelection = () => {
    setSelectedUrls([])
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 固定标题区域 */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 ">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              Shadow Writing Agent
            </h1>
          </div>
        </div>
      </div>

      {/* 可滚动内容区域 */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
            {/* 继续学习卡片（条件显示） */}
            {incompleteTasks.length > 0 && (
              <ContinueLearningCard />
            )}

            {/* 主对话界面 */}
            <ChatInterface
              messages={messages}
              searchResults={searchResults}
              selectedUrls={selectedUrls}
              recentSearches={[]}
              onSendMessage={handleSendMessage}
              onToggleTED={handleToggleTED}
              onStartBatch={handleStartBatch}
              onClearSelection={handleClearSelection}
              isTyping={false}
              isSearching={isSearching}
              isLoadingHistory={isLoadingHistory}
              className=""
            />

            {/* 全局批量操作栏（当有选择时显示） */}
            {selectedUrls.length > 0 && (
              <div className="border border-gray-200 rounded-xl   shadow-sm">
                <BatchActionBar
                  selectedCount={selectedUrls.length}
                  onStartBatch={handleStartBatch}
                  onClear={handleClearSelection}
                  disabled={isSearching}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 固定输入区域 */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSend={handleSendMessage}
            disabled={isSearching}
            loading={isSearching}
            placeholder="告诉我你想搜索或者学习的TED演讲主题..."
          />
        </div>
      </div>
    </div>
  )
}

export default SearchPage
