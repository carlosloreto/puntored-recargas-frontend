import { useState } from 'react'
import { Header } from '../components/Layout/Header'
import { RechargeForm } from '../components/Recargas/RechargeForm'
import { RechargeSuccess } from '../components/Recargas/RechargeSuccess'
import { Smartphone, DollarSign, Zap } from 'lucide-react'

export const DashboardPage = () => {
  const [successTransaction, setSuccessTransaction] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleRechargeSuccess = (transaction) => {
    setSuccessTransaction(transaction)
    setShowSuccess(true)
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
    setSuccessTransaction(null)
  }

  const handleNewRecharge = () => {
    setShowSuccess(false)
    setSuccessTransaction(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#eb0b7f] to-[#c70967] rounded-2xl mb-4 shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-[#eb0b7f] to-[#c70967] bg-clip-text text-transparent">
            Recarga Instantánea
          </h1>
          <p className="text-lg text-gray-600">
            Rápido, seguro y confiable. Recarga en segundos
          </p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <RechargeForm onSuccess={handleRechargeSuccess} />
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Límites Card */}
            <div className="bg-gradient-to-br from-[#eb0b7f] to-[#c70967] rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6" />
                <h3 className="text-lg font-bold">Límites de Recarga</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-pink-100">Mínimo:</span>
                  <span className="font-bold text-xl">$1,000</span>
                </div>
                <div className="h-px bg-pink-300"></div>
                <div className="flex justify-between items-center">
                  <span className="text-pink-100">Máximo:</span>
                  <span className="font-bold text-xl">$100,000</span>
                </div>
              </div>
            </div>

            {/* Instrucciones Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="w-6 h-6 text-[#eb0b7f]" />
                <h3 className="text-lg font-bold text-gray-900">¿Cómo Recargar?</h3>
              </div>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-pink-100 text-[#eb0b7f] rounded-full flex items-center justify-center font-bold text-xs">1</span>
                  <span>Ingresa el número de celular (10 dígitos)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-pink-100 text-[#eb0b7f] rounded-full flex items-center justify-center font-bold text-xs">2</span>
                  <span>Selecciona el monto a recargar</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-pink-100 text-[#eb0b7f] rounded-full flex items-center justify-center font-bold text-xs">3</span>
                  <span>Elige tu operador móvil</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-pink-100 text-[#eb0b7f] rounded-full flex items-center justify-center font-bold text-xs">4</span>
                  <span>Confirma y recibe tu ticket</span>
                </li>
              </ol>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Tip</h3>
              <p className="text-sm text-gray-600">
                Guarda tu ticket de confirmación. Puedes consultarlo en cualquier momento desde el historial de transacciones.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de éxito */}
      {showSuccess && (
        <RechargeSuccess
          transaction={successTransaction}
          onClose={handleCloseSuccess}
          onNewRecharge={handleNewRecharge}
        />
      )}
    </div>
  )
}

