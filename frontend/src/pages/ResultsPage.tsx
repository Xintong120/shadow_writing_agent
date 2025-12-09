/**
 * 结果查看页面（卡片翻页式）
 *
 * 功能：
 * - 卡片式翻页浏览 Shadow Writing 结果
 * - 高亮映射词汇替换
 * - 键盘导航快捷键
 * - 显示原文和改写
 * - 质量评分展示
 *
 * ⚠️ 重要：后端返回的分组数据需要前端扁平化
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api, flattenBatchResults } from '@/services/api'
import { CardNavigator } from '@/components/organisms/CardNavigator'
import { ResultHeader } from '@/components/organisms/ResultHeader'
import type { ShadowWritingResult } from '@/types'

function ResultsPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()

  const [results, setResults] = useState<ShadowWritingResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 加载结果数据
  useEffect(() => {
    if (!taskId) return

    const loadResults = async () => {
      try {
        setLoading(true)
        const taskData = await api.getTaskStatus(taskId)

        //！关键：扁平化批量结果
        const flatResults = flattenBatchResults(taskData!)

        setResults(flatResults)

        if (flatResults.length === 0) {
          setError('没有找到学习结果')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败')
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [taskId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>加载学习结果...</p>
        </div>
      </div>
    )
  }

  if (error || results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-destructive mb-4">加载失败</h1>
        <p className="text-muted-foreground mb-4">{error || '没有找到学习结果'}</p>
        <button onClick={() => navigate('/')}>
          返回搜索
        </button>
      </div>
    )
  }

  const tedInfo = results.length > 0 ? {
    title: results[0].tedTitle,
    speaker: results[0].speaker,
    url: '', // ShadowWritingResult 没有 url 字段
  } : { title: '', speaker: '', url: '' }

  return (
    <div className="container mx-auto px-4 py-3 max-w-4xl">
      {/* 使用 ResultHeader 组件 */}
      <ResultHeader
        tedInfo={tedInfo}
        totalCount={results.length}
        onBack={() => navigate('/')}
      />

      {/* 使用 CardNavigator 组件 */}
      <CardNavigator
        results={results}
        tedInfo={tedInfo}
      />
    </div>
  )
}
export default ResultsPage