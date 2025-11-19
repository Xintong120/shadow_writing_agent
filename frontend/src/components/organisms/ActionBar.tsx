/**
 * 操作栏组件：
 * - 导出功能（JSON格式）
 * - 打印功能
 * - 批量操作
 * - 响应式布局
 */

import * as React from "react"
import { Group, useMantineTheme } from '@mantine/core'
import { cn } from "@/lib/utils"
import { Button } from '@/components/atoms/button'
import { Download, Printer, Share2 } from 'lucide-react'
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'

// 简化的类型定义
interface ActionBarProps {
  results: any[]
  tedInfo: {
    title?: string
    [key: string]: any
  }
  currentIndex: number
  onExport?: (results: any[], tedInfo: any) => void
  onPrint?: (currentResult: any, tedInfo: any) => void
  onShare?: (currentResult: any, tedInfo: any) => void
  className?: string
}

const ActionBar = React.forwardRef<HTMLDivElement, ActionBarProps>(
  ({
    results,
    tedInfo,
    currentIndex,
    onExport,
    onPrint,
    onShare,
    className,
    ...props
  }, ref) => {
    const theme = useMantineTheme()
    const colors = getSemanticColors(theme)
    const spacing = getSpacing(theme)
    const currentResult = results[currentIndex]

    const handleExport = () => {
      if (onExport) {
        onExport(results, tedInfo)
      } else {
        // 默认导出逻辑
        const exportData = {
          tedInfo,
          results,
          exportedAt: new Date().toISOString(),
          totalCount: results.length,
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        })

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${tedInfo.title || 'shadow-writing'}-results.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    }

    const handlePrint = () => {
      if (onPrint) {
        onPrint(currentResult, tedInfo)
      } else {
        // 默认打印逻辑
        window.print()
      }
    }

    const handleShare = () => {
      if (onShare) {
        onShare(currentResult, tedInfo)
      } else {
        // 默认分享逻辑
        const shareText = `我在学习 TED: ${tedInfo.title} 的 Shadow Writing\n${currentResult.original}`
        if (navigator.share) {
          navigator.share({
            title: `Shadow Writing: ${tedInfo.title}`,
            text: shareText,
          })
        } else {
          navigator.clipboard.writeText(shareText)
          // 这里可以显示复制成功的提示
        }
      }
    }

    return (
      <Group
        ref={ref}
        gap={spacing.md}
        className={cn("flex-col sm:flex-row", className)}
        {...props}
      >
        <Button
          variant="outline"
          onClick={handleExport}
          className="flex-1 sm:flex-none"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs,
          }}
        >
          <Download style={{ height: '1rem', width: '1rem' }} />
          导出全部
        </Button>

        <Button
          variant="outline"
          onClick={handlePrint}
          className="flex-1 sm:flex-none"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs,
          }}
        >
          <Printer style={{ height: '1rem', width: '1rem' }} />
          打印卡片
        </Button>

        <Button
          variant="outline"
          onClick={handleShare}
          className="flex-1 sm:flex-none"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs,
          }}
        >
          <Share2 style={{ height: '1rem', width: '1rem' }} />
          分享
        </Button>
      </Group>
    )
  }
)

ActionBar.displayName = "ActionBar"

export { ActionBar }
export default ActionBar