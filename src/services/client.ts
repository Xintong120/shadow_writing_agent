import type { APIResponse } from '@/types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const IS_DEBUG = import.meta.env.VITE_ENABLE_DEBUG === 'true'

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