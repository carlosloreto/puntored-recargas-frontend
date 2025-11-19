/**
 * Formatea un número como moneda colombiana (COP)
 * @param {number} amount - El monto a formatear
 * @returns {string} - El monto formateado (ej: "$10,000")
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formatea una fecha en formato legible
 * @param {string} dateString - La fecha en formato ISO
 * @returns {string} - La fecha formateada (ej: "18 de noviembre de 2025, 18:41")
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/**
 * Formatea una fecha en formato corto
 * @param {string} dateString - La fecha en formato ISO
 * @returns {string} - La fecha formateada (ej: "18/11/2025")
 */
export const formatDateShort = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/**
 * Formatea un número de teléfono
 * @param {string} phoneNumber - El número de teléfono
 * @returns {string} - El número formateado (ej: "300 123 4567")
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || phoneNumber.length !== 10) return phoneNumber
  return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6)}`
}

