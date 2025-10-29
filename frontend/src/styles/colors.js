//  统一颜色管理系统
// 修改这里的所有颜色将自动应用到整个应用

// 基础颜色常量
export const baseColors = {
  white: '#FFFFFF',
  black: '#000000',
}

// 品牌颜色
export const brandColors = {
  primary: '#6B46C1',    // 深紫色 - 主色
  secondary: '#0891B2',  // 青蓝色 - 次要色
  accent: '#EA580C',     // 橙色 - 强调色
}

// 中性灰阶颜色
export const neutralColors = {
  50: '#F9FAFB',   // 最浅灰
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',  // 主要文字色
  900: '#111827',  // 最深灰
}

// 功能性颜色
export const functionalColors = {
  success: '#10B981',   // 绿色
  warning: '#F59E0B',   // 黄色
  error: '#EF4444',     // 红色
  info: '#3B82F6',      // 蓝色
}

// 语义化颜色映射 - 应用实际使用
export const semanticColors = {
  // 背景色
  background: baseColors.white,
  surface: neutralColors[50],
  card: baseColors.white,

  // 文字色
  text: neutralColors[800],
  textSecondary: neutralColors[600],
  textMuted: neutralColors[400],

  // 边框色
  border: neutralColors[200],
  borderLight: neutralColors[100],

  // 品牌应用
  brand: brandColors.primary,
  brandSecondary: brandColors.secondary,
  brandAccent: brandColors.accent,

  // 状态色
  success: functionalColors.success,
  warning: functionalColors.warning,
  error: functionalColors.error,
  info: functionalColors.info,
}

// CSS 变量映射 - 用于 :root 定义
export const cssVariables = {
  // 基础
  background: hslToString(hexToHsl(semanticColors.background)),
  foreground: hslToString(hexToHsl(semanticColors.text)),

  // 品牌色
  primary: hslToString(hexToHsl(brandColors.primary)),
  'primary-foreground': hslToString(hexToHsl(baseColors.white)),

  secondary: hslToString(hexToHsl(brandColors.secondary)),
  'secondary-foreground': hslToString(hexToHsl(baseColors.white)),

  accent: hslToString(hexToHsl(brandColors.accent)),
  'accent-foreground': hslToString(hexToHsl(baseColors.white)),

  // 功能色
  success: hslToString(hexToHsl(functionalColors.success)),
  warning: hslToString(hexToHsl(functionalColors.warning)),
  error: hslToString(hexToHsl(functionalColors.error)),
  info: hslToString(hexToHsl(functionalColors.info)),

  // 其他语义色
  card: hslToString(hexToHsl(semanticColors.card)),
  'card-foreground': hslToString(hexToHsl(semanticColors.text)),

  border: hslToString(hexToHsl(semanticColors.border)),
  input: hslToString(hexToHsl(semanticColors.surface)),
  ring: hslToString(hexToHsl(brandColors.primary)),

  muted: hslToString(hexToHsl(neutralColors[100])),
  'muted-foreground': hslToString(hexToHsl(neutralColors[500])),
}

// 工具函数：HEX 转 HSL
function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToString([h, s, l]) {
  // 返回 'H S% L%' 格式，方便作为 CSS 变量直接使用： e.g. hsl(var(--primary))
  return `${h} ${s}% ${l}%`
}

// 默认导出所有颜色配置
export default {
  baseColors,
  brandColors,
  neutralColors,
  functionalColors,
  semanticColors,
  cssVariables,
}