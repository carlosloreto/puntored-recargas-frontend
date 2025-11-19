import { useNavigate } from 'react-router-dom'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { CheckCircle, Receipt, X, History, RotateCcw } from 'lucide-react'

export const RechargeSuccess = ({ transaction, onClose, onNewRecharge }) => {
  const navigate = useNavigate()

  if (!transaction) return null

  const handleViewHistory = () => {
    navigate('/history')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Icono de éxito */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">¡Recarga Exitosa!</h2>
        </div>

        {/* Información de la transacción */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
          <div className="flex items-start gap-3">
            <Receipt className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Ticket</p>
              <p className="font-mono text-sm text-gray-900 break-all">{transaction.ticket}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Proveedor:</span>
              <span className="font-semibold text-gray-900">{transaction.supplierName}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Teléfono:</span>
              <span className="font-semibold text-gray-900">{transaction.phoneNumber}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Monto:</span>
              <span className="font-bold text-2xl text-success">
                {formatCurrency(transaction.amount)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Estado:</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {transaction.status}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Fecha:</span>
              <span className="text-gray-900">{formatDate(transaction.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={onNewRecharge}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-dark transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Nueva Recarga
          </button>
          
          <button
            onClick={handleViewHistory}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <History className="w-5 h-5" />
            Ver Historial
          </button>
        </div>
      </div>
    </div>
  )
}

