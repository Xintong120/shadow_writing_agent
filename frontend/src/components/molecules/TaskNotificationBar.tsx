import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTasks } from '@/contexts/TaskContext'

function TaskNotificationBar() {
  const { tasks } = useTasks()
  const navigate = useNavigate()

  // 搜索任务通知
  if (tasks.search?.status === 'searching') {
    return (
      <div
        className="bg-secondary/10 border-b border-secondary/20 px-3 py-2 lg:px-4"
        role="status"
        aria-live="polite"
        aria-label="搜索任务状态"
        aria-atomic="true"
      >
        <div className="flex items-center gap-2">
          <Loader2
            className="animate-spin h-4 w-4 text-secondary shrink-0"
            aria-hidden="true"
          />
          <span className="text-sm truncate">
            正在搜索 "{tasks.search.query}"...
          </span>
          <button
            className="ml-auto text-secondary underline text-sm shrink-0 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
            onClick={() => navigate('/')}
            aria-label="查看搜索详情"
          >
            查看详情
          </button>
        </div>
      </div>
    )
  }

  // 搜索完成通知
  if (tasks.search?.status === 'completed' && !tasks.search.viewed) {
    return (
      <div
        className="bg-accent/10 border-b border-accent/20 px-3 py-2 lg:px-4"
        role="status"
        aria-live="polite"
        aria-label="搜索完成通知"
        aria-atomic="true"
      >
        <div className="flex items-center gap-2">
          <CheckCircle
            className="h-4 w-4 text-accent shrink-0"
            aria-hidden="true"
          />
          <span className="text-sm">
            找到了 {tasks.search.results.length} 个演讲！
          </span>
          <button
            className="ml-auto text-accent underline text-sm shrink-0 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            onClick={() => navigate('/')}
            aria-label="立即查看搜索结果"
          >
            立即查看
          </button>
        </div>
      </div>
    )
  }

  // 批量处理任务通知
  const runningBatch = tasks.batch.find(t => t.status === 'running')
  if (runningBatch) {
    return (
      <div
        className="bg-primary/10 border-b border-primary/20 px-3 py-2 lg:px-4"
        role="status"
        aria-live="polite"
        aria-label="批量处理状态"
        aria-atomic="true"
      >
        <div className="flex items-center gap-2">
          <Loader2
            className="animate-spin h-4 w-4 text-primary shrink-0"
            aria-hidden="true"
          />
          <span className="text-sm">
            正在处理 ({runningBatch.progress}%)
          </span>
          <button
            className="ml-auto text-primary underline text-sm shrink-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            onClick={() => navigate(`/batch/${runningBatch.id}`)}
            aria-label="查看批量处理进度"
          >
            查看进度
          </button>
        </div>
      </div>
    )
  }

  // 批量处理完成通知
  const completedBatch = tasks.batch.find(t => t.status === 'completed' && !t.viewed)
  if (completedBatch) {
    return (
      <div
        className="bg-accent/10 border-b border-accent/20 px-4 py-2"
        role="status"
        aria-live="polite"
        aria-label="批量处理完成通知"
        aria-atomic="true"
      >
        <div className="flex items-center gap-2">
          <CheckCircle
            className="h-4 w-4 text-accent"
            aria-hidden="true"
          />
          <span className="text-sm">处理完成！</span>
          <button
            className="ml-auto text-accent underline text-sm focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            onClick={() => navigate(`/results/${completedBatch.id}`)}
            aria-label="查看批量处理结果"
          >
            查看结果
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default TaskNotificationBar