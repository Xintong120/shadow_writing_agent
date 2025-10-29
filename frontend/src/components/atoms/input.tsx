import * as React from "react"
import { cn } from "@/lib/utils"
// 新增：导入设计系统尺寸
import { componentSizes } from "@/styles/sizing"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // 源代码："flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          // 改进：移除硬编码尺寸，使用设计系统尺寸
          "flex w-full rounded-md border border-input bg-transparent shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          // 使用设计系统尺寸替代硬编码值
          componentSizes.input.md.height,     // 替代 h-9 (36px -> 44px)
          componentSizes.input.md.padding,    // 替代 px-3 py-1 (12px 4px -> 16px)
          `text-${componentSizes.input.md.fontSize}`, // 替代 text-base md:text-sm (16px)
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
