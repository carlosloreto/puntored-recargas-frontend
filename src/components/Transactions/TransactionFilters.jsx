import { useState, useEffect } from 'react'
import { Search, X, Filter, Calendar, CheckCircle, Building2 } from 'lucide-react'
import { getSuppliers } from '../../utils/suppliersCache'
import { logger } from '../../utils/logger'

export const TransactionFilters = ({ onFilter }) => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [status, setStatus] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [suppliers, setSuppliers] = useState([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    try {
      const data = await getSuppliers() // Usa el caché, solo carga una vez
      setSuppliers(data)
    } catch (error) {
      logger.error('Error cargando proveedores:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    applyFilters()
  }

  const applyFilters = () => {
    onFilter({
      phoneNumber,
      status,
      supplierId,
      dateFrom,
      dateTo
    })
  }

  const handleClear = () => {
    setPhoneNumber('')
    setStatus('')
    setSupplierId('')
    setDateFrom('')
    setDateTo('')
    onFilter({})
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
      {/* Búsqueda principal */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Buscar por número de teléfono..."
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {phoneNumber && (
            <button
              type="button"
              onClick={() => setPhoneNumber('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-4 py-2.5 border rounded-lg transition font-medium flex items-center gap-2 ${
            showAdvanced 
              ? 'bg-primary text-white border-primary' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>

        <button
          type="submit"
          className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium"
        >
          Buscar
        </button>
      </form>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Estado
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-[42px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white cursor-pointer pr-10"
              >
                <option value="">Todos los estados</option>
                <option value="COMPLETED">✓ Completada</option>
                <option value="PENDING">⏱ Pendiente</option>
                <option value="FAILED">✕ Fallida</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              Operador
            </label>
            <div className="relative">
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full h-[42px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white cursor-pointer pr-10"
              >
                <option value="">Todos los operadores</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Fecha desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Desde
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full h-[42px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Fecha hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Hasta
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full h-[42px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Botón limpiar filtros */}
          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

