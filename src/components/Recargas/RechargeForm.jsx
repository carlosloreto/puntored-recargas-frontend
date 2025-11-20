import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { apiService } from '../../services/api'
import { VALIDATION_RULES } from '../../utils/constants'
import { SupplierCard } from './SupplierCard'
import { useAuthToken } from '../../hooks/useAuthToken'
import { getSuppliers } from '../../utils/suppliersCache'
import { clearTransactionsCache } from '../../utils/transactionsCache'
import { logger } from '../../utils/logger'
import toast from 'react-hot-toast'
import { Smartphone, DollarSign, Building2, Send, Sparkles } from 'lucide-react'

export const RechargeForm = ({ onSuccess }) => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingSuppliers, setLoadingSuppliers] = useState(true)
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [phoneLength, setPhoneLength] = useState(0)
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm()
  const { puntoredToken, isReady } = useAuthToken()
  
  const phoneNumber = watch('phoneNumber')

  useEffect(() => {
    setPhoneLength(phoneNumber?.length || 0)
  }, [phoneNumber])

  const loadSuppliers = useCallback(async () => {
    try {
      const data = await getSuppliers() // Usa el caché, solo carga una vez
      setSuppliers(data)
      setLoadingSuppliers(false)
    } catch (error) {
      logger.error('Error cargando proveedores:', error, {
        category: 'suppliers-load-error',
      })
      toast.error('Error cargando proveedores. Por favor, recarga la página.')
      setLoadingSuppliers(false)
    }
  }, [])

  useEffect(() => {
    // Solo cargar suppliers cuando el token esté listo (una sola vez)
    if (isReady && puntoredToken) {
      loadSuppliers()
    }
  }, [isReady, puntoredToken, loadSuppliers])

  const handleSupplierClick = (supplierId) => {
    setSelectedSupplier(supplierId)
    setValue('supplierId', supplierId)
  }

  const onSubmit = async (data) => {
    // Validar campos antes de enviar
    if (!data.phoneNumber || !data.amount) {
      logger.warn('Intento de recarga con campos vacíos', {
        category: 'recharge-validation',
        hasPhoneNumber: !!data.phoneNumber,
        hasAmount: !!data.amount,
        hasSupplier: !!selectedSupplier,
      })
      return
    }

    if (!selectedSupplier) {
      logger.warn('Intento de recarga sin seleccionar operador', {
        category: 'recharge-validation',
        phoneNumber: data.phoneNumber,
        amount: data.amount,
      })
      toast.error('Por favor selecciona un operador')
      return
    }

    // Validar formato del teléfono
    if (data.phoneNumber.length !== 10) {
      logger.warn('Intento de recarga con teléfono inválido', {
        category: 'recharge-validation',
        phoneLength: data.phoneNumber.length,
        phoneNumber: data.phoneNumber,
      })
      return
    }

    // Validar monto
    const amount = parseInt(data.amount)
    if (isNaN(amount) || amount < 1000 || amount > 100000) {
      logger.warn('Intento de recarga con monto inválido', {
        category: 'recharge-validation',
        amount: data.amount,
        parsedAmount: amount,
      })
      return
    }
    
    setLoading(true)
    const startTime = Date.now()
    
    try {
      logger.info('Iniciando proceso de recarga', {
        category: 'recharge-submit',
        phoneNumber: data.phoneNumber,
        amount,
        supplierId: selectedSupplier,
      })

      const result = await apiService.createRecharge({
        phoneNumber: data.phoneNumber,
        amount,
        supplierId: selectedSupplier,
      })
      
      const duration = Date.now() - startTime
      logger.info('Recarga exitosa', {
        category: 'recharge-success',
        transactionId: result?.id || result?.transactionId,
        phoneNumber: data.phoneNumber,
        amount,
        supplierId: selectedSupplier,
        duration,
      })
      
      // Limpiar caché de transacciones para que se actualicen cuando vaya al historial
      clearTransactionsCache()
      logger.info('Caché de transacciones limpiado después de recarga exitosa', {
        category: 'transactions-cache',
      })
      
      toast.success('¡Recarga exitosa!')
      reset()
      setSelectedSupplier('')
      setPhoneLength(0)
      onSuccess(result)
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Error en recarga:', error, {
        category: 'recharge-error',
        duration,
        phoneNumber: data.phoneNumber,
        amount,
        supplierId: selectedSupplier,
        errorType: error.code || error.message,
        hasResponse: !!error.response,
        status: error.response?.status,
        responseData: error.response?.data,
      })
      
      const errorData = error.response?.data
      
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        // Mostrar todos los errores de validación
        errorData.errors.forEach(err => toast.error(err))
      } else {
        const message = errorData?.message || 'Error al procesar la recarga'
        toast.error(message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loadingSuppliers) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-[#eb0b7f] to-[#c70967] rounded-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Nueva Recarga</h2>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Número de teléfono */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#eb0b7f]" />
                Número de Teléfono
              </div>
              <span className={`text-xs font-medium ${phoneLength === 10 ? 'text-green-600' : phoneLength > 0 ? 'text-[#eb0b7f]' : 'text-gray-400'}`}>
                {phoneLength}/10
              </span>
            </div>
          </label>
          <input
            id="phoneNumber"
            type="tel"
            maxLength="10"
            {...register('phoneNumber', VALIDATION_RULES.phoneNumber)}
            onInput={(e) => {
              // Solo permitir números
              e.target.value = e.target.value.replace(/[^0-9]/g, '')
            }}
            placeholder="3001234567"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#eb0b7f] focus:border-[#eb0b7f] transition text-lg"
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <span>⚠️</span> {errors.phoneNumber.message}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">💡 Debe iniciar con 3 y tener 10 dígitos</p>
        </div>

        {/* Monto */}
        <div>
          <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#eb0b7f]" />
              Monto (COP)
            </div>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
            <input
              id="amount"
              type="text"
              inputMode="numeric"
              {...register('amount', VALIDATION_RULES.amount)}
              onInput={(e) => {
                // Solo permitir números
                e.target.value = e.target.value.replace(/[^0-9]/g, '')
              }}
              placeholder="10000"
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#eb0b7f] focus:border-[#eb0b7f] transition text-lg"
            />
          </div>
          {errors.amount && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <span>⚠️</span> {errors.amount.message}
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => setValue('amount', '5000')}
              className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
            >
              $5,000
            </button>
            <button
              type="button"
              onClick={() => setValue('amount', '10000')}
              className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
            >
              $10,000
            </button>
            <button
              type="button"
              onClick={() => setValue('amount', '20000')}
              className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
            >
              $20,000
            </button>
          </div>
        </div>

        {/* Proveedor - Tarjetas */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              Selecciona tu Operador
            </div>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                selected={selectedSupplier === supplier.id}
                onClick={handleSupplierClick}
              />
            ))}
          </div>
          {!selectedSupplier && errors.supplierId && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <span>⚠️</span> Por favor selecciona un operador
            </p>
          )}
        </div>

        {/* Campo hidden para react-hook-form */}
        <input type="hidden" {...register('supplierId', { required: true })} />

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#eb0b7f] to-[#c70967] text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-[#d60a71] hover:to-[#b0085c] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              Procesando Recarga...
            </>
          ) : (
            <>
              <Send className="w-6 h-6" />
              Realizar Recarga Ahora
            </>
          )}
        </button>
      </form>
    </div>
  )
}

