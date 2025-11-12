import * as React from "react"
import { NavLink as MantineNavLink, useMantineTheme } from '@mantine/core'
import { cn } from "@/lib/utils"
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'

// 简化的类型定义
type NavLinkVariant = "filled" | "light" | "subtle"

// 简化的核心接口
interface SimpleNavLinkProps {
  label: React.ReactNode
  icon?: React.ReactNode
  description?: React.ReactNode
  active?: boolean
  variant?: NavLinkVariant
  className?: string
  onClick?: () => void
  disabled?: boolean
  rightSection?: React.ReactNode
  leftSection?: React.ReactNode
}

// 主NavLink组件
const NavLink = React.forwardRef<HTMLAnchorElement, SimpleNavLinkProps>(
  ({
    label,
    icon,
    description,
    active = false,
    variant = "subtle",
    className,
    onClick,
    disabled = false,
    rightSection,
    leftSection,
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)
    const spacing = getSpacing(theme)

    return (
      <MantineNavLink
        ref={ref}
        label={label}
        description={description}
        active={active}
        variant={variant}
        className={cn(className)}
        onClick={onClick}
        disabled={disabled}
        rightSection={rightSection}
        leftSection={leftSection}
        styles={{
          root: {
            backgroundColor: active
              ? theme.colors[theme.primaryColor][5]
              : undefined,
            color: active
              ? theme.white
              : undefined,
          },
        }}
        {...props}
      >
        {icon && <div className="mr-2">{icon}</div>}
        {label}
      </MantineNavLink>
    )
  }
)
NavLink.displayName = "NavLink"

// 导出组件和类型
export { NavLink }
export type {
  SimpleNavLinkProps as NavLinkProps,
  NavLinkVariant
}