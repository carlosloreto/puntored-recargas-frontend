import axios from 'axios'
import { API_TIMEOUT, STORAGE_KEYS } from '../utils/constants'
import { logger, logApi } from '../utils/logger'

const API_URL = import.meta.env.VITE_BACKEND_URL

// Validar que la URL de la API esté definida
// Usar console.error directamente para errores críticos de configuración
// que deben mostrarse siempre, incluso en producción
if (!API_URL) {
  console.error('❌ ERROR: VITE_BACKEND_URL no está configurada')
  throw new Error('Variable de entorno VITE_BACKEND_URL no está configurada')
}

const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar tokens automáticamente
api.interceptors.request.use((config) => {
  // Agregar timestamp para medir duración de la petición
  config.metadata = { startTime: Date.now() }

  const supabaseToken = localStorage.getItem(STORAGE_KEYS.SUPABASE_TOKEN)  // JWT de Supabase

  // Todos los endpoints protegidos ahora usan JWT de Supabase
  // - /transactions
  // - /recharges
  // - /suppliers
  const needsAuth = config.url.includes('/transactions') ||
    config.url.includes('/recharges') ||
    config.url.includes('/suppliers')

  if (needsAuth && supabaseToken) {
    config.headers.Authorization = `Bearer ${supabaseToken}`
    logApi('request', config.url, { auth: 'Supabase JWT', method: config.method })
  } else {
    logApi('request', config.url, { auth: 'none', method: config.method })
  }

  return config
}, (error) => {
  logger.error('Error en request interceptor:', error, {
    category: 'api-request-error',
    errorType: error.code || error.message,
  })
  return Promise.reject(error)
})

// Variable para evitar múltiples refreshes simultáneos
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Interceptor para manejar errores y refresh automático
api.interceptors.response.use(
  (response) => {
    // Log de respuesta exitosa con duración
    const startTime = response.config.metadata?.startTime
    if (startTime) {
      const duration = Date.now() - startTime

      // Log si la respuesta es lenta (> 2 segundos)
      if (duration > 2000) {
        logger.warn('Respuesta lenta de API', {
          category: 'api-slow-response',
          url: response.config.url,
          method: response.config.method,
          duration,
          status: response.status,
        })
      }

      // Log estructurado de respuesta exitosa
      if (import.meta.env.PROD) {
        logApi('response', response.config.url, {
          method: response.config.method,
          status: response.status,
          duration,
        })
      }
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config
    const startTime = originalRequest?.metadata?.startTime
    const duration = startTime ? Date.now() - startTime : null

    // Error de red/conexión (sin respuesta del servidor)
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      logger.error('Error de conexión a la API', error, {
        category: 'api-network-error',
        url: originalRequest?.url,
        method: originalRequest?.method,
        duration,
        errorCode: error.code,
      })
      return Promise.reject(new Error('Error de conexión. Verifica tu internet.'))
    }

    // Error de timeout
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      logger.error('Request timeout:', originalRequest?.url, {
        category: 'api-timeout',
        url: originalRequest?.url,
        method: originalRequest?.method,
        timeout: API_TIMEOUT,
        duration,
      })
      return Promise.reject(new Error('La petición tardó demasiado. Intenta de nuevo.'))
    }

    // Error 401: Token expirado o inválido
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya se está refrescando, agregar a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Intentar refrescar el JWT de Supabase
        const { supabase } = await import('./supabase')
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()

        if (refreshError || !session) {
          throw new Error('No se pudo refrescar la sesión')
        }

        // Actualizar token en localStorage
        const newToken = session.access_token
        localStorage.setItem(STORAGE_KEYS.SUPABASE_TOKEN, newToken)

        logger.log('Token refrescado automáticamente')

        // Log estructurado del refresh exitoso
        if (import.meta.env.PROD) {
          logApi('refresh-token', 'supabase', {
            success: true,
            retryUrl: originalRequest.url,
          })
        }

        // Actualizar el header de la petición original
        originalRequest.headers.Authorization = `Bearer ${newToken}`

        // Procesar la cola de peticiones pendientes
        processQueue(null, newToken)

        isRefreshing = false

        // Reintentar la petición original
        return api(originalRequest)
      } catch (refreshError) {
        // Si falla el refresh, limpiar todo
        processQueue(refreshError, null)
        isRefreshing = false

        logger.error('Error al refrescar token:', refreshError, {
          category: 'auth-refresh-failed',
          originalUrl: originalRequest.url,
          redirectToLogin: true,
        })

        // Limpiar TODOS los tokens
        localStorage.removeItem(STORAGE_KEYS.SUPABASE_TOKEN)

        // Disparar evento para que AuthContext maneje el logout limpiamente
        window.dispatchEvent(new Event('auth:logout'))

        return Promise.reject(refreshError)
      }
    }

    // Otros errores - Log estructurado con contexto completo
    logger.error('API Error:', error, {
      category: 'api-error',
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: originalRequest?.url,
      method: originalRequest?.method,
      responseData: error.response?.data,
    })

    return Promise.reject(error)
  }
)

// Servicios
export const apiService = {
  // Obtener proveedores
  getSuppliers: async () => {
    const response = await api.get('/api/suppliers')
    return response.data
  },

  // Crear recarga
  createRecharge: async (data) => {
    const response = await api.post('/api/recharges', data)
    return response.data
  },

  // Obtener historial
  getTransactions: async () => {
    const response = await api.get('/api/transactions')
    return response.data
  },

  // Obtener por teléfono
  getTransactionsByPhone: async (phoneNumber) => {
    const response = await api.get(`/api/transactions/phone/${phoneNumber}`)
    return response.data
  },
}

export default api

