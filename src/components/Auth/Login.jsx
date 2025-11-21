import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { VALIDATION_RULES } from '../../utils/constants'
import { logger, logAuth } from '../../utils/logger'
import toast from 'react-hot-toast'
import { LogIn } from 'lucide-react'

export const Login = () => {
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    // Validar que los campos no estén vacíos antes de intentar login
    if (!data.email || !data.password) {
      logger.warn('Intento de login con campos vacíos', {
        category: 'auth-validation',
        hasEmail: !!data.email,
        hasPassword: !!data.password,
      })
      logAuth('login-attempt-empty-fields', {})
      return
    }

    setLoading(true)
    const startTime = Date.now()

    try {
      logAuth('login-attempt', { email: data.email })
      await signIn(data.email, data.password)

      const duration = Date.now() - startTime
      logger.info('Login exitoso', {
        category: 'auth-login',
        duration,
        email: data.email,
      })

      toast.success('¡Bienvenido!')
      navigate('/')
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Error en login:', error, {
        category: 'auth-login-error',
        duration,
        email: data.email,
        errorMessage: error.message,
      })
      logAuth('login-failed', {
        email: data.email,
        error: error.message,
        duration,
      })
      toast.error(error.message || 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-sm p-4">
            <img src="/puntored-logo-192.png" alt="Puntored" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h2>
          <p className="text-gray-600 mt-2">Accede a tu cuenta de Puntored Recargas</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              {...register('email', VALIDATION_RULES.email)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
              placeholder="correo@ejemplo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              {...register('password', VALIDATION_RULES.password)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

