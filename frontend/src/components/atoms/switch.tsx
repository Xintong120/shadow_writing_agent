import * as React from "react"
import { Switch as MantineSwitch, SwitchGroup as MantineSwitchGroup, useMantineTheme } from '@mantine/core'
import { cn } from "@/lib/utils"

// 简化的类型定义
type SwitchSize = "xs" | "sm" | "md" | "lg" | "xl"
type SwitchRadius = "xs" | "sm" | "md" | "lg" | "xl"
type SwitchLabelPosition = "left" | "right"

// 简化的核心接口
interface SimpleSwitchProps {
  size?: SwitchSize
  radius?: SwitchRadius
  color?: string
  id?: string
  offLabel?: React.ReactNode
  onLabel?: React.ReactNode
  thumbIcon?: React.ReactNode
  withThumbIndicator?: boolean
  description?: React.ReactNode
  label?: React.ReactNode
  labelPosition?: SwitchLabelPosition
  disabled?: boolean
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  className?: string
}

// 简化的Switch组接口
interface SimpleSwitchGroupProps {
  children: React.ReactNode
  description?: React.ReactNode
  error?: React.ReactNode
  id?: string
  label?: React.ReactNode
  onChange?: (value: string[]) => void
  readOnly?: boolean
  required?: boolean
  withAsterisk?: boolean
  size?: SwitchSize
  value?: string[]
  className?: string
}

// 主Switch组件
const SwitchRoot = React.forwardRef<HTMLInputElement, SimpleSwitchProps>(
  ({
    size = "md",
    radius,
    color,
    id,
    offLabel,
    onLabel,
    thumbIcon,
    withThumbIndicator,
    description,
    label,
    labelPosition = "right",
    disabled = false,
    checked,
    defaultChecked,
    onChange,
    className,
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    const defaultColor = color || theme.colors.primary[6]
    const defaultRadius = radius || theme.radius.sm

    return (
      <MantineSwitch
        ref={ref}
        size={size}
        radius={defaultRadius}
        color={defaultColor}
        id={id}
        offLabel={offLabel}
        onLabel={onLabel}
        thumbIcon={thumbIcon}
        withThumbIndicator={withThumbIndicator}
        description={description}
        label={label}
        labelPosition={labelPosition}
        disabled={disabled}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange ? (event) => onChange(event.currentTarget.checked) : undefined}
        className={cn(className)}
        {...props}
      />
    )
  }
)
SwitchRoot.displayName = "Switch"

// 简化的Switch组组件
const SwitchGroup = React.forwardRef<HTMLDivElement, SimpleSwitchGroupProps>(
  ({
    children,
    description,
    error,
    id,
    label,
    onChange,
    readOnly = false,
    required = false,
    withAsterisk = false,
    size = "md",
    value,
    className,
    ...props
  }, ref) => {
    return (
      <MantineSwitchGroup
        ref={ref}
        description={description}
        error={error}
        id={id}
        label={label}
        onChange={onChange}
        readOnly={readOnly}
        required={required}
        withAsterisk={withAsterisk}
        size={size}
        value={value}
        className={cn(className)}
        {...props}
      >
        {children}
      </MantineSwitchGroup>
    )
  }
)
SwitchGroup.displayName = "SwitchGroup"

// 组合导出
const Switch = Object.assign(SwitchRoot, {
  Group: SwitchGroup,
})

// 导出组件和类型
export { Switch }
export type {
  SimpleSwitchProps as SwitchProps,
  SimpleSwitchGroupProps as SwitchGroupProps,
  SwitchSize,
  SwitchRadius,
  SwitchLabelPosition,
}
