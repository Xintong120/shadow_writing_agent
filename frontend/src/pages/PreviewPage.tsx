// frontend/src/pages/PreviewPage.tsx
// 任务预览页面 - 显示处理完成后的演讲内容预览

import { useState } from 'react'
import { Layout, Play, Zap, BookOpen } from 'lucide-react'
import { TedTalk } from '@/types/ted'

interface PreviewPageProps {
  selectedTalksData: TedTalk[]
  onStartLearning: (talk: TedTalk) => void
}

const PreviewPage = ({ selectedTalksData, onStartLearning }: PreviewPageProps) => {
  const [activePreviewId, setActivePreviewId] = useState(selectedTalksData[0]?.id)
  const activeTalk = selectedTalksData.find(t => t.id === activePreviewId) || selectedTalksData[0]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24 h-full flex flex-col">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <Layout className="text-indigo-600" />
        学习任务预览 ({selectedTalksData.length})
      </h2>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* 左侧：演讲列表 */}
        <div className="w-full lg:w-1/3 space-y-3">
          {selectedTalksData.map(talk => (
            <div
              key={talk.id}
              onClick={() => setActivePreviewId(talk.id)}
              className={`p-4 rounded-xl cursor-pointer border transition-all ${
                activePreviewId === talk.id
                  ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                  : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
            >
              <h3 className={`font-bold text-sm mb-1 ${activePreviewId === talk.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {talk.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-1">{talk.speaker}</p>
            </div>
          ))}
        </div>

        {/* 右侧：预览详情 & 开始按钮 */}
        <div className="w-full lg:w-2/3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm flex flex-col">
           <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeTalk.thumbnail} text-indigo-600`}>
                    <Play size={20} fill="currentColor" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{activeTalk.title}</h3>
                    <p className="text-slate-500 text-sm">{activeTalk.speaker} • {activeTalk.duration}</p>
                 </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                {activeTalk.description}
              </p>

              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-3 flex items-center gap-2">
                   <Zap size={16} className="text-amber-500" />
                   生成内容预览
                </h4>
                <div className="space-y-3">
                   <div className="h-2 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                   <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                   <div className="h-2 w-5/6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
                <p className="text-xs text-slate-400 mt-4 text-center">包含约 15 个影子写作练习单元</p>
              </div>
           </div>

           <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => onStartLearning(activeTalk)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 transform hover:scale-105"
              >
                <BookOpen size={20} />
                进入学习界面
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}

export default PreviewPage