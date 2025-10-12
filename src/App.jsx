  import { useState } from 'react'
import InputPanel from './components/InputPanel'
import WorkflowVisualizer from './components/WorkflowVisualizer'
import ResultDisplay from './components/ResultDisplay'
import StatusBar from './components/StatusBar'

/**
 * TED Agent 主应用组件
 * 
 * 学习要点:
 * 1. useState Hook - 管理组件状态
 * 2. 组件组合 - 将UI分解为多个小组件
 * 3. Props传递 - 父组件向子组件传递数据和函数
 */
function App() {
  // 状态管理 - 使用useState Hook
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentNode, setCurrentNode] = useState(null)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  /**
   * 处理文本提交
   * 这个函数会传递给InputPanel组件
   */
  const handleSubmit = async (text) => {
    setIsProcessing(true)
    setError(null)
    setInputText(text)
    
    try {
      // TODO: 调用后端API
      console.log('提交文本:', text)
      
      // 模拟处理过程
      setCurrentNode('semantic_chunking')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setCurrentNode('sentence_variation')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setCurrentNode('validation')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setCurrentNode('quality')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setCurrentNode('finalize')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟结果
      setResults({
        original: '这是原始句子',
        paraphrases: [
          { sentence: '改写句子1', strategy: '同义替换', score: 7.5 },
          { sentence: '改写句子2', strategy: '句式转换', score: 8.0 }
        ]
      })
      
      setCurrentNode(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部标题栏 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            TED Agent 可视化系统
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            LangGraph工作流 - 句子改写Agent
          </p>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 左侧：输入和控制面板 */}
          <div className="space-y-6">
            <InputPanel 
              onSubmit={handleSubmit}
              isProcessing={isProcessing}
            />
            
            <StatusBar 
              currentNode={currentNode}
              isProcessing={isProcessing}
            />
          </div>

          {/* 右侧：工作流可视化 */}
          <div>
            <WorkflowVisualizer 
              currentNode={currentNode}
            />
          </div>
        </div>

        {/* 结果展示区域 */}
        {results && (
          <div className="mt-6">
            <ResultDisplay results={results} />
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">错误: {error}</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
