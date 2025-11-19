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
import { Box } from '@mantine/core'
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
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Box style={{ textAlign: 'center' }}>
          <Box
            style={{
              animation: 'spin 1s linear infinite',
              width: '3rem',
              height: '3rem',
              border: '2px solid transparent',
              borderBottom: `2px solid var(--mantine-color-primary-6)`,
              borderRadius: '50%',
              margin: '0 auto 1rem auto',
            }}
          />
          <p>加载学习历史...</p>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      style={{
        maxWidth: '1536px', // max-w-6xl
        margin: '0 auto',
        padding: '1.5rem',
      }}
    >
      {/* 统计卡片 */}
      {stats && (
        <Box
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: '1fr',
            marginBottom: '2rem',
          }}
        >
          <Box
            style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            }}
          >
            {/* TED 观看数量 */}
            <Card>
              <CardHeader style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                <CardTitle style={{ fontSize: '0.875rem', fontWeight: '500' }}>TED 演讲</CardTitle>
                <BookOpen className="h-4 w-4" style={{ color: 'var(--mantine-color-dimmed)' }} />
              </CardHeader>
              <CardContent>
                <Box style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.total_teds_watched}</Box>
                <Box style={{ fontSize: '0.75rem', color: 'var(--mantine-color-dimmed)' }}>已观看</Box>
              </CardContent>
            </Card>

            {/* 学习记录数量 */}
            <Card>
              <CardHeader style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                <CardTitle style={{ fontSize: '0.875rem', fontWeight: '500' }}>学习记录</CardTitle>
                <TrendingUp className="h-4 w-4" style={{ color: 'var(--mantine-color-dimmed)' }} />
              </CardHeader>
              <CardContent>
                <Box style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.total_records}</Box>
                <Box style={{ fontSize: '0.75rem', color: 'var(--mantine-color-dimmed)' }}>Shadow Writing</Box>
              </CardContent>
            </Card>

            {/* 学习时长 */}
            <Card>
              <CardHeader style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                <CardTitle style={{ fontSize: '0.875rem', fontWeight: '500' }}>学习时长</CardTitle>
                <Clock className="h-4 w-4" style={{ color: 'var(--mantine-color-dimmed)' }} />
              </CardHeader>
              <CardContent>
                <Box style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{learningTime}</Box>
                <Box style={{ fontSize: '0.75rem', color: 'var(--mantine-color-dimmed)' }}>分钟（估算）</Box>
              </CardContent>
            </Card>

            {/* 连续打卡 */}
            <Card>
              <CardHeader style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                <CardTitle style={{ fontSize: '0.875rem', fontWeight: '500' }}>连续打卡</CardTitle>
                <Flame className="h-4 w-4" style={{ color: 'var(--mantine-color-dimmed)' }} />
              </CardHeader>
              <CardContent>
                <Box style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{streakDays}</Box>
                <Box style={{ fontSize: '0.75rem', color: 'var(--mantine-color-dimmed)' }}>天</Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* 搜索和过滤 */}
      <Box style={{ marginBottom: '1.5rem' }}>
        <Input
          placeholder="搜索 TED 标题或原文..."
          value={searchQuery}
          onChange={setSearchQuery}
          style={{ maxWidth: '28rem' }}
        />
      </Box>

      {/* 学习记录列表 */}
      <Box style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>学习记录</h2>

        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent style={{ padding: '2rem 0', textAlign: 'center' }}>
              <p style={{ color: 'var(--mantine-color-dimmed)' }}>还没有学习记录</p>
              <Button
                style={{ marginTop: '1rem' }}
                onClick={() => navigate('/')}
              >
                开始学习
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.record_id} style={{ transition: 'box-shadow 0.2s ease' }}>
              <CardContent style={{ padding: '1.5rem' }}>
                <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <Box style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>{record.ted_title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--mantine-color-dimmed)', marginBottom: '0.5rem' }}>
                      {record.ted_speaker && `演讲者：${record.ted_speaker}`}
                    </p>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: 'var(--mantine-color-dimmed)' }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar className="h-4 w-4" />
                        {new Date(record.learned_at).toLocaleDateString()}
                      </Box>
                      {record.quality_score && (
                        <Badge variant="secondary">
                          质量评分: {record.quality_score}/8
                        </Badge>
                      )}
                    </Box>
                  </Box>
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
                </Box>

                {/* 原文 */}
                <Box style={{ marginBottom: '0.75rem' }}>
                  <h4 style={{ fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.25rem' }}>原文：</h4>
                  <Box style={{ fontSize: '0.875rem', backgroundColor: 'var(--mantine-color-dimmed)', padding: '0.75rem', borderRadius: 'var(--mantine-radius-md)' }}>
                    {record.original}
                  </Box>
                </Box>

                {/* 改写 */}
                <Box style={{ marginBottom: '0.75rem' }}>
                  <h4 style={{ fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Shadow Writing：</h4>
                  <Box style={{ fontSize: '0.875rem', backgroundColor: 'var(--mantine-color-dimmed)', padding: '0.75rem', borderRadius: 'var(--mantine-radius-md)' }}>
                    {record.imitation}
                  </Box>
                </Box>

                {/* 词汇映射 */}
                {record.map && Object.keys(record.map).length > 0 && (
                  <Box>
                    <h4 style={{ fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.5rem' }}>词汇映射：</h4>
                    <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {Object.entries(record.map).map(([category, words]) => (
                        <Badge key={category} variant="outline">
                          {category}: {words.join(', ')}
                        </Badge>
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  )
}

export default HistoryPage