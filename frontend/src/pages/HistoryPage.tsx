/**
 * 学习历史页面
 *
 * 功能：
 * - 显示学习统计数据
 * - 浏览历史学习记录
 * - 搜索和过滤功能
 * - 连续打卡天数显示
 *
 * ⚠️ 重要：后端不提供的一些数据需要前端计算
 * - 学习时长：按每条记录2分钟估算
 * - 连续打卡天数：根据learned_at时间戳计算
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, BookOpen, TrendingUp, Flame } from 'lucide-react'
import { api, flattenStats, calculateLearningTime, calculateStreakDays } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import type { FlatStats, LearningRecord } from '@/types/api'

function HistoryPage() {
  const navigate = useNavigate()

  const [stats, setStats] = useState<FlatStats | null>(null)
  const [records, setRecords] = useState<LearningRecord[]>([])
  const [learningTime, setLearningTime] = useState(0)
  const [streakDays, setStreakDays] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        const userId = 'user_123' // 临时使用固定用户ID

        // 并行请求统计和记录
        const [statsRes, recordsRes] = await Promise.all([
          api.getStats(userId),
          api.getLearningRecords(userId, { limit: 50 })
        ])

        setStats(statsRes)
        setRecords(recordsRes.records || [])

        // 前端计算缺失的数据
        const time = calculateLearningTime(recordsRes.records || [])
        const streak = calculateStreakDays(recordsRes.records?.map(r => r.learned_at) || [])

        setLearningTime(time)
        setStreakDays(streak)

      } catch (error) {
        console.error('加载历史数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // 过滤记录
  const filteredRecords = records.filter(record =>
    record.ted_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.original.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>加载学习历史...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">学习历史</h1>
        <p className="text-muted-foreground">回顾你的英语学习旅程</p>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* TED 观看数量 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">TED 演讲</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_teds_watched}</div>
              <p className="text-xs text-muted-foreground">已观看</p>
            </CardContent>
          </Card>

          {/* 学习记录数量 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">学习记录</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_records}</div>
              <p className="text-xs text-muted-foreground">Shadow Writing</p>
            </CardContent>
          </Card>

          {/* 学习时长 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">学习时长</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{learningTime}</div>
              <p className="text-xs text-muted-foreground">分钟（估算）</p>
            </CardContent>
          </Card>

          {/* 连续打卡 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">连续打卡</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streakDays}</div>
              <p className="text-xs text-muted-foreground">天</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 搜索和过滤 */}
      <div className="mb-6">
        <Input
          placeholder="搜索 TED 标题或原文..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* 学习记录列表 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">学习记录</h2>

        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">还没有学习记录</p>
              <Button
                className="mt-4"
                onClick={() => navigate('/')}
              >
                开始学习
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.record_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{record.ted_title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {record.ted_speaker && `演讲者：${record.ted_speaker}`}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(record.learned_at).toLocaleDateString()}
                      </div>
                      {record.quality_score && (
                        <Badge variant="secondary">
                          质量评分: {record.quality_score}/8
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // 这里可以跳转到详情页面，如果有的话
                      console.log('查看详情:', record.record_id)
                    }}
                  >
                    查看详情
                  </Button>
                </div>

                {/* 原文 */}
                <div className="mb-3">
                  <h4 className="font-medium text-sm mb-1">原文：</h4>
                  <p className="text-sm bg-muted p-3 rounded-md">{record.original}</p>
                </div>

                {/* 改写 */}
                <div className="mb-3">
                  <h4 className="font-medium text-sm mb-1">Shadow Writing：</h4>
                  <p className="text-sm bg-muted p-3 rounded-md">{record.imitation}</p>
                </div>

                {/* 词汇映射 */}
                {record.map && Object.keys(record.map).length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">词汇映射：</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(record.map).map(([category, words]) => (
                        <Badge key={category} variant="outline">
                          {category}: {words.join(', ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default HistoryPage