import { useState, useEffect, useCallback } from 'react'
import { getTransactions, refreshTransactions } from '../../utils/transactionsCache'
import { TransactionCard } from './TransactionCard'
import { TransactionFilters } from './TransactionFilters'
import { logger } from '../../utils/logger'
import { RefreshCw, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export const TransactionList = () => {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [loading, setLoading] = useState(true) // Cargar automáticamente la primera vez
  const [refreshing, setRefreshing] = useState(false)
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const loadTransactions = useCallback(async () => {
    setLoading(true)
    try {
      // Usa el caché - solo carga la primera vez, luego usa caché
      const data = await getTransactions()
      setTransactions(data)
      setFilteredTransactions(data)
      setCurrentPage(1) // Reset a la primera página
    } catch (error) {
      logger.error('Error cargando transacciones:', error, {
        category: 'transactions-load-error',
        errorType: error.code || error.message,
        hasResponse: !!error.response,
        status: error.response?.status,
      })
      toast.error('Error al cargar el historial')
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar transacciones automáticamente SOLO la primera vez (usa caché)
  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const handleRefresh = async () => {
    setRefreshing(true)
    const startTime = Date.now()
    try {
      logger.info('Actualizando transacciones (forzar recarga)', {
        category: 'transactions-refresh',
      })
      
      // Forzar recarga (limpia caché y carga de nuevo)
      const data = await refreshTransactions()
      const duration = Date.now() - startTime
      
      logger.info('Transacciones actualizadas exitosamente', {
        category: 'transactions-refresh',
        count: data?.length || 0,
        duration,
      })
      
      setTransactions(data)
      setFilteredTransactions(data)
      setCurrentPage(1) // Reset a la primera página
      toast.success('Historial actualizado')
    } catch (error) {
      const duration = Date.now() - startTime
      logger.error('Error actualizando transacciones:', error, {
        category: 'transactions-refresh-error',
        duration,
        errorType: error.code || error.message,
        hasResponse: !!error.response,
        status: error.response?.status,
      })
      toast.error('Error al actualizar el historial')
    } finally {
      setRefreshing(false)
    }
  }

  const handleFilter = (filters) => {
    let filtered = [...transactions]

    // Filtrar por número de teléfono
    if (filters.phoneNumber) {
      filtered = filtered.filter(t => 
        t.phoneNumber.includes(filters.phoneNumber)
      )
    }

    // Filtrar por estado
    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status)
    }

    // Filtrar por proveedor
    if (filters.supplierId) {
      filtered = filtered.filter(t => t.supplierId === filters.supplierId)
    }

    // Filtrar por rango de fechas
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filtered = filtered.filter(t => new Date(t.createdAt) >= fromDate)
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999) // Incluir todo el día
      filtered = filtered.filter(t => new Date(t.createdAt) <= toDate)
    }

    setFilteredTransactions(filtered)
    setCurrentPage(1) // Reset a la primera página cuando se filtran
  }

  // Calcular paginación
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex)

  const goToPage = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    
    return pages
  }

  return (
    <div className="space-y-6">
      {/* Header con filtros y refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900">
            Historial de Transacciones
          </h2>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <TransactionFilters onFilter={handleFilter} />

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Cargando historial...</p>
        </div>
      )}

      {/* Lista de transacciones */}
      {!loading && transactions.length === 0 && filteredTransactions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No hay transacciones para mostrar</p>
          <p className="text-gray-500 text-sm mt-2">
            Presiona &quot;Actualizar&quot; para cargar el historial
          </p>
        </div>
      ) : !loading && filteredTransactions.length === 0 && transactions.length > 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No hay transacciones que coincidan con los filtros</p>
          <p className="text-gray-500 text-sm mt-2">
            Intenta cambiar los filtros
          </p>
        </div>
      ) : !loading && filteredTransactions.length > 0 && (
        <>
          <div className="space-y-3">
            {currentTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Info y selector de items por página */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    Mostrando <span className="font-medium text-gray-900">{startIndex + 1}</span> - <span className="font-medium text-gray-900">{Math.min(endIndex, filteredTransactions.length)}</span> de <span className="font-medium text-gray-900">{filteredTransactions.length}</span>
                  </span>
                  
                  <div className="relative">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                      className="px-3 py-1.5 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white cursor-pointer"
                    >
                      <option value={5}>5 por página</option>
                      <option value={10}>10 por página</option>
                      <option value={20}>20 por página</option>
                      <option value={50}>50 por página</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Botones de navegación */}
                <div className="flex items-center gap-2">
                  {/* Anterior */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Anterior</span>
                  </button>

                  {/* Números de página */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-2 rounded-lg transition ${
                            currentPage === page
                              ? 'bg-primary text-white font-medium'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  {/* Siguiente */}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <span className="hidden sm:inline">Siguiente</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

