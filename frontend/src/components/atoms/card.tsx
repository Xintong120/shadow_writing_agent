import * as React from "react"
import { Card as MantineCard, Text, Title, Group, Box } from "@mantine/core"
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
  children: React.ReactNode
}

// 简化的子组件接口
interface SimpleCardSectionProps {
  className?: string
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
  ({ variant = "default", size = "md", onClick, className, children, ...props }, ref) => {
    // 修复阴影问题的样式映射
    const styles = {
      default: {
        withBorder: false,
        className: "bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),_0_2px_4px_-1px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),_0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-shadow"
      },
      outline: {
        withBorder: false,  // 改为false避免与阴影冲突
        className: "bg-transparent border border-gray-200 dark:border-gray-700"
      }
    }

    const cardStyles = styles[variant]
    const padding = size === "sm" ? "sm" : size === "lg" ? "lg" : "md"

    return (
      <MantineCard
        ref={ref}
        withBorder={cardStyles.withBorder}
        padding={padding}
        className={cn(cardStyles.className, onClick && "cursor-pointer", className)}
        onClick={onClick}
        style={{
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
        }}
        {...props}
      >
        {children}
      </MantineCard>
    )
  }
)
CardRoot.displayName = "Card"

// 简化的CardHeader
const CardHeader = React.forwardRef<HTMLDivElement, SimpleCardSectionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <MantineCard.Section
        ref={ref}
        className={cn("p-md", className)}
        {...props}
      >
        {children}
      </MantineCard.Section>
    )
  }
)
CardHeader.displayName = "CardHeader"

// 简化的CardBody
const CardBody = React.forwardRef<HTMLDivElement, SimpleCardSectionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <MantineCard.Section
        ref={ref}
        className={cn("p-md", className)}
        {...props}
      >
        {children}
      </MantineCard.Section>
    )
  }
)
CardBody.displayName = "CardBody"

// 简化的CardFooter
const CardFooter = React.forwardRef<HTMLDivElement, SimpleCardSectionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <MantineCard.Section
        ref={ref}
        className={cn("p-md", className)}
        {...props}
      >
        <Group justify="flex-end" gap="sm">
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
    return (
      <Title
        ref={ref}
        order={order}
        className={cn("text-lg font-semibold text-gray-900 dark:text-gray-100", className)}
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
    return (
      <Text
        ref={ref}
        size="sm"
        c="dimmed"
        className={cn("text-gray-600 dark:text-gray-400", className)}
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
