/**
 * 轮播图组件：
 * - 支持水平方向轮播
 * - 自定义控制按钮和指示器
 * - 响应式设计
 * - 键盘导航支持
 */

import * as React from "react"
import { Carousel } from '@mantine/carousel'
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useMantineTheme } from '@mantine/core'
import { cn } from "@/lib/utils"
import { Button } from "@/components/atoms/button"
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'

// 简化的类型定义
type CarouselOrientation = "horizontal"
type CarouselSlideGap = "xs" | "sm" | "md" | "lg" | "xl"
type CarouselControlsOffset = "xs" | "sm" | "md" | "lg" | "xl"
type CarouselControlSize = "xs" | "sm" | "md" | "lg" | "xl"

interface CarouselProps {
  orientation?: CarouselOrientation
  slideSize?: string | number
  slideGap?: CarouselSlideGap
  controlsOffset?: CarouselControlsOffset
  controlSize?: CarouselControlSize
  withControls?: boolean
  withIndicators?: boolean
  height?: string | number
  emblaOptions?: any
  children: React.ReactNode
  className?: string
  onNextSlide?: () => void
  onPreviousSlide?: () => void
}

interface CarouselComponent extends React.ForwardRefExoticComponent<CarouselProps & React.RefAttributes<HTMLDivElement>> {
  Slide: typeof Carousel.Slide
}

const SimpleCarousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({
    orientation = "horizontal",
    slideSize = "100%",
    slideGap = "md",
    controlsOffset = "sm",
    controlSize = "md",
    withControls = true,
    withIndicators = true,
    height = 200,
    emblaOptions,
    children,
    className,
    onNextSlide,
    onPreviousSlide,
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)
    const spacing = getSpacing(theme)

    return (
      <Carousel
        ref={ref}
        orientation={orientation}
        slideSize={slideSize}
        slideGap={slideGap}
        controlsOffset={controlsOffset}
        controlSize={controlSize}
        withControls={withControls}
        withIndicators={withIndicators}
        height={height}
        emblaOptions={emblaOptions}
        className={cn(className)}
        nextControlIcon={
          <Button
            variant="subtle"
            size="sm"
            onClick={onNextSlide}
            className="hover:bg-primary/10"
          >
            <ArrowRight size={16} />
          </Button>
        }
        previousControlIcon={
          <Button
            variant="subtle"
            size="sm"
            onClick={onPreviousSlide}
            className="hover:bg-primary/10"
          >
            <ArrowLeft size={16} />
          </Button>
        }
        styles={{
          control: {
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            '&:hover': {
              backgroundColor: colors.primary,
              color: 'white',
            },
          },
          indicator: {
            backgroundColor: colors.border,
            '&[data-active]': {
              backgroundColor: colors.primary,
            },
          },
        }}
        {...props}
      >
        {children}
      </Carousel>
    )
  }
)

SimpleCarousel.displayName = "Carousel"

// 导出 Slide 组件
const Slide = Carousel.Slide

// 创建带有 Slide 属性的组件
const CarouselWithSlide = Object.assign(SimpleCarousel, { Slide })

export { CarouselWithSlide as Carousel, Slide as Slide }
export type { CarouselProps, CarouselOrientation, CarouselSlideGap, CarouselControlsOffset, CarouselControlSize }

// 为了向后兼容，导出原始的 Mantine Carousel.Slide
export { Carousel as MantineCarousel } from '@mantine/carousel'

// 为了向后兼容，也导出为默认导出
export default CarouselWithSlide

