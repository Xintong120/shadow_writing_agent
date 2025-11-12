import * as React from "react"
import { Button as MantineButton, useMantineTheme } from "@mantine/core"
import { ButtonProps as MantineButtonProps } from "@mantine/core"
import { cn } from "@/lib/utils"

// 使用Mantine Button组件的直接类型定义
type ButtonVariant = "filled" | "outline" | "light" | "subtle" | "transparent" | "white" 
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl" | "icon"
type ButtonRadius = "xs" | "sm" | "md" | "lg" | "xl"

interface ButtonProps extends Omit<MantineButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant
  size?: ButtonSize
  radius?: ButtonRadius
  onClick?: () => void
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "filled", size = "md", radius, children, ...props }, ref) => {
    const theme = useMantineTheme()
    const defaultRadius = radius || theme.radius.md

    return (
      <MantineButton
        className={className}
        variant={variant}
        size={size}
        radius={defaultRadius}
        ref={ref}
        {...props}
      >
        {children}
      </MantineButton>
    )
  }
)
Button.displayName = "Button"

export { Button }

// 导出新的类型定义
export type {
  ButtonVariant,
  ButtonSize,
  ButtonRadius,
}
