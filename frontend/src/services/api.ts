import { fetchAPI } from './client'
import { handleError } from '@/utils/errorHandler'
import {
  flattenStats,
  generateColors,
  convertMapToHighlightMapping,
  flattenBatchResults,
  calculateLearningTime,
  calculateStreakDays,
} from './transforms'
import type {
  SearchTEDResponse,
  StartBatchResponse,
  TaskStatusResponse,
  StatsResponse,
  FlatStats,
  LearningRecord,
  GetLearningRecordsResponse,
} from '@/types/api'

// ============ TED 搜索相关 ============

export const searchTED = async (
  topic: string,
  userId: string
) => {
  const response = await fetchAPI<SearchTEDResponse>('/search-ted', {
    method: 'POST',
    body: JSON.stringify({ topic, user_id: userId }),
  })

  if (!response.success) {
    handleError(new Error(response.error || '搜索TED失败'), 'searchTED')
    throw new Error(response.error || '搜索TED失败')
  }

  return response.data
}

// ============ 批量处理相关 ============

export const startBatchProcess = async (
  urls: string[],
  userId: string
) => {
  const response = await fetchAPI<StartBatchResponse>('/process-batch', {
    method: 'POST',
    body: JSON.stringify({ urls, user_id: userId }),
  })

  if (!response.success) {
    handleError(new Error(response.error || '启动批量处理失败'), 'startBatchProcess')
    throw new Error(response.error || '启动批量处理失败')
  }

  return response.data
}

export const getTaskStatus = async (
  taskId: string
) => {
  const response = await fetchAPI<TaskStatusResponse>(`/task/${taskId}`, {
    method: 'GET',
  })

  if (!response.success) {
    handleError(new Error(response.error || '获取任务状态失败'), 'getTaskStatus')
    throw new Error(response.error || '获取任务状态失败')
  }

  return response.data
}

// ============ Memory 系统相关 ============

export const getLearningRecords = async (
  userId: string,
  filters?: {
    limit?: number
    offset?: number
    sort_by?: 'learned_at' | 'learning_time'
    order?: 'asc' | 'desc'
  }
): Promise<GetLearningRecordsResponse> => {
  const params = new URLSearchParams({
    ...(filters?.limit && { limit: String(filters.limit) }),
    ...(filters?.offset && { offset: String(filters.offset) }),
    ...(filters?.sort_by && { sort_by: filters.sort_by }),
    ...(filters?.order && { order: filters.order }),
  })

  const response = await fetchAPI<GetLearningRecordsResponse>(
    `/memory/learning-records/${userId}?${params}`,
    { method: 'GET' }
  )

  if (!response.success) {
    handleError(new Error(response.error || '获取学习记录失败'), 'getLearningRecords')
    throw new Error(response.error || '获取学习记录失败')
  }

  return response.data!
}

export const getStats = async (userId: string): Promise<FlatStats> => {
  const response = await fetchAPI<StatsResponse>(`/memory/stats/${userId}`, {
    method: 'GET',
  })

  if (!response.success) {
    handleError(new Error(response.error || '获取统计数据失败'), 'getStats')
    throw new Error(response.error || '获取统计数据失败')
  }

  // ✅ 扁平化统计数据用于前端显示
  return flattenStats(response.data!)
}

// ============ 健康检查 ============

export const healthCheck = async () => {
  const response = await fetchAPI<{ status: string }>('/health', {
    method: 'GET',
  })

  if (!response.success) {
    handleError(new Error(response.error || '健康检查失败'), 'healthCheck')
    throw new Error(response.error || '健康检查失败')
  }

  return response.data
}

// ============ 导出所有API ============

export const api = {
  searchTED,
  startBatchProcess,
  getTaskStatus,
  getLearningRecords,
  getStats,
  healthCheck,
}

// 导出工具函数（用于 ResultsPage 扁平化数据）
export {
  flattenBatchResults,
  convertMapToHighlightMapping,
  generateColors,
  calculateLearningTime,
  calculateStreakDays,
  flattenStats,
}

export default api