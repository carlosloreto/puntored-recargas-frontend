import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

/**
 * Custom hook para obtener tokens de autenticación de forma segura
 * Espera a que los tokens estén disponibles antes de permitir llamadas a la API
 * 
 * @returns {Object} { supabaseToken, isReady, error }
 */
export const useAuthToken = () => {
  const { user } = useAuth()
  const [supabaseToken, setSupabaseToken] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setSupabaseToken(null)
      setIsReady(false)
      return
    }

    let retryCount = 0
    const MAX_RETRIES = 10 // 10 intentos = 1 segundo máximo
    let timeoutId = null

    // Intentar obtener tokens del localStorage
    const checkTokens = () => {
      try {
        const sToken = localStorage.getItem('supabaseToken')

        if (sToken) {
          // ✅ Token encontrado
          setSupabaseToken(sToken)
          setIsReady(true)
          setError(null)
        } else if (retryCount < MAX_RETRIES) {
          // ⏳ Reintentar (máximo 10 veces)
          retryCount++
          timeoutId = setTimeout(checkTokens, 100)
        } else {
          // ❌ Se agotaron los reintentos
          setError(new Error('Token no disponible después de múltiples intentos'))
          setIsReady(false)
        }
      } catch (err) {
        setError(err)
        setIsReady(false)
      }
    }

    checkTokens()

    // Limpiar timeout al desmontar
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [user])

  return {
    supabaseToken,
    isReady,
    error,
  }
}

