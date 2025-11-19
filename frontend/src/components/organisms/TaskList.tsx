import { TaskItem } from './TaskItem'
import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'
import { useMantineTheme, Box, Text } from '@mantine/core'
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'

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

interface TaskListProps {
  tasks?: Task[]
  currentTaskId?: string | null
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

function TaskList({
  tasks = [],
  currentTaskId,
  className,
  style,
  ...props
}: TaskListProps) {
  const theme = useMantineTheme()
  const colors = getSemanticColors(theme)
  const spacing = getSpacing(theme)

  if (!tasks || tasks.length === 0) {
    return (
      <Box
        ta="center"
        py="xl"
        style={{
          color: colors.textMuted
        }}
      >
        <Text size="md" style={{ color: colors.textMuted }}>
          暂无任务
        </Text>
      </Box>
    )
  }

  return (
    <Box
      className={cn(className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.sm,
        maxHeight: '384px',
        overflowY: 'auto',
        transition: 'all 0.3s ease',
        ...style
      }}
      {...props}
    >
      {tasks.map((task, index) => {
        const isCurrentTask = currentTaskId === task.id && task.status === 'processing'
        
        return (
          <Box
            key={task.id || index}
            style={{
              transition: 'all 0.3s ease',
              ...(isCurrentTask && {
                border: `2px solid ${colors.primary}`,
                borderRadius: theme.radius.md,
                boxShadow: `0 0 0 2px ${colors.primary}20, 0 10px 15px -3px rgba(0, 0, 0, 0.1)`,
                backgroundColor: colors.surface
              })
            }}
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
          </Box>
        )
      })}
    </Box>
  )
}

export { TaskList }
export default TaskList