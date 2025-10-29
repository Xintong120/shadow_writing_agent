/** @type {import('tailwindcss').Config} */
// 🎨 统一颜色管理系统 - 导入颜色配置
import { brandColors, neutralColors, semanticColors } from './src/styles/colors.js'
// 📏 统一尺寸管理系统 - 导入尺寸配置
import { sizing } from './src/styles/sizing.js'

export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
   	extend: {
   		// 📏 尺寸系统扩展
   		spacing: sizing.spacing,
   		borderRadius: sizing.radius,
   		fontSize: {
   			'xs': '0.75rem',    // 12px
   			'sm': '0.875rem',   // 14px
   			'base': '1rem',     // 16px
   			'lg': '1.125rem',   // 18px
   			'xl': '1.25rem',    // 20px
   			'2xl': '1.5rem',    // 24px
   			'3xl': '1.875rem',  // 30px
   			'4xl': '2.25rem',   // 36px
   		},
   		// 自定义尺寸变量
   		sizing: sizing.base,

   		colors: {
   			// 🎨 品牌色 - 简化为主要色调
   			primary: {
   				DEFAULT: brandColors.primary,
   				foreground: 'hsl(var(--primary-foreground))'
   			},
 				secondary: {
   				DEFAULT: brandColors.secondary,
   				foreground: 'hsl(var(--secondary-foreground))'
 				},
        accent: {
          DEFAULT: brandColors.accent,
          foreground: 'hsl(var(--accent-foreground))'
        },

        // 🎨 功能色
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        error: 'hsl(var(--error))',
        info: 'hsl(var(--info))',

        // 🎨 中性灰阶 - 统一使用
        neutral: neutralColors,

        // 🎨 语义化颜色 - 使用 CSS 变量
   			background: 'hsl(var(--background))',
   			foreground: 'hsl(var(--foreground))',
   			card: {
   				DEFAULT: 'hsl(var(--card))',
   				foreground: 'hsl(var(--card-foreground))'
   			},
   			popover: {
   				DEFAULT: 'hsl(var(--popover))',
   				foreground: 'hsl(var(--popover-foreground))'
   			},
   			muted: {
   				DEFAULT: 'hsl(var(--muted))',
   				foreground: 'hsl(var(--muted-foreground))'
   			},
   			destructive: {
   				DEFAULT: 'hsl(var(--destructive))',
   				foreground: 'hsl(var(--destructive-foreground))'
   			},
   			border: 'hsl(var(--border))',
   			input: 'hsl(var(--input))',
   			ring: 'hsl(var(--ring))',
   		},
 			fontFamily: {
         sans: ['Inter', 'sans-serif'],
       },
   		borderRadius: {
   			lg: 'var(--radius)',
   			md: 'calc(var(--radius) - 2px)',
   			sm: 'calc(var(--radius) - 4px)'
   		}
   	}
  },
  plugins: [require("tailwindcss-animate")],
}
