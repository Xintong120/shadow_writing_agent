import { createTheme } from '@mantine/core';

// 创建一个简单的主题，避免与TailwindCSS冲突
export const theme = createTheme({
  // 基本颜色配置
  colors: {
    base: [
      '#ffffffff', '#efefefff', '#dee2e6', '#ced4da', '#adb5bd',
      '#6c757d', '#495057', '#343a40', '#212529', '#121416'
    ],
    primary: [
      '#e7f0ff', '#d1e0ff', '#a3c2ff', '#74a3ff', '#4685ff',
      '#1d6aff', '#0052cc', '#003d99', '#002966', '#001a33'
    ],
    secondary: [
      '#e0f7fa', '#b2ebf2', '#80deee', '#4dd0e1', '#26c6da',
      '#00bcd4', '#00acc1', '#0097a7', '#00838f', '#006064'
    ],
    // 添加语义色
    success: [
      '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80',
      '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'
    ],
    warning: [
      '#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24',
      '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'
    ],
    error: [
      '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171',
      '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'
    ],
    info: [
      '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa',
      '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'
    ]
  },

  // 字体大小
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },

  // 间距 - 标准化间距系统
  spacing: {
    xs: '0.5rem',    // 8px - 小元素间距
    sm: '0.75rem',   // 12px - 组件内间距
    md: '1rem',      // 16px - 标准间距
    lg: '1.5rem',    // 24px - 大间距
    xl: '2rem',      // 32px - 页面级间距
    '2xl': '3rem',   // 48px - 超大间距
  },

  // 圆角
  radius: {
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '2rem',
  },

  // 阴影
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 15px -5px, 0 7px 7px -5px',
    md: '0 1px 3px rgba(0, 0, 0, 0.05), 0 20px 25px -5px, 0 10px 10px -5px',
    lg: '0 1px 3px rgba(0, 0, 0, 0.05), 0 28px 23px -7px, 0 12px 12px -7px',
    xl: '0 1px 3px rgba(0, 0, 0, 0.05), 0 36px 28px -7px, 0 17px 17px -7px',
  },

  // 断点 - 优化为更合理的断点值
  breakpoints: {
    xs: '36em',    // 576px - 移动端
    sm: '48em',    // 768px - 平板
    md: '62em',    // 992px - 小屏桌面
    lg: '75em',    // 1200px - 大屏桌面
    xl: '88em',    // 1408px - 超大屏
  },

  // 添加行高系统
  lineHeights: {
    xs: '1.2',
    sm: '1.4',
    md: '1.6',
    lg: '1.8',
    xl: '2.0',
  },

  // 添加字重映射 (移除，因为Mantine主题不支持此属性)
  // fontWeights: {
  //   thin: 100,
  //   light: 300,
  //   normal: 400,
  //   medium: 500,
  //   semibold: 600,
  //   bold: 700,
  //   extrabold: 800,
  //   black: 900,
  // },

  // 添加z-index层级 (移除，因为Mantine主题不支持此属性)
  // zIndices: {
  //   hide: -1,
  //   auto: 'auto',
  //   base: 0,
  //   docked: 10,
  //   dropdown: 1000,
  //   sticky: 1100,
  //   banner: 1200,
  //   overlay: 1300,
  //   modal: 1400,
  //   popover: 1500,
  //   skipLink: 1600,
  //   toast: 1700,
  //   tooltip: 1800,
  // },

  // 添加动画时长 (移除，因为Mantine主题不支持此属性)
  // transitionDurations: {
  //   fast: '150ms',
  //   normal: '200ms',
  //   slow: '300ms',
  // },

  // 组件样式
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      }
    },
    Card: {
      defaultProps: {
        radius: 'md',
        withBorder: true,
        shadow: 'sm',
        padding: 'md',
      },
    },
    Notification: {
      defaultProps: {
        radius: 'sm',
      },
      styles: {
        root: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }
      }
    },
    // 添加更多组件默认值
    Text: {
      defaultProps: {
        style: {
          lineHeight: 1.6,
        }
      }
    },
    Box: {
      defaultProps: {
        style: {
          transition: 'all 200ms ease',
        }
      }
    }
  }
});

// 导入MantineTheme类型
import type { MantineTheme } from '@mantine/core';

// 语义色工具函数
export const getSemanticColors = (theme: MantineTheme) => ({
  // 背景色
  background: theme.colors.base[0],
  surface: theme.colors.base[1],
  surfaceHover: theme.colors.base[2],

  // 边框色
  border: theme.colors.base[2],
  borderHover: theme.colors.base[3],
  borderFocus: theme.colors.primary[6],

  // 文字色
  text: theme.colors.base[8],
  textSecondary: theme.colors.base[7],
  textMuted: theme.colors.base[5],
  textDisabled: theme.colors.base[4],

  // 语义色
  primary: theme.colors.primary[6],
  primaryHover: theme.colors.primary[7],
  success: theme.colors.success[6],
  warning: theme.colors.warning[6],
  error: theme.colors.error[6],
  info: theme.colors.info[6],
});

// 间距工具函数
export const getSpacing = (theme: MantineTheme) => ({
  // 常用间距组合
  none: 0,
  xs: theme.spacing.xs,      // 8px - 小元素
  sm: theme.spacing.sm,      // 12px - 组件内
  md: theme.spacing.md,      // 16px - 标准间距
  lg: theme.spacing.lg,      // 24px - 大间距
  xl: theme.spacing.xl,      // 32px - 页面级
  '2xl': theme.spacing['2xl'], // 48px - 超大间距

  // 特定用途
  card: theme.spacing.lg,    // 卡片内边距
  section: theme.spacing.xl, // 区块间距
  page: theme.spacing['2xl'], // 页面边距
});

// 响应式工具函数
export const getResponsiveProps = (theme: MantineTheme) => ({
  // 响应式显示 - 使用媒体查询字符串
  mobileOnly: {
    '@media (max-width: 767px)': { display: 'block' },
    '@media (min-width: 768px)': { display: 'none' },
  },
  tabletOnly: {
    '@media (min-width: 768px) and (max-width: 991px)': { display: 'block' },
    '@media (max-width: 767px)': { display: 'none' },
    '@media (min-width: 992px)': { display: 'none' },
  },
  desktopOnly: {
    '@media (min-width: 992px)': { display: 'block' },
    '@media (max-width: 991px)': { display: 'none' },
  },

  // 响应式布局
  stackOnMobile: {
    '@media (max-width: 991px)': {
      flexDirection: 'column',
      gap: theme.spacing.sm,
    },
    '@media (min-width: 992px)': {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
  },
});