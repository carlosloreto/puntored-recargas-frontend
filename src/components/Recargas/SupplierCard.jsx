
const supplierColors = {
  '8753': { bg: 'from-red-500 to-red-600', icon: '📱' }, // Claro
  '9773': { bg: 'from-green-500 to-green-600', icon: '🌟' }, // Movistar
  '3398': { bg: 'from-blue-500 to-blue-600', icon: '💙' }, // Tigo
  '4689': { bg: 'from-purple-500 to-purple-600', icon: '📞' }, // WOM
}

export const SupplierCard = ({ supplier, selected, onClick }) => {
  const colors = supplierColors[supplier.id] || { bg: 'from-gray-500 to-gray-600', icon: '📱' }
  
  // Intentar cargar logo desde /public/logos/, si no existe usar emoji
  const logoPath = `/logos/${supplier.id}.png`
  
  return (
    <button
      type="button"
      onClick={() => onClick(supplier.id)}
      className={`relative w-full p-3 rounded-lg border-2 transition-all duration-200 ${
        selected
          ? 'border-[#eb0b7f] bg-pink-50 shadow-lg scale-105'
          : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100 overflow-hidden">
          <img 
            src={logoPath} 
            alt={supplier.name}
            className="w-full h-full object-contain p-1"
            onError={(e) => {
              // Si la imagen no carga, mostrar icono con gradiente
              e.target.style.display = 'none'
              const parent = e.target.parentElement
              parent.className = `w-10 h-10 rounded-lg bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-md`
              parent.querySelector('span').style.display = 'block'
            }}
          />
          <span className="text-xl hidden">{colors.icon}</span>
        </div>
        <div className="flex-1 text-left">
          <p className="font-bold text-sm text-gray-900">{supplier.name}</p>
          <p className="text-xs text-gray-500">Operador</p>
        </div>
        {selected && (
          <div className="w-5 h-5 bg-[#eb0b7f] rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        )}
      </div>
    </button>
  )
}

