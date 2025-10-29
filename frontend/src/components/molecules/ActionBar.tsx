/**
 * 操作栏组件
 *
 * 功能：
 * - 导出功能（JSON格式）
 * - 打印功能
 * - 批量操作
 * - 响应式布局
 */

import { Download, Printer, Share2 } from 'lucide-react'
import { Button } from '@/components/atoms/button'

function ActionBar({
  results,
  tedInfo,
  currentIndex,
  onExport,
  onPrint,
  onShare,
  className = '',
  ...props
}) {
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
    <div className={`flex flex-col sm:flex-row gap-3 lg:gap-4 ${className}`} {...props}>
      <Button
        variant="outline"
        onClick={handleExport}
        className="flex-1 sm:flex-none"
      >
        <Download className="h-4 w-4 mr-2" />
        导出全部
      </Button>

      <Button
        variant="outline"
        onClick={handlePrint}
        className="flex-1 sm:flex-none"
      >
        <Printer className="h-4 w-4 mr-2" />
        打印卡片
      </Button>

      <Button
        variant="outline"
        onClick={handleShare}
        className="flex-1 sm:flex-none"
      >
        <Share2 className="h-4 w-4 mr-2" />
        分享
      </Button>
    </div>
  )
}

export default ActionBar