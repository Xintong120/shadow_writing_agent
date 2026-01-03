// frontend/src/pages/LearningSessionPage.tsx
// 学习会话页面 - 沉浸式学习界面

import { ArrowRight, MoreHorizontal } from 'lucide-react'
import LearningCard from '@/components/LearningCard'
import { TedTalk } from '@/types/ted'
import { LearningItem } from '@/types/learning'

interface LearningSessionPageProps {
  talk: TedTalk
  onBack: () => void
}

// 模拟数据 - 默认使用第一个演讲的学习内容
const MOCK_SHADOW_CONTENT: Record<number, LearningItem[]> = {
  1: [
    {
      id: 101,
      original: "Leadership requires vision to navigate uncertainty.",
      mimic: "Management demands insight to handle ambiguity.",
      mapping: [
        { from: "Leadership", to: "Management" },
        { from: "requires", to: "demands" },
        { from: "vision", to: "insight" },
        { from: "navigate", to: "handle" }
      ]
    },
    {
      id: 102,
      original: "We must embrace the challenges of the future.",
      mimic: "We should accept the difficulties of tomorrow.",
      mapping: [
        { from: "must", to: "should" },
        { from: "embrace", to: "accept" },
        { from: "challenges", to: "difficulties" }
      ]
    }
  ],
  2: [
    {
      id: 201,
      original: "To learn is to change.",
      mimic: "To acquire knowledge is to transform.",
      mapping: [
        { from: "learn", to: "acquire knowledge" },
        { from: "change", to: "transform" }
      ]
    }
  ]
}

const LearningSessionPage = ({ talk, onBack }: LearningSessionPageProps) => {
  const content = MOCK_SHADOW_CONTENT[talk.id] || []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
       {/* 顶部导航 */}
       <div className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md py-4 mb-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
           <button
             onClick={onBack}
             className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition-colors"
           >
              <ArrowRight className="rotate-180" size={20} />
              <span className="font-medium hidden sm:inline">返回任务列表</span>
           </button>
           <div className="text-center">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{talk.title}</h2>
              <p className="text-xs text-slate-500">2 / 15 完成</p>
           </div>
           <button className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              <MoreHorizontal size={24} />
           </button>
       </div>

       {/* 练习卡片列表 */}
       <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
           {content.map((item, index) => (
              <div key={item.id}>
                 <div className="flex items-center gap-4 mb-4">
                    <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
                    <span className="text-xs font-bold text-slate-400">练习 {index + 1}</span>
                    <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
                 </div>
                 <LearningCard data={item} />
              </div>
           ))}

           <div className="text-center pt-10 pb-20">
              <button className="bg-slate-900 dark:bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                 完成本节练习 🎉
              </button>
           </div>
       </div>
    </div>
  )
}

export default LearningSessionPage