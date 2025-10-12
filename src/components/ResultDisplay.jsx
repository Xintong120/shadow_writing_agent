// ResultDisplay.jsx
// 作用：显示句子改写结果

function ResultDisplay({ results }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">改写结果</h2>

      <div className="space-y-4">
        {/* 原始句子 */}
        <div className="p-3 bg-gray-50 rounded">
          <h3 className="font-medium text-gray-700 mb-2">原始句子:</h3>
          <p className="text-gray-900">{results.original}</p>
        </div>

        {/* 改写结果 */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">改写结果:</h3>
          {results.paraphrases.map((item, index) => (
            <div key={index} className="p-3 border rounded">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-600">策略: {item.strategy}</span>
                <span className="text-sm font-medium text-green-600">评分: {item.score}</span>
              </div>
              <p className="text-gray-900">{item.sentence}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ResultDisplay
