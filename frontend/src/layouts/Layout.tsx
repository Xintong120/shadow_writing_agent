import { cn } from '@/lib/utils'
import { Outlet } from 'react-router-dom'

/**
 * Layout - 应用主布局组件
 * 提供基本的页面布局结构
 */
export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout