import { TaskItem } from './TaskItem'
import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

/**
 * TaskList - 任务列表容器组件
 * 显示所有TED处理任务，突出显示当前处理的任务
 */

interface Task {
  id: string
  url: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  tedInfo?: {
    title: string
    speaker: string
  }
  resultCount?: number
  error?: string
  title?: string
  speaker?: string
  urls?: string[]
  results?: any[]
}

interface TaskListProps extends Omit<ComponentProps<'div'>, 'children'> {
  tasks?: Task[]
  currentTaskId?: string | null
  className?: string
}

function TaskList({
  tasks = [],
  currentTaskId,
  className,
  ...props
}: TaskListProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>暂无任务</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "space-y-3 max-h-96 overflow-y-auto",
        className
      )}
      {...props}
    >
      {tasks.map((task, index) => (
        <div
          key={task.id || index}
          className={cn(
            "transition-all duration-300",
            // 当前处理的任务高亮显示
            currentTaskId === task.id && task.status === 'processing' && [
              "ring-2 ring-primary ring-offset-2 ring-offset-background",
              "shadow-lg shadow-primary/20"
            ]
          )}
        >
          <TaskItem
            url={task.url || task.urls?.[0] || ''}
            tedInfo={{
              title: task.title || task.tedInfo?.title || '未知标题',
              speaker: task.speaker || task.tedInfo?.speaker || '未知演讲者'
            }}
            status={task.status}
            resultCount={task.resultCount || task.results?.length}
            error={task.error}
          />
        </div>
      ))}
    </div>
  )
}

export { TaskList }
export default TaskList