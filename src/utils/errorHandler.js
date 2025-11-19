import toast from 'react-hot-toast'
import { logger } from './logger'

/**
 * Maneja errores de la API de forma centralizada
 * @param {Error} error - El error capturado
 * @param {string} defaultMessage - Mensaje por defecto si no hay uno específico
 */
export const handleApiError = (error, defaultMessage = 'Ha ocurrido un error') => {
  logger.error('API Error:', error)

  // Error de red
  if (error.code === 'ERR_NETWORK') {
    toast.error('Error de conexión. Verifica tu internet.')
    return
  }

  // Error sin respuesta del servidor
  if (!error.response) {
    toast.error('No se pudo conectar con el servidor')
    return
  }

  const status = error.response.status
  const errorData = error.response.data

  // Errores específicos por código de estado
  switch (status) {
    case 400:
      // Error de validación
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        errorData.errors.forEach(err => toast.error(err))
      } else {
        toast.error(errorData?.message || 'Datos inválidos')
      }
      break

    case 401:
      // No autorizado
      toast.error('Sesión expirada. Por favor inicia sesión nuevamente.')
      // Limpiar tokens
      localStorage.removeItem('puntoredToken')
      // Podría redirigir al login aquí
      break

    case 403:
      // Prohibido
      toast.error('No tienes permisos para realizar esta acción')
      break

    case 404:
      // No encontrado
      toast.error('Recurso no encontrado')
      break

    case 409:
      // Conflicto
      toast.error(errorData?.message || 'Conflicto en la operación')
      break

    case 500:
    case 502:
    case 503:
      // Error del servidor
      toast.error('Error del servidor. Intenta más tarde.')
      break

    default:
      toast.error(errorData?.message || defaultMessage)
  }
}

/**
 * Maneja errores de autenticación de Supabase
 * @param {Error} error - El error de Supabase
 */
export const handleAuthError = (error) => {
  logger.error('Auth Error:', error)

  const message = error.message.toLowerCase()

  if (message.includes('invalid login credentials')) {
    toast.error('Credenciales inválidas')
  } else if (message.includes('email not confirmed')) {
    toast.error('Por favor confirma tu correo electrónico')
  } else if (message.includes('already registered')) {
    toast.error('Este correo ya está registrado')
  } else if (message.includes('weak password')) {
    toast.error('La contraseña es muy débil')
  } else if (message.includes('email already in use')) {
    toast.error('El correo ya está en uso')
  } else {
    toast.error(error.message || 'Error de autenticación')
  }
}

/**
 * Valida si hay conexión a internet
 * @returns {boolean} - true si hay conexión
 */
export const checkNetworkConnection = () => {
  if (!navigator.onLine) {
    toast.error('Sin conexión a internet')
    return false
  }
  return true
}

