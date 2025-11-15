import { cn } from '@/lib/utils'
import { useMantineTheme } from '@mantine/core'
import { getSpacing } from '@/theme/mantine-theme'

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
 */
export function Grid({
  columns = 12,
  gap = 'gap-4 lg:gap-6',
  className,
  children,
  ...props
}) {

  // 网格布局类名
  const gridClass = `grid grid-cols-${columns} ${gap}`

  return (
    <div
      className={cn(gridClass, className)}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * GridItem - 网格项组件
 * 网格布局中的单个项目
 */
export function GridItem({
  span = 1,
  responsive,
  className,
  children,
  ...props
}) {
  // 基础跨度类名
  const spanMap = {
    1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
    5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
    9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12'
  }

  let spanClass = spanMap[span] || spanMap[1]

  // 处理响应式跨度
  if (responsive) {
    const responsiveClasses = []
    Object.entries(responsive).forEach(([breakpoint, spanValue]) => {
      const responsiveMap = {
        sm: { 1: 'sm:col-span-1', 2: 'sm:col-span-2', 3: 'sm:col-span-3', 4: 'sm:col-span-4',
              5: 'sm:col-span-5', 6: 'sm:col-span-6', 7: 'sm:col-span-7', 8: 'sm:col-span-8',
              9: 'sm:col-span-9', 10: 'sm:col-span-10', 11: 'sm:col-span-11', 12: 'sm:col-span-12' },
        md: { 1: 'md:col-span-1', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4',
              5: 'md:col-span-5', 6: 'md:col-span-6', 7: 'md:col-span-7', 8: 'md:col-span-8',
              9: 'md:col-span-9', 10: 'md:col-span-10', 11: 'md:col-span-11', 12: 'md:col-span-12' },
        lg: { 1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3', 4: 'lg:col-span-4',
              5: 'lg:col-span-5', 6: 'lg:col-span-6', 7: 'lg:col-span-7', 8: 'lg:col-span-8',
              9: 'lg:col-span-9', 10: 'lg:col-span-10', 11: 'lg:col-span-11', 12: 'lg:col-span-12' },
        xl: { 1: 'xl:col-span-1', 2: 'xl:col-span-2', 3: 'xl:col-span-3', 4: 'xl:col-span-4',
              5: 'xl:col-span-5', 6: 'xl:col-span-6', 7: 'xl:col-span-7', 8: 'xl:col-span-8',
              9: 'xl:col-span-9', 10: 'xl:col-span-10', 11: 'xl:col-span-11', 12: 'xl:col-span-12' }
      }
      if (responsiveMap[breakpoint]?.[spanValue]) {
        responsiveClasses.push(responsiveMap[breakpoint][spanValue])
      }
    })
    if (responsiveClasses.length > 0) {
      spanClass = responsiveClasses.join(' ')
    }
  }

  return (
    <div
      className={cn(spanClass, className)}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Stack - 垂直堆叠布局组件
 * 统一的垂直间距布局
 */
export function Stack({
  spacing = 'gap-md lg:gap-lg',
  align = 'stretch',
  className,
  children,
  ...props
}) {
  const alignClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }[align] || 'items-stretch'

  return (
    <div
      className={cn(
        'flex flex-col',
        alignClass,
        spacing,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Inline - 水平内联布局组件
 * 统一的水平间距布局
 */
export function Inline({
  spacing = 'gap-sm lg:gap-md',
  align = 'center',
  justify = 'start',
  wrap = true,
  className,
  children,
  ...props
}) {
  const alignClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  }[align] || 'items-center'

  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }[justify] || 'justify-start'

  const wrapClass = wrap ? 'flex-wrap' : 'flex-nowrap'

  return (
    <div
      className={cn(
        'flex',
        alignClass,
        justifyClass,
        wrapClass,
        spacing,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * SidebarLayout - 侧边栏布局组件
 * 专门用于有侧边栏的页面布局
 */
export function SidebarLayout({
  sidebar,
  children,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'flex h-screen bg-background',
        className
      )}
      {...props}
    >
      {/* 侧边栏 */}
      <aside className="w-20 flex-shrink-0 bg-card border-r border-border">
        {sidebar}
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-auto p-6 lg:p-8 focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  )
}

/**
 * DualColumnLayout - 双列布局组件
 * 用于侧边栏内容页面
 * 使用 Mantine 主题间距系统 + Tailwind 布局基础类
 */
export function DualColumnLayout({
  main,
  sidebar,
  className,
  ...props
}) {
  const theme = useMantineTheme()
  const spacing = getSpacing(theme)

  // 使用 Mantine 主题间距
  const layoutStyles = {
    padding: `${spacing.md} ${spacing.md}`,
    [theme.breakpoints.lg]: {
      padding: `${spacing.lg} ${spacing.lg}`
    },
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg
  }

  const gridStyles = {
    gap: spacing.lg
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
      <div
        className="grid grid-cols-1 lg:grid-cols-3" // Tailwind 网格布局
        style={gridStyles} // Mantine 主题间距
      >
        <main className="lg:col-span-2">
          {main}
        </main>
        <aside className="lg:col-span-1">
          {sidebar}
        </aside>
      </div>
    </div>
  )
}

/**
 * CardGrid - 卡片网格布局组件
 * 专门用于卡片列表的网格布局
 * 使用 Mantine 主题间距系统 + Tailwind 布局基础类
 */
export function CardGrid({
  children,
  className,
  ...props
}) {
  const theme = useMantineTheme()
  const spacing = getSpacing(theme)

  // 使用 Mantine 主题间距
  const containerStyles = {
    padding: `${spacing.lg} ${spacing.md}`,
    [theme.breakpoints.lg]: {
      padding: `${spacing.lg} ${spacing.lg}`
    },
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg
  }

  const gridStyles = {
    gap: spacing.md
  }

  return (
    <div
      className={cn(
        'container mx-auto', // Tailwind 布局基础类
        className
      )}
      style={containerStyles} // Mantine 主题间距
      {...props}
    >
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" // Tailwind 网格布局
        style={gridStyles} // Mantine 主题间距
      >
        {children}
      </div>
    </div>
  )
}