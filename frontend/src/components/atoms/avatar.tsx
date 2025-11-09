import * as React from "react"
import { Avatar as MantineAvatar, Text, Tooltip, Group } from '@mantine/core'
import { MantineColor } from '@mantine/core'
import { cn } from "@/lib/utils"

// 简化的类型定义
type AvatarVariant = "filled" | "outline"
type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl"
type AvatarRadius = "xs" | "sm" | "md" | "lg" | "xl"
type AvatarColor = MantineColor | "initials"

// 简化的核心接口
interface SimpleAvatarProps {
  src?: string | null
  name?: string
  size?: AvatarSize
  radius?: AvatarRadius
  variant?: AvatarVariant
  color?: AvatarColor
  alt?: string
  onClick?: () => void
  className?: string
  children?: React.ReactNode
}

// 简化的组接口
interface SimpleAvatarGroupProps {
  children: React.ReactNode
  spacing?: string | number
  max?: number
  className?: string
}

// 获取首字母的简化函数
const getInitials = (name: string) => {
  if (!name) return "??"
  const parts = name.split(" ").filter(Boolean)
  if (parts.length === 0) return "??"
  if (parts.length === 1) return parts[0].substring(0, 2)
  return parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
}


// 主Avatar组件
const AvatarRoot = React.forwardRef<HTMLDivElement, SimpleAvatarProps>(
  ({
    src = null,
    name,
    size = "md",
    radius = "sm",
    variant = "filled",
    color = "blue",
    alt = "",
    onClick,
    className,
    children,
    ...props
  }, ref) => {
    // 获取首字母
    const initials = name ? getInitials(name) : "??"
    
    return (
      <MantineAvatar
        ref={ref}
        src={src}
        alt={alt || name || "User avatar"}
        color={color}
        size={size}
        radius={radius}
        className={cn(
          onClick && "cursor-pointer hover:opacity-80 transition-opacity",
          className
        )}
        onClick={onClick}
        variant={variant}
        {...props}
      >
        {children || <Text size="sm" fw={700}>{initials}</Text>}
      </MantineAvatar>
    )
  }
)
AvatarRoot.displayName = "Avatar"

// 简化的Avatar组组件
const AvatarGroup = React.forwardRef<HTMLDivElement, SimpleAvatarGroupProps>(
  ({ children, spacing = "sm", max = 5, className, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children)
    const visibleItems = childrenArray.slice(0, max)
    const overflowCount = childrenArray.length - max

    return (
      <Group
        ref={ref}
        gap={typeof spacing === 'number' ? `${spacing}px` : spacing}
        className={cn("inline-flex", className)}
        {...props}
      >
        {visibleItems}
        {overflowCount > 0 && (
          <Tooltip label={`+${overflowCount} more`}>
            <MantineAvatar size="sm" variant="filled" color="gray" radius="sm">
              +{overflowCount}
            </MantineAvatar>
          </Tooltip>
        )}
      </Group>
    )
  }
)
AvatarGroup.displayName = "AvatarGroup"

// 简化的AvatarImage组件
const AvatarImage = React.forwardRef<HTMLImageElement, React.ComponentPropsWithoutRef<"img">>(
  ({ className, ...props }, ref) => (
    <img
      ref={ref}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  )
)
AvatarImage.displayName = "AvatarImage"

// 简化的AvatarFallback组件
const AvatarFallback = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex h-full w-full items-center justify-center rounded-full bg-gray-100", className)}
      {...props}
    />
  )
)
AvatarFallback.displayName = "AvatarFallback"

// 组合导出 - 保持API兼容性
const Avatar = Object.assign(AvatarRoot, {
  Group: AvatarGroup,
  Image: AvatarImage,
  Fallback: AvatarFallback,
})

// 导出组件
export {
  Avatar as Avatar,
  AvatarRoot,
  AvatarGroup,
  AvatarImage,
  AvatarFallback,
}

// 导出简化的类型
export type {
  SimpleAvatarProps as AvatarProps,
  SimpleAvatarGroupProps as AvatarGroupProps,
  AvatarVariant,
  AvatarSize,
  AvatarRadius,
  AvatarColor,
}
