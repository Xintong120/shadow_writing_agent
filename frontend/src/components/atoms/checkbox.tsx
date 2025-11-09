import * as React from "react"
import { Checkbox as MantineCheckbox, Box, Text, Group } from '@mantine/core'
import { MantineSize } from '@mantine/core'
import { cn } from "@/lib/utils"

// 简化的类型定义
type CheckboxSize = "xs" | "sm" | "md" | "lg" | "xl"

// 简化的核心接口
interface SimpleCheckboxProps {
  label?: string
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  color?: string
  size?: CheckboxSize
  indeterminate?: boolean
  className?: string
}

// 简化的复选框组接口
interface SimpleCheckboxGroupProps {
  children: React.ReactNode
  value?: string[]
  onChange?: (value: string[]) => void
  spacing?: MantineSize | number
  orientation?: "horizontal" | "vertical"
  className?: string
}

// 简化的复选框项接口
interface SimpleCheckboxItemProps {
  value: string
  label: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  color?: string
  size?: CheckboxSize
  className?: string
}


// 简化的Checkbox组件
const CheckboxRoot = React.forwardRef<HTMLInputElement, SimpleCheckboxProps>(
  ({
    label,
    checked,
    defaultChecked,
    onChange,
    disabled = false,
    color = "blue",
    size = "md",
    indeterminate = false,
    className,
    ...props
  }, ref) => {
    return (
      <Box className={cn("flex items-center", className)}>
        <Group gap="xs" wrap="nowrap" align="center">
          <MantineCheckbox
            ref={ref}
            color={color}
            disabled={disabled}
            checked={checked}
            defaultChecked={defaultChecked}
            indeterminate={indeterminate}
            onChange={(event) => onChange?.(event.currentTarget.checked)}
            size={size}
            {...props}
          />
          {label && (
            <Text
              size={size}
              style={{
                color: disabled ? 'var(--mantine-color-gray-5)' : 'var(--mantine-color-gray-7)',
                cursor: disabled ? 'not-allowed' : 'default',
              }}
            >
              {label}
            </Text>
          )}
        </Group>
      </Box>
    )
  }
)
CheckboxRoot.displayName = "Checkbox"

// 简化的Checkbox组组件
const CheckboxGroup = React.forwardRef<HTMLDivElement, SimpleCheckboxGroupProps>(
  ({ 
    children, 
    value, 
    onChange, 
    spacing = "sm", 
    orientation = "horizontal",
    className,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value || [])
    
    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value)
      }
    }, [value])
    
    const handleItemChange = (itemValue: string, checked: boolean) => {
      let newValue: string[]
      
      if (checked) {
        newValue = [...internalValue, itemValue]
      } else {
        newValue = internalValue.filter(v => v !== itemValue)
      }
      
      setInternalValue(newValue)
      onChange?.(newValue)
    }
    
    const enhancedChildren = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          ...child.props,
          checked: internalValue.includes(child.props.value),
          onChange: (checked: boolean) => handleItemChange(child.props.value, checked)
        })
      }
      return child
    })
    
    return (
      <Box
        ref={ref}
        className={cn(
          "flex",
          orientation === "vertical" ? "flex-col" : "flex-row",
          className
        )}
        style={{
          gap: typeof spacing === 'number' ? `${spacing}px` : spacing,
        }}
        {...props}
      >
        {enhancedChildren}
      </Box>
    )
  }
)
CheckboxGroup.displayName = "CheckboxGroup"

// 简化的Checkbox项组件
const CheckboxItem = React.forwardRef<HTMLInputElement, SimpleCheckboxItemProps>(
  ({ 
    value,
    label,
    checked,
    onChange,
    disabled = false,
    color = "blue",
    size = "md",
    className,
    ...props 
  }, ref) => {
    return (
      <CheckboxRoot
        ref={ref}
        label={label}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        color={color}
        size={size}
        className={className}
        {...props}
      />
    )
  }
)
CheckboxItem.displayName = "CheckboxItem"

// 简化的Checkbox开关组件
const CheckboxSwitch = React.forwardRef<HTMLInputElement, SimpleCheckboxProps>(
  ({ 
    checked = false,
    onChange,
    size = "md",
    color = "blue",
    disabled = false,
    ...props 
  }, ref) => {
    return (
      <MantineCheckbox
        ref={ref}
        color={color}
        disabled={disabled}
        checked={checked}
        onChange={(event) => onChange?.(event.currentTarget.checked)}
        className="checkbox-switch"
        style={{
          backgroundColor: checked ? `var(--mantine-color-${color}-6)` : 'var(--mantine-color-gray-3)',
          width: size === "sm" ? 32 : size === "md" ? 36 : 40,
          height: size === "sm" ? 18 : size === "md" ? 20 : 22,
          borderRadius: 9999,
          padding: 0,
        }}
        {...props}
      />
    )
  }
)
CheckboxSwitch.displayName = "CheckboxSwitch"

// 组合导出
const Checkbox = Object.assign(CheckboxRoot, {
  Group: CheckboxGroup,
  Item: CheckboxItem,
  Switch: CheckboxSwitch,
})

// 导出组件和类型
export { Checkbox }
export type { 
  SimpleCheckboxProps as CheckboxProps,
  SimpleCheckboxGroupProps as CheckboxGroupProps,
  SimpleCheckboxItemProps as CheckboxItemProps,
  CheckboxSize
}
