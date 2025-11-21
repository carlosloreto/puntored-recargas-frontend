import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { logger, logAuth } from '../utils/logger'
import { STORAGE_KEYS } from '../utils/constants'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [supabaseToken, setSupabaseToken] = useState(null)

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
        localStorage.setItem(STORAGE_KEYS.SUPABASE_TOKEN, session.access_token)
        setSupabaseToken(session.access_token)
        logAuth('session-checked', { hasSession: true, userId: session.user.id })
      } else {
        logAuth('session-checked', { hasSession: false })
      }
    } catch (error) {
      logger.error('Error verificando sesión:', error, {
        category: 'auth-session-check',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Cierra la sesión del usuario
   * Memoizado con useCallback para evitar recreaciones innecesarias
   * Maneja el caso donde la sesión ya no existe (no lanza error)
   * El logout se maneja completamente en el frontend con Supabase (JWT stateless)
   */
  const signOut = useCallback(async () => {
    const userId = user?.id
    try {
      // Verificar si hay sesión antes de intentar cerrarla
      const { data: { session } } = await supabase.auth.getSession()

      // Solo intentar cerrar sesión en Supabase si hay una sesión activa
      if (session) {
        const { error } = await supabase.auth.signOut()
        // Si hay error pero es porque la sesión ya no existe, ignorarlo silenciosamente
        // Solo loguear el error si no es AuthSessionMissingError
        if (error && !error.message?.includes('Auth session missing') && !error.message?.includes('session')) {
          logger.error('Error al cerrar sesión en Supabase:', error, {
            category: 'auth-signout',
          })
        } else {
          logAuth('signout-success', { userId })
        }
      } else {
        logAuth('signout-no-session', { userId })
      }
    } catch (error) {
      // Si falla el signOut de Supabase, continuar con la limpieza local
      // Esto puede pasar si la sesión ya expiró o no existe
      // No lanzar error porque el logout debe funcionar siempre (JWT stateless)
      if (error.message && !error.message.includes('Auth session missing') && !error.message.includes('session')) {
        logger.error('Error al cerrar sesión en Supabase:', error, {
          category: 'auth-signout',
        })
      }
      logAuth('signout-error', { userId, error: error.message })
    } finally {
      // Siempre limpiar el estado local, incluso si falla el signOut de Supabase
      // El backend usa JWT stateless, así que no necesita endpoint de logout
      localStorage.removeItem(STORAGE_KEYS.SUPABASE_TOKEN)
      setSupabaseToken(null)
      setUser(null)
    }
  }, [user])

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
        localStorage.setItem(STORAGE_KEYS.SUPABASE_TOKEN, session.access_token)
        setSupabaseToken(session.access_token)
        setUser(session.user)
        logger.log('JWT de Supabase actualizado')
        logAuth('supabase-session-refreshed', { success: true, userId: session.user.id })
        return session.access_token
      }

      return null
    } catch (error) {
      logger.error('Error refrescando sesión de Supabase:', error, {
        category: 'auth-session-refresh',
        tokenType: 'supabase',
      })
      logAuth('supabase-session-refresh-failed', { error: error.message })
      // Si falla el refresh, limpiar todo y forzar re-login
      await signOut()
      return null
    }
  }, [signOut])

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      })
      if (error) {
        logAuth('signup-failed', { email, error: error.message })
        throw error
      }
      logAuth('signup-success', { email, userId: data.user?.id })
      return data
    } catch (error) {
      logger.error('Error en signUp:', error, { category: 'auth-signup' })
      throw error
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        logAuth('signin-failed', { email, error: error.message })
        throw error
      }
      logAuth('signin-success', { email, userId: data.user?.id })
      return data
    } catch (error) {
      logger.error('Error en signIn:', error, { category: 'auth-signin' })
      throw error
    }
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
          localStorage.setItem(STORAGE_KEYS.SUPABASE_TOKEN, session.access_token)
          setSupabaseToken(session.access_token)
        } else {
          // Limpiar tokens cuando no hay sesión
          localStorage.removeItem(STORAGE_KEYS.SUPABASE_TOKEN)
          setSupabaseToken(null)
        }

        setLoading(false)
      }
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [checkUser])

  // Escuchar evento de logout forzado desde api.js
  useEffect(() => {
    const handleAuthLogout = () => {
      logger.warn('Logout forzado recibido desde API')
      signOut()
    }

    window.addEventListener('auth:logout', handleAuthLogout)

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout)
    }
  }, [signOut])

  const value = {
    user,
    loading,
    supabaseToken,
    signUp,
    signIn,
    signOut,
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
