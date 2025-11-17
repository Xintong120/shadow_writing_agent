// SettingsPage.tsx - 设置页面
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
    <div className="container mx-auto px-4 py-6 max-w-4xl bg-background">

      <div className="space-y-6">
        {/* API配置 */}
        <Card>
          <CardHeader>
            <CardTitle>API配置</CardTitle>
            <CardDescription>
              配置后端API和LLM服务连接信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="api-url">后端API地址</label>
                <Input
                  id="api-url"
                  placeholder="http://localhost:8000"
                  defaultValue="http://localhost:8000"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="api-key">LLM API Key (OpenAI/DeepSeek)</label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-************************"
                  defaultValue="sk-****************************"
                />
              </div>
            </div>
            <Button variant="outline" onClick={handleTestConnection}>
              测试连接
            </Button>
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
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label>主题模式</label>
              <div className="flex gap-4">
                <Badge variant="outline">浅色模式</Badge>
                <Badge variant="default">深色模式</Badge>
                <Badge variant="secondary">跟随系统</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                目前支持浅色和深色模式切换
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="font-size">字体大小</label>
              <div className="flex items-center gap-4">
                <span className="text-sm">小</span>
                <div className="flex-1">
                  {/* 这里可以添加滑块组件 */}
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-2 bg-primary rounded-full w-2/3"></div>
                  </div>
                </div>
                <span className="text-sm">大</span>
              </div>
              <p className="text-xs text-muted-foreground">当前：中等</p>
            </div>
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
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="auto-save">自动保存学习进度</label>
                <p className="text-sm text-muted-foreground">
                  自动保存您的学习进度到本地
                </p>
              </div>
              <Switch id="auto-save" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="show-stats">显示学习统计</label>
                <p className="text-sm text-muted-foreground">
                  在历史页面显示详细的学习统计数据
                </p>
              </div>
              <Switch id="show-stats" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="keyboard-hints">启用键盘快捷键提示</label>
                <p className="text-sm text-muted-foreground">
                  显示键盘快捷键使用提示
                </p>
              </div>
              <Switch id="keyboard-hints" />
            </div>
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
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button variant="outline">导出所有学习数据</Button>
              <Button
                variant="destructive"
                onClick={handleClearHistory}
                disabled
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                清空学习历史
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              ⚠️ 清空学习历史功能正在开发中，目前不可用
            </p>
          </CardContent>
        </Card>

        {/* 保存按钮 */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings}>保存设置</Button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage