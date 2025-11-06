"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"
import { componentSizes } from '@/styles/sizing';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> &
  {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  }
>(({ className, value, size = 'md', ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      // 使用设计系统尺寸
      `relative ${componentSizes.progress.height[size]} w-full overflow-hidden ${componentSizes.progress.radius[size]} bg-primary/20`,
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
