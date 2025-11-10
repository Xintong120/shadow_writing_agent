import * as React from "react"
import { Tabs as MantineTabs, MantineColor, useMantineTheme } from '@mantine/core'
import { cn } from "@/lib/utils"

// 简化的类型定义
type TabsVariant = "default" | "outline" | "pills"
type TabsRadius = "xs" | "sm" | "md" | "lg" | "xl"
type TabsOrientation = "horizontal" | "vertical"

// 简化的核心接口
interface SimpleTabsProps {
  children?: React.ReactNode
  variant?: TabsVariant
  radius?: TabsRadius
  orientation?: TabsOrientation
  className?: string
  value?: string
  defaultValue?: string
  color?: MantineColor
  keepMounted?: boolean
  onChange?: (value: string) => void
}

// 简化的TabsList接口
interface SimpleTabsListProps {
  children?: React.ReactNode
  grow?: boolean
  className?: string
}

// 简化的TabsTrigger接口
interface SimpleTabsTriggerProps {
  children?: React.ReactNode
  value: string
  disabled?: boolean
  className?: string
}

// 简化的TabsPanel接口
interface SimpleTabsPanelProps {
  children?: React.ReactNode
  value: string
  keepMounted?: boolean
  className?: string
}

// 主Tabs组件
const TabsRoot = React.forwardRef<HTMLDivElement, SimpleTabsProps>(
  ({
    children,
    variant = "default",
    radius,
    orientation = "horizontal",
    className,
    value,
    defaultValue,
    color,
    keepMounted = false,
    onChange,
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    const defaultColor = color || theme.colors.primary[6]
    const defaultRadius = radius || theme.radius.sm

    return (
      <MantineTabs
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        variant={variant}
        radius={defaultRadius}
        orientation={orientation}
        color={defaultColor}
        keepMounted={keepMounted}
        className={cn(className)}
        {...props}
      >
        {children}
      </MantineTabs>
    )
  }
)
TabsRoot.displayName = "Tabs"

// 简化的TabsList组件
const TabsList = React.forwardRef<HTMLDivElement, SimpleTabsListProps>(
  ({ children, grow = false, className, ...props }, ref) => {
    return (
      <MantineTabs.List
        ref={ref}
        grow={grow}
        className={cn(className)}
        {...props}
      >
        {children}
      </MantineTabs.List>
    )
  }
)
TabsList.displayName = "TabsList"

// 简化的TabsTrigger组件
const TabsTrigger = React.forwardRef<HTMLButtonElement, SimpleTabsTriggerProps>(
  ({ children, value, disabled = false, className, ...props }, ref) => {
    return (
      <MantineTabs.Tab
        ref={ref}
        value={value}
        disabled={disabled}
        className={cn(className)}
        {...props}
      >
        {children}
      </MantineTabs.Tab>
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

// 简化的TabsContent组件
const TabsContent = React.forwardRef<HTMLDivElement, SimpleTabsPanelProps>(
  ({ children, value, keepMounted = false, className, ...props }, ref) => {
    return (
      <MantineTabs.Panel
        ref={ref}
        value={value}
        keepMounted={keepMounted}
        className={cn(className)}
        {...props}
      >
        {children}
      </MantineTabs.Panel>
    )
  }
)
TabsContent.displayName = "TabsContent"

// 组合导出
const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Tab: TabsTrigger,
  Panel: TabsContent,
})

// 导出组件和类型
export { Tabs }
export type {
  SimpleTabsProps as TabsProps,
  SimpleTabsListProps as TabsListProps,
  SimpleTabsTriggerProps as TabsTriggerProps,
  SimpleTabsPanelProps as TabsPanelProps,
  TabsVariant,
  TabsRadius,
  TabsOrientation,
}
