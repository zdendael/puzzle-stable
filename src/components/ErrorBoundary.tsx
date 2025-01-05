import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Něco se pokazilo</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              Omlouváme se, ale došlo k neočekávané chybě. Zkuste prosím:
            </p>
            
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Obnovit stránku</li>
              <li>Zkontrolovat připojení k internetu</li>
              <li>Vymazat mezipaměť prohlížeče</li>
            </ul>

            <div className="flex justify-end">
              <button
                onClick={() => window.location.reload()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Obnovit stránku
              </button>
            </div>

            {this.state.error && (
              <div className="mt-4 p-3 bg-red-50 rounded-md">
                <p className="text-sm text-red-800 font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}