import React, { useState } from 'react';
import { useMantineTheme } from '@mantine/core';
import { 
  getSemanticColors, 
  getSpacing, 
  getTypography,
  getBorderRadius,
  getShadows,
  getResponsiveProps 
} from '@/theme/mantine-theme';

/**
 * 增强主题工具函数使用示例
 * 展示如何在组件中使用新的主题工具函数
 */
export function EnhancedThemeExample() {
  const theme = useMantineTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  // 获取所有主题工具
  const colors = getSemanticColors(theme);
  const spacing = getSpacing(theme);
  const typography = getTypography(theme);
  const borderRadius = getBorderRadius(theme);
  const shadows = getShadows(theme);
  const responsive = getResponsiveProps(theme);

  return (
    <div
      style={{
        // 使用语义化颜色
        backgroundColor: colors.background,
        color: colors.text,
        
        // 使用间距令牌
        padding: spacing.md,
        marginBottom: spacing.lg,
        
        // 使用字体排版
        fontSize: typography.body.fontSize,
        lineHeight: typography.body.lineHeight,
        fontWeight: typography.body.fontWeight,
        
        // 使用圆角令牌
        borderRadius: borderRadius.card,
        
        // 使用阴影令牌
        boxShadow: isHovered ? shadows.hover : shadows.card,
        
        // 其他样式
        border: `1px solid ${colors.border}`,
        transition: 'all 200ms ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 标题区域 */}
      <header
        style={{
          fontSize: typography.h2.fontSize,
          lineHeight: typography.h2.lineHeight,
          fontWeight: typography.h2.fontWeight,
          color: colors.primary,
          marginBottom: spacing.md,
        }}
      >
        主题工具函数示例
      </header>

      {/* 内容区域 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.sm,
        }}
      >
        {/* 卡片组件示例 */}
        <CardExample 
          colors={colors}
          spacing={spacing}
          typography={typography}
          borderRadius={borderRadius}
          shadows={shadows}
        />

        {/* 按钮组件示例 */}
        <ButtonExample
          colors={colors}
          spacing={spacing}
          typography={typography}
          borderRadius={borderRadius}
        />

        {/* 响应式布局示例 */}
        <ResponsiveExample
          spacing={spacing}
          responsive={responsive}
        />
      </div>

      {/* 页脚说明 */}
      <footer
        style={{
          fontSize: typography.caption.fontSize,
          lineHeight: typography.caption.lineHeight,
          fontWeight: typography.caption.fontWeight,
          color: colors.textMuted,
          marginTop: spacing.lg,
          paddingTop: spacing.md,
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        这个示例展示了如何使用主题工具函数来构建一致的UI组件
      </footer>
    </div>
  );
}

/**
 * 卡片组件示例
 */
interface CardExampleProps {
  colors: ReturnType<typeof getSemanticColors>;
  spacing: ReturnType<typeof getSpacing>;
  typography: ReturnType<typeof getTypography>;
  borderRadius: ReturnType<typeof getBorderRadius>;
  shadows: ReturnType<typeof getShadows>;
}

function CardExample({ 
  colors, 
  spacing, 
  typography, 
  borderRadius, 
  shadows 
}: CardExampleProps) {
  const [isCardHovered, setIsCardHovered] = useState(false);

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: borderRadius.card,
        padding: spacing.card,
        boxShadow: isCardHovered ? shadows.hover : shadows.card,
        transition: 'box-shadow 200ms ease',
      }}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      <h3
        style={{
          fontSize: typography.h3.fontSize,
          lineHeight: typography.h3.lineHeight,
          fontWeight: typography.h3.fontWeight,
          color: colors.text,
          marginBottom: spacing.sm,
        }}
      >
        卡片标题
      </h3>
      <p
        style={{
          fontSize: typography.body.fontSize,
          lineHeight: typography.body.lineHeight,
          fontWeight: typography.body.fontWeight,
          color: colors.textSecondary,
        }}
      >
        这是一个使用主题工具函数构建的卡片组件示例。
        它展示了如何保持设计的一致性和类型安全。
      </p>
    </div>
  );
}

/**
 * 按钮组件示例
 */
interface ButtonExampleProps {
  colors: ReturnType<typeof getSemanticColors>;
  spacing: ReturnType<typeof getSpacing>;
  typography: ReturnType<typeof getTypography>;
  borderRadius: ReturnType<typeof getBorderRadius>;
}

function ButtonExample({ 
  colors, 
  spacing, 
  typography, 
  borderRadius 
}: ButtonExampleProps) {
  const [primaryHovered, setPrimaryHovered] = useState(false);
  const [secondaryHovered, setSecondaryHovered] = useState(false);
  const [dangerHovered, setDangerHovered] = useState(false);

  return (
    <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
      {/* 主要按钮 */}
      <button
        style={{
          fontSize: typography.button.fontSize,
          lineHeight: typography.button.lineHeight,
          fontWeight: typography.button.fontWeight,
          textTransform: typography.button.textTransform,
          letterSpacing: typography.button.letterSpacing,
          backgroundColor: primaryHovered ? colors.primaryHover : colors.primary,
          color: colors.background,
          border: 'none',
          borderRadius: borderRadius.button,
          padding: `${spacing.sm} ${spacing.md}`,
          cursor: 'pointer',
          transition: 'all 200ms ease',
          transform: primaryHovered ? 'translateY(-1px)' : 'none',
        }}
        onMouseEnter={() => setPrimaryHovered(true)}
        onMouseLeave={() => setPrimaryHovered(false)}
      >
        主要按钮
      </button>

      {/* 次要按钮 */}
      <button
        style={{
          fontSize: typography.button.fontSize,
          lineHeight: typography.button.lineHeight,
          fontWeight: typography.button.fontWeight,
          textTransform: typography.button.textTransform,
          letterSpacing: typography.button.letterSpacing,
          backgroundColor: secondaryHovered ? colors.primary : 'transparent',
          color: secondaryHovered ? colors.background : colors.primary,
          border: `1px solid ${colors.primary}`,
          borderRadius: borderRadius.button,
          padding: `${spacing.sm} ${spacing.md}`,
          cursor: 'pointer',
          transition: 'all 200ms ease',
        }}
        onMouseEnter={() => setSecondaryHovered(true)}
        onMouseLeave={() => setSecondaryHovered(false)}
      >
        次要按钮
      </button>

      {/* 危险按钮 */}
      <button
        style={{
          fontSize: typography.button.fontSize,
          lineHeight: typography.button.lineHeight,
          fontWeight: typography.button.fontWeight,
          textTransform: typography.button.textTransform,
          letterSpacing: typography.button.letterSpacing,
          backgroundColor: colors.error,
          color: colors.background,
          border: 'none',
          borderRadius: borderRadius.button,
          padding: `${spacing.sm} ${spacing.md}`,
          cursor: 'pointer',
          transition: 'all 200ms ease',
          opacity: dangerHovered ? 0.9 : 1,
        }}
        onMouseEnter={() => setDangerHovered(true)}
        onMouseLeave={() => setDangerHovered(false)}
      >
        危险按钮
      </button>
    </div>
  );
}

/**
 * 响应式布局示例
 */
interface ResponsiveExampleProps {
  spacing: ReturnType<typeof getSpacing>;
  responsive: ReturnType<typeof getResponsiveProps>;
}

function ResponsiveExample({ spacing, responsive }: ResponsiveExampleProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.md,
        padding: spacing.md,
        backgroundColor: '#f8f9fa',
        borderRadius: spacing.sm,
      }}
    >
      {/* 移动端卡片 */}
      <div
        style={{
          padding: spacing.sm,
          backgroundColor: 'white',
          borderRadius: spacing.xs,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
          minHeight: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '0.875rem', color: '#6c757d' }}>
          移动端
        </span>
      </div>

      <div
        style={{
          padding: spacing.sm,
          backgroundColor: 'white',
          borderRadius: spacing.xs,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
          minHeight: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '0.875rem', color: '#6c757d' }}>
          平板端
        </span>
      </div>

      <div
        style={{
          padding: spacing.sm,
          backgroundColor: 'white',
          borderRadius: spacing.xs,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
          minHeight: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '0.875rem', color: '#6c757d' }}>
          桌面端
        </span>
      </div>
    </div>
  );
}

export default EnhancedThemeExample;