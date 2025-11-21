import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { VALIDATION_RULES } from '../../utils/constants'
import { logger, logAuth } from '../../utils/logger'
import toast from 'react-hot-toast'
import { UserPlus } from 'lucide-react'

export const Register = () => {
  const [loading, setLoading] = useState(false)
  const { signUp, signIn } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    // Validar que los campos no estén vacíos
    if (!data.email || !data.password || !data.confirmPassword) {
      logger.warn('Intento de registro con campos vacíos', {
        category: 'auth-validation',
        hasEmail: !!data.email,
        hasPassword: !!data.password,
        hasConfirmPassword: !!data.confirmPassword,
      })
      logAuth('register-attempt-empty-fields', {})
      return
    }

    // Validar que las contraseñas coincidan
    if (data.password !== data.confirmPassword) {
      logger.warn('Intento de registro con contraseñas que no coinciden', {
        category: 'auth-validation',
        email: data.email,
      })
      logAuth('register-attempt-password-mismatch', { email: data.email })
      return
    }

    setLoading(true)
    const startTime = Date.now()

    try {
      logAuth('register-attempt', { email: data.email })

      // Registrar usuario
      await signUp(data.email, data.password)

      // Auto-login después del registro
      await signIn(data.email, data.password)

      const duration = Date.now() - startTime
      logger.info('Registro exitoso', {
        category: 'auth-register',
        duration,
        email: data.email,
      })

      toast.success('¡Cuenta creada exitosamente!')
      navigate('/')
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Error en registro:', error, {
        category: 'auth-register-error',
        duration,
        email: data.email,
        errorMessage: error.message,
      })
      logAuth('register-failed', {
        email: data.email,
        error: error.message,
        duration,
      })

      if (error.message.includes('already registered')) {
        toast.error('Este correo ya está registrado')
      } else {
        toast.error(error.message || 'Error al crear la cuenta')
      }
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
          <h2 className="text-3xl font-bold text-gray-900">Crear Cuenta</h2>
          <p className="text-gray-600 mt-2">Regístrate en Puntored Recargas</p>
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

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', {
                required: 'Por favor confirma tu contraseña',
                validate: value => value === password || 'Las contraseñas no coinciden'
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
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
                Creando cuenta...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Crear Cuenta
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

