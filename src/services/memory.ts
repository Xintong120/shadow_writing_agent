import { fetchAPI } from './client'
import type {
  GetLearningRecordsRequest,
  GetLearningRecordsResponse,
  StatsResponse,
} from '@/types/api'

// ============ Memory 系统相关 ============

export const getLearningRecords = async (
  userId: string,
  filters?: Omit<GetLearningRecordsRequest, 'user_id'>
): Promise<ReturnType<typeof fetchAPI<GetLearningRecordsResponse>>> => {
  const params = new URLSearchParams({
    ...filters,
    limit: String(filters?.limit || 20),
    offset: String(filters?.offset || 0),
  } as any)

  return fetchAPI<GetLearningRecordsResponse>(
    `/memory/learning-records/${userId}?${params}`,
    { method: 'GET' }
  )
}

export const getStats = async (
  userId: string
): Promise<ReturnType<typeof fetchAPI<StatsResponse>>> => {
  return fetchAPI<StatsResponse>(`/memory/stats/${userId}`, {
    method: 'GET',
  })
}

// ============ 导出 Memory API ============

export const memoryApi = {
  getLearningRecords,
  getStats,
}

export default memoryApi