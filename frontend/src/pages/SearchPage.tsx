// frontend/src/pages/SearchPage.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
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

function SearchPage() {
  const navigate = useNavigate()
  const { startSearchTask, startBatchTask } = useTasks()
  
  // 状态管理
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'agent',
      content: '你好！我是你的英语学习助手。告诉我你想学习什么主题，我会帮你找到最合适的TED演讲。',
      timestamp: Date.now(),
      type: 'text'
    }
  ])
  
  const [tedCandidates, setTedCandidates] = useState<TEDCandidate[]>([])
  const [selectedUrls, setSelectedUrls] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [currentQuery, setCurrentQuery] = useState('')
  
  // 获取未完成任务（用于 ContinueLearningCard）
  const incompleteTasks = useIncompleteTasks()

  // 添加消息到对话历史
  const addMessage = (role: 'user' | 'agent', content: string, type: 'text' | 'ted_results' = 'text') => {
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      role,
      content,
      timestamp: Date.now(),
      type
    }
    setMessages(prev => [...prev, newMessage])
  }

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

        if (response.success) {
          setTedCandidates(response.data.candidates)

          if (response.data.candidates.length > 0) {
            addMessage('agent', `找到了 ${response.data.total} 个演讲！请选择你感兴趣的：`, 'text')
          } else {
            addMessage('agent', '抱歉，没有找到相关的TED演讲。请尝试其他主题。', 'text')
          }

          return response.data.candidates
        } else {
          throw new Error(response.error || '搜索失败')
        }
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
    // 简化实现：根据关键词处理
    if (/分钟|时长|短/i.test(userInput)) {
      // 按时长筛选
      const filtered = tedCandidates.filter(ted => {
        const duration = ted.duration || '00:00'
        const minutes = parseInt(duration.split(':')[0]) || 0
        return minutes <= 15
      })
      setTedCandidates(filtered)
      addMessage('agent', `已筛选出 ${filtered.length} 个15分钟以内的演讲。`, 'text')
      
    } else if (/换|更多|其他/i.test(userInput)) {
      // 重新搜索
      handleSearch(currentQuery)
      
    } else if (/清空|重置/i.test(userInput)) {
      // 清空选择
      setSelectedUrls([])
      addMessage('agent', '已清空选择。你可以重新选择演讲。', 'text')
      
    } else {
      // 默认：重新搜索
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

      if (response.success) {
        // 启动批量任务（全局状态管理）
        startBatchTask(response.data.task_id, selectedUrls)

        // 跳转到处理页面
        navigate(`/batch/${response.data.task_id}`)

        toast.success('开始批量处理...')
      } else {
        throw new Error(response.error || '启动失败')
      }

    } catch (error) {
      handleError(error, 'SearchPage.handleStartBatch')
    }
  }

  return (
    <LayoutContainer maxWidth="standard">
      {/* 继续学习卡片（条件显示） */}
      {incompleteTasks.length > 0 && (
        <PageSection>
          <ContinueLearningCard />
        </PageSection>
      )}

      {/* 主对话界面 */}
      <PageSection>
        <ChatInterface
          messages={messages}
          tedCandidates={tedCandidates}
          selectedUrls={selectedUrls}
          onSendMessage={handleSendMessage}
          onToggleTED={handleToggleTED}
          onStartBatch={handleStartBatch}
          isSearching={isSearching}
        />
      </PageSection>

      {/* TED候选列表（当有结果时显示） */}
      {tedCandidates.length > 0 && (
        <PageSection>
          <TEDList
            teds={tedCandidates}
            selectedUrls={selectedUrls}
            onToggle={handleToggleTED}
          />
        </PageSection>
      )}

      {/* 批量操作栏（当有选择时显示） */}
      {selectedUrls.length > 0 && (
        <PageSection>
          <BatchActionBar
            selectedCount={selectedUrls.length}
            onStartBatch={handleStartBatch}
            disabled={isSearching}
          />
        </PageSection>
      )}
    </LayoutContainer>
  )
}

export default SearchPage
