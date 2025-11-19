import { NavLink, useLocation } from 'react-router-dom';
import { Search, BarChart3, Settings, Headphones, Mic, PenTool } from 'lucide-react';
import { useMantineTheme } from '@mantine/core';
import { getSemanticColors, getSpacing, getResponsiveProps } from '@/theme/mantine-theme';

const mainNav = [
  { icon: Search, label: '搜索TED', path: '/', enabled: true },
  { icon: BarChart3, label: '学习历史', path: '/history', enabled: true },
  { icon: Settings, label: '设置', path: '/settings', enabled: true },
];

const upcomingFeatures = [
  { icon: Headphones, label: 'Listening', badge: 'Soon' },
  { icon: Mic, label: 'Speaking', badge: 'Soon' },
  { icon: PenTool, label: 'Writing', badge: 'Soon' },
];

function Sidebar() {
  const theme = useMantineTheme();
  const colors = getSemanticColors(theme);
  const spacing = getSpacing(theme);
  const responsive = getResponsiveProps(theme);
  const location = useLocation();

  return (
    <aside
      style={{
        width: '5rem',
        flexShrink: 0,
        backgroundColor: colors.surface,
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
      }}
      aria-label="侧边栏导航"
      role="navigation"
    >
      {/* Logo */}
      <header
        style={{
          marginBottom: spacing.xl,
          ...responsive.desktopOnly.container,
        }}
        role="banner"
        aria-label="应用Logo"
      >
        <div
          style={{
            fontSize: theme.fontSizes.xl,
          }}
          role="img"
          aria-label="读书图标"
        >
          📚
        </div>
      </header>

      {/* 主导航 */}
      <nav
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.md,
        }}
        aria-label="主功能导航"
      >
        {mainNav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                padding: spacing.xs,
                borderRadius: theme.radius.md,
                transition: 'all 200ms ease',
                backgroundColor: isActive
                  ? `${colors.primary}1A`
                  : 'transparent',
                color: isActive ? colors.primary : colors.textMuted,
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = colors.surfaceHover;
                  e.currentTarget.style.color = colors.text;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.textMuted;
                }
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = `2px solid ${colors.primary}`;
                e.currentTarget.style.outlineOffset = '2px';
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none';
              }}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`${item.label}${isActive ? ' (当前页面)' : ''}`}
            >
              <item.icon
                style={{
                  height: '1.25rem',
                  width: '1.25rem',
                }}
                aria-hidden="true"
              />
              <span
                style={{
                  fontSize: theme.fontSizes.xs,
                }}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* 分割线 */}
      <div
        style={{
          width: '3rem',
          height: '1px',
          backgroundColor: colors.border,
          marginTop: spacing.md,
          marginBottom: spacing.md,
        }}
        role="separator"
        aria-hidden="true"
      />

      {/* 即将推出的功能 */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.md,
          opacity: 0.4,
        }}
        aria-label="即将推出的功能"
      >
        {upcomingFeatures.map((item) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              padding: spacing.xs,
            }}
            role="listitem"
            aria-label={`${item.label}功能即将推出`}
          >
            <item.icon
              style={{
                height: '1.25rem',
                width: '1.25rem',
              }}
              aria-hidden="true"
            />
            <span
              style={{
                fontSize: theme.fontSizes.xs,
              }}
              aria-label="即将推出"
            >
              {item.badge}
            </span>
          </div>
        ))}
      </section>
    </aside>
  );
}

export default Sidebar;
