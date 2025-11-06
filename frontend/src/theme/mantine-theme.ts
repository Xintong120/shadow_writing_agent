import { createTheme } from '@mantine/core';

// 创建一个简单的主题，避免与TailwindCSS冲突
export const theme = createTheme({
  // 基本颜色配置
  colors: {
    primary: [
      '#e7f0ff', '#d1e0ff', '#a3c2ff', '#74a3ff', '#4685ff',
      '#1d6aff', '#0052cc', '#003d99', '#002966', '#001a33'
    ],
    secondary: [
      '#e0f7fa', '#b2ebf2', '#80deee', '#4dd0e1', '#26c6da',
      '#00bcd4', '#00acc1', '#0097a7', '#00838f', '#006064'
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

  // 间距
  spacing: {
    xs: '0.625rem',
    sm: '0.75rem', 
    md: '1rem',
    lg: '1.25rem',
    xl: '2rem',
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

  // 断点
  breakpoints: {
    xs: '576px',
    sm: '768px',
    md: '992px',
    lg: '1200px',
    xl: '1408px',
  },

  // 组件样式
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      }
    }
  }
});