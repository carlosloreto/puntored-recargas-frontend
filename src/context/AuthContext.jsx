import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { apiService } from '../services/api'
import { logger } from '../utils/logger'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  /**
   * Refresca el token de Puntored para operaciones de negocio
   * Memoizado con useCallback para evitar recreaciones innecesarias
   */
  const refreshPuntoredToken = useCallback(async () => {
    try {
      const token = await apiService.getAuthToken()
      localStorage.setItem('puntoredToken', token)
      logger.log('Token de Puntored actualizado')
    } catch (error) {
      logger.error('Error obteniendo token de Puntored:', error)
    }
  }, [])

  /**
   * Verifica la sesión actual del usuario
   * Memoizado con useCallback para evitar recreaciones innecesarias
   */
  const checkUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Guardar JWT de Supabase (contiene userId y email)
        localStorage.setItem('supabaseToken', session.access_token)
        await refreshPuntoredToken()
      }
    } catch (error) {
      logger.error('Error verificando sesión:', error)
    } finally {
      setLoading(false)
    }
  }, [refreshPuntoredToken])

  /**
   * Cierra la sesión del usuario
   * Memoizado con useCallback para evitar recreaciones innecesarias
   * Maneja el caso donde la sesión ya no existe (no lanza error)
   * El logout se maneja completamente en el frontend con Supabase (JWT stateless)
   */
  const signOut = useCallback(async () => {
    try {
      // Verificar si hay sesión antes de intentar cerrarla
      const { data: { session } } = await supabase.auth.getSession()
      
      // Solo intentar cerrar sesión en Supabase si hay una sesión activa
      if (session) {
        const { error } = await supabase.auth.signOut()
        // Si hay error pero es porque la sesión ya no existe, ignorarlo silenciosamente
        // Solo loguear el error si no es AuthSessionMissingError
        if (error && !error.message?.includes('Auth session missing') && !error.message?.includes('session')) {
          logger.error('Error al cerrar sesión en Supabase:', error)
        }
      }
    } catch (error) {
      // Si falla el signOut de Supabase, continuar con la limpieza local
      // Esto puede pasar si la sesión ya expiró o no existe
      // No lanzar error porque el logout debe funcionar siempre (JWT stateless)
      if (error.message && !error.message.includes('Auth session missing') && !error.message.includes('session')) {
        logger.error('Error al cerrar sesión en Supabase:', error)
      }
    } finally {
      // Siempre limpiar el estado local, incluso si falla el signOut de Supabase
      // El backend usa JWT stateless, así que no necesita endpoint de logout
      localStorage.removeItem('puntoredToken')
      localStorage.removeItem('supabaseToken')
      setUser(null)
    }
  }, [])

  /**
   * Refresca el JWT de Supabase cuando está por expirar
   * Esto permite mantener la sesión activa sin intervención del usuario
   * Memoizado con useCallback para evitar recreaciones innecesarias
   */
  const refreshSupabaseSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) throw error
      
      if (session?.access_token) {
        localStorage.setItem('supabaseToken', session.access_token)
        setUser(session.user)
        logger.log('JWT de Supabase actualizado')
        return session.access_token
      }
      
      return null
    } catch (error) {
      logger.error('Error refrescando sesión de Supabase:', error)
      // Si falla el refresh, limpiar todo y forzar re-login
      await signOut()
      return null
    }
  }, [signOut])

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: window.location.origin,
      }
    })
    if (error) throw error
    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  useEffect(() => {
    // Verificar sesión al cargar
    checkUser()
    
    // Escuchar cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Guardar JWT de Supabase (contiene userId y email)
          localStorage.setItem('supabaseToken', session.access_token)
          // Obtener token de Puntored para suppliers
          await refreshPuntoredToken()
        } else {
          // Limpiar tokens cuando no hay sesión
          localStorage.removeItem('puntoredToken')
          localStorage.removeItem('supabaseToken')
        }
        
        setLoading(false)
      }
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [checkUser, refreshPuntoredToken])

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    refreshPuntoredToken,
    refreshSupabaseSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook personalizado para acceder al contexto de autenticación
 * Debe usarse dentro de AuthProvider
 * 
 * @returns {Object} Objeto con user, loading, signUp, signIn, signOut, etc.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

