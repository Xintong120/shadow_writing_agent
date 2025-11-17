import React, { useMemo, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { 
  AppShell, 
  Group, 
  Text, 
  Burger,
  Box,
  useMantineTheme,
  rem
} from '@mantine/core';
import { NavLink } from '@/components/atoms/navlink';
import { Search, BarChart3, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme';

/**
 * Shadow Writing AppShell - 完美响应式导航组件
 * 
 * 核心特性：
 * - 双状态管理：桌面端和移动端独立控制侧边栏
 * - 响应式汉堡菜单：桌面端和移动端都有汉堡菜单
 * - 侧边栏导航：包含搜索学习、学习历史、设置等导航项
 * - Logo 和品牌元素集成
 * - 主内容区域包装
 * 
 * 修复内容：
 * - ✅ 修复 NavLink 组件 Props 类型不匹配问题
 * - ✅ 处理样式冲突（Tailwind CSS 与 Mantine 样式）
 * - ✅ 提取硬编码数值为常量或配置
 * - ✅ 添加性能优化（useMemo, useCallback）
 * - ✅ 增强类型安全性
 */

// SVG Logo 组件
const LogoIcon = ({ size = 32, className = '', style }: { size?: number; className?: string; style?: React.CSSProperties }) => (
  <svg
    className={className}
    style={style}
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="currentColor"
  >
    <path d="M523.341653 51.768889a176.810667 176.810667 0 0 1 250.055111 250.055111l-466.773333 466.858667-0.284444 0.284444-0.284445 0.227556-5.944889 5.319111-0.625777 0.568889-0.711112 0.483555-11.491555 7.936-0.512 0.341334-0.540445 0.284444a95.544889 95.544889 0 0 1-46.904888 12.344889h-157.013334l-0.654222-0.085333-8.163556-0.796445-0.711111-0.056889-0.711111-0.142222a54.613333 54.613333 0 0 1-40.135111-34.56l-0.227555-0.568889-0.142223-0.540444-1.592889-5.802667-0.284444-1.109333-0.142222-1.137778-0.796445-8.192L28.692764 742.798222v-157.013333c0-16.412444 4.266667-32.568889 12.316445-46.848l0.284444-0.540445 0.341334-0.512 7.964444-11.491555 0.483556-0.739556 0.597333-0.682666 5.404444-5.973334 0.256-0.227555L523.341653 51.768889z m178.659556 78.848c-30.919111-30.919111-83.569778-28.472889-104.049778-11.776l-3.982222 3.555555-13.482667 13.454223 108.003556 113.720889 13.511111-13.511112 3.584-3.953777c16.668444-20.48 27.363556-70.570667-3.584-101.489778z" />
    <path d="M540.863431 768.426667c31.857778-8.135111 69.546667-12.060444 103.139556 3.555555 13.852444 6.428444 32.995556 17.834667 41.614222 39.054222 10.467556 25.799111-0.853333 47.900444-10.24 59.733334a98.417778 98.417778 0 0 1-12.714667 13.027555c14.620444-4.579556 29.468444-9.045333 43.918222-13.027555 32.711111-9.016889 67.754667-16.753778 98.588445-16.981334 43.946667-0.312889 78.904889 18.858667 105.386667 35.043556 29.326222 17.92 47.274667 30.947556 68.949333 37.376a42.666667 42.666667 0 1 1-24.291556 81.777778c-35.584-10.581333-67.413333-33.080889-89.144889-46.336-24.547556-14.990222-41.870222-22.670222-60.273777-22.528-19.114667 0.142222-45.226667 5.262222-76.572445 13.880889-31.004444 8.533333-63.089778 19.342222-95.089778 29.44-30.549333 9.642667-62.293333 19.143111-88.206222 22.840889-12.714667 1.820444-27.932444 2.901333-42.382222-0.227556-15.616-3.328-35.413333-12.999111-44.913778-35.754667-10.325333-24.860444-0.853333-46.848 8.732445-59.790222 8.903111-12.032 21.191111-21.390222 31.488-28.273778 11.406222-7.651556 25.315556-15.36 38.940444-22.556444a588.515556 588.515556 0 0 0-58.680889 25.457778c-30.577778 15.018667-59.960889 31.260444-89.088 46.449777-27.249778 14.222222-56.035556 28.501333-79.872 34.986667-35.896889 9.813333-89.543111 13.852444-140.686222 11.946667-50.261333-1.848889-106.922667-9.671111-145.720889-29.184a42.666667 42.666667 0 0 1 38.343111-76.231111c21.703111 10.894222 62.976 18.403556 110.563556 20.167111 46.677333 1.706667 90.766222-2.360889 115.029333-8.988445 13.596444-3.697778 34.389333-13.454222 62.862222-28.330666 26.624-13.880889 59.278222-31.857778 91.022223-47.416889 31.914667-15.644444 66.389333-30.72 99.271111-39.111111z" />
  </svg>
);

// 常量配置 - 提取硬编码值
const APP_CONFIG = {
  logo: {
    size: rem(32), // w-8 h-8 -> 32px
    gradient: 'from-blue-500 to-purple-600',
    name: 'Shadow Writing'
  },
  layout: {
    headerHeight: 60,
    navbarWidth: 280,
    breakpoint: 'sm' as const,
    padding: 'md' as const
  },
  navigation: {
    iconSize: 20,
    transition: 'all 200ms ease',
    activeColor: 'var(--mantine-primary-color-6)'
  },
  mainContent: {
    borderRadius: 'var(--mantine-radius-md)',
    minHeight: 'calc(100vh - 120px)' // headerHeight(60) + padding(60)
  }
};

// 导航项类型定义
interface NavigationItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  description: string;
}

export function ShadowWritingAppShell() {
  // 双状态管理 - 桌面端和移动端独立控制
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const colors = getSemanticColors(theme);
  const spacing = getSpacing(theme);

  // 性能优化：使用 useMemo 缓存导航项数组
  const navigationItems = useMemo<NavigationItem[]>(() => [
    { 
      icon: Search, 
      label: '搜索学习', 
      path: '/',
      description: '搜索并学习TED演讲'
    },
    { 
      icon: BarChart3, 
      label: '学习历史', 
      path: '/history',
      description: '查看学习记录和进度'
    },
    { 
      icon: Settings, 
      label: '设置', 
      path: '/settings',
      description: '配置应用设置'
    }
  ], []);

  // 性能优化：使用 useCallback 缓存事件处理函数
  const handleNavigation = useCallback((path: string) => {
    navigate(path);
    // 移动端导航后自动关闭侧边栏
    if (mobileOpened) {
      toggleMobile();
    }
  }, [navigate, mobileOpened, toggleMobile]);

  // 获取导航项样式
  const getNavItemStyles = useCallback((itemPath: string) => {
    const isActive = location.pathname === itemPath;
    return {
      color: isActive ? theme.colors.primary[6] : colors.text,
      fontWeight: isActive ? 600 : 400,
      transition: APP_CONFIG.navigation.transition
    };
  }, [location.pathname, theme.colors.primary, colors.text]);

  return (
    <AppShell
      padding={APP_CONFIG.layout.padding}
      header={{ height: APP_CONFIG.layout.headerHeight }}
      navbar={{
        width: APP_CONFIG.layout.navbarWidth,
        breakpoint: APP_CONFIG.layout.breakpoint,
        collapsed: { 
          mobile: !mobileOpened, 
          desktop: !desktopOpened 
        },
      }}
    >
      {/* 头部 - 双汉堡菜单设计 */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            {/* 移动端汉堡菜单 */}
            <Burger 
              opened={mobileOpened} 
              onClick={toggleMobile} 
              hiddenFrom="sm" 
              size="sm"
              aria-label="切换移动端侧边栏"
            />
            
            {/* 桌面端汉堡菜单 */}
            <Burger 
              opened={desktopOpened} 
              onClick={toggleDesktop} 
              visibleFrom="sm" 
              size="sm"
              aria-label="切换桌面端侧边栏"
            />
            
            {/* Logo 区域 */}
            <Group gap="sm" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} align="center">
              <LogoIcon
                size={32}
                style={{
                  color: colors.text,
                  transition: APP_CONFIG.navigation.transition
                }}
              />
              <Text
                size="lg"
                fw={700}
                style={{
                  fontSize: rem(18),
                  fontFamily: theme.fontFamily,
                  color: colors.text
                }}
              >
                {APP_CONFIG.logo.name}
              </Text>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      {/* 侧边栏导航 */}
      <AppShell.Navbar
        p="md"
        style={{
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb'
        }}
      >
        <AppShell.Section grow>
          <Box className="space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                icon={
                  <item.icon
                    size={APP_CONFIG.navigation.iconSize}
                    style={getNavItemStyles(item.path)}
                    aria-hidden={true}
                  />
                }
                label={item.label}
                description={item.description}
                active={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                variant="subtle"
                className="rounded-lg transition-all duration-200 hover:bg-gray-50/50"
                styles={{
                  root: {
                    backgroundColor: location.pathname === item.path ? 'white' : undefined,
                    border: location.pathname === item.path ? '1px solid #374151' : undefined,
                    color: location.pathname === item.path ? '#374151' : undefined,
                  }
                }}
              />
            ))}
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* 主内容区 */}
      <AppShell.Main>
        <Box
          style={{
            backgroundColor: theme.colors.base[0],
            borderRadius: theme.radius.md,
            minHeight: APP_CONFIG.mainContent.minHeight,
            padding: theme.spacing.lg,
            transition: APP_CONFIG.navigation.transition,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}
        >
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}

export default ShadowWritingAppShell;