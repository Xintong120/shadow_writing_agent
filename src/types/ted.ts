// TED相关类型定义
export interface TEDInfo {
  title: string
  speaker: string
  url: string
  duration: string      // "12:30"
  views: string         // "1.2M"
  description: string
  relevance_score: number  // 0-1
  thumbnailUrl?: string    // 缩略图URL（可选）
}

export interface TEDCandidate extends TEDInfo {
  reasons: string[]     // 相关性理由
}



