import { Outlet } from 'react-router-dom'
import { Home, FileText, BookOpen, Info, Heart } from 'lucide-react'
import Logo from './logo'
import NavLink from './ui/NavLink'

function Layout() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* 页头：导航栏 */}
      <header className="bg-white shadow-sm border-b">
        <nav className="max-w-7xl mx-auto px-4" aria-label="主导航">
          <div className="flex items-center justify-between h-16">
            {/* Logo 和标题 */}
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Shadow Writing Agent
              </h1>
            </div>
            
            {/* 导航链接列表 */}
            <ul className="flex space-x-2 list-none m-0">
              <li>
                <NavLink to="/" icon={Home} aria-label="首页">
                  首页
                </NavLink>
              </li>
              <li>
                <NavLink to="/process" icon={FileText} aria-label="文件上传">
                  开始处理
                </NavLink>
              </li>
              <li>
                <NavLink to="/docs" icon={BookOpen} aria-label="更新记录">
                  更新记录
                </NavLink>
              </li>
              <li>
                <NavLink to="/faq" icon={Info} aria-label="常见问题">
                  常见问题
                </NavLink>
              </li>
              <li>
                <NavLink to="/support" icon={Heart} aria-label="支持我们">
                  支持我们
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
      </header>
      
      {/* 主内容区 */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
      
      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>&copy; 2025 Shadow Writing Agent. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout