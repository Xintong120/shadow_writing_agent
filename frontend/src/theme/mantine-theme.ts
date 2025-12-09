import { createTheme } from '@mantine/core';
import type { MantineTheme } from '@mantine/core';
import type { CSSProperties } from 'react';

// 定义CSS textTransform类型
type TextTransform = 
  | 'none'
  | 'capitalize'
  | 'uppercase'
  | 'lowercase'
  | 'full-width'
  | 'full-size-kana';

// ========================================
// 主题配置
// ========================================

/**
 * Mantine主题配置 - 基础主题设置
 * 避免与TailwindCSS冲突，提供完整的颜色、间距、圆角等设计令牌
 */
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
    sm: '0 2px 4px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.12)',
    md: '0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.18)',
    xl: '0 12px 24px rgba(0, 0, 0, 0.18), 0 6px 12px rgba(0, 0, 0, 0.20)',
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
        shadow: 'md', // 使用更小的阴影避免过重效果
        padding: 'sm',
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

// ========================================
// 类型定义
// ========================================

/**
 * 语义化颜色接口
 */
export interface SemanticColors {
  /** 主背景色 */
  background: string;
  /** 表面色（卡片背景等） */
  surface: string;
  /** 表面悬停色 */
  surfaceHover: string;
  /** 边框色 */
  border: string;
  /** 边框悬停色 */
  borderHover: string;
  /** 边框聚焦色 */
  borderFocus: string;
  /** 主文字色 */
  text: string;
  /** 次要文字色 */
  textSecondary: string;
  /** 弱化文字色 */
  textMuted: string;
  /** 禁用文字色 */
  textDisabled: string;
  /** 主色 */
  primary: string;
  /** 主色悬停 */
  primaryHover: string;
  /** 成功色 */
  success: string;
  /** 警告色 */
  warning: string;
  /** 错误色 */
  error: string;
  /** 信息色 */
  info: string;
}

/**
 * 间距令牌接口
 */
export interface SpacingTokens {
  /** 无间距 */
  none: number;
  /** 小间距 */
  xs: string;
  /** 标准间距 */
  sm: string;
  /** 中等间距 */
  md: string;
  /** 大间距 */
  lg: string;
  /** 超大间距 */
  xl: string;
  /** 超大间距（2倍） */
  '2xl': string;
  /** 卡片内边距 */
  card: string;
  /** 区块间距 */
  section: string;
  /** 页面边距 */
  page: string;
}

/**
 * 响应式令牌接口
 */
export interface ResponsiveTokens {
  /** 仅移动端显示 */
  mobileOnly: Record<string, CSSProperties>;
  /** 仅平板显示 */
  tabletOnly: Record<string, CSSProperties>;
  /** 仅桌面显示 */
  desktopOnly: Record<string, CSSProperties>;
  /** 移动端垂直排列 */
  stackOnMobile: Record<string, CSSProperties>;
}

/**
 * 字体排版样式接口
 */
export interface TypographyStyle {
  /** 字体大小 */
  fontSize: string;
  /** 行高 */
  lineHeight: string | number;
  /** 字重 */
  fontWeight: number;
  /** 文本转换 */
  textTransform?: TextTransform;
  /** 字符间距 */
  letterSpacing?: string;
}

/**
 * 字体排版令牌接口
 */
export interface TypographyTokens {
  /** 一级标题 */
  h1: TypographyStyle;
  /** 二级标题 */
  h2: TypographyStyle;
  /** 三级标题 */
  h3: TypographyStyle;
  /** 正文 */
  body: TypographyStyle;
  /** 文字说明 */
  caption: TypographyStyle;
  /** 按钮文字 */
  button: TypographyStyle;
}

/**
 * 圆角令牌接口
 */
export interface BorderRadiusTokens {
  /** 超小圆角 */
  xs: string | number;
  /** 小圆角 */
  sm: string | number;
  /** 中等圆角 */
  md: string | number;
  /** 大圆角 */
  lg: string | number;
  /** 超大圆角 */
  xl: string | number;
  /** 按钮圆角 */
  button: string | number;
  /** 输入框圆角 */
  input: string | number;
  /** 卡片圆角 */
  card: string | number;
  /** 模态框圆角 */
  modal: string | number;
  /** 胶囊圆角 */
  pill: string;
  /** 圆形 */
  circle: string;
}

/**
 * 阴影令牌接口
 */
export interface ShadowTokens {
  /** 超小阴影 */
  xs: string;
  /** 小阴影 */
  sm: string;
  /** 中等阴影 */
  md: string;
  /** 大阴影 */
  lg: string;
  /** 超大阴影 */
  xl: string;
  /** 卡片阴影 */
  card: string;
  /** 模态框阴影 */
  modal: string;
  /** 下拉框阴影 */
  dropdown: string;
  /** 悬停阴影 */
  hover: string;
  /** 激活阴影 */
  active: string;
  /** 聚焦阴影 */
  focus: string;
}

// ========================================
// 工具函数
// ========================================

/**
 * 获取语义化颜色工具函数
 * @param theme Mantine主题对象
 * @returns 语义化颜色对象
 */
export const getSemanticColors = (theme: MantineTheme): SemanticColors => ({
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

/**
 * 获取间距令牌工具函数
 * @param theme Mantine主题对象
 * @returns 间距令牌对象
 */
export const getSpacing = (theme: MantineTheme): SpacingTokens => ({
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

/**
 * 获取响应式属性工具函数
 * @param theme Mantine主题对象
 * @returns 响应式令牌对象
 */
export const getResponsiveProps = (theme: MantineTheme): ResponsiveTokens => ({
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

/**
 * 获取字体排版工具函数
 * @param theme Mantine主题对象
 * @returns 字体排版令牌对象
 */
export const getTypography = (theme: MantineTheme): TypographyTokens => ({
  // 标题层级
  h1: {
    fontSize: theme.fontSizes.xl,
    lineHeight: theme.lineHeights.xl,
    fontWeight: 700,
  },
  h2: {
    fontSize: theme.fontSizes.lg,
    lineHeight: theme.lineHeights.lg,
    fontWeight: 600,
  },
  h3: {
    fontSize: theme.fontSizes.md,
    lineHeight: theme.lineHeights.md,
    fontWeight: 600,
  },
  // 正文层级
  body: {
    fontSize: theme.fontSizes.md,
    lineHeight: theme.lineHeights.md,
    fontWeight: 400,
  },
  caption: {
    fontSize: theme.fontSizes.sm,
    lineHeight: theme.lineHeights.sm,
    fontWeight: 400,
  },
  // 特殊用途
  button: {
    fontSize: theme.fontSizes.md,
    lineHeight: theme.lineHeights.md,
    fontWeight: 500,
    textTransform: 'uppercase' as TextTransform,
    letterSpacing: '0.5px',
  },
});

/**
 * 获取圆角工具函数
 * @param theme Mantine主题对象
 * @returns 圆角令牌对象
 */
export const getBorderRadius = (theme: MantineTheme): BorderRadiusTokens => ({
  // 标准圆角
  xs: theme.radius.xs,
  sm: theme.radius.sm,
  md: theme.radius.md,
  lg: theme.radius.lg,
  xl: theme.radius.xl,
  // 语义化圆角
  button: theme.radius.sm,
  input: theme.radius.sm,
  card: theme.radius.md,
  modal: theme.radius.lg,
  // 特殊圆角
  pill: '9999px',
  circle: '50%',
});

/**
 * 获取阴影工具函数
 * @param theme Mantine主题对象
 * @returns 阴影令牌对象
 */
export const getShadows = (theme: MantineTheme): ShadowTokens => ({
  // 主题阴影
  ...theme.shadows,
  // 语义化阴影
  card: theme.shadows.sm,
  modal: theme.shadows.lg,
  dropdown: theme.shadows.md,
  // 自定义阴影（硬编码，符合策略）
  hover: '0 4px 12px rgba(0,0,0,0.15)',
  active: '0 2px 8px rgba(0,0,0,0.1)',
  focus: '0 0 0 2px rgba(59, 130, 246, 0.5)',
});