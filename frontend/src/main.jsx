import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// 在运行时注入 colors.js 中的 cssVariables，确保组件拿到最新的变量值
import './styles/applyCssVariables'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
