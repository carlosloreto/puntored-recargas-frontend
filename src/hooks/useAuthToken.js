import { useAuth } from '../context/AuthContext'

/**
 * Custom hook para obtener tokens de autenticación de forma segura
 * Consume el token directamente del AuthContext (optimizado)
 * 
 * @returns {Object} { supabaseToken, isReady, error }
 */
export const useAuthToken = () => {
  const { user, supabaseToken, loading } = useAuth()

  return {
    supabaseToken,
    isReady: !loading && !!user && !!supabaseToken,
    error: null,
  }
}
