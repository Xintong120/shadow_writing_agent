// InputPanel.jsx
// 作用：用户输入TED文本的面板
// 功能：文本框、提交按钮、输入验证
// React学习重点：表单处理、事件处理、受控组件

import { useState } from 'react'

function InputPanel({ onSubmit, disabled = false }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && onSubmit) {
      onSubmit(input.trim())
      setInput('')
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入TED演讲URL或标题..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          处理
        </button>
      </form>
    </div>
  )
}

export default InputPanel
