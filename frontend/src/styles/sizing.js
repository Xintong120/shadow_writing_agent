// 尺寸管理系统
// 统一管理所有组件的尺寸、间距、圆角等

export const sizing = {
  // 基础尺寸单位 (基于 4px 网格系统)
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

  // 间距系统 (spacing)
  spacing: {
    xs: '0.25rem',   // 4px - 极小间距
    sm: '0.5rem',    // 8px - 小间距
    md: '0.75rem',   // 12px - 中等间距
    lg: '1rem',      // 16px - 大间距
    xl: '1.5rem',    // 24px - 超大间距
    '2xl': '2rem',   // 32px - 极大间距
  },

  // 圆角系统 (border-radius)
  radius: {
    none: '0',
    sm: '0.125rem',  // 2px - 小圆角
    md: '0.25rem',   // 4px - 中等圆角
    lg: '0.5rem',    // 8px - 大圆角
    xl: '0.75rem',   // 12px - 超大圆角
    full: '9999px',  // 完全圆角
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

  // 布局尺寸
  layout: {
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

  // 响应式断点 (用于媒体查询)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// 导出常用的尺寸组合
export const spacing = sizing.spacing;
export const radius = sizing.radius;
export const componentSizes = sizing.component;

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