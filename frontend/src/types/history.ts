// frontend/src/types/history.ts
// 学习历史相关类型定义

// 学习记录状态
export type LearningStatus = 'todo' | 'in_progress' | 'completed'

// 学习历史记录
export interface LearningHistory {
  id: number
  talkId: number
  title: string
  status: LearningStatus
  progress: number // 0-100
  lastPlayed: string // 如 "2h ago", "1d ago"
}

// 标签页配置
export interface HistoryTab {
  id: LearningStatus
  label: string
  icon: any // LucideIcon
  color: string // Tailwind 类名，如 'text-amber-500'
}