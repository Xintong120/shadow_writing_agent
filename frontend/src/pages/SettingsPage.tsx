// frontend/src/pages/SettingsPage.tsx
// 系统设置页面 - API配置、偏好设置、存储管理

import { useState } from 'react'
import { Database, Settings, Cpu, Trash2, Moon, Sun, Globe, Wifi, WifiOff, RefreshCw } from 'lucide-react'

interface ApiKey {
  service: string
  key: string
  status: 'idle' | 'checking' | 'success' | 'error'
}

interface SettingsPageProps {
  isDarkMode: boolean
  toggleTheme: () => void
}

const SettingsPage = ({ isDarkMode, toggleTheme }: SettingsPageProps) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { service: 'Tavily Search API', key: '', status: 'idle' },
    { service: 'OpenAI GPT-4', key: '', status: 'success' }
  ])

  const updateKey = (index: number, value: string) => {
    const newKeys = [...apiKeys]
    newKeys[index].key = value
    newKeys[index].status = 'idle'
    setApiKeys(newKeys)
  }

  const testConnection = (index: number) => {
    const newKeys = [...apiKeys]
    newKeys[index].status = 'checking'
    setApiKeys(newKeys)

    // Simulate API Check
    setTimeout(() => {
      const updatedKeys = [...newKeys]
      // Randomly succeed or fail for demo
      updatedKeys[index].status = Math.random() > 0.3 ? 'success' : 'error'
      setApiKeys(updatedKeys)
    }, 1500)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8">系统设置</h1>

      <div className="space-y-8">
        {/* API Configuration */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
           <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-lg">
             <Database size={20} className="text-indigo-500" />
             API 连接配置
           </h3>
           <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
             配置外部服务 API Key 以启用智能搜索和影子写作功能。您的 Key 仅存储在本地浏览器中。
           </p>

           <div className="space-y-4">
             {apiKeys.map((api, idx) => (
               <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                 <div className="flex-1 w-full">
                   <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                     {api.service}
                   </label>
                   <div className="relative">
                     <input
                       type="password"
                       value={api.key || "sk-........................"}
                       onChange={(e) => updateKey(idx, e.target.value)}
                       className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-10 py-2.5 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono"
                     />
                     <div className="absolute right-3 top-2.5">
                       {api.status === 'success' && <Wifi size={16} className="text-emerald-500" />}
                       {api.status === 'error' && <WifiOff size={16} className="text-red-500" />}
                       {api.status === 'checking' && <RefreshCw size={16} className="text-indigo-500 animate-spin" />}
                     </div>
                   </div>
                 </div>
                 <button
                   onClick={() => testConnection(idx)}
                   disabled={api.status === 'checking'}
                   className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                     api.status === 'success'
                       ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                       : api.status === 'error'
                       ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                       : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                   }`}
                 >
                   {api.status === 'checking' ? '连接中...' : api.status === 'success' ? '连接正常' : api.status === 'error' ? '连接失败' : '测试连接'}
                 </button>
               </div>
             ))}

             <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1 mt-2">
               + 添加新的 API 服务
             </button>
           </div>
        </section>

        {/* Preferences */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
           <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-lg">
             <Settings size={20} className="text-indigo-500" />
             偏好设置
           </h3>
           <div className="space-y-5">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-orange-100 text-orange-500'}`}>
                    {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                  </div>
                  <div>
                    <span className="text-slate-900 dark:text-white font-medium block">界面外观</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">切换深色/浅色模式</span>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 relative ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  aria-label="Toggle Dark Mode"
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`}></div>
                </button>
             </div>

             <hr className="border-slate-100 dark:border-slate-700" />

             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                    <Globe size={20} />
                  </div>
                  <div>
                    <span className="text-slate-900 dark:text-white font-medium block">界面语言</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">选择应用显示语言</span>
                  </div>
                </div>
                <select className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-1.5 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option>简体中文</option>
                  <option>English</option>
                  <option>日本語</option>
                </select>
             </div>
           </div>
        </section>

        {/* Cache */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
           <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-lg">
             <Cpu size={20} className="text-indigo-500" />
             存储管理
           </h3>
           <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
             <div>
               <p className="text-slate-700 dark:text-slate-200 font-medium">本地缓存数据</p>
               <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">已使用 124MB (包含演讲音频和文本)</p>
             </div>
             <button className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
               <Trash2 size={16} /> 清除缓存
             </button>
           </div>
        </section>
      </div>
    </div>
  )
}

export default SettingsPage