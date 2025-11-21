/**
 * Logger con integración a Google Cloud Logging
 * 
 * En desarrollo: muestra logs en consola con formato visual (emojis, separadores)
 * En producción: envía logs estructurados a Google Cloud Logging
 * 
 * Referencias:
 * - https://cloud.google.com/run/docs/logging
 * - https://cloud.google.com/logging/docs/structured-logging
 */

import { cloudLogger } from '../services/cloudLogger'

const isDev = import.meta.env.DEV
const isProduction = import.meta.env.PROD

/**
 * Clase de logging visual que mantiene coherencia con el backend
 */
class VisualLogger {
  constructor() {
    this.isDev = isDev
    this.separator = '━'.repeat(60)
  }

  /**
   * Formatea la duración de una operación
   * @param {number} ms - Milisegundos
   * @returns {string} Duración formateada
   */
  formatDuration(ms) {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
  }

  /**
   * Log de inicio de operación
   * @param {string} operation - Nombre de la operación
   * @param {string} requestId - ID de la petición
   */
  logOperationStart(operation, requestId) {
    if (!this.isDev) return
    console.log(this.separator)
    console.log(`🌐 ${operation} | Request: ${requestId}`)
    console.log(this.separator)
  }

  /**
   * Log de fin de operación
   * @param {string} operation - Nombre de la operación
   * @param {number} statusCode - Código de estado HTTP
   * @param {number} durationMs - Duración en milisegundos
   */
  logOperationEnd(operation, statusCode, durationMs) {
    if (!this.isDev) return
    const duration = this.formatDuration(durationMs)
    const emoji = statusCode >= 200 && statusCode < 300 ? '✅' : '❌'
    console.log(this.separator)
    console.log(`${emoji} ${operation} → ${statusCode} (${duration})`)
    console.log(this.separator)
  }

  /**
   * Log de llamada a API
   * @param {string} method - Método HTTP
   * @param {string} path - Ruta de la API
   * @param {number} statusCode - Código de estado
   * @param {number} durationMs - Duración en milisegundos
   */
  logApi(method, path, statusCode, durationMs) {
    if (!this.isDev) {
      // En producción, usar Cloud Logging
      cloudLogger.api(method, path, { statusCode, duration: durationMs })
      return
    }
    const duration = this.formatDuration(durationMs)
    console.info(`🌐 ${method} ${path} → ${statusCode} (${duration})`)
  }

  /**
   * Log de operación de estado/base de datos
   * @param {string} action - Acción realizada
   * @param {string} details - Detalles de la operación
   */
  logState(action, details) {
    if (!this.isDev) {
      cloudLogger.info(`State: ${action}`, { details })
      return
    }
    console.log(`💾 ${action}: ${details}`)
  }

  /**
   * Log de servicio externo
   * @param {string} method - Método HTTP
   * @param {string} url - URL completa
   * @param {number} statusCode - Código de estado
   * @param {number} durationMs - Duración en milisegundos
   */
  logExternal(method, url, statusCode, durationMs) {
    if (!this.isDev) {
      cloudLogger.info(`External: ${method} ${url}`, { statusCode, duration: durationMs })
      return
    }
    const duration = this.formatDuration(durationMs)
    const status = statusCode >= 200 && statusCode < 300 ? 'OK' : 'ERROR'
    console.info(`🔌 ${method} ${url} → ${statusCode} ${status} (${duration})`)
  }

  /**
   * Log de autenticación
   * @param {string} message - Mensaje de autenticación
   * @param {Object} details - Detalles (se sanitizan automáticamente)
   */
  logAuth(message, details = {}) {
    if (!this.isDev) {
      cloudLogger.auth(message, details)
      return
    }
    const sanitizedDetails = {
      ...details,
      token: details.token ? `${details.token.substring(0, 10)}...` : undefined,
    }
    console.log(`🔑 ${message}`, sanitizedDetails)
  }

  /**
   * Log de validación
   * @param {string} message - Mensaje de validación
   */
  logValidation(message) {
    if (!this.isDev) {
      cloudLogger.warn(message, { category: 'validation' })
      return
    }
    console.warn(`⚠️ ${message}`)
  }

  /**
   * Log de seguridad
   * @param {string} message - Mensaje de seguridad
   * @param {Object} details - Detalles del evento
   */
  logSecurity(message, details = {}) {
    // Eventos de seguridad siempre se registran
    if (this.isDev) {
      console.warn(`🔒 ${message}`, details)
    }
    cloudLogger.warn(message, { category: 'security', ...details })
  }

  /**
   * Log de UI/UX
   * @param {string} message - Mensaje de evento de UI
   * @param {Object} details - Detalles del evento
   */
  logUI(message, details = {}) {
    if (!this.isDev) return
    console.log(`📱 ${message}`, details)
  }

  /**
   * Log de éxito
   * @param {string} message - Mensaje de éxito
   */
  logSuccess(message) {
    if (!this.isDev) {
      cloudLogger.info(message, { category: 'success' })
      return
    }
    console.log(`✅ ${message}`)
  }

  /**
   * Log de error
   * @param {string} message - Mensaje de error
   * @param {Error} error - Objeto de error
   * @param {Object} metadata - Metadata adicional
   */
  logError(message, error = null, metadata = {}) {
    // Los errores siempre se registran
    if (this.isDev) {
      console.error(`❌ ${message}`, error, metadata)
    }
    cloudLogger.error(message, error, metadata)
  }

  /**
   * Log general (info level)
   * @param {...any} args - Argumentos a loggear
   */
  log(...args) {
    if (this.isDev) {
      console.log(...args)
    } else if (isProduction) {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')
      cloudLogger.info(message, { source: 'logger.log' })
    }
  }

  /**
   * Log de advertencias
   * @param {...any} args - Argumentos a loggear
   */
  warn(...args) {
    if (this.isDev) {
      console.warn(...args)
    } else if (isProduction) {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')
      cloudLogger.warn(message, { source: 'logger.warn' })
    }
  }

  /**
   * Log informativo
   * @param {...any} args - Argumentos a loggear
   */
  info(...args) {
    if (this.isDev) {
      console.info(...args)
    } else if (isProduction) {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')
      cloudLogger.info(message, { source: 'logger.info' })
    }
  }

  /**
   * Log de debug (solo en desarrollo)
   * @param {...any} args - Argumentos a loggear
   */
  debug(...args) {
    if (this.isDev) {
      console.debug(...args)
    }
  }

  /**
   * Alias de logError para compatibilidad
   * @param {...any} args - Argumentos a loggear
   */
  error(...args) {
    const error = args.find(arg => arg instanceof Error)
    const metadata = args.find(arg => typeof arg === 'object' && !(arg instanceof Error))
    const message = args
      .filter(arg => !(arg instanceof Error) && typeof arg !== 'object')
      .map(arg => String(arg))
      .join(' ') || 'Error occurred'

    this.logError(message, error, metadata || {})
  }
}

// Exportar instancia singleton
export const logger = new VisualLogger()

/**
 * Helper para loggear información de autenticación de forma segura
 * @param {string} action - Acción de autenticación
 * @param {Object} details - Detalles del evento (se sanitizan automáticamente)
 */
export const logAuth = (action, details = {}) => {
  logger.logAuth(action, details)
}

/**
 * Helper para loggear llamadas a la API
 * @param {string} method - Método HTTP
 * @param {string} url - URL de la API
 * @param {Object} details - Detalles de la llamada
 */
export const logApi = (method, url, details = {}) => {
  if (isDev) {
    // En desarrollo, usar formato visual si tenemos statusCode y duration
    if (details.statusCode && details.duration !== undefined) {
      logger.logApi(method, url, details.statusCode, details.duration)
    } else {
      // Formato simple para requests sin respuesta aún
      console.log(`🌐 [API] ${method.toUpperCase()} ${url}`, details)
    }
  } else if (isProduction) {
    cloudLogger.api(method, url, details)
  }
}

