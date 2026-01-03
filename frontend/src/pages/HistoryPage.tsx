// frontend/src/pages/HistoryPage.tsx
// 学习历史页面 - 展示学习记录，支持状态分组和跳转

import { useState } from 'react'
import { Clock, Zap, CheckCircle, ArrowRight, List } from 'lucide-react'
import { LearningStatus, LearningHistory, HistoryTab } from '@/types/history'
import { TedTalk } from '@/types/ted'

// 标签页配置
const tabs: HistoryTab[] = [
  { id: 'todo', label: '待学习', icon: Clock, color: 'text-amber-500' },
  { id: 'in_progress', label: '学习中', icon: Zap, color: 'text-indigo-500' },
  { id: 'completed', label: '已完成', icon: CheckCircle, color: 'text-emerald-500' },
]

// 模拟历史数据
const MOCK_HISTORY: LearningHistory[] = [
  { id: 1, talkId: 1, title: "Why AI needs a sense of ethics", status: 'completed', progress: 100, lastPlayed: '2h ago' },
  { id: 2, talkId: 2, title: "The future of leadership in the digital age", status: 'in_progress', progress: 45, lastPlayed: '1d ago' },
  { id: 3, talkId: 3, title: "How to learn a new language by 2025", status: 'todo', progress: 0, lastPlayed: 'Added today' },
  { id: 4, talkId: 4, title: "Creative thinking in a data-driven world", status: 'todo', progress: 0, lastPlayed: 'Added yesterday' },
]

// TED演讲数据映射
const MOCK_TED_TALKS: Record<number, Omit<TedTalk, 'id'>> = {
  1: {
    title: "Why AI needs a sense of ethics",
    speaker: "Technologist X",
    duration: "12:45",
    views: "2.1M",
    description: "An insightful look into how we can program morality into machines...",
    thumbnail: "bg-blue-100 dark:bg-blue-900/30"
  },
  2: {
    title: "The future of leadership in the digital age",
    speaker: "Leader Y",
    duration: "15:20",
    views: "1.5M",
    description: "What does it mean to lead when your team is half human, half algorithm?",
    thumbnail: "bg-indigo-100 dark:bg-indigo-900/30"
  },
  3: {
    title: "How to learn a new language by 2025",
    speaker: "Linguist Z",
    duration: "09:30",
    views: "5.8M",
    description: "New techniques in cognitive science reveal the secrets of rapid acquisition.",
    thumbnail: "bg-purple-100 dark:bg-purple-900/30"
  },
  4: {
    title: "Creative thinking in a data-driven world",
    speaker: "Artist A",
    duration: "18:10",
    views: "900K",
    description: "Why human creativity is becoming more valuable, not less.",
    thumbnail: "bg-pink-100 dark:bg-pink-900/30"
  }
}

interface HistoryPageProps {
  onNavigateToLearning: (talk: TedTalk) => void
}

const HistoryPage = ({ onNavigateToLearning }: HistoryPageProps) => {
  const [activeTab, setActiveTab] = useState<LearningStatus>('todo')

  const filteredHistory = MOCK_HISTORY.filter(item => item.status === activeTab)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 pb-24 md:pb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8">学习历史</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-xl w-full sm:w-auto inline-flex">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? tab.color : ''} />
            {tab.label}
            <span className="ml-1 text-xs opacity-60 bg-slate-100 dark:bg-slate-800 px-1.5 rounded-full">
              {MOCK_HISTORY.filter(h => h.status === tab.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((item) => {
            const talkData = MOCK_TED_TALKS[item.talkId] || MOCK_TED_TALKS[1]
            const talk: TedTalk = { id: item.talkId, ...talkData }

            return (
              <div
                key={item.id}
                onClick={() => onNavigateToLearning(talk)}
                className="group bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 transition-all cursor-pointer flex items-center gap-5"
              >
                {/* Thumbnail / Status Icon */}
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 ${
                    activeTab === 'completed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
                    activeTab === 'in_progress' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
                    'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                }`}>
                    {activeTab === 'completed' ? <CheckCircle size={28} /> :
                     activeTab === 'in_progress' ? <Zap size={28} /> :
                     <Clock size={28} />}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <span>{talk.speaker}</span>
                    <span>•</span>
                    <span>{item.lastPlayed}</span>
                  </div>

                  {/* Progress Bar (Only for In Progress) */}
                  {activeTab === 'in_progress' && (
                    <div className="mt-3 w-full max-w-xs h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 rounded-full" style={{width: `${item.progress}%`}}></div>
                    </div>
                  )}
                </div>

                <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ArrowRight size={20} />
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                 <List size={32} />
              </div>
              <p className="text-slate-500 dark:text-slate-400">暂无此状态的记录</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPage