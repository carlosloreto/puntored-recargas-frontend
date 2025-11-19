import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { logger } from '../../utils/logger'
import { LogOut, Home, History, User, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

export const Header = () => {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Sesión cerrada')
      navigate('/login')
    } catch (error) {
      logger.error('Error al cerrar sesión:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo oficial de Puntored */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo-puntored.png" 
              alt="Puntored Logo" 
              className="h-8 w-auto object-contain"
            />
            <div className="hidden sm:block border-l border-gray-300 pl-3">
              <p className="text-sm font-semibold text-gray-700">Recargas</p>
            </div>
          </div>

          {/* Navegación - Centro */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`relative flex items-center gap-2 px-2 py-2 transition-colors ${
                isActive('/') 
                  ? 'text-primary' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Dashboard</span>
              {isActive('/') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
              )}
            </Link>
            
            <Link
              to="/history"
              className={`relative flex items-center gap-2 px-2 py-2 transition-colors ${
                isActive('/history') 
                  ? 'text-primary' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="font-medium">Historial</span>
              {isActive('/history') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
              )}
            </Link>
          </nav>

          {/* Usuario con Dropdown - Derecha */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700 font-medium max-w-[150px] truncate">
                {user?.email}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500">Cuenta</p>
                  <p className="text-sm text-gray-900 font-medium truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navegación móvil */}
        <div className="md:hidden flex gap-2 pb-3">
          <Link
            to="/"
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition text-sm ${
              isActive('/') 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="font-medium">Dashboard</span>
          </Link>
          
          <Link
            to="/history"
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition text-sm ${
              isActive('/history') 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="font-medium">Historial</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

