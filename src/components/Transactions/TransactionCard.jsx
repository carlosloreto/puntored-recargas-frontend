import { formatCurrency, formatDate, formatPhoneNumber } from '../../utils/formatters'
import { Building2, Smartphone, Calendar, Receipt, CheckCircle, Clock, XCircle } from 'lucide-react'

export const TransactionCard = ({ transaction }) => {
  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completada'
      case 'PENDING':
        return 'Pendiente'
      case 'FAILED':
        return 'Fallida'
      default:
        return 'Desconocido'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'FAILED':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        {/* Información principal */}
        <div className="flex-1 space-y-2.5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-lg text-gray-900">
                  {transaction.supplierName}
                </h3>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <Smartphone className="w-4 h-4" />
                <p className="text-sm">
                  {formatPhoneNumber(transaction.phoneNumber)}
                </p>
              </div>
            </div>

            {/* Monto destacado */}
            <div className="text-right">
              <p className="text-2xl font-bold text-success">
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>

          {/* Fecha y Estado en una fila */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Calendar className="w-4 h-4" />
              <p>{formatDate(transaction.createdAt)}</p>
            </div>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
              {getStatusIcon(transaction.status)}
              {getStatusText(transaction.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Ticket (si existe) */}
      {transaction.ticket && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-start gap-2">
            <Receipt className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">Ticket de confirmación:</p>
              <p className="text-sm font-mono text-gray-700 break-all">
                {transaction.ticket}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

