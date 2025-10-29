// 将 colors.js 中定义的 cssVariables 注入到 document :root
// 这样可以在运行时保证组件能读取到最新的颜色配置
import { cssVariables } from './colors'

function applyCssVariables(vars) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  Object.entries(vars).forEach(([name, value]) => {
    // value 预计是形如 '249 77% 56%' 或 '0.5rem' 的字符串
    root.style.setProperty(`--${name}`, value)
  })
}

applyCssVariables(cssVariables)

// 方便在控制台手动触发（可选）
export { applyCssVariables }
