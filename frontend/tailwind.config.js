/** @type {import('tailwindcss').Config} */
// Unified color management system - Import color configuration
import { brandColors, neutralColors, semanticColors } from './src/styles/colors.js'
// Unified sizing management system - Import sizing configuration
import { sizing } from './src/styles/sizing.js'

export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Sizing system extension
      spacing: sizing.spacing,
      borderRadius: sizing.radius,
      fontSize: sizing.fontSizes,
      lineHeight: sizing.lineHeights,
      boxShadow: sizing.shadows,
      screens: sizing.breakpoints,
      // Custom sizing variables
      sizing: sizing.base,

   		colors: {
   		  // Brand colors - Simplified to main colors
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

   		  // Functional colors
   		  success: 'hsl(var(--success))',
   		  warning: 'hsl(var(--warning))',
   		  error: 'hsl(var(--error))',
   		  info: 'hsl(var(--info))',

   		  // Neutral grayscale - Unified usage
   		  neutral: neutralColors,

   		  // Semantic colors - Using CSS variables
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
