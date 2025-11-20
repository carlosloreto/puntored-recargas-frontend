/**
 * Logger con integración a Google Cloud Logging
 * 
 * En desarrollo: muestra logs en consola con formato legible
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
 * Logger principal que integra Cloud Logging en producción
 * Mantiene compatibilidad con el código existente
 */
export const logger = {
  /**
   * Log general (info level)
   * @param {...any} args - Argumentos a loggear
   */
  log: (...args) => {
    if (isDev) {
      console.log(...args)
    } else if (isProduction) {
      // En producción, enviar a Cloud Logging como INFO
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')
      cloudLogger.info(message, { source: 'logger.log' })
    }
  },
  
  /**
   * Log de errores críticos
   * Los errores siempre se registran, incluso en producción
   * @param {...any} args - Argumentos a loggear
   */
  error: (...args) => {
    // Extraer error y metadata si están disponibles
    const error = args.find(arg => arg instanceof Error)
    const metadata = args.find(arg => typeof arg === 'object' && !(arg instanceof Error))
    const message = args
      .filter(arg => !(arg instanceof Error) && typeof arg !== 'object')
      .map(arg => String(arg))
      .join(' ') || 'Error occurred'

    if (isDev) {
      console.error(...args)
    }

    // En producción, enviar a Cloud Logging
    if (isProduction) {
      cloudLogger.error(message, error, metadata || {})
    }
  },
  
  /**
   * Log de advertencias
   * @param {...any} args - Argumentos a loggear
   */
  warn: (...args) => {
    if (isDev) {
      console.warn(...args)
    } else if (isProduction) {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')
      cloudLogger.warn(message, { source: 'logger.warn' })
    }
  },
  
  /**
   * Log informativo
   * @param {...any} args - Argumentos a loggear
   */
  info: (...args) => {
    if (isDev) {
      console.info(...args)
    } else if (isProduction) {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')
      cloudLogger.info(message, { source: 'logger.info' })
    }
  },
  
  /**
   * Log de debug (solo en desarrollo)
   * @param {...any} args - Argumentos a loggear
   */
  debug: (...args) => {
    if (isDev) {
      console.debug(...args)
    }
    // Debug no se envía a Cloud Logging en producción para reducir volumen
  }
}

/**
 * Helper para loggear información de autenticación de forma segura
 * Integrado con Cloud Logging en producción
 * 
 * @param {string} action - Acción de autenticación
 * @param {Object} details - Detalles del evento (se sanitizan automáticamente)
 */
export const logAuth = (action, details = {}) => {
  if (isDev) {
    console.log(`🔐 [Auth] ${action}`, {
      ...details,
      // Nunca loggear tokens completos, solo los primeros caracteres
      token: details.token ? `${details.token.substring(0, 10)}...` : undefined,
    })
  }

  // En producción, usar Cloud Logging
  if (isProduction) {
    cloudLogger.auth(action, details)
  }
}

/**
 * Helper para loggear llamadas a la API
 * Integrado con Cloud Logging en producción
 * 
 * @param {string} method - Método HTTP
 * @param {string} url - URL de la API
 * @param {Object} details - Detalles de la llamada
 */
export const logApi = (method, url, details = {}) => {
  if (isDev) {
    console.log(`🌐 [API] ${method.toUpperCase()} ${url}`, details)
  }

  // En producción, usar Cloud Logging
  if (isProduction) {
    cloudLogger.api(method, url, details)
  }
}

