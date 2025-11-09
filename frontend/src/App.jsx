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
  const ButtonTest = await import('@/dev/ButtonRefactorTest');
  const CardTest = await import('@/dev/CardRefactorTest');
  const InputTest = await import('@/dev/InputRefactorTest');
  const AvatarTest = await import('@/dev/AvatarRefactorTest');
  const BadgeTest = await import('@/dev/BadgeRefactorTest');
  const CheckboxTest = await import('@/dev/CheckboxTest');
 

  devRoutes = (
    <>
      <Route path="/dev/button-test" element={<ButtonTest.default />} />
      <Route path="/dev/card-test" element={<CardTest.default />}  />
      <Route path="/dev/input-test" element={<InputTest.default />} />
      <Route path="/dev/avatar-test" element={<AvatarTest.default />} />
      <Route path="/dev/badge-test" element={<BadgeTest.default />} />
      <Route path="/dev/checkbox-test" element={<CheckboxTest.default />} />
    </>
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