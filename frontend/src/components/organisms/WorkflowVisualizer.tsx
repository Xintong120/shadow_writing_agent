// WorkflowVisualizer.jsx
// 作用：可视化LangGraph工作流执行过程

function WorkflowVisualizer({ currentNode }) {
  const nodes = [
    { id: 'semantic_chunking', label: '语义分块', color: 'blue' },
    { id: 'sentence_variation', label: '句子改写', color: 'green' },
    { id: 'validation', label: '结果验证', color: 'yellow' },
    { id: 'quality', label: '质量评估', color: 'purple' },
    { id: 'finalize', label: '结果整理', color: 'red' },
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">工作流执行状态</h2>
      <div className="space-y-3">
        {nodes.map((node) => (
          <div key={node.id} className={`flex items-center gap-3 p-3 rounded ${
            currentNode === node.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
          }`}>
            <div className={`w-4 h-4 rounded-full ${
              currentNode === node.id ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
            }`} />
            <span className={currentNode === node.id ? 'font-medium text-blue-700' : 'text-gray-600'}>
              {node.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WorkflowVisualizer
