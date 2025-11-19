import { Box } from '@mantine/core'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Switch } from '@/components/atoms/switch'
import { Badge } from '@/components/atoms/badge'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

function SettingsPage() {
  const handleTestConnection = () => {
    toast.info('测试连接功能开发中...')
  }

  const handleClearHistory = () => {
    toast.error('清空学习历史功能尚未实现，请联系管理员')
  }

  const handleSaveSettings = () => {
    toast.success('设置已保存')
  }

  return (
    <Box
      style={{
        maxWidth: '1024px',
        margin: '0 auto',
        padding: '1.5rem',
      }}
    >
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* API配置 */}
        <Card>
          <CardHeader>
            <CardTitle>API配置</CardTitle>
            <CardDescription>
              配置后端API和LLM服务连接信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Box
              style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: '1fr',
              }}
            >
              <Box style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="api-url">后端API地址</label>
                <Input
                  id="api-url"
                  placeholder="http://localhost:8000"
                  defaultValue="http://localhost:8000"
                />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="api-key">LLM API Key (OpenAI/DeepSeek)</label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-************************"
                  defaultValue="sk-****************************"
                />
              </Box>
            </Box>
            <Box style={{ marginTop: '1rem' }}>
              <Button variant="outline" onClick={handleTestConnection}>
                测试连接
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* 外观设置 */}
        <Card>
          <CardHeader>
            <CardTitle>外观设置</CardTitle>
            <CardDescription>
              自定义应用的外观和主题
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label>主题模式</label>
              <Box style={{ display: 'flex', gap: '1rem' }}>
                <Badge variant="outline">浅色模式</Badge>
                <Badge variant="default">深色模式</Badge>
                <Badge variant="secondary">跟随系统</Badge>
              </Box>
              <Box>
                <span style={{ fontSize: '0.875rem', color: 'var(--mantine-color-dimmed)' }}>
                  目前支持浅色和深色模式切换
                </span>
              </Box>
            </Box>

            <Box style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="font-size">字体大小</label>
              <Box style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.875rem' }}>小</span>
                <Box style={{ flex: 1 }}>
                  <Box
                    style={{
                      height: '8px',
                      backgroundColor: 'var(--mantine-color-dimmed)',
                      borderRadius: 'var(--mantine-radius-full)',
                    }}
                  >
                    <Box
                      style={{
                        height: '8px',
                        backgroundColor: 'var(--mantine-color-primary-6)',
                        borderRadius: 'var(--mantine-radius-full)',
                        width: '66.666667%',
                      }}
                    />
                  </Box>
                </Box>
                <span style={{ fontSize: '0.875rem' }}>大</span>
              </Box>
              <Box>
                <span style={{ fontSize: '0.75rem', color: 'var(--mantine-color-dimmed)' }}>当前：中等</span>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* 学习偏好 */}
        <Card>
          <CardHeader>
            <CardTitle>学习偏好</CardTitle>
            <CardDescription>
              配置学习相关的行为偏好
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <label htmlFor="auto-save">自动保存学习进度</label>
                  <Box>
                    <span style={{ fontSize: '0.875rem', color: 'var(--mantine-color-dimmed)' }}>
                      自动保存您的学习进度到本地
                    </span>
                  </Box>
                </Box>
                <Switch id="auto-save" defaultChecked />
              </Box>

              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <label htmlFor="show-stats">显示学习统计</label>
                  <Box>
                    <span style={{ fontSize: '0.875rem', color: 'var(--mantine-color-dimmed)' }}>
                      在历史页面显示详细的学习统计数据
                    </span>
                  </Box>
                </Box>
                <Switch id="show-stats" defaultChecked />
              </Box>

              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <label htmlFor="keyboard-hints">启用键盘快捷键提示</label>
                  <Box>
                    <span style={{ fontSize: '0.875rem', color: 'var(--mantine-color-dimmed)' }}>
                      显示键盘快捷键使用提示
                    </span>
                  </Box>
                </Box>
                <Switch id="keyboard-hints" />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* 数据管理 */}
        <Card>
          <CardHeader>
            <CardTitle>数据管理</CardTitle>
            <CardDescription>
              管理您的学习数据和应用设置
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Box style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <Button variant="outline">导出所有学习数据</Button>
              <Button
                variant="destructive"
                onClick={handleClearHistory}
                disabled
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                清空学习历史
              </Button>
            </Box>
            <Box>
              <span style={{ fontSize: '0.875rem', color: 'var(--mantine-color-dimmed)' }}>
                ⚠️ 清空学习历史功能正在开发中，目前不可用
              </span>
            </Box>
          </CardContent>
        </Card>

        {/* 保存按钮 */}
        <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleSaveSettings}>保存设置</Button>
        </Box>
      </Box>
    </Box>
  )
}

export default SettingsPage