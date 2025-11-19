import axios from 'axios'
import { API_TIMEOUT } from '../utils/constants'
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
  const puntoredToken = localStorage.getItem('puntoredToken')
  const supabaseToken = localStorage.getItem('supabaseToken')  // JWT de Supabase
  
  // Determinar qué token usar según el endpoint
  const needsSupabaseAuth = config.url.includes('/transactions') || config.url.includes('/recharges')
  const needsPuntoredAuth = config.url.includes('/suppliers') || config.url.includes('/auth')
  
  if (needsSupabaseAuth && supabaseToken) {
    // Para recharges y transactions: JWT de Supabase
    config.headers.Authorization = `Bearer ${supabaseToken}`
    logApi('request', config.url, { auth: 'Supabase JWT' })
  } else if (needsPuntoredAuth && puntoredToken) {
    // Para suppliers: Token de Puntored
    config.headers.Authorization = puntoredToken
    logApi('request', config.url, { auth: 'Puntored Token' })
  }
  
  return config
}, (error) => {
  logger.error('Error en request interceptor:', error)
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Error de timeout
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      logger.error('Request timeout:', originalRequest.url)
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
        localStorage.setItem('supabaseToken', newToken)
        
        logger.log('Token refrescado automáticamente')
        
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
        
        logger.error('Error al refrescar token:', refreshError)
        
        // Limpiar TODOS los tokens
        localStorage.removeItem('puntoredToken')
        localStorage.removeItem('supabaseToken')
        
        // Redirigir al login
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        
        return Promise.reject(refreshError)
      }
    }

    // Otros errores
    logger.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      url: originalRequest?.url
    })
    
    return Promise.reject(error)
  }
)

// Servicios
export const apiService = {
  // Obtener token de Puntored
  getAuthToken: async () => {
    const response = await api.post('/api/auth')
    return response.data.token
  },

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

