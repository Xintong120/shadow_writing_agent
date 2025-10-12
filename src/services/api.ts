import { fetchAPI } from './client'
import type {
  SearchTEDResponse,
  StartBatchResponse,
  TaskStatusResponse,
} from '@/types/api'

// ============ TED 搜索相关 ============

export const searchTED = async (
  topic: string,
  userId: string
): Promise<ReturnType<typeof fetchAPI<SearchTEDResponse>>> => {
  return fetchAPI<SearchTEDResponse>('/search-ted', {
    method: 'POST',
    body: JSON.stringify({ topic, user_id: userId }),
  })
}

// ============ 批量处理相关 ============

export const startBatchProcess = async (
  urls: string[],
  userId: string
): Promise<ReturnType<typeof fetchAPI<StartBatchResponse>>> => {
  return fetchAPI<StartBatchResponse>('/process-batch', {
    method: 'POST',
    body: JSON.stringify({ urls, user_id: userId }),
  })
}

export const getTaskStatus = async (
  taskId: string
): Promise<ReturnType<typeof fetchAPI<TaskStatusResponse>>> => {
  return fetchAPI<TaskStatusResponse>(`/task/${taskId}`, {
    method: 'GET',
  })
}

// ============ 健康检查 ============

export const healthCheck = async (): Promise<ReturnType<typeof fetchAPI<{ status: string }>>> => {
  return fetchAPI<{ status: string }>('/health', {
    method: 'GET',
  })
}

// ============ 导出所有API ============

export const api = {
  searchTED,
  startBatchProcess,
  getTaskStatus,
  healthCheck,
}

export default api