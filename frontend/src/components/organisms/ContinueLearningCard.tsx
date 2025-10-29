import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { BookmarkIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useIncompleteTasks } from '@/hooks/useIncompleteTasks'

function ContinueLearningCard() {
  const navigate = useNavigate()
  const incompleteTasks = useIncompleteTasks()

  if (!incompleteTasks || incompleteTasks.length === 0) {
    return null // 没有未完成任务时不显示
  }

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookmarkIcon className="h-5 w-5 text-primary" />
          继续学习
        </CardTitle>
      </CardHeader>
      <CardContent>
        {incompleteTasks.map(task => (
          <div key={task.id} className="flex items-center justify-between mb-3 last:mb-0">
            <div>
              <p className="font-medium">{task.title}</p>
              <p className="text-sm text-muted-foreground">
                进度：{task.current}/{task.total} ({Math.round(task.current/task.total*100)}%)
              </p>
              <p className="text-xs text-muted-foreground">
                最后学习：{new Date(task.lastViewedAt).toLocaleString()}
              </p>
            </div>
            <Button
              onClick={() => navigate(`/results/${task.id}?start=${task.current}`)}>
              继续学习 →
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default ContinueLearningCard