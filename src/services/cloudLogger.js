/**
 * Servicio de logging para Google Cloud Logging
 * 
 * Para aplicaciones React en Cloud Run, los logs estructurados en JSON
 * son capturados automáticamente por Cloud Logging.
 * 
 * Referencias:
 * - https://cloud.google.com/run/docs/logging
 * - https://cloud.google.com/logging/docs/structured-logging
 */

const isProduction = import.meta.env.PROD
const isDev = import.meta.env.DEV

/**
 * Detecta si la aplicación está corriendo en Cloud Run
 * Cloud Run establece la variable de entorno K_SERVICE
 * Nota: En el navegador, esto siempre será false, pero los logs estructurados
 * se capturarán automáticamente cuando la app se sirva desde Cloud Run
 */
const isCloudRun = false // En el navegador siempre es false, pero los logs JSON se capturan en Cloud Run

/**
 * Obtiene información del usuario actual sin exponer datos sensibles
 * @returns {Object} Información del usuario para logging
 */
const getUserContext = () => {
  try {
    const supabaseToken = localStorage.getItem('supabaseToken')
    if (!supabaseToken) return null

    // Decodificar el JWT para obtener el user ID (sin exponer el token completo)
    try {
      const payload = JSON.parse(atob(supabaseToken.split('.')[1]))
      return {
        userId: payload.sub || payload.user_id,
        // No incluir email u otros datos sensibles en logs
      }
    } catch {
      return null
    }
  } catch {
    return null
  }
}

/**
 * Obtiene información del navegador para contexto
 * @returns {Object} Información del navegador
 */
const getBrowserContext = () => {
  if (typeof window === 'undefined') return null

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    url: window.location.href,
    referrer: document.referrer || null,
  }
}

/**
 * Sanitiza datos para evitar exponer información sensible
 * @param {*} data - Datos a sanitizar
 * @returns {*} Datos sanitizados
 */
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data

  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'auth']
  const sanitized = Array.isArray(data) ? [...data] : { ...data }

  for (const key in sanitized) {
    const lowerKey = key.toLowerCase()
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key])
    }
  }

  return sanitized
}

/**
 * Crea un log estructurado en formato JSON
 * Cloud Run captura automáticamente logs en formato JSON estructurado
 * 
 * @param {string} severity - Nivel de severidad (ERROR, WARNING, INFO, DEBUG)
 * @param {string} message - Mensaje del log
 * @param {Object} metadata - Metadata adicional
 */
const createStructuredLog = (severity, message, metadata = {}) => {
  const logEntry = {
    severity,
    message,
    timestamp: new Date().toISOString(),
    service: 'puntored-recargas-frontend',
    environment: isProduction ? 'production' : 'development',
    ...getBrowserContext(),
    ...(getUserContext() ? { user: getUserContext() } : {}),
    ...sanitizeData(metadata),
  }

  // En producción, usar formato JSON estructurado que Cloud Run captura automáticamente
  // En desarrollo, usar formato visual con emojis como el backend
  if (isProduction || isCloudRun) {
    // Cloud Run captura logs de stdout/stderr automáticamente
    // Usar console.log con JSON para que Cloud Logging lo parse correctamente
    const logMethod = severity === 'ERROR' ? console.error : console.log
    logMethod(JSON.stringify(logEntry))
  } else {
    // En desarrollo, formato visual con emojis (coherente con backend)
    const emoji = {
      ERROR: '❌',
      WARNING: '⚠️',
      INFO: 'ℹ️',
      DEBUG: '🔍',
    }[severity] || '📝'

    // Si tiene categoría, usar emoji específico
    const categoryEmoji = {
      authentication: '🔑',
      api: '🌐',
      'error-boundary': '🛡️',
      validation: '⚠️',
      security: '🔒',
      success: '✅',
    }[metadata.category]

    const displayEmoji = categoryEmoji || emoji
    console.log(`${displayEmoji} ${message}`, metadata)
  }
}

/**
 * Servicio de logging para Google Cloud Logging
 * 
 * En producción, los logs se envían automáticamente a Cloud Logging
 * mediante logs estructurados en JSON que Cloud Run captura.
 */
export const cloudLogger = {
  /**
   * Log de error crítico
   * @param {string} message - Mensaje del error
   * @param {Error|Object} error - Error o metadata
   * @param {Object} context - Contexto adicional
   */
  error: (message, error = null, context = {}) => {
    const metadata = {
      ...context,
      ...(error instanceof Error
        ? {
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        }
        : error),
    }

    createStructuredLog('ERROR', message, metadata)
  },

  /**
   * Log de advertencia
   * @param {string} message - Mensaje de advertencia
   * @param {Object} metadata - Metadata adicional
   */
  warn: (message, metadata = {}) => {
    createStructuredLog('WARNING', message, metadata)
  },

  /**
   * Log informativo
   * @param {string} message - Mensaje informativo
   * @param {Object} metadata - Metadata adicional
   */
  info: (message, metadata = {}) => {
    createStructuredLog('INFO', message, metadata)
  },

  /**
   * Log de debug (solo en desarrollo)
   * @param {string} message - Mensaje de debug
   * @param {Object} metadata - Metadata adicional
   */
  debug: (message, metadata = {}) => {
    if (isDev) {
      createStructuredLog('DEBUG', message, metadata)
    }
  },

  /**
   * Log de evento de autenticación
   * @param {string} action - Acción de autenticación (login, logout, signup, etc.)
   * @param {Object} details - Detalles del evento (sin datos sensibles)
   */
  auth: (action, details = {}) => {
    createStructuredLog('INFO', `Auth: ${action}`, {
      category: 'authentication',
      ...sanitizeData(details),
    })
  },

  /**
   * Log de llamada a API
   * @param {string} method - Método HTTP
   * @param {string} url - URL de la API
   * @param {Object} details - Detalles de la llamada
   */
  api: (method, url, details = {}) => {
    createStructuredLog('INFO', `API: ${method.toUpperCase()} ${url}`, {
      category: 'api',
      ...sanitizeData(details),
    })
  },
}

export default cloudLogger

