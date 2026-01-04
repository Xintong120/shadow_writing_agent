import { BrowserRouter } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { TaskProvider } from '@/contexts/TaskContext'
import { Toaster } from 'sonner'
import LoginPage from '@/pages/LoginPage'
import SearchPage from '@/pages/SearchPage'
import ProcessingPage from '@/pages/ProcessingPage'
import PreviewPage from '@/pages/PreviewPage'
import LearningSessionPage from '@/pages/LearningSessionPage'
import HistoryPage from '@/pages/HistoryPage'
import SettingsPage from '@/pages/SettingsPage'
import StatsPage from '@/pages/StatsPage'
import Navigation from '@/components/Navigation'
import { ActiveTab } from '@/types/navigation'
import { TedTalk } from '@/types/ted'
import { sseService } from '@/services/progress'

// Auth Wrapper Component with State Machine
const AuthWrapper = () => {
  const { authStatus, login, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat')
  const [appState, setAppState] = useState<'idle' | 'processing' | 'preview' | 'learning'>('idle')
  const [processedTalks, setProcessedTalks] = useState<TedTalk[]>([])
  const [currentLearningTalk, setCurrentLearningTalk] = useState<TedTalk | null>(null)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Apply dark mode to document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const handleStartProcessing = (talks: TedTalk[], taskId?: string) => {
    console.log('开始处理演讲:', talks, 'taskId:', taskId)

    setProcessedTalks(talks)
    setCurrentTaskId(taskId || null)
    setAppState('processing')
  }

  const handleProcessingFinish = useCallback(() => {
    console.log('[App] handleProcessingFinish被调用，设置appState为preview')
    setAppState('preview')
    console.log('处理完成，跳转到预览页面')
  }, [])

  const handleStartLearning = (talk: TedTalk) => {
    console.log('开始学习:', talk)
    setCurrentLearningTalk(talk)
    setAppState('learning')
    setActiveTab('chat') // 确保切换到 chat 标签显示学习页面
  }

  const handleNavigateToLearning = (talk: TedTalk) => {
    console.log('导航到学习页面:', talk)
    setActiveTab('chat')
    setCurrentLearningTalk(talk)
    setAppState('learning')
  }

  if (authStatus === 'logged_out') {
    return <LoginPage onLogin={login} />
  }

  // Main authenticated layout
  return (
    <div className="flex h-screen font-sans overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <Navigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab)
          setAppState('idle') // 切换标签时重置状态
        }}
        userMode={authStatus}
        onLogout={logout}
      />
      <main className="flex-1 overflow-y-auto scroll-smooth w-full relative">
        {activeTab === 'chat' && (
          appState === 'idle'
            ? <SearchPage onStartProcessing={handleStartProcessing} />
            : appState === 'processing'
            ? <ProcessingPage taskId={currentTaskId} onFinish={handleProcessingFinish} />
            : appState === 'preview'
            ? <PreviewPage selectedTalksData={processedTalks} onStartLearning={handleStartLearning} taskId={currentTaskId} />
            : currentTaskId && <LearningSessionPage taskId={currentTaskId} onBack={() => setAppState('preview')} />
        )}
        {activeTab === 'history' && <HistoryPage onNavigateToLearning={handleNavigateToLearning} />}
        {activeTab === 'stats' && <StatsPage />}
        {activeTab === 'settings' && <SettingsPage isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />}
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
          <AuthWrapper />
          <Toaster position="top-right" />
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
