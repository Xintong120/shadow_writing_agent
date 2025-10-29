import { cn } from '@/lib/utils'
import { pageLayouts, gridSystem, spacing, createContainer, createGridLayout } from '@/styles/layout'

/**
 * LayoutContainer - 页面容器组件
 * 提供统一的页面布局容器，自动处理响应式和间距
 */
export function LayoutContainer({
  maxWidth = 'standard',
  padding = 'page',
  className,
  children,
  ...props
}) {
  const maxWidthClass = pageLayouts.containers?.content?.[maxWidth] || 'max-w-4xl'
  const paddingClass = spacing[padding]?.padding || 'p-lg lg:p-xl'

  return (
    <div
      className={cn(
        'container mx-auto',
        maxWidthClass,
        paddingClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * PageSection - 页面区块组件
 * 统一的页面内容区块，包含标准间距
 */
export function PageSection({
  spacing: sectionSpacing = 'section',
  className,
  children,
  ...props
}) {
  const spacingClass = spacing.component?.[sectionSpacing] || 'mb-xl lg:mb-2xl'

  return (
    <section
      className={cn(spacingClass, className)}
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
  gap = 'gap-md lg:gap-lg',
  className,
  children,
  ...props
}) {
  return (
    <div
      className={cn(
        createGridLayout(columns, gap),
        className
      )}
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
  let spanClass = gridSystem.spans[span] || 'col-span-1'

  // 处理响应式跨度
  if (responsive) {
    const responsiveClasses = []
    Object.entries(responsive).forEach(([breakpoint, spanValue]) => {
      if (gridSystem.responsive[breakpoint]?.[spanValue]) {
        responsiveClasses.push(gridSystem.responsive[breakpoint][spanValue])
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
        pageLayouts.sidebar.container,
        className
      )}
      {...props}
    >
      {/* 侧边栏 */}
      <aside className={pageLayouts.sidebar.sidebar}>
        {sidebar}
      </aside>

      {/* 主内容区 */}
      <div className={pageLayouts.sidebar.main}>
        <main className={pageLayouts.sidebar.content}>
          {children}
        </main>
      </div>
    </div>
  )
}

/**
 * DualColumnLayout - 双列布局组件
 * 用于侧边栏内容页面
 */
export function DualColumnLayout({
  main,
  sidebar,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        pageLayouts.dual.container,
        className
      )}
      {...props}
    >
      <div className={pageLayouts.dual.content}>
        <main className={pageLayouts.dual.main}>
          {main}
        </main>
        <aside className={pageLayouts.dual.sidebar}>
          {sidebar}
        </aside>
      </div>
    </div>
  )
}

/**
 * CardGrid - 卡片网格布局组件
 * 专门用于卡片列表的网格布局
 */
export function CardGrid({
  children,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        pageLayouts.cards.container,
        className
      )}
      {...props}
    >
      <div className={pageLayouts.cards.grid}>
        {children}
      </div>
    </div>
  )
}