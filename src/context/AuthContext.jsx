import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { apiService } from '../services/api'
import { logger } from '../utils/logger'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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
  }, [])

  const checkUser = async () => {
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
  }

  const refreshPuntoredToken = async () => {
    try {
      const token = await apiService.getAuthToken()
      localStorage.setItem('puntoredToken', token)
      logger.log('Token de Puntored actualizado')
    } catch (error) {
      logger.error('Error obteniendo token de Puntored:', error)
    }
  }

  /**
   * Refresca el JWT de Supabase cuando está por expirar
   * Esto permite mantener la sesión activa sin intervención del usuario
   */
  const refreshSupabaseSession = async () => {
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
  }

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

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    localStorage.removeItem('puntoredToken')
    localStorage.removeItem('supabaseToken')
  }

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

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

