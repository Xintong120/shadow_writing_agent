import * as React from "react"
import { Button as MantineButton } from "@mantine/core"
import { ButtonProps as MantineButtonProps } from "@mantine/core"
import { cn } from "@/lib/utils"

// 使用Mantine Button组件的直接类型定义
type ButtonVariant = "filled" | "outline" | "light" | "subtle" | "transparent" | "white" | "default" | "destructive" | "secondary" | "ghost" | "link"
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl" | "icon"

interface ButtonProps extends Omit<MantineButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant | "destructive" | "secondary" | "ghost" | "link"
  size?: ButtonSize
}

// 实现一个简单的Button组件，使用Mantine组件作为基础
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "filled", size = "md", children, ...props }, ref) => {
    // 处理变体映射
    let buttonVariant = variant
    if (variant === "default") buttonVariant = "filled"
    if (variant === "secondary") buttonVariant = "light"
    if (variant === "ghost") buttonVariant = "subtle"
    if (variant === "destructive") buttonVariant = "filled"
    if (variant === "link") buttonVariant = "subtle"
    
    // 处理尺寸映射
    let buttonSize = size
    if (size === "xs") buttonSize = "xs"
    if (size === "sm") buttonSize = "sm"
    if (size === "md") buttonSize = "md"
    if (size === "lg") buttonSize = "lg"
    if (size === "xl") buttonSize = "xl"
    if (size === "icon") buttonSize = "sm"
    
    return (
      <MantineButton
        className={className}
        variant={buttonVariant}
        size={buttonSize}
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
