export const VALIDATION_RULES = {
  phoneNumber: {
    required: 'El número de teléfono es requerido',
    pattern: {
      value: /^3[0-9]{9}$/,
      message: 'Número inválido',
    },
  },
  amount: {
    required: 'El monto es requerido',
    validate: {
      isNumber: value => !isNaN(value) && value !== '' || 'Debe ser un número válido',
      min: value => parseInt(value) >= 1000 || 'El monto mínimo es $1,000 COP',
      max: value => parseInt(value) <= 100000 || 'El monto máximo es $100,000 COP',
    },
  },
  email: {
    required: 'El email es requerido',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Email inválido',
    },
  },
  password: {
    required: 'La contraseña es requerida',
    minLength: {
      value: 6,
      message: 'Mínimo 6 caracteres',
    },
  },
}

export const MIN_AMOUNT = 1000
export const MAX_AMOUNT = 100000

export const SUPPLIERS = {
  CLARO: '8753',
  MOVISTAR: '9773',
  TIGO: '3398',
  WOM: '4689',
}

export const TRANSACTION_STATUS = {
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
}

// Configuración de timeouts para la API
export const API_TIMEOUT = 15000 // 15 segundos
export const AUTH_TIMEOUT = 10000 // 10 segundos para autenticación

export const STORAGE_KEYS = {
  SUPABASE_TOKEN: 'supabaseToken',
}

export const PAGINATION_OPTIONS = [5, 10, 20, 50]

