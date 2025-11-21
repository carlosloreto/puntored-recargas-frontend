/**
 * Caché simple para transacciones
 * Carga las transacciones UNA VEZ y las reutiliza
 * Solo se recargan cuando se llama explícitamente a refreshTransactions()
 */

import { apiService } from '../services/api'
import { logger } from './logger'

let transactionsCache = null
let loadingPromise = null

/**
 * Carga las transacciones una sola vez y las cachea
 * Si ya hay caché, retorna el caché sin hacer nueva solicitud
 * @returns {Promise<Array>} Lista de transacciones
 */
export const getTransactions = async () => {
  // Si ya hay caché, retornarlo sin hacer nueva solicitud
  if (transactionsCache) {
    logger.debug('Usando transacciones del caché', {
      category: 'transactions-cache',
      count: transactionsCache.length,
    })
    return transactionsCache
  }

  // Si ya hay una carga en progreso, esperar a que termine
  if (loadingPromise) {
    logger.debug('Esperando carga de transacciones en progreso', {
      category: 'transactions-cache',
    })
    return loadingPromise
  }

  // Cargar transacciones
  loadingPromise = (async () => {
    try {
      const startTime = Date.now()
      logger.info('Cargando transacciones (primera vez)', {
        category: 'transactions-cache',
      })

      const data = await apiService.getTransactions()
      const duration = Date.now() - startTime

      transactionsCache = data

      logger.info('Transacciones cargadas y cacheadas', {
        category: 'transactions-cache',
        count: data?.length || 0,
        duration,
      })

      return data
    } catch (error) {
      logger.error('Error cargando transacciones:', error, {
        category: 'transactions-cache-error',
      })
      throw error
    } finally {
      loadingPromise = null
    }
  })()

  return loadingPromise
}

/**
 * Fuerza la recarga de transacciones (para el botón "Actualizar")
 * Limpia el caché y carga de nuevo
 * Si falla, restaura el caché anterior para evitar pérdida de datos
 * @returns {Promise<Array>} Lista de transacciones actualizadas
 */
export const refreshTransactions = async () => {
  // Guardar caché anterior como fallback
  const previousCache = transactionsCache

  // Limpiar caché antes de cargar
  transactionsCache = null
  loadingPromise = null

  logger.info('Forzando recarga de transacciones', {
    category: 'transactions-cache',
    hadPreviousCache: !!previousCache,
  })

  try {
    // Cargar de nuevo
    return await getTransactions()
  } catch (error) {
    // Si falla, restaurar caché anterior
    if (previousCache) {
      transactionsCache = previousCache
      logger.warn('Error al refrescar transacciones, restaurando caché anterior', {
        category: 'transactions-cache-fallback',
        cachedCount: previousCache.length,
      })
    }
    throw error
  }
}

/**
 * Limpia el caché de transacciones
 */
export const clearTransactionsCache = () => {
  transactionsCache = null
  loadingPromise = null
  logger.info('Caché de transacciones limpiado', {
    category: 'transactions-cache',
  })
}

/**
 * Obtiene las transacciones del caché sin hacer solicitud
 * Retorna null si no hay caché
 */
export const getCachedTransactions = () => {
  return transactionsCache
}

