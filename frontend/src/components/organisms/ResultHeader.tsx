/**
 * 结果页面头部组件
 *
 * 功能：
 * - 显示 TED 演讲标题和演讲者
 * - 显示结果总数
 * - 提供返回按钮
 * - 响应式布局
 */

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Text, useMantineTheme } from '@mantine/core'
import { getSemanticColors, getSpacing } from '@/theme/mantine-theme'

function ResultHeader({
  tedInfo,
  totalCount,
  currentIndex,
  onBack,
  className = '',
  ...props
}) {
  const theme = useMantineTheme()
  const colors = getSemanticColors(theme)
  const spacing = getSpacing(theme)
  const displayIndex = currentIndex !== undefined ? currentIndex + 1 : null

  return (
    <div className={`flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-0 ${className}`} {...props}>
      {/* TED 信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回搜索
          </Button>
          <Text
            size="xl"
            fw={700}
            style={{ color: colors.primary }}
            className="truncate"
          >
            Shadow Writing 学习卡片
          </Text>
        </div>

        {/* TED 标题和演讲者 */}
        {tedInfo.title && (
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <svg data-t="1765286554527" className="icon flex-shrink-0" viewBox="0 0 1192 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" data-p-id="15874" width="16" height="16"><path d="M1192.824929 1024l-53.370243-13.689467a1076.437771 1076.437771 0 0 0-524.682858-2.268236l-1.080748 0.293537c-6.257661 1.761218-25.350865 7.111585-43.40335-6.591225a45.48479 45.48479 0 0 1-17.825661-36.6787v-0.120083a42.696194 42.696194 0 0 1 42.696195-42.696194 43.163184 43.163184 0 0 1 8.138962 0.773868A1162.750797 1162.750797 0 0 1 1107.43254 915.25813V111.315476a1076.597882 1076.597882 0 0 0-469.524712 0v647.594528a42.696194 42.696194 0 0 1-85.392389 0V44.549303l32.022146-8.23236a1161.36317 1161.36317 0 0 1 576.265198-0.013343l32.022146 8.23236z" fill="" data-p-id="15875"></path><path d="M0 1024V44.549303l32.022146-8.23236A1146.953205 1146.953205 0 0 1 449.911148 7.670465a42.696194 42.696194 0 1 1-9.753412 84.832001A1061.881038 1061.881038 0 0 0 85.392389 111.302134v803.969339a1155.78598 1155.78598 0 0 1 510.192836 10.00692c1.734533 0.426962 3.215557 0.813896 4.456416 1.160803a42.77625 42.77625 0 0 1 19.827045 76.506243c-11.381204 8.605952-24.977274 10.754104-40.401274 6.404429-1.214173-0.346907-2.588457-0.733841-4.469758-1.20083A1069.619723 1069.619723 0 0 0 53.370243 1010.310533z m551.488062-55.38497z" fill="" data-p-id="15876"></path></svg>
              <Text
                size="lg"
                fw={600}
                style={{ color: colors.text }}
                className="truncate"
              >
                {tedInfo.title}
              </Text>
            </div>
            {tedInfo.speaker && (
              <Text
                size="sm"
                style={{ color: colors.textMuted, marginTop: spacing.xs }}
              >
                <div className="flex items-center gap-2" style={{ marginTop: spacing.xs }}>
                  <svg data-t="1765286627262" className="icon flex-shrink-0" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" data-p-id="20838" width="16" height="16"><path d="M956.928 554.642286a134.070857 134.070857 0 0 1 49.078857 183.222857l-48.713143 84.406857a134.144 134.144 0 0 1-136.338285 65.609143l-53.394286 92.306286a48.786286 48.786286 0 0 1-86.235429-45.348572l1.755429-3.364571 53.394286-92.379429a134.144 134.144 0 0 1-11.483429-150.893714l48.786286-84.48a134.070857 134.070857 0 0 1 183.149714-49.005714zM463.213714 24.356571a268.214857 268.214857 0 0 1 170.422857 475.282286c28.306286 12.8 54.857143 29.037714 79.725715 48.493714a48.786286 48.786286 0 0 1-59.977143 76.8c-53.540571-41.691429-117.101714-64.146286-190.171429-64.146285-200.192 0-341.284571 187.026286-341.284571 390.070857a48.786286 48.786286 0 0 1-97.572572 0c0-192.292571 103.716571-375.222857 268.873143-450.925714A268.214857 268.214857 0 0 1 463.213714 24.429714zM860.16 649.508571l-1.901714 2.998858-48.786286 84.48a36.571429 36.571429 0 0 0 61.44 39.497142l1.901714-2.925714 48.786286-84.48a36.571429 36.571429 0 0 0-61.44-39.497143zM463.213714 121.929143a170.642286 170.642286 0 1 0 0 341.284571 170.642286 170.642286 0 0 0 0-341.284571z" fill="#1B1F26" data-p-id="20839"></path></svg>
                  <Text
                    size="sm"
                    style={{ color: colors.textMuted }}
                  >
                    {tedInfo.speaker}
                  </Text>
                </div>
              </Text>
            )}
          </div>
        )}

        {/* 结果统计 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg data-t="1765289758423" className="icon flex-shrink-0" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" data-p-id="22028" width="16" height="16"><path d="M917 872H107c-24.9 0-45 20.1-45 45s20.1 45 45 45h810c24.9 0 45-20.1 45-45s-20.1-45-45-45zM182 782c66.3 0 120-53.7 120-120V482c0-66.3-53.7-120-120-120S62 415.7 62 482v180c0 66.3 53.7 120 120 120z m-30-300c0-16.6 13.4-30 30-30s30 13.4 30 30v180c0 16.6-13.4 30-30 30s-30-13.4-30-30V482zM512 782c66.3 0 120-53.7 120-120V362c0-66.3-53.7-120-120-120s-120 53.7-120 120v300c0 66.3 53.7 120 120 120z m-30-420c0-16.6 13.4-30 30-30s30 13.4 30 30v300c0 16.6-13.4 30-30 30s-30-13.4-30-30V362zM842 62c-66.3 0-120 53.7-120 120v480c0 66.3 53.7 120 120 120s120-53.7 120-120V182c0-66.3-53.7-120-120-120z m30 600c0 16.6-13.4 30-30 30s-30-13.4-30-30V182c0-16.6 13.4-30 30-30s30 13.4 30 30v480z" fill="" data-p-id="22029"></path></svg>
            <Text size="sm" style={{ color: colors.textMuted }}>
              共 {totalCount} 个结果
            </Text>
          </div>
          {displayIndex && (
            <Text size="sm" style={{ color: colors.textMuted }}>
              当前：{displayIndex}/{totalCount}
            </Text>
          )}
        </div>
      </div>

      {/* 右侧操作区 - 预留给将来扩展 */}
      <div className="flex gap-2 lg:gap-3 shrink-0">
        {/* 可以在这里添加更多操作按钮，比如导出、打印等 */}
      </div>
    </div>
  )
}

export { ResultHeader }
export default ResultHeader