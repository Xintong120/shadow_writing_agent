import * as React from "react"
import { TextInput, NumberInput as MantineNumberInput, Group, Text, Input as MantineInput, Box } from "@mantine/core"
import { MantineRadius, MantineSize } from "@mantine/core"
import { cn } from "@/lib/utils"

// 增强的类型定义
type InputVariant = "default" | "outline" | "filled"
type InputSize = "sm" | "md" | "lg"
type InputRadius = "xs" | "sm" | "md" | "lg" | "xl"

// 增强的核心接口
interface SimpleInputProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  variant?: InputVariant
  size?: InputSize
  radius?: InputRadius
  withAsterisk?: boolean
}

// 增强的数字输入接口
interface SimpleNumberInputProps {
  label?: string
  placeholder?: string
  value?: number
  onChange?: (value: number) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  variant?: InputVariant
  size?: InputSize
  radius?: InputRadius
  withAsterisk?: boolean
}

// 尺寸映射函数
const getSizeProps = (size: InputSize) => {
  const sizeMap: Record<InputSize, MantineSize> = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  }
  
  return {
    size: sizeMap[size]
  }
}

// 半径映射函数
const getRadiusProps = (radius: InputRadius) => {
  return { radius }
}

// 变体处理函数
const getVariantProps = (variant: InputVariant) => {
  const variants: Record<InputVariant, any> = {
    default: {
      variant: "default" as const
    },
    outline: {
      variant: "outline" as const
    },
    filled: {
      variant: "filled" as const
    }
  }
  
  return variants[variant] || variants.default
}

// 增强的基础输入组件
const InputRoot = React.forwardRef<HTMLInputElement, SimpleInputProps>(
  ({ 
    label, 
    placeholder, 
    value, 
    onChange, 
    onBlur, 
    error, 
    required = false, 
    disabled = false, 
    className, 
    variant = "default",
    size = "md",
    radius = "sm",
    withAsterisk = false,
    ...props 
  }, ref) => {
    const sizeProps = getSizeProps(size)
    const radiusProps = getRadiusProps(radius)
    const variantProps = getVariantProps(variant)
    
    return (
      <MantineInput.Wrapper
        label={label}
        required={required}
        withAsterisk={withAsterisk}
        error={error}
        className={className}
      >
        <TextInput
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          error={!!error}
          {...sizeProps}
          {...radiusProps}
          {...variantProps}
          {...props}
        />
      </MantineInput.Wrapper>
    )
  }
)
InputRoot.displayName = "Input"

// 增强的数字输入组件
const CustomNumberInput = React.forwardRef<HTMLInputElement, SimpleNumberInputProps>(
  ({ 
    label, 
    placeholder, 
    value, 
    onChange, 
    onBlur, 
    error, 
    required = false, 
    disabled = false, 
    className, 
    variant = "default",
    size = "md",
    radius = "sm",
    withAsterisk = false,
    ...props 
  }, ref) => {
    const sizeProps = getSizeProps(size)
    const radiusProps = getRadiusProps(radius)
    const variantProps = getVariantProps(variant)
    
    return (
      <MantineInput.Wrapper
        label={label}
        required={required}
        withAsterisk={withAsterisk}
        error={error}
        className={className}
      >
        <MantineNumberInput
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          error={!!error}
          {...sizeProps}
          {...radiusProps}
          {...variantProps}
          {...props}
        />
      </MantineInput.Wrapper>
    )
  }
)
CustomNumberInput.displayName = "NumberInput"

// 组合导出
const Input = Object.assign(InputRoot, {
  Number: CustomNumberInput,
})

// 导出组件和类型
export { Input }
export type { 
  SimpleInputProps, 
  SimpleNumberInputProps,
  InputVariant,
  InputSize,
  InputRadius
}