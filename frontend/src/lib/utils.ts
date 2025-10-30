import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// rem转换工具
// 将像素值转换为相对单位（基于16px根字体）
export function rem(value: number): string {
  return `${value / 16}rem`;
}

// em单位转换工具
export function em(value: number): string {
  return `${value / 16}em`;
}
