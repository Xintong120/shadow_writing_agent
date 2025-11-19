import * as React from "react"
import { TextInput, NumberInput as MantineNumberInput, Group, Text, Input as MantineInput, Box, useMantineTheme } from "@mantine/core"
import { MantineRadius } from "@mantine/core"
import { getSemanticColors, getSpacing, getResponsiveProps } from "@/theme/mantine-theme"
import { cn } from "@/lib/utils"

// 增强的类型定义
type InputVariant = "default" | "outline" | "filled"
type InputSize = "xs" | "sm" | "md" | "lg" | "xl"
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
  id?: string
  name?: string
  defaultValue?: string
  type?: string
  withAsterisk?: boolean
  responsive?: boolean
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
  responsive?: boolean
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
    radius,
    withAsterisk = false,
    responsive = true,
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)
    const spacing = getSpacing(theme)
    const responsiveProps = getResponsiveProps(theme)
    
    // 使用主题圆角系统
    const inputRadius = radius ? theme.radius[radius] : theme.radius.sm

    return (
      <MantineInput.Wrapper
        label={label}
        required={required}
        withAsterisk={withAsterisk}
        error={error}
        className={cn(className)}
        style={responsive ? responsiveProps.stackOnMobile : undefined}
        styles={{
          label: {
            color: colors.text,
            fontSize: theme.fontSizes.sm,
            lineHeight: theme.lineHeights.sm,
            fontWeight: 500,
            marginBottom: spacing.xs,
          },
          description: {
            color: colors.textSecondary,
            fontSize: theme.fontSizes.xs,
            lineHeight: theme.lineHeights.sm,
            marginBottom: spacing.xs,
          },
          error: {
            color: colors.error,
            fontSize: theme.fontSizes.xs,
            lineHeight: theme.lineHeights.sm,
            marginTop: spacing.xs,
          },
        }}
      >
        <TextInput
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          error={!!error}
          size={size}
          radius={inputRadius}
          variant={variant}
          styles={{
            input: {
              backgroundColor: colors.background,
              color: colors.text,
              border: `1px solid ${error ? colors.error : colors.border}`,
              fontSize: theme.fontSizes.md,
              lineHeight: theme.lineHeights.md,
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: theme.radius.sm,
              transition: 'all 200ms ease',
              
              '&::placeholder': {
                color: colors.textMuted,
              },
              
              '&:focus': {
                borderColor: error ? colors.error : colors.borderFocus,
                outline: 'none',
              },
              
              '&[data-error]': {
                borderColor: colors.error,
              },
              
              '&[data-disabled]': {
                backgroundColor: colors.surface,
                color: colors.textDisabled,
                cursor: 'not-allowed',
              }
            },
          }}
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
    radius,
    withAsterisk = false,
    responsive = true,
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)
    const spacing = getSpacing(theme)
    const responsiveProps = getResponsiveProps(theme)
    
    // 使用主题圆角系统
    const inputRadius = radius ? theme.radius[radius] : theme.radius.sm

    return (
      <MantineInput.Wrapper
        label={label}
        required={required}
        withAsterisk={withAsterisk}
        error={error}
        className={cn(className)}
        style={responsive ? responsiveProps.stackOnMobile : undefined}
        styles={{
          label: {
            color: colors.text,
            fontSize: theme.fontSizes.sm,
            lineHeight: theme.lineHeights.sm,
            fontWeight: 500,
            marginBottom: spacing.xs,
          },
          description: {
            color: colors.textSecondary,
            fontSize: theme.fontSizes.xs,
            lineHeight: theme.lineHeights.sm,
            marginBottom: spacing.xs,
          },
          error: {
            color: colors.error,
            fontSize: theme.fontSizes.xs,
            lineHeight: theme.lineHeights.sm,
            marginTop: spacing.xs,
          },
        }}
      >
        <MantineNumberInput
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          error={!!error}
          size={size}
          radius={inputRadius}
          variant={variant}
          styles={{
            input: {
              backgroundColor: colors.background,
              color: colors.text,
              border: `1px solid ${error ? colors.error : colors.border}`,
              fontSize: theme.fontSizes.md,
              lineHeight: theme.lineHeights.md,
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: theme.radius.sm,
              transition: 'all 200ms ease',
              
              '&::placeholder': {
                color: colors.textMuted,
              },
              
              '&:focus': {
                borderColor: error ? colors.error : colors.borderFocus,
                outline: 'none',
              },
              
              '&[data-error]': {
                borderColor: colors.error,
              },
              
              '&[data-disabled]': {
                backgroundColor: colors.surface,
                color: colors.textDisabled,
                cursor: 'not-allowed',
              }
            },
            controls: {
              '& button': {
                color: colors.textSecondary,
                
                '&:hover': {
                  backgroundColor: colors.surfaceHover,
                }
              }
            }
          }}
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