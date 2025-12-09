import * as React from "react"
import { Card as MantineCard, Text, Title, Group, Box, useMantineTheme } from "@mantine/core"
import { getSemanticColors, getSpacing } from "@/theme/mantine-theme"
import { cn } from "@/lib/utils"

// 简化的类型定义
type CardVariant = "default" | "outline"
type CardSize = "xs" | "sm" | "md" | "lg" | "xl"

// 简化的核心接口
interface SimpleCardProps {
  variant?: CardVariant
  size?: CardSize
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

// 简化的子组件接口 - 添加style支持
interface SimpleCardSectionProps {
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

// 简化的标题接口
interface SimpleTitleProps {
  order?: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
  className?: string
}

// 简化的描述接口
interface SimpleDescriptionProps {
  children: React.ReactNode
  className?: string
}

// 简化的媒体接口
interface SimpleMediaProps {
  src: string
  alt?: string
  height?: number
  className?: string
  children?: React.ReactNode
}

// 主Card组件
const CardRoot = React.forwardRef<HTMLDivElement, SimpleCardProps>(
  ({ variant = "default", size = "md", onClick, className, style, children, ...props }, ref) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)
    const spacing = getSpacing(theme)

    // 根据主题和变体配置样式
    const styles = {
      default: {
        withBorder: false,
        backgroundColor: colors.background,
        border: `1px solid ${colors.border}`,
      },
      outline: {
        withBorder: false,
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
      }
    }

    const cardStyles = styles[variant]
    const padding = size === "sm" ? "sm" : size === "lg" ? "lg" : "md"
    
    // 根据size映射圆角
    const radiusMap = {
      xs: theme.radius.xs,
      sm: theme.radius.sm,
      md: theme.radius.md,
      lg: theme.radius.lg,
      xl: theme.radius.xl,
    }

    return (
      <MantineCard
        ref={ref}
        withBorder={cardStyles.withBorder}
        padding={padding}
        radius={radiusMap[size]}
        style={{
          backgroundColor: cardStyles.backgroundColor,
          border: cardStyles.border,
          // 移除硬编码阴影，使用Mantine主题阴影避免双重阴影
          boxShadow: 'none',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 200ms ease',
          ...style,
        }}
        className={cn(onClick && "hover:opacity-90", className)}
        onClick={onClick}
        {...props}
      >
        {children}
      </MantineCard>
    )
  }
)
CardRoot.displayName = "Card"

// 简化的CardHeader - 添加style支持
const CardHeader = React.forwardRef<HTMLDivElement, SimpleCardSectionProps>(
  ({ className, style, children, ...props }, ref) => {
    const theme = useMantineTheme()
    const spacing = getSpacing(theme)

    return (
      <MantineCard.Section
        ref={ref}
        style={{
          padding: spacing.md,
          ...style,
        }}
        className={cn(className)}
        {...props}
      >
        {children}
      </MantineCard.Section>
    )
  }
)
CardHeader.displayName = "CardHeader"

// 简化的CardBody - 添加style支持
const CardBody = React.forwardRef<HTMLDivElement, SimpleCardSectionProps>(
  ({ className, style, children, ...props }, ref) => {
    const theme = useMantineTheme()
    const spacing = getSpacing(theme)

    return (
      <MantineCard.Section
        ref={ref}
        style={{
          padding: spacing.md,
          ...style,
        }}
        className={cn(className)}
        {...props}
      >
        {children}
      </MantineCard.Section>
    )
  }
)
CardBody.displayName = "CardBody"

// 简化的CardFooter - 添加style支持
const CardFooter = React.forwardRef<HTMLDivElement, SimpleCardSectionProps>(
  ({ className, style, children, ...props }, ref) => {
    const theme = useMantineTheme()
    const spacing = getSpacing(theme)
    const colors = getSemanticColors(theme)

    return (
      <MantineCard.Section
        ref={ref}
        style={{
          padding: spacing.md,
          borderTop: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
          ...style,
        }}
        className={cn(className)}
        {...props}
      >
        <Group justify="flex-end" gap={spacing.sm}>
          {children}
        </Group>
      </MantineCard.Section>
    )
  }
)
CardFooter.displayName = "CardFooter"

// 简化的CardTitle
const CardTitle = React.forwardRef<HTMLDivElement, SimpleTitleProps>(
  ({ order = 3, children, className, ...props }, ref) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)

    return (
      <Title
        ref={ref}
        order={order}
        style={{
          color: colors.text,
          fontSize: theme.fontSizes.lg,
          lineHeight: theme.lineHeights.lg,
          fontWeight: 600,
        }}
        className={cn(className)}
        {...props}
      >
        {children}
      </Title>
    )
  }
)
CardTitle.displayName = "CardTitle"

// 简化的CardDescription
const CardDescription = React.forwardRef<HTMLDivElement, SimpleDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)

    return (
      <Text
        ref={ref}
        style={{
          color: colors.textSecondary,
          fontSize: theme.fontSizes.sm,
          lineHeight: theme.lineHeights.md,
        }}
        className={cn(className)}
        {...props}
      >
        {children}
      </Text>
    )
  }
)
CardDescription.displayName = "CardDescription"

// 简化的CardMedia
const CardMedia = React.forwardRef<HTMLDivElement, SimpleMediaProps>(
  ({ src, alt = "", height = 200, className, children, ...props }, ref) => {
    return (
      <MantineCard.Section>
        <Box
          ref={ref}
          className={cn("relative overflow-hidden", className)}
          style={{ height: `${height}px` }}
          {...props}
        >
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            style={{ height: '100%', width: '100%' }}
          />
          {children}
        </Box>
      </MantineCard.Section>
    )
  }
)
CardMedia.displayName = "CardMedia"

// 组合导出 - 保持API兼容性
const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Content: CardBody, // 向后兼容别名
  Footer: CardFooter,
  Title: CardTitle,
  Description: CardDescription,
  Media: CardMedia,
})

// 导出组件和类型
export {
  Card as Card,
  CardRoot,
  CardHeader,
  CardBody,
  CardBody as CardContent, // 向后兼容
  CardFooter,
  CardTitle,
  CardDescription,
  CardMedia,
}

// 导出简化的类型
export type {
  SimpleCardProps as CardRootProps,
  SimpleCardSectionProps as CardHeaderProps,
  SimpleCardSectionProps as CardBodyProps,
  SimpleCardSectionProps as CardFooterProps,
  SimpleTitleProps as CardTitleProps,
  SimpleDescriptionProps as CardDescriptionProps,
  SimpleMediaProps as CardMediaProps,
  CardVariant,
  CardSize,
}
