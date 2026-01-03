import type { APIResponse } from '@/types'

// 获取环境变量 - 兼容 Vite (import.meta.env) 和 Jest (process.env)
function getEnv(key: string, defaultValue: string): string {
  // Node.js / Jest 环境
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue
  }
  return defaultValue
}

const API_BASE = getEnv('VITE_API_BASE_URL', 'http://localhost:8000')
const IS_DEBUG = getEnv('VITE_ENABLE_DEBUG', 'false') === 'true'

/**
 * HTTP客户端基础 - 通用请求处理函数
 */
export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<APIResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '请求失败' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    if (IS_DEBUG) console.error('API Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }
  }
}
