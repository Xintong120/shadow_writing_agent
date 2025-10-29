// 错误边界组件
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { Card } from '@/components/atoms/card'

interface ErrorFallbackProps extends FallbackProps {
  error: Error
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <section
        className="max-w-md w-full"
        role="alert"
        aria-labelledby="error-title"
        aria-describedby="error-description"
      >
        <Card className="p-8">
          <header className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div
                className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center"
                role="img"
                aria-label="错误图标"
              >
                <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
              </div>
            </div>
            <h1
              id="error-title"
              className="text-2xl font-bold text-foreground"
            >
              糟糕！出错了
            </h1>
          </header>

          <div
            id="error-description"
            className="text-sm text-muted-foreground mb-6"
          >
            <p className="mb-3">应用遇到了意外错误：</p>
            <pre className="bg-muted p-3 rounded text-xs break-all overflow-x-auto">
              {error.message || '未知错误'}
            </pre>
          </div>

          <nav className="flex flex-col gap-2" aria-label="错误恢复选项">
            <Button
              onClick={resetErrorBoundary}
              className="w-full"
              aria-describedby="retry-description"
            >
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
              重试
            </Button>
            <span id="retry-description" className="sr-only">
              点击重新加载应用
            </span>

            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full"
              aria-describedby="home-description"
            >
              <Home className="h-4 w-4 mr-2" aria-hidden="true" />
              返回首页
            </Button>
            <span id="home-description" className="sr-only">
              返回应用首页
            </span>
          </nav>
        </Card>
      </section>
    </main>
  )
}

interface AppErrorBoundaryProps {
  children: React.ReactNode
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        if (import.meta.env.DEV) {
          console.error('Error:', error, errorInfo)
        }
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}

