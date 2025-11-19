import { useEffect, useRef } from 'react'
import { Button } from '@/components/atoms/button'
import { ScrollArea } from '@/components/atoms/scrollarea'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMantineTheme, Box, Text } from '@mantine/core'
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'

/**
 * LiveLogPanel - 实时日志面板组件
 * 显示WebSocket接收的实时日志信息
 */

interface LogEntry {
  timestamp: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
  step?: string
  log?: string
}

interface LiveLogPanelProps {
  logs?: LogEntry[]
  onClearLogs?: () => void
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

function LiveLogPanel({
  logs = [],
  onClearLogs,
  className,
  style,
  ...props
}: LiveLogPanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const theme = useMantineTheme()
  const colors = getSemanticColors(theme)
  const spacing = getSpacing(theme)

  // 自动滚动到最新日志
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  // 日志类型样式映射
  const getLogStyle = (type: LogEntry['type']): React.CSSProperties => {
    switch (type) {
      case 'error':
        return { color: colors.error }
      case 'success':
        return { color: colors.success }
      case 'warning':
        return { color: colors.warning }
      case 'info':
      default:
        return { color: colors.info }
    }
  }

  // 格式化时间戳
  const formatTimestamp = (timestamp: string | number | Date): string => {
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp).toLocaleTimeString()
    }
    return new Date().toLocaleTimeString()
  }

  // 只显示最近100条日志，防止内存溢出
  const displayLogs = logs.slice(-100)

  return (
    <Box
      className={cn(className)}
      style={{
        backgroundColor: theme.colors.gray[9],
        color: theme.colors.gray[0],
        borderRadius: theme.radius.lg,
        border: `1px solid ${theme.colors.gray[8]}`,
        overflow: 'hidden',
        ...style
      }}
      {...props}
    >
      {/* 标题栏 */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: spacing.sm,
          borderBottom: `1px solid ${theme.colors.gray[8]}`
        }}
      >
        <Text
          size="sm"
          fw={500}
          style={{ color: theme.colors.gray[0] }}
        >
          📋 实时日志
        </Text>
        <Button
          variant="subtle"
          size="sm"
          onClick={onClearLogs}
          disabled={!logs.length}
          style={{
            height: '28px',
            padding: '0 8px',
            color: theme.colors.gray[4],
            backgroundColor: 'transparent'
          }}
          aria-label="清空日志"
        >
          <Trash2 size={12} />
        </Button>
      </Box>

      {/* 日志内容 */}
      <ScrollArea
        ref={scrollAreaRef}
        className="h-48 p-3 font-mono text-xs"
        aria-label="实时日志内容"
        aria-live="polite"
        aria-atomic="false"
      >
        <Box style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.xs,
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
        }}>
          {displayLogs.length === 0 ? (
            <Box
              style={{
                color: theme.colors.gray[5],
                fontStyle: 'italic'
              }}
            >
              暂无日志...
            </Box>
          ) : (
            displayLogs.map((log, index) => (
              <Box
                key={index}
                style={{
                  display: 'flex',
                  gap: spacing.xs,
                  lineHeight: 1.5,
                  ...getLogStyle(log.type)
                }}
              >
                <Text
                  size="xs"
                  style={{
                    color: theme.colors.gray[5],
                    flexShrink: 0
                  }}
                >
                  [{formatTimestamp(log.timestamp)}]
                </Text>
                <Text
                  size="xs"
                  style={{
                    wordBreak: 'break-word'
                  }}
                >
                  {log.message || log.log || ''}
                </Text>
              </Box>
            ))
          )}
        </Box>

        {/* 滚动锚点 */}
        <Box ref={endRef} />
      </ScrollArea>

      {/* 日志数量提示 */}
      {logs.length > 100 && (
        <Box
          style={{
            padding: `${spacing.xs} ${spacing.sm}`,
            backgroundColor: theme.colors.gray[9],
            fontSize: theme.fontSizes.xs,
            color: theme.colors.gray[5],
            borderTop: `1px solid ${theme.colors.gray[8]}`
          }}
        >
          显示最近 100 条，共 {logs.length} 条
        </Box>
      )}
    </Box>
  )
}

export { LiveLogPanel }
export default LiveLogPanel