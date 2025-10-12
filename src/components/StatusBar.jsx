// StatusBar.jsx
// 作用：显示应用状态的底部栏
// 功能：状态显示、进度指示

function StatusBar({ status = 'ready', message = '系统就绪' }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white px-4 py-2 text-sm">
      <span>{message}</span>
    </div>
  )
}

export default StatusBar
