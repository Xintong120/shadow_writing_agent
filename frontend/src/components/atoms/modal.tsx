import * as React from "react"
import { Modal as MantineModal } from '@mantine/core'
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
    radius = "sm",
    children,
    className,
    centered = true,
    keepMounted = false,
    ...props
  }, ref) => {
    return (
      <MantineModal
        ref={ref}
        opened={opened}
        onClose={onClose}
        title={title}
        size={size}
        radius={radius}
        centered={centered}
        keepMounted={keepMounted}
        className={cn(className)}
        styles={{
          content: {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)', // 添加自定义阴影
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