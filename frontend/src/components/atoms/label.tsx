import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  // 源代码："text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  // 改进：移除硬编码尺寸 text-sm，添加尺寸和颜色变体
  "font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      size: {
        sm: "text-sm",      // 14px
        md: "text-base",    // 16px (默认)
        lg: "text-lg",      // 18px
      },
      color: {
        default: "text-foreground",           // 主要文字色
        secondary: "text-muted-foreground",   // 次要文字色
        accent: "text-accent-foreground",     // 强调色
      }
    },
    defaultVariants: {
      size: "md",
      color: "default",
    },
  }
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, size, color, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ size, color }), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
