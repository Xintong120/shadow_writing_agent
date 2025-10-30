import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TaskProvider } from '@/contexts/TaskContext'
import { Toaster } from 'sonner'
import Layout from '@/layouts/Layout'
import SearchPage from '@/pages/SearchPage'
import BatchProcessPage from '@/pages/BatchProcessPage'
import ResultsPage from '@/pages/ResultsPage'
import HistoryPage from '@/pages/HistoryPage'
import SettingsPage from '@/pages/SettingsPage'

// Development test routes (only in development)
let devRoutes = null;
if (import.meta.env.DEV) {
  const MantineButtonTest = await import('@/dev/MantineButtonTest');
  devRoutes = (
    <Route path="/dev/button-test" element={<MantineButtonTest.default />} />
  );
}

function App() {
  return (
    <BrowserRouter>
      <TaskProvider>
        {/* Layout包裹所有页面 */}
        <Routes>
          {/* Development test routes (only in development) */}
          {devRoutes}

          <Route path="/" element={<Layout />}>
            {/* 主页：SearchPage */}
            <Route index element={<SearchPage />} />

            {/* 批量处理流程（不在侧边栏显示，程序自动跳转） */}
            <Route path="batch/:taskId" element={<BatchProcessPage />} />
            <Route path="results/:taskId" element={<ResultsPage />} />

            {/* 工具页面（侧边栏导航） */}
            <Route path="history" element={<HistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
        
        {/* 全局Toast通知 */}
        <Toaster position="top-right" />
      </TaskProvider>
    </BrowserRouter>
  )
}

export default App