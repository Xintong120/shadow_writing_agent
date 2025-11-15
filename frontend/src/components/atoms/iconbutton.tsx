import * as React from "react"
import { Loader2 } from 'lucide-react'
import { cn } from "@/lib/utils"

// 类型定义
type IconButtonSize = "sm" | "md" | "lg"

interface IconButtonProps {
  icon: React.ReactNode
  size?: IconButtonSize
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
  "aria-label"?: string
}

// 尺寸配置
const sizeConfig = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12"
}

// 图标尺寸配置
const iconSizeConfig = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6"
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({
    icon,
    size = "md",
    loading = false,
    disabled = false,
    onClick,
    className,
    "aria-label": ariaLabel,
    ...props
  }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          sizeConfig[size],
          "inline-flex items-center justify-center rounded-lg transition-all duration-200",
          "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
          (disabled || loading) && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={disabled || loading ? undefined : onClick}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        {...props}
      >
        {loading ? (
          <Loader2 className={cn(iconSizeConfig[size], "animate-spin text-gray-600")} />
        ) : (
          <span className="flex items-center justify-center w-full h-full">
            {React.cloneElement(icon as React.ReactElement, {
              className: cn(iconSizeConfig[size], (icon as any).props?.className)
            })}
          </span>
        )}
      </button>
    )
  }
)

IconButton.displayName = "IconButton"

export { IconButton }
export type { IconButtonProps, IconButtonSize }