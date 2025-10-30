// 布局管理系统
// 统一管理页面布局、容器、网格系统和响应式规则

export const layout = {
  // 容器系统 - 定义页面容器的最大宽度
  containers: {
    // 响应式断点对应的最大宽度
    breakpoints: {
      sm: '640px',      // 小屏幕
      md: '768px',      // 中等屏幕
      lg: '1024px',     // 大屏幕
      xl: '1280px',     // 超大屏幕
      '2xl': '1536px',  // 极大屏幕
    },

    // 内容宽度规范 (Tailwind max-width classes)
    content: {
      narrow: 'max-w-2xl',    // 文章页面，约672px
      standard: 'max-w-4xl',  // 标准页面，约896px
      wide: 'max-w-6xl',      // 宽页面，约1152px
      full: 'max-w-full',     // 全宽页面
    },
  },

  // 间距系统 - 定义页面和组件的标准间距
  spacing: {
    // 页面级间距
    page: {
      padding: 'p-lg lg:p-xl',           // 页面内边距: 16px / 24px
      margin: 'mx-auto',                 // 页面居中
      gap: 'space-y-xl lg:space-y-2xl',  // 页面区块间距: 24px / 32px
    },

    // 组件级间距
    component: {
      section: 'mb-xl lg:mb-2xl',        // 区块间距: 24px / 32px
      element: 'mb-lg',                  // 元素间距: 16px
      group: 'gap-md lg:gap-lg',         // 组件组间距: 12px / 16px
    },
  },

  // 网格系统 - 12列响应式网格
  grid: {
    // 网格容器
    container: 'grid grid-cols-12 gap-md lg:gap-lg',

    // 网格项 (span classes)
    spans: {
      1: 'col-span-1',     // 1/12
      2: 'col-span-2',     // 2/12
      3: 'col-span-3',     // 3/12
      4: 'col-span-4',     // 4/12
      5: 'col-span-5',     // 5/12
      6: 'col-span-6',     // 6/12 (半宽)
      7: 'col-span-7',     // 7/12
      8: 'col-span-8',     // 8/12
      9: 'col-span-9',     // 9/12
      10: 'col-span-10',   // 10/12
      11: 'col-span-11',   // 11/12
      12: 'col-span-12',   // 12/12 (全宽)
    },

    // 响应式网格断点
    responsive: {
      sm: {
        6: 'col-span-12 sm:col-span-6',    // 移动端全宽，sm以上半宽
        4: 'col-span-12 sm:col-span-4',    // 移动端全宽，sm以上1/3宽
        8: 'col-span-12 sm:col-span-8',    // 移动端全宽，sm以上2/3宽
      },
      md: {
        6: 'col-span-12 md:col-span-6',    // 中等屏幕以上半宽
        4: 'col-span-12 md:col-span-4',    // 中等屏幕以上1/3宽
        8: 'col-span-12 md:col-span-8',    // 中等屏幕以上2/3宽
      },
      lg: {
        6: 'col-span-12 lg:col-span-6',    // 大屏幕以上半宽
        4: 'col-span-12 lg:col-span-4',    // 大屏幕以上1/3宽
        8: 'col-span-12 lg:col-span-8',    // 大屏幕以上2/3宽
      },
    },
  },

  // 布局模式 - 常见页面布局模板
  patterns: {
    // 侧边栏布局
    sidebar: {
      container: 'flex h-screen bg-background',
      sidebar: 'w-20 flex-shrink-0 bg-card border-r border-border',
      main: 'flex-1 flex flex-col min-w-0 overflow-hidden',
      content: 'flex-1 overflow-auto p-lg lg:p-xl focus:outline-none',
    },

    // 单列布局 (标准页面)
    single: {
      container: 'container mx-auto px-lg lg:px-xl py-xl',
      content: 'max-w-4xl mx-auto',
    },

    // 双列布局 (侧边栏内容)
    dual: {
      container: 'container mx-auto px-lg lg:px-xl py-xl',
      content: 'max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-xl',
      main: 'lg:col-span-3',
      sidebar: 'lg:col-span-1',
    },

    // 卡片网格布局
    cards: {
      container: 'container mx-auto px-lg lg:px-xl py-xl',
      grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md lg:gap-lg',
    },
  },

  // 导航和头部
  navigation: {
    // 主导航
    main: {
      container: 'flex flex-col gap-md lg:gap-lg',
      link: 'flex flex-col items-center gap-xs p-md rounded-lg transition-colors',
      active: 'bg-primary/10 text-primary',
      inactive: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
    },

    // 面包屑导航
    breadcrumb: {
      container: 'flex items-center gap-sm text-sm text-muted-foreground',
      separator: 'mx-sm',
    },
  },

  // 页脚和底部
  footer: {
    container: 'border-t border-border mt-auto',
    content: 'px-lg lg:px-xl py-lg',
  },
};

// 导出常用布局组合
export const pageLayouts = layout.patterns;
export const gridSystem = layout.grid;
export const spacing = layout.spacing;

// 辅助函数：获取响应式类名
export const getResponsiveClass = (baseClass, responsiveMap) => {
  const classes = [baseClass];
  Object.entries(responsiveMap).forEach(([breakpoint, className]) => {
    if (className) classes.push(className);
  });
  return classes.join(' ');
};

// 辅助函数：创建网格布局
export const createGridLayout = (columns = 12, gap = 'gap-md lg:gap-lg') => {
  return `grid grid-cols-${columns} ${gap}`;
};

// 辅助函数：创建容器布局
export const createContainer = (maxWidth = 'max-w-4xl', padding = 'px-lg lg:px-xl') => {
  return `container ${maxWidth} mx-auto ${padding}`;
};