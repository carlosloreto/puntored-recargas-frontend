/**
 * Caché simple para suppliers
 * Carga los suppliers UNA VEZ y los reutiliza en toda la aplicación
 * Evita múltiples solicitudes innecesarias
 */

import { apiService } from '../services/api'
import { logger } from './logger'

let suppliersCache = null
let loadingPromise = null
let lastLoadTime = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

/**
 * Carga los suppliers una sola vez y los cachea
 * @returns {Promise<Array>} Lista de suppliers
 */
export const getSuppliers = async () => {
  // Si hay caché válido, retornarlo
  if (suppliersCache && lastLoadTime) {
    const cacheAge = Date.now() - lastLoadTime
    if (cacheAge < CACHE_DURATION) {
      logger.debug('Usando suppliers del caché', {
        category: 'suppliers-cache',
        cacheAge,
        count: suppliersCache.length,
      })
      return suppliersCache
    }
  }

  // Si ya hay una carga en progreso, esperar a que termine
  if (loadingPromise) {
    logger.debug('Esperando carga de suppliers en progreso', {
      category: 'suppliers-cache',
    })
    return loadingPromise
  }

  // Cargar suppliers
  loadingPromise = (async () => {
    try {
      const startTime = Date.now()
      logger.info('Cargando suppliers (primera vez o caché expirado)', {
        category: 'suppliers-cache',
      })

      const data = await apiService.getSuppliers()
      const duration = Date.now() - startTime

      suppliersCache = data
      lastLoadTime = Date.now()

      logger.info('Suppliers cargados y cacheados', {
        category: 'suppliers-cache',
        count: data?.length || 0,
        duration,
      })

      return data
    } catch (error) {
      logger.error('Error cargando suppliers:', error, {
        category: 'suppliers-cache-error',
      })
      throw error
    } finally {
      loadingPromise = null
    }
  })()

  return loadingPromise
}

/**
 * Limpia el caché de suppliers (útil para forzar recarga)
 * Si falla la recarga, restaura el caché anterior
 */
export const clearSuppliersCache = () => {
  suppliersCache = null
  lastLoadTime = null
  loadingPromise = null
  logger.info('Caché de suppliers limpiado', {
    category: 'suppliers-cache',
  })
}

/**
 * Fuerza la recarga de suppliers
 * Si falla, restaura el caché anterior
 */
export const refreshSuppliers = async () => {
  const previousCache = suppliersCache

  clearSuppliersCache()

  try {
    return await getSuppliers()
  } catch (error) {
    if (previousCache) {
      suppliersCache = previousCache
      lastLoadTime = Date.now()
      logger.warn('Error al refrescar suppliers, restaurando caché anterior', {
        category: 'suppliers-cache-fallback',
        cachedCount: previousCache.length,
      })
    }
    throw error
  }
}

/**
 * Obtiene los suppliers del caché sin hacer solicitud
 * Retorna null si no hay caché
 */
export const getCachedSuppliers = () => {
  return suppliersCache
}

