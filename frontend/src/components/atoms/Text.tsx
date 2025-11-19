import * as React from "react"
import { Text as MantineText, useMantineTheme } from '@mantine/core'
import { cn } from "@/lib/utils"

// 简化的类型定义
type TextSize = "xs" | "sm" | "md" | "lg" | "xl"
type TextWeight = "normal" | "semibold" | "bold"
type TextStyle = "normal" | "italic"
type TextDecoration = "none" | "underline" | "line-through"
type TextColor = "dimmed" | string
type TextTransform = "none" | "uppercase" | "capitalize"
type TextAlign = "left" | "center" | "right"
type TextGradient = {
  from: string
  to: string
  deg?: number
}


// 简化的核心接口
interface SimpleTextProps {
  children: React.ReactNode
  size?: TextSize
  weight?: TextWeight
  style?: TextStyle
  decoration?: TextDecoration
  color?: TextColor
  gradient?: TextGradient
  transform?: TextTransform
  align?: TextAlign
  className?: string
  variant?: "text" | "gradient"
  inherit?: boolean
  inline?: boolean
  span?: boolean
  truncate?: boolean
  lineClamp?: number
}

// 权重映射
const weightMap = {
  normal: 400,
  semibold: 600,
  bold: 700
}


// 主Text组件
const Text = React.forwardRef<HTMLDivElement, SimpleTextProps>(
  ({
    children,
    size,
    weight = "normal",
    style = "normal",
    decoration = "none",
    color,
    gradient,
    transform = "none",
    align = "left",
    variant,
    className,
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    
    // 使用主题字体大小系统
    const textSize = size ? theme.fontSizes[size] : theme.fontSizes.md
    // 自动设置variant为gradient当gradient存在时
    const actualVariant = gradient ? "gradient" : variant

    return (
      <MantineText
        ref={ref}
        size={textSize}
        fw={weightMap[weight]}
        fs={style === "italic" ? "italic" : undefined}
        td={decoration !== "none" ? decoration : undefined}
        c={actualVariant === "gradient" ? undefined : color}
        gradient={gradient}
        tt={transform !== "none" ? transform : undefined}
        ta={align}
        variant={actualVariant}
        className={cn(className)}
        {...props}
      >
        {children}
      </MantineText>
    )
  }
)
Text.displayName = "Text"

// 导出组件和类型
export { Text }
export type {
  SimpleTextProps as TextProps,
  TextSize,
  TextWeight,
  TextStyle,
  TextDecoration,
  TextColor,
  TextGradient,
  TextTransform,
  TextAlign
}
