/**
 * 学习统计摘要组件
 *
 * 功能：
 * - 显示学习统计数据（TED数量、学习记录、时长、打卡天数）
 * - 响应式网格布局
 * - 图标和视觉化
 */

import { BookOpen, TrendingUp, Clock, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function StatsSummary({
  stats,
  className = '',
  ...props
}) {
  const statItems = [
    {
      title: 'TED 演讲',
      value: stats?.total_teds_watched || 0,
      description: '已观看',
      icon: BookOpen,
      color: 'text-blue-600',
    },
    {
      title: '学习记录',
      value: stats?.total_records || 0,
      description: 'Shadow Writing',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: '学习时长',
      value: stats?.learning_time || 0,
      description: '分钟（估算）',
      icon: Clock,
      color: 'text-purple-600',
    },
    {
      title: '连续打卡',
      value: stats?.streak_days || 0,
      description: '天',
      icon: Flame,
      color: 'text-orange-600',
    },
  ]

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`} {...props}>
      {statItems.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {item.title}
            </CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {item.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default StatsSummary