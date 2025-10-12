import { ShadowWritingResult } from './shadow'
import { TEDCandidate } from './ted'

// API相关类型定义
// 定义API请求/响应类型

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface SearchResponse {
  candidates: TEDCandidate[]
  query: string
  total: number
}

// ============ TED 搜索相关 ============

export interface SearchTEDRequest {
  topic: string
  user_id: string
}

export interface SearchTEDResponse {
  candidates: TEDCandidate[]
  query: string
  total: number
}

// ============ 批量处理相关 ============

export interface StartBatchRequest {
  urls: string[]
  user_id: string
}

export interface StartBatchResponse {
  task_id: string
  total: number
  status: string
}

export interface TaskStatusResponse {
  task_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  current: number
  total: number
  results?: ShadowWritingResult[]
  error?: string
}

// ============ Memory 系统相关 ============

/**
 * 学习记录
 * ✅ 匹配后端 /memory/learning-records 返回格式
 */
export interface LearningRecord {
  record_id: string  // ✅ 后端用 record_id，不是 id
  ted_url: string
  ted_title: string
  ted_speaker?: string
  original: string
  imitation: string  // ✅ 后端用 imitation
  map: Record<string, string[]>  // ✅ 词汇映射字典
  paragraph: string
  quality_score: number  // 质量评分
  learned_at: string  // ISO 8601 时间戳
  tags?: string[]  // 标签列表
}

export interface GetLearningRecordsRequest {
  user_id: string
  limit?: number
  offset?: number
  sort_by?: 'learned_at' | 'learning_time'
  order?: 'asc' | 'desc'
}

/**
 * 获取学习记录响应
 * ✅ 匹配后端 /memory/learning-records/{user_id} 返回格式
 */
export interface GetLearningRecordsResponse {
  user_id: string  // ✅ 后端返回包含 user_id
  total: number
  records: LearningRecord[]
}

/**
 * 学习统计响应
 * ✅ 匹配后端 /memory/stats/{user_id} 返回格式
 * 注意：后端返回嵌套结构
 */
export interface StatsResponse {
  user_id: string
  learning_records: {
    total_records: number
    avg_quality_score: number
    top_tags: string[]  // 热门标签列表
    records_by_ted: Record<string, {
      count: number
      title: string
    }>
    recent_activity?: string
    quality_trend?: Array<{
      learned_at: string
      quality_score: number
    }>
  }
  ted_history: {
    total_watched: number
    watched_urls: string[]
  }
  search_history: {
    total_searches: number
    recent_searches: any[]
  }
}

/**
 * 扁平化的统计数据（用于前端显示）
 */
export interface FlatStats {
  total_records: number
  total_teds_watched: number
  total_searches: number
  avg_quality_score: number
  top_tags: string[]
  recent_activity?: string
}

/**
 * WebSocket 进度消息类型
 * 完整匹配后端 MessageType 枚举
 */
export interface BatchProgressMessage {
  type: 'connected' | 'started' | 'progress' | 'step' |
        'url_completed' | 'error' | 'completed' | 'task_completed'
  taskId?: string
  task_id?: string
  progress?: number
  current?: number  // 当前处理数量
  total?: number    // 总数量
  currentUrl?: string
  url?: string
  result?: ShadowWritingResult
  result_count?: number  // 结果数量
  error?: string
  message?: string
  log?: string
  step?: string  // 处理步骤（如 "extracting_transcript"）
  timestamp?: string
  successful?: number  // 成功数量
  failed?: number  // 失败数量
}

/**
 * WebSocket 回调函数类型
 */
export interface WebSocketCallbacks {
  onConnected?: (data: any) => void
  onProgress?: (data: BatchProgressMessage) => void
  onStep?: (data: BatchProgressMessage) => void
  onUrlCompleted?: (data: BatchProgressMessage) => void
  onCompleted?: (data: BatchProgressMessage) => void
  onError?: (error: string) => void
  onClose?: (code: number, reason: string) => void
}
