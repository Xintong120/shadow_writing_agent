/**
 * 历史记录项组件
 *
 * 功能：
 * - 显示单个学习记录
 * - 原文和改写内容
 * - 质量评分和时间信息
 * - 词汇映射显示
 * - 响应式布局
 */

import { Calendar, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function HistoryItem({
  record,
  onViewDetails,
  className = '',
  ...props
}) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`} {...props}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-1 truncate">
              {record.ted_title}
            </h3>
            {record.ted_speaker && (
              <p className="text-sm text-muted-foreground mb-2">
                {record.ted_speaker}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(record.learned_at)}
              </div>
              {record.quality_score && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Badge variant="secondary" className="text-xs">
                    {record.quality_score}/8
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(record)}
              className="shrink-0 ml-4"
            >
              查看详情
            </Button>
          )}
        </div>

        {/* 原文 */}
        <div className="mb-3">
          <h4 className="font-medium text-sm mb-1">原文：</h4>
          <p className="text-sm bg-muted/50 p-3 rounded-md line-clamp-2">
            {record.original}
          </p>
        </div>

        {/* 改写 */}
        <div className="mb-3">
          <h4 className="font-medium text-sm mb-1">Shadow Writing：</h4>
          <p className="text-sm bg-muted/50 p-3 rounded-md line-clamp-2">
            {record.imitation}
          </p>
        </div>

        {/* 词汇映射 */}
        {record.map && Object.keys(record.map).length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">词汇映射：</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(record.map).map(([category, words]) => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category}: {words.join(', ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default HistoryItem