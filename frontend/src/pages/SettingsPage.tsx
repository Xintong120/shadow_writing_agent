import { useState, useEffect } from 'react'
import { Box, TextInput, Switch, Button, Select, Group, Title, Text, Card, NumberInput, ActionIcon, Divider } from '@mantine/core'
import { Card as MantineCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button as MantineButton } from '@/components/atoms/button'
import { Input as MantineInput } from '@/components/atoms/input'
import { Switch as MantineSwitch } from '@/components/atoms/switch'
import { Badge as MantineBadge } from '@/components/atoms/badge'
import { AlertTriangle, Plus, Trash2, TestTube, RotateCcw, Settings } from 'lucide-react'
import { toast } from 'sonner'

interface ApiKey {
  id: number
  provider: 'groq' | 'openai' | 'deepseek'
  key: string
  active: boolean
}

interface SettingsState {
  // API配置
  backendApiUrl: string
  openaiApiKey: string
  deepseekApiKey: string
  apiRotationEnabled: boolean
  currentApiProvider: string
  
  // 外观设置
  themeMode: 'light' | 'dark' | 'system'
  fontSize: 'small' | 'medium' | 'large'
  
  // 学习偏好
  autoSaveProgress: boolean
  showLearningStats: boolean
  enableKeyboardShortcuts: boolean
  
  // LLM配置
  modelName: string
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
}

function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    // API配置
    backendApiUrl: 'http://localhost:8000',
    openaiApiKey: '',
    deepseekApiKey: '',
    apiRotationEnabled: false,
    currentApiProvider: 'groq',
    
    // 外观设置
    themeMode: 'light',
    fontSize: 'medium',
    
    // 学习偏好
    autoSaveProgress: true,
    showLearningStats: true,
    enableKeyboardShortcuts: true,
    
    // LLM配置
    modelName: 'llama-3.3-70b-versatile',
    temperature: 0.1,
    maxTokens: 4096,
    topP: 1.0,
    frequencyPenalty: 0.0,
  })

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: 1, provider: 'groq', key: '', active: true },
    { id: 2, provider: 'openai', key: '', active: false },
  ])

  const [loading, setLoading] = useState(false)
  const [testingApi, setTestingApi] = useState<number | null>(null)

  // 从本地存储加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('shadow-writing-settings')
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) })
    }
    
    const savedApiKeys = localStorage.getItem('shadow-writing-api-keys')
    if (savedApiKeys) {
      setApiKeys(JSON.parse(savedApiKeys))
    }
  }, [])

  // 更新设置
  const updateSetting = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  // 添加API密钥
  const addApiKey = () => {
    const newId = Math.max(...apiKeys.map(k => k.id)) + 1
    setApiKeys([...apiKeys, { id: newId, provider: 'groq', key: '', active: false }])
  }

  // 更新API密钥
  const updateApiKey = (id: number, field: keyof ApiKey, value: any) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, [field]: value } : key
    ))
  }

  // 删除API密钥
  const deleteApiKey = (id: number) => {
    if (apiKeys.length > 1) {
      setApiKeys(apiKeys.filter(key => key.id !== id))
    }
  }

  // 测试API连接
  const testApiConnection = async (provider: string, apiKey: string) => {
    if (!apiKey) {
      toast.error('请先输入API密钥')
      return
    }

    setTestingApi(apiKeys.find(k => k.provider === provider)?.id || null)
    
    try {
      // 模拟API测试
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success(`${provider.toUpperCase()} API连接测试成功！`)
    } catch (error) {
      toast.error(`${provider.toUpperCase()} API连接测试失败`)
    } finally {
      setTestingApi(null)
    }
  }

  // 轮换API密钥
  const rotateApiKey = () => {
    const activeIndex = apiKeys.findIndex(k => k.active)
    const nextIndex = (activeIndex + 1) % apiKeys.length
    
    setApiKeys(apiKeys.map((key, index) => ({
      ...key,
      active: index === nextIndex
    })))
    
    toast.success('API密钥已轮换')
  }

  // 保存设置
  const saveSettings = async () => {
    try {
      setLoading(true)
      
      // 保存到本地存储
      localStorage.setItem('shadow-writing-settings', JSON.stringify(settings))
      localStorage.setItem('shadow-writing-api-keys', JSON.stringify(apiKeys))
      
      // TODO: 保存到后端API
      // const response = await api.updateSettings(settings)
      
      toast.success('设置已保存')
    } catch (error) {
      toast.error('保存设置失败')
    } finally {
      setLoading(false)
    }
  }

  // 主题选项
  const themeOptions = [
    { value: 'light', label: '浅色模式' },
    { value: 'dark', label: '深色模式' },
    { value: 'system', label: '跟随系统' }
  ]

  // 字体大小选项
  const fontSizeOptions = [
    { value: 'small', label: '小' },
    { value: 'medium', label: '中等' },
    { value: 'large', label: '大' }
  ]

  // 模型选项
  const modelOptions = [
    { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile' },
    { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant' },
    { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
    { value: 'gemma2-9b-it', label: 'Gemma2 9B' }
  ]

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
        <Group>
          <Settings size={24} />
          <Title order={1}>设置</Title>
        </Group>
        <Text c="dimmed">配置您的Shadow Writing Agent</Text>

        {/* API配置 */}
        <MantineCard>
          <CardHeader>
            <CardTitle>API配置</CardTitle>
            <CardDescription>
              配置后端API和LLM服务连接信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* 后端API地址 */}
              <TextInput
                label="后端API地址"
                placeholder="http://localhost:8000"
                value={settings.backendApiUrl}
                onChange={(e) => updateSetting('backendApiUrl', e.target.value)}
              />

              {/* API密钥管理 */}
              <Box>
                <Group justify="space-between" mb="sm">
                  <Text fw={500}>API密钥管理</Text>
                  <MantineButton
                    variant="outline"
                    size="sm"
                    leftSection={<Plus size={16} />}
                    onClick={addApiKey}
                  >
                    添加API密钥
                  </MantineButton>
                </Group>

                <Box style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {apiKeys.map((apiKey) => (
                    <Box
                      key={apiKey.id}
                      style={{
                        padding: '1rem',
                        border: '1px solid var(--mantine-color-gray-3)',
                        borderRadius: 'var(--mantine-radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      <Group justify="space-between">
                        <Group>
                          <Select
                            placeholder="选择提供商"
                            data={[
                              { value: 'groq', label: 'Groq' },
                              { value: 'openai', label: 'OpenAI' },
                              { value: 'deepseek', label: 'DeepSeek' }
                            ]}
                            value={apiKey.provider}
                            onChange={(value) => updateApiKey(apiKey.id, 'provider', value)}
                            style={{ width: 120 }}
                          />
                          <MantineBadge variant={apiKey.active ? 'default' : 'outline'}>
                            {apiKey.active ? '使用中' : '备用'}
                          </MantineBadge>
                        </Group>
                        <Group>
                          <MantineButton
                            variant="outline"
                            size="sm"
                            leftSection={<TestTube size={14} />}
                            onClick={() => testApiConnection(apiKey.provider, apiKey.key)}
                            loading={testingApi === apiKey.id}
                            disabled={!apiKey.key}
                          >
                            测试连接
                          </MantineButton>
                          <ActionIcon
                            variant="outline"
                            color="red"
                            onClick={() => deleteApiKey(apiKey.id)}
                            disabled={apiKeys.length <= 1}
                          >
                            <Trash2 size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>
                      <TextInput
                        type="password"
                        placeholder="输入API Key"
                        value={apiKey.key}
                        onChange={(e) => updateApiKey(apiKey.id, 'key', e.target.value)}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* API轮换设置 */}
              <Box
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--mantine-color-gray-0)',
                  borderRadius: 'var(--mantine-radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Text fw={500}>启用API轮换</Text>
                  <Text size="sm" c="dimmed">自动在多个API之间轮换使用</Text>
                </Box>
                <Group>
                  <MantineSwitch
                    checked={settings.apiRotationEnabled}
                    onChange={(checked) => updateSetting('apiRotationEnabled', checked)}
                  />
                  {settings.apiRotationEnabled && (
                    <MantineButton
                      variant="outline"
                      size="sm"
                      leftSection={<RotateCcw size={14} />}
                      onClick={rotateApiKey}
                    >
                      轮换API
                    </MantineButton>
                  )}
                </Group>
              </Box>
            </Box>
          </CardContent>
        </MantineCard>

        {/* 外观设置 */}
        <MantineCard>
          <CardHeader>
            <CardTitle>外观设置</CardTitle>
            <CardDescription>
              自定义应用的外观和主题
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* 主题模式 */}
              <Box>
                <Text fw={500} mb="xs">主题模式</Text>
                <Group>
                  {themeOptions.map((option) => (
                    <Box
                      key={option.value}
                      style={{ cursor: 'pointer' }}
                      onClick={() => updateSetting('themeMode', option.value)}
                    >
                      <MantineBadge
                        variant={settings.themeMode === option.value ? 'default' : 'outline'}
                      >
                        {option.label}
                      </MantineBadge>
                    </Box>
                  ))}
                </Group>
                <Text size="sm" c="dimmed" mt="xs">
                  目前支持浅色和深色模式切换
                </Text>
              </Box>

              {/* 字体大小 */}
              <Box>
                <Text fw={500} mb="xs">字体大小</Text>
                <Select
                  data={fontSizeOptions}
                  value={settings.fontSize}
                  onChange={(value) => updateSetting('fontSize', value)}
                  placeholder="选择字体大小"
                />
                <Text size="sm" c="dimmed" mt="xs">
                  当前：{settings.fontSize === 'small' ? '小' : settings.fontSize === 'large' ? '大' : '中等'}
                </Text>
              </Box>
            </Box>
          </CardContent>
        </MantineCard>

        {/* 学习偏好 */}
        <MantineCard>
          <CardHeader>
            <CardTitle>学习偏好</CardTitle>
            <CardDescription>
              配置学习相关的行为偏好
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* 自动保存学习进度 */}
              <Group justify="space-between">
                <Box>
                  <Text fw={500}>自动保存学习进度</Text>
                  <Text size="sm" c="dimmed">自动保存您的学习进度到本地</Text>
                </Box>
                <MantineSwitch
                  checked={settings.autoSaveProgress}
                  onChange={(checked) => updateSetting('autoSaveProgress', checked)}
                />
              </Group>

              {/* 显示学习统计 */}
              <Group justify="space-between">
                <Box>
                  <Text fw={500}>显示学习统计</Text>
                  <Text size="sm" c="dimmed">在历史页面显示详细的学习统计数据</Text>
                </Box>
                <MantineSwitch
                  checked={settings.showLearningStats}
                  onChange={(checked) => updateSetting('showLearningStats', checked)}
                />
              </Group>

              {/* 启用键盘快捷键提示 */}
              <Group justify="space-between">
                <Box>
                  <Text fw={500}>启用键盘快捷键提示</Text>
                  <Text size="sm" c="dimmed">显示键盘快捷键使用提示</Text>
                </Box>
                <MantineSwitch
                  checked={settings.enableKeyboardShortcuts}
                  onChange={(checked) => updateSetting('enableKeyboardShortcuts', checked)}
                />
              </Group>
            </Box>
          </CardContent>
        </MantineCard>

        {/* LLM配置 */}
        <MantineCard>
          <CardHeader>
            <CardTitle>LLM配置</CardTitle>
            <CardDescription>
              配置大语言模型参数
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* 模型选择 */}
              <Select
                label="模型名称"
                data={modelOptions}
                value={settings.modelName}
                onChange={(value) => updateSetting('modelName', value)}
                placeholder="选择模型"
              />

              {/* 温度 */}
              <NumberInput
                label="温度 (Temperature)"
                description="控制输出随机性，0-2之间"
                min={0}
                max={2}
                step={0.1}
                value={settings.temperature}
                onChange={(value) => updateSetting('temperature', value || 0)}
              />

              {/* 最大令牌数 */}
              <NumberInput
                label="最大令牌数"
                min={1}
                max={8192}
                value={settings.maxTokens}
                onChange={(value) => updateSetting('maxTokens', value || 1)}
              />

              {/* Top P */}
              <NumberInput
                label="Top P"
                description="控制词汇选择的多样性"
                min={0}
                max={1}
                step={0.1}
                value={settings.topP}
                onChange={(value) => updateSetting('topP', value || 0)}
              />

              {/* 频率惩罚 */}
              <NumberInput
                label="频率惩罚"
                description="减少重复内容的概率"
                min={-2}
                max={2}
                step={0.1}
                value={settings.frequencyPenalty}
                onChange={(value) => updateSetting('frequencyPenalty', value || 0)}
              />
            </Box>
          </CardContent>
        </MantineCard>

        {/* 数据管理 */}
        <MantineCard>
          <CardHeader>
            <CardTitle>数据管理</CardTitle>
            <CardDescription>
              管理您的学习数据和应用设置
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Box style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <MantineButton variant="outline">
                导出所有学习数据
              </MantineButton>
              <MantineButton
                variant="destructive"
                disabled
                leftSection={<AlertTriangle size={16} />}
              >
                清空学习历史
              </MantineButton>
            </Box>
            <Text size="sm" c="dimmed">
              ⚠️ 清空学习历史功能正在开发中，目前不可用
            </Text>
          </CardContent>
        </MantineCard>

        {/* 保存按钮 */}
        <Group justify="flex-end">
          <MantineButton
            onClick={saveSettings}
            loading={loading}
            size="lg"
          >
            保存设置
          </MantineButton>
        </Group>
      </Box>
    </Box>
  )
}

export default SettingsPage