import { Card as MantineCard, Text, useMantineTheme } from '@mantine/core'
import { Button } from '@/components/atoms/button'
import { BookmarkIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useIncompleteTasks } from '@/hooks/useIncompleteTasks'
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'

function ContinueLearningCard() {
  const navigate = useNavigate()
  const incompleteTasks = useIncompleteTasks()
  const theme = useMantineTheme()
  const colors = getSemanticColors(theme)
  const spacing = getSpacing(theme)

  if (!incompleteTasks || incompleteTasks.length === 0) {
    return null // 没有未完成任务时不显示
  }

  return (
    <MantineCard
      className="mb-6"
      style={{
        borderColor: `${colors.primary}33`, // primary/20
        backgroundColor: `${colors.primary}0D`, // primary/5
        border: `1px solid ${colors.primary}33`,
      }}
    >
      {/* Card Header */}
      <MantineCard.Section
        style={{
          padding: `${spacing.md} ${spacing.lg}`,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center gap-2">
          <BookmarkIcon className="h-5 w-5" style={{ color: colors.primary }} />
          <Text
            size="lg"
            fw={600}
            style={{ color: colors.text }}
          >
            继续学习
          </Text>
        </div>
      </MantineCard.Section>

      {/* Card Content */}
      <div style={{ padding: `${spacing.md} ${spacing.lg}` }}>
        {incompleteTasks.map(task => (
          <div key={task.id} className="flex items-center justify-between mb-3 last:mb-0">
            <div>
              <Text fw={500} style={{ color: colors.text }}>
                {task.title}
              </Text>
              <Text size="sm" style={{ color: colors.textMuted }}>
                进度：{task.current}/{task.total} ({Math.round(task.current/task.total*100)}%)
              </Text>
              <Text size="xs" style={{ color: colors.textMuted }}>
                最后学习：{new Date(task.lastViewedAt).toLocaleString()}
              </Text>
            </div>
            <Button
              onClick={() => navigate(`/results/${task.id}?start=${task.current}`)}>
              继续学习 →
            </Button>
          </div>
        ))}
      </div>
    </MantineCard>
  )
}

export default ContinueLearningCard