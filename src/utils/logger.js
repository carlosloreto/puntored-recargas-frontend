/**
 * Logger condicional que solo imprime en desarrollo
 * En producción no muestra nada para evitar exponer información sensible
 */

const isDev = import.meta.env.DEV

export const logger = {
  log: (...args) => {
    if (isDev) {
      console.log(...args)
    }
  },
  
  /**
   * Log de errores
   * Los errores críticos siempre se muestran, incluso en producción,
   * para facilitar el debugging en producción
   */
  error: (...args) => {
    // Los errores críticos siempre se muestran, incluso en producción
    console.error(...args)
  },
  
  warn: (...args) => {
    if (isDev) {
      console.warn(...args)
    }
  },
  
  info: (...args) => {
    if (isDev) {
      console.info(...args)
    }
  },
  
  debug: (...args) => {
    if (isDev) {
      console.debug(...args)
    }
  }
}

/**
 * Helper para loggear información de autenticación de forma segura
 * Solo muestra en desarrollo y oculta información sensible
 */
export const logAuth = (action, details = {}) => {
  if (isDev) {
    console.log(`🔐 [Auth] ${action}`, {
      ...details,
      // Nunca loggear tokens completos, solo los primeros caracteres
      token: details.token ? `${details.token.substring(0, 10)}...` : undefined,
    })
  }
}

/**
 * Helper para loggear llamadas a la API
 */
export const logApi = (method, url, details = {}) => {
  if (isDev) {
    console.log(`🌐 [API] ${method.toUpperCase()} ${url}`, details)
  }
}

