/**
 * 分页状态
 */
export interface PaginationState {
  currentPage: number
  totalPages: number
  pageSize: number
}

/**
 * 过滤状态
 */
export interface FilterState {
  searchQuery: string
  sortBy: 'date' | 'title' | 'progress'
  sortOrder: 'asc' | 'desc'
}