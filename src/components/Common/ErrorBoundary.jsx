import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

/**
 * Error Boundary para capturar errores de renderizado en componentes hijos
 * 
 * Según la documentación oficial de React:
 * - Debe ser un componente de clase
 * - Debe implementar componentDidCatch o getDerivedStateFromError
 * - Solo captura errores en componentes hijos, no en el mismo Error Boundary
 * 
 * Referencia: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    }
  }

  /**
   * Actualiza el estado para que el siguiente render muestre la UI de fallback
   * Se ejecuta durante el render, por lo que no debe tener efectos secundarios
   * @param {Error} error - El error que fue lanzado (no se usa en este método)
   * @returns {Object} Estado actualizado con hasError: true
   */
  static getDerivedStateFromError() {
    // Actualizar el estado para que el siguiente render muestre la UI de fallback
    return { hasError: true }
  }

  /**
   * Se ejecuta después de que un error ha sido lanzado por un componente descendiente
   * Útil para logging de errores
   */
  componentDidCatch(error, errorInfo) {
    // Log del error para debugging (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.error('Error capturado por ErrorBoundary:', error, errorInfo)
    }
    
    this.setState({
      error,
      errorInfo
    })

    // Aquí podrías enviar el error a un servicio de logging (Sentry, etc.)
    // Ejemplo: logErrorToService(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    })
  }

  handleGoHome = () => {
    this.handleReset()
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // UI de fallback personalizada
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Algo salió mal
            </h1>
            
            <p className="text-gray-600 mb-6">
              Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta recargar la página.
            </p>

            {/* Detalles del error solo en desarrollo */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                  Detalles del error (solo en desarrollo)
                </summary>
                <div className="bg-gray-50 rounded-lg p-4 text-xs font-mono text-red-600 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#eb0b7f] text-white rounded-lg font-medium hover:bg-[#d60a71] transition"
              >
                <RefreshCw className="w-4 h-4" />
                Intentar de nuevo
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                <Home className="w-4 h-4" />
                Ir al inicio
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

