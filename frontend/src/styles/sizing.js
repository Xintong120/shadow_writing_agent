// 尺寸管理系统
// 统一管理所有组件的尺寸、间距、圆角等
// 集成Mantine设计系统，实现全局控制

// Inline rem function to avoid import issues in CSS processing
const rem = (value) => `${value / 16}rem`;

export const sizing = {
  // 全局缩放因子 (Mantine风格)
  scale: 1,
  // 字体大小系统 (Mantine集成)
  fontSizes: {
    xs: rem(12),  // 0.75rem
    sm: rem(14),  // 0.875rem
    md: rem(16),  // 1rem
    lg: rem(18),  // 1.125rem
    xl: rem(20),  // 1.25rem
  },

  // 行高系统 (Mantine集成)
  lineHeights: {
    xs: '1.4',
    sm: '1.45',
    md: '1.55',
    lg: '1.6',
    xl: '1.65',
  },

  // 间距系统 (Mantine优化)
  spacing: {
    xs: rem(10),  // 0.625rem (10px)
    sm: rem(12),  // 0.75rem (12px)
    md: rem(16),  // 1rem (16px)
    lg: rem(20),  // 1.25rem (20px)
    xl: rem(32),  // 2rem (32px)
  },

  // 圆角系统 (Mantine集成)
  radius: {
    xs: rem(2),   // 0.125rem (2px)
    sm: rem(4),   // 0.25rem (4px)
    md: rem(8),   // 0.5rem (8px)
    lg: rem(16),  // 1rem (16px)
    xl: rem(32),  // 2rem (32px)
  },

  // 阴影系统 (Mantine集成)
  shadows: {
    xs: `0 ${rem(1)} ${rem(3)} rgba(0, 0, 0, 0.05), 0 ${rem(1)} ${rem(2)} rgba(0, 0, 0, 0.1)`,
    sm: `0 ${rem(1)} ${rem(3)} rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 ${rem(10)} ${rem(15)} ${rem(-5)}, rgba(0, 0, 0, 0.04) 0 ${rem(7)} ${rem(7)} ${rem(-5)}`,
    md: `0 ${rem(1)} ${rem(3)} rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 ${rem(20)} ${rem(25)} ${rem(-5)}, rgba(0, 0, 0, 0.04) 0 ${rem(10)} ${rem(10)} ${rem(-5)}`,
    lg: `0 ${rem(1)} ${rem(3)} rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 ${rem(28)} ${rem(23)} ${rem(-7)}, rgba(0, 0, 0, 0.04) 0 ${rem(12)} ${rem(12)} ${rem(-7)}`,
    xl: `0 ${rem(1)} ${rem(3)} rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 ${rem(36)} ${rem(28)} ${rem(-7)}, rgba(0, 0, 0, 0.04) 0 ${rem(17)} ${rem(17)} ${rem(-7)}`,
  },

  // 标题尺寸 (Mantine集成)
  headings: {
    h1: { fontSize: rem(34), lineHeight: '1.3' },
    h2: { fontSize: rem(26), lineHeight: '1.35' },
    h3: { fontSize: rem(22), lineHeight: '1.4' },
    h4: { fontSize: rem(18), lineHeight: '1.45' },
    h5: { fontSize: rem(16), lineHeight: '1.5' },
    h6: { fontSize: rem(14), lineHeight: '1.5' },
  },

  // 基础尺寸单位 (保持兼容性)
  base: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },

  // 组件尺寸系统
  component: {
    // 按钮尺寸
    button: {
      sm: {
        height: '2rem',      // 32px
        padding: '0 0.75rem', // 12px
        fontSize: '0.875rem', // 14px
      },
      md: {
        height: '2.5rem',    // 40px
        padding: '0 1rem',    // 16px
        fontSize: '1rem',     // 16px
      },
      lg: {
        height: '3rem',      // 48px
        padding: '0 1.5rem',  // 24px
        fontSize: '1.125rem', // 18px
      },
    },

    // 输入框尺寸
    input: {
      sm: {
        height: '2.25rem',   // 36px
        padding: '0 0.75rem', // 12px
        fontSize: '0.875rem', // 14px
      },
      md: {
        height: '2.75rem',   // 44px
        padding: '0 1rem',    // 16px
        fontSize: '1rem',     // 16px
      },
      lg: {
        height: '3.25rem',   // 52px
        padding: '0 1.25rem', // 20px
        fontSize: '1.125rem', // 18px
      },
    },

    // 卡片尺寸
    card: {
      padding: {
        sm: '1rem',      // 16px
        md: '1.5rem',    // 24px
        lg: '2rem',      // 32px
      },
      gap: {
        sm: '0.75rem',   // 12px
        md: '1rem',      // 16px
        lg: '1.5rem',    // 24px
      },
    },

    // 头像尺寸
    avatar: {
      xs: '1.5rem',     // 24px
      sm: '2rem',       // 32px
      md: '2.5rem',     // 40px
      lg: '3rem',       // 48px
      xl: '4rem',       // 64px
    },
  },

  // 布局系统 (从layout.js迁移)
  layout: {
    // 容器系统
    containers: {
      breakpoints: {
        xs: '36em',   // 576px
        sm: '48em',   // 768px
        md: '62em',   // 992px
        lg: '75em',   // 1200px
        xl: '88em',   // 1408px
      },
      content: {
        narrow: 'max-w-2xl',    // 文章页面，约672px
        standard: 'max-w-4xl',  // 标准页面，约896px
        wide: 'max-w-6xl',      // 宽页面，约1152px
        full: 'max-w-full',     // 全宽页面
      },
    },

    // 页面和组件间距
    spacing: {
      page: {
        padding: 'p-lg lg:p-xl',           // 页面内边距: 20px / 32px
        margin: 'mx-auto',                 // 页面居中
        gap: 'space-y-xl lg:space-y-2xl',  // 页面区块间距: 32px / 40px
      },
      component: {
        section: 'mb-xl lg:mb-2xl',        // 区块间距: 32px / 40px
        element: 'mb-lg',                  // 元素间距: 20px
        group: 'gap-md lg:gap-lg',         // 组件组间距: 16px / 20px
      },
    },

    // 网格系统
    grid: {
      container: 'grid grid-cols-12 gap-md lg:gap-lg',
      spans: {
        1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3',
        4: 'col-span-4', 5: 'col-span-5', 6: 'col-span-6',
        7: 'col-span-7', 8: 'col-span-8', 9: 'col-span-9',
        10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12',
      },
    },

    // 旧版兼容
    sidebar: {
      width: '5rem',       // 80px
      widthExpanded: '16rem', // 256px
    },
    container: {
      maxWidth: '1200px',
      padding: '1rem',     // 16px
    },
    header: {
      height: '4rem',      // 64px
    },
  },

  // 响应式断点 (Mantine集成)
  breakpoints: {
    xs: '36em',   // 576px
    sm: '48em',   // 768px
    md: '62em',   // 992px
    lg: '75em',   // 1200px
    xl: '88em',   // 1408px
  },
};

// 导出常用的尺寸组合 (Mantine风格)
export const spacing = sizing.spacing;
export const radius = sizing.radius;
export const shadows = sizing.shadows;
export const fontSizes = sizing.fontSizes;
export const lineHeights = sizing.lineHeights;
export const breakpoints = sizing.breakpoints;
export const componentSizes = sizing.component;

// 导出布局相关 (兼容layout.js)
export const pageLayouts = {
  sidebar: {
    container: 'flex h-screen bg-background',
    sidebar: 'w-20 flex-shrink-0 bg-card border-r border-border',
    main: 'flex-1 flex flex-col min-w-0 overflow-hidden',
    content: 'flex-1 overflow-auto p-lg lg:p-xl focus:outline-none',
  },
  single: {
    container: 'container mx-auto px-lg lg:px-xl py-xl',
    content: 'max-w-4xl mx-auto',
  },
};
export const gridSystem = sizing.layout.grid;
export const layoutSpacing = sizing.layout.spacing; // 避免与spacing冲突

// 辅助函数：获取尺寸值
export const getSize = (category, key) => {
  return sizing[category]?.[key] || key;
};

// 辅助函数：计算相对尺寸
export const calcSize = (base, multiplier = 1) => {
  const baseValue = parseFloat(base);
  const unit = base.replace(/[0-9.]/g, '');
  return `${baseValue * multiplier}${unit}`;
};

// 全局缩放工具
export const getScaledSize = (base, scale = sizing.scale) => {
  const baseValue = parseFloat(base);
  const unit = base.replace(/[0-9.]/g, '');
  return `${baseValue * scale}${unit}`;
};

// 布局辅助函数 (从layout.js迁移)
export const getResponsiveClass = (baseClass, responsiveMap) => {
  const classes = [baseClass];
  Object.entries(responsiveMap).forEach(([breakpoint, className]) => {
    if (className) classes.push(className);
  });
  return classes.join(' ');
};

export const createGridLayout = (columns = 12, gap = 'gap-md lg:gap-lg') => {
  return `grid grid-cols-${columns} ${gap}`;
};

export const createContainer = (maxWidth = 'max-w-4xl', padding = 'px-lg lg:px-xl') => {
  return `container ${maxWidth} mx-auto ${padding}`;
};