import * as React from "react"
import { Modal as MantineModal, useMantineTheme } from '@mantine/core'
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'
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
    const colors = getSemanticColors(theme)
    const spacing = getSpacing(theme)
    
    // 使用主题圆角系统
    const modalRadius = radius ? theme.radius[radius] : theme.radius.md

    return (
      <MantineModal
        ref={ref}
        opened={opened}
        onClose={onClose}
        title={title}
        size={size}
        radius={modalRadius}
        centered={centered}
        keepMounted={keepMounted}
        className={cn(className)}
        styles={{
          content: {
            backgroundColor: colors.background,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            // 保留硬编码阴影（符合新策略）
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
          header: {
            backgroundColor: colors.surface,
            borderBottom: `1px solid ${colors.border}`,
            color: colors.text,
          },
          body: {
            backgroundColor: colors.background,
            color: colors.text,
          },
          overlay: {
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
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