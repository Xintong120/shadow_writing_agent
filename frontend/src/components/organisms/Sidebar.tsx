import { NavLink } from 'react-router-dom'
import { Search, BarChart3, Settings, Headphones, Mic, PenTool } from 'lucide-react'

const mainNav = [
  { icon: Search, label: '搜索TED', path: '/', enabled: true },
  { icon: BarChart3, label: '学习历史', path: '/history', enabled: true },
  { icon: Settings, label: '设置', path: '/settings', enabled: true },
]

const upcomingFeatures = [
  { icon: Headphones, label: 'Listening', badge: 'Soon' },
  { icon: Mic, label: 'Speaking', badge: 'Soon' },
  { icon: PenTool, label: 'Writing', badge: 'Soon' },
]

function Sidebar() {
  return (
    <aside
      className="
        w-20
        shrink-0
        bg-card
        border-r
        border-border
        flex
        flex-col
        items-center
        py-md
      "
      aria-label="侧边栏导航"
      role="navigation"
    >
      {/* Logo */}
      <header
        className="mb-xl lg:mb-2xl"
        role="banner"
        aria-label="应用Logo"
      >
        <div className="text-2xl" role="img" aria-label="读书图标">📚</div>
      </header>

      {/* 主导航 */}
      <nav
        className="flex-1 flex flex-col gap-md lg:gap-lg"
        aria-label="主功能导航"
      >
        {mainNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`
            }
            aria-current={location.pathname === item.path ? 'page' : undefined}
            aria-label={`${item.label}${location.pathname === item.path ? ' (当前页面)' : ''}`}
          >
            <item.icon
              className="h-5 w-5 lg:h-6 lg:w-6"
              aria-hidden="true"
            />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* 分割线 - 装饰性，无需语义 */}
      <div
        className="w-12 h-px bg-border my-md lg:my-lg"
        role="separator"
        aria-hidden="true"
      />

      {/* 即将推出的功能 */}
      <section
        className="flex flex-col gap-md lg:gap-lg opacity-40"
        aria-label="即将推出的功能"
      >
        {upcomingFeatures.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-1 p-2"
            role="listitem"
            aria-label={`${item.label}功能即将推出`}
          >
            <item.icon
              className="h-5 w-5 lg:h-6 lg:w-6"
              aria-hidden="true"
            />
            <span
              className="text-xs"
              aria-label="即将推出"
            >
              {item.badge}
            </span>
          </div>
        ))}
      </section>
    </aside>
  )
}

export default Sidebar