import * as React from "react"
import { Modal as MantineModal, useMantineTheme } from '@mantine/core'
import { cn } from "@/lib/utils"

// 简化的类型定义
type ModalSize = "xs" | "sm" | "md" | "lg" | "xl"
type ModalRadius = "xs" | "sm" | "md" | "lg" | "xl"

// 简化的核心接口
interface SimpleModalProps {
  opened: boolean
  onClose: () => void
  title?: React.ReactNode
  size?: ModalSize
  radius?: ModalRadius
  children?: React.ReactNode
  className?: string
  centered?: boolean
  keepMounted?: boolean
}

// 主Modal组件
const Modal = React.forwardRef<HTMLDivElement, SimpleModalProps>(
  ({
    opened,
    onClose,
    title,
    size = "md",
    radius,
    children,
    className,
    centered = true,
    keepMounted = false,
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    const defaultRadius = radius || theme.radius.sm

    return (
      <MantineModal
        ref={ref}
        opened={opened}
        onClose={onClose}
        title={title}
        size={size}
        radius={defaultRadius}
        centered={centered}
        keepMounted={keepMounted}
        className={cn(className)}
        styles={{
          content: {
            boxShadow: theme.shadows.md, // 使用主题阴影
          }
        }}
        {...props}
      >
        {children}
      </MantineModal>
    )
  }
)
Modal.displayName = "Modal"

// 导出组件和类型
export { Modal }
export type {
  SimpleModalProps as ModalProps,
  ModalSize,
  ModalRadius
}