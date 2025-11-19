import { cn } from '@/lib/utils'
import { useMantineTheme } from '@mantine/core'
import { getSemanticColors, getSpacing, getResponsiveProps } from '@/theme/mantine-theme'

/**
 * LayoutContainer - 页面容器组件
 * 提供统一的页面布局容器，自动处理响应式和间距
 * 使用 Mantine 主题间距系统 + Tailwind 布局基础类
 */
export function LayoutContainer({
  maxWidth = 'standard',
  padding = 'page',
  className,
  children,
  ...props
}) {
  const theme = useMantineTheme()
  const spacing = getSpacing(theme)

  // 最大宽度映射 (保持 Tailwind 类)
  const maxWidthMap = {
    narrow: 'max-w-2xl',
    standard: 'max-w-4xl',
    wide: 'max-w-6xl',
    full: 'max-w-full'
  }

  // 内边距使用 Mantine 主题值 (通过样式对象)
  const getPaddingStyles = () => {
    const basePadding = {
      none: { padding: 0 },
      sm: { padding: spacing.sm },
      md: { padding: spacing.md },
      lg: { padding: spacing.lg },
      xl: { padding: spacing.xl },
      page: {
        padding: spacing.md,
        [theme.breakpoints.lg]: { padding: spacing.lg },
        [theme.breakpoints.xl]: { padding: spacing.xl }
      }
    }
    return basePadding[padding] || basePadding.page
  }

  const maxWidthClass = maxWidthMap[maxWidth] || maxWidthMap.standard
  const paddingStyles = getPaddingStyles()

  return (
    <div
      className={cn(
        'container mx-auto', // Tailwind 布局基础类
        maxWidthClass,       // Tailwind 最大宽度类
        className
      )}
      style={paddingStyles}  // Mantine 主题间距
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * PageSection - 页面区块组件
 * 统一的页面内容区块，包含标准间距
 * 使用 Mantine 主题间距系统 + Tailwind 布局基础类
 */
export function PageSection({
  spacing: sectionSpacing = 'section',
  className,
  children,
  ...props
}) {
  const theme = useMantineTheme()
  const spacing = getSpacing(theme)

  // 区块间距使用 Mantine 主题值 (通过样式对象)
  const getSpacingStyles = () => {
    const baseSpacing = {
      none: { marginBottom: 0 },
      sm: {
        marginBottom: spacing.sm,
        [theme.breakpoints.lg]: { marginBottom: spacing.md }
      },
      md: {
        marginBottom: spacing.md,
        [theme.breakpoints.lg]: { marginBottom: spacing.lg }
      },
      lg: {
        marginBottom: spacing.lg,
        [theme.breakpoints.lg]: { marginBottom: spacing.xl }
      },
      xl: {
        marginBottom: spacing.xl,
        [theme.breakpoints.lg]: { marginBottom: spacing['2xl'] }
      },
      section: {
        marginBottom: spacing.lg,
        [theme.breakpoints.lg]: { marginBottom: spacing.xl },
        [theme.breakpoints.xl]: { marginBottom: spacing['2xl'] }
      }
    }
    return baseSpacing[sectionSpacing] || baseSpacing.section
  }

  const spacingStyles = getSpacingStyles()

  return (
    <section
      className={cn(className)}  // 只保留自定义类名
      style={spacingStyles}     // Mantine 主题间距
      {...props}
    >
      {children}
    </section>
  )
}

/**
 * Grid - 响应式网格组件
 * 基于12列网格系统的灵活布局组件
 * 迁移到主题令牌系统，保持布局功能完整性
 */
export function Grid({
  columns = 12,
  gap = 'md',
  responsive,
  className,
  children,
  ...props
}) {
  const theme = useMantineTheme()
  const spacing = getSpacing(theme)
  const colors = getSemanticColors(theme)
  const responsiveProps = getResponsiveProps(theme)

  // 间距映射
  const gapMap = {
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
    '2xl': spacing['2xl']
  }

  // 构建网格样式
  const gridStyles: Record<string, any> = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: gapMap[gap] || spacing.md,
    backgroundColor: colors.background,
    color: colors.text,
  }

  // 处理响应式
  if (responsive) {
    Object.entries(responsive).forEach(([breakpoint, columns]) => {
      const mediaQuery = {
        sm: '(max-width: 767px)',
        md: '(min-width: 768px) and (max-width: 991px)', 
        lg: '(min-width: 992px)',
        xl: '(min-width: 1200px)'
      }[breakpoint]
      
      if (mediaQuery) {
        gridStyles[`@media ${mediaQuery}`] = {
          gridTemplateColumns: `repeat(${columns}, 1fr)`
        }
      }
    })
  }

  return (
    <div
      className={cn(className)}
      style={gridStyles}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * GridItem - 网格项组件
 * 网格布局中的单个项目
 * 迁移到主题令牌系统，保持布局功能完整性
 */
export function GridItem({
  span = 1,
  responsive,
  className,
  children,
  ...props
}) {
  const theme = useMantineTheme()
  const colors = getSemanticColors(theme)

  // 构建网格项样式
  const gridItemStyles: Record<string, any> = {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: theme.radius.sm,
  }

  // 处理跨度
  if (span !== 1) {
    gridItemStyles.gridColumn = `span ${span}`
  }

  // 处理响应式跨度
  if (responsive) {
    Object.entries(responsive).forEach(([breakpoint, spanValue]) => {
      const mediaQuery = {
        sm: '(max-width: 767px)',
        md: '(min-width: 768px) and (max-width: 991px)', 
        lg: '(min-width: 992px)',
        xl: '(min-width: 1200px)'
      }[breakpoint]
      
      if (mediaQuery && spanValue !== span) {
        gridItemStyles[`@media ${mediaQuery}`] = {
          gridColumn: `span ${spanValue}`
        }
      }
    })
  }

  return (
    <div
      className={cn(className)}
      style={gridItemStyles}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Stack - 垂直堆叠布局组件
 * 统一的垂直间距布局
 * 迁移到主题令牌系统，保持布局功能完整性
 */
export function Stack({
  spacing: spacingSize = 'md',
  align = 'stretch',
  className,
  children,
  ...props
}) {
  const theme = useMantineTheme()
  const spacing = getSpacing(theme)
  const colors = getSemanticColors(theme)

  // 间距映射
  const spacingMap = {
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
    '2xl': spacing['2xl']
  }

  // 对齐映射
  const alignMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
  }

  const stackStyles: Record<string, any> = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: alignMap[align] || 'stretch',
    gap: spacingMap[spacingSize] || spacing.md,
    backgroundColor: colors.background,
    color: colors.text,
  }

  return (
    <div
      className={cn(className)}
      style={stackStyles}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Inline - 水平内联布局组件
 * 统一的水平间距布局
 * 迁移到主题令牌系统，保持布局功能完整性
 */
export function Inline({
  spacing: spacingSize = 'sm',
  align = 'center',
  justify = 'start',
  wrap = true,
  className,
  children,
  ...props
}) {
  const theme = useMantineTheme()
  const spacing = getSpacing(theme)
  const colors = getSemanticColors(theme)

  // 间距映射
  const spacingMap = {
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
    '2xl': spacing['2xl']
  }

  // 对齐映射
  const alignMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    baseline: 'baseline',
    stretch: 'stretch',
  }

  // 分布映射
  const justifyMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  }

  const inlineStyles: Record<string, any> = {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: alignMap[align] || 'center',
    justifyContent: justifyMap[justify] || 'flex-start',
    gap: spacingMap[spacingSize] || spacing.sm,
    flexWrap: wrap ? 'wrap' : 'nowrap',
    backgroundColor: colors.background,
    color: colors.text,
  }

  return (
    <div
      className={cn(className)}
      style={inlineStyles}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * SidebarLayout - 侧边栏布局组件
 * 专门用于有侧边栏的页面布局
 * 迁移到主题令牌系统，保持布局功能完整性
 */
export function SidebarLayout({
  sidebar,
  children,
  className,
  ...props
}) {
  const theme = useMantineTheme()
  const spacing = getSpacing(theme)
  const colors = getSemanticColors(theme)

  const layoutStyles = {
    display: 'flex',
    height: '100vh',
    backgroundColor: colors.background,
    color: colors.text,
  }

  const sidebarStyles = {
    width: '5rem', // 80px - 保持原有尺寸
    flexShrink: 0,
    backgroundColor: colors.surface,
    borderRight: `1px solid ${colors.border}`,
    padding: spacing.md,
  }

  const mainStyles: Record<string, any> = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: 0,
    overflow: 'hidden',
  }

  const contentStyles = {
    flex: 1,
    overflow: 'auto',
    padding: spacing.lg,
    [theme.breakpoints.lg]: {
      padding: spacing.xl,
    },
  }

  return (
    <div
      className={cn(className)}
      style={layoutStyles}
      {...props}
    >
      {/* 侧边栏 */}
      <aside style={sidebarStyles}>
        {sidebar}
      </aside>

      {/* 主内容区 */}
      <div style={mainStyles}>
        <main style={contentStyles} tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}

/**
 * DualColumnLayout - 双列布局组件
 * 用于侧边栏内容页面
 * 添加完整的响应式设计支持
 */
export function DualColumnLayout({
  main,
  sidebar,
  className,
  ...props
}) {
  const theme = useMantineTheme()
  const spacing = getSpacing(theme)
  const colors = getSemanticColors(theme)
  const responsiveProps = getResponsiveProps(theme)

  // 使用 Mantine 主题间距
  const layoutStyles: Record<string, any> = {
    padding: `${spacing.md} ${spacing.md}`,
    [theme.breakpoints.lg]: {
      padding: `${spacing.lg} ${spacing.lg}`
    },
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    color: colors.text,
  }

  const gridStyles: Record<string, any> = {
    display: 'grid',
    gap: spacing.lg,
    gridTemplateColumns: '1fr',
    [theme.breakpoints.lg]: {
      gridTemplateColumns: '2fr 1fr',
    },
  }

  const mainStyles = {
    minWidth: 0,
  }

  const sidebarStyles = {
    minWidth: 0,
  }

  return (
    <div
      className={cn(
        'container mx-auto', // Tailwind 布局基础类
        className
      )}
      style={layoutStyles} // Mantine 主题间距
      {...props}
    >
      <div style={gridStyles}>
        <main style={mainStyles}>
          {main}
        </main>
        <aside style={sidebarStyles}>
          {sidebar}
        </aside>
      </div>
    </div>
  )
}

/**
 * CardGrid - 卡片网格布局组件
 * 专门用于卡片列表的网格布局
 * 添加颜色、字体、圆角主题令牌
 */
export function CardGrid({
  children,
  className,
  ...props
}) {
  const theme = useMantineTheme()
  const spacing = getSpacing(theme)
  const colors = getSemanticColors(theme)

  // 使用完整的 Mantine 主题令牌
  const containerStyles: Record<string, any> = {
    padding: `${spacing.lg} ${spacing.md}`,
    [theme.breakpoints.lg]: {
      padding: `${spacing.lg} ${spacing.lg}`
    },
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: theme.radius.md,
  }

  const gridStyles: Record<string, any> = {
    display: 'grid',
    gap: spacing.md,
    gridTemplateColumns: '1fr',
    [theme.breakpoints.md]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [theme.breakpoints.lg]: {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
  }

  return (
    <div
      className={cn(
        'container mx-auto', // Tailwind 布局基础类
        className
      )}
      style={containerStyles} // Mantine 主题令牌
      {...props}
    >
      <div style={gridStyles}>
        {children}
      </div>
    </div>
  )
}