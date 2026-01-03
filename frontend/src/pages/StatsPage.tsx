// frontend/src/pages/StatsPage.tsx
// 数据统计页面 - 学习数据分析和可视化

import { Clock, CheckCircle, Activity, Zap, BarChart2 } from 'lucide-react'

const StatsPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
        <BarChart2 className="text-indigo-500" />
        学习数据分析
      </h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: '总练习时长', value: '32h 15m', icon: Clock, color: 'blue' },
          { label: '模仿句子数', value: '1,245', icon: CheckCircle, color: 'emerald' },
          { label: '平均准确率', value: '88%', icon: Activity, color: 'rose' },
          { label: '当前连胜', value: '12 Days', icon: Zap, color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 flex items-center justify-center text-${stat.color}-600 dark:text-${stat.color}-400`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Placeholder */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white">能力维度雷达图</h3>
            <select className="text-xs bg-slate-50 dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300">
              <option>本周</option>
              <option>本月</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">
             <div className="text-center">
               <div className="relative w-40 h-40 mx-auto opacity-50">
                  {/* CSS Simulation of Radar Chart */}
                  <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                    <polygon points="50,10 90,35 90,75 50,90 10,75 10,35" fill="none" stroke="currentColor" strokeWidth="1" />
                    <polygon points="50,25 75,40 75,65 50,75 25,65 25,40" fill="rgba(79, 70, 229, 0.2)" stroke="currentColor" strokeWidth="1" className="text-indigo-500" />
                    <line x1="50" y1="50" x2="50" y2="10" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="50" y1="50" x2="90" y2="35" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="50" y1="50" x2="90" y2="75" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="50" y1="50" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="50" y1="50" x2="10" y2="75" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="50" y1="50" x2="10" y2="35" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
               </div>
               <span className="text-xs mt-2 block">词汇量 • 语法结构 • 流利度 • 逻辑性 • 情感色彩 • 专业度</span>
             </div>
          </div>
        </div>

        {/* Progress List */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">今日目标</h3>
          <div className="space-y-6">
            {[
              { title: "完成 3 个 TED 演讲分析", progress: 66, color: "bg-indigo-500" },
              { title: "学习 20 个新表达", progress: 40, color: "bg-pink-500" },
              { title: "保持专注 45 分钟", progress: 100, color: "bg-emerald-500" }
            ].map((goal, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-300">{goal.title}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{goal.progress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${goal.color} rounded-full transition-all duration-1000`}
                    style={{width: `${goal.progress}%`}}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsPage