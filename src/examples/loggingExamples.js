/**
 * Ejemplo de uso del sistema de logging visual
 * 
 * Este archivo demuestra cómo usar el nuevo sistema de logging
 * que mantiene coherencia visual con el backend.
 */

import { logger, logAuth } from '../utils/logger'

/**
 * Ejemplo 1: Flujo completo de recarga con logs visuales
 */
export async function exampleRechargeFlow() {
    const requestId = crypto.randomUUID()
    const startTime = Date.now()

    // Inicio de operación con separador
    logger.logOperationStart('POST /api/recharges', requestId)

    try {
        // Log de validación
        const data = { phoneNumber: '3001234567', amount: 10000 }
        logger.logState('Validando formulario', JSON.stringify(data))

        // Simular llamada a API
        logger.logUI('Mostrando indicador de carga')

        // Log de API call
        const apiStartTime = Date.now()
        const response = await fetch('/api/recharges', {
            method: 'POST',
            body: JSON.stringify(data)
        })
        const apiDuration = Date.now() - apiStartTime

        // Log de respuesta API
        logger.logApi('POST', '/api/recharges', response.status, apiDuration)

        if (response.ok) {
            // Log de actualización de estado
            logger.logState('Actualizando estado', 'recharge → completed')

            // Log de éxito
            logger.logSuccess('Recarga completada exitosamente')

            // Fin de operación
            const totalDuration = Date.now() - startTime
            logger.logOperationEnd('POST /api/recharges', response.status, totalDuration)

            return await response.json()
        } else {
            throw new Error('Recharge failed')
        }
    } catch (error) {
        // Log de error
        logger.logError('Error en recarga', error, {
            category: 'api-error',
            requestId
        })

        const totalDuration = Date.now() - startTime
        logger.logOperationEnd('POST /api/recharges', 500, totalDuration)

        throw error
    }
}

/**
 * Ejemplo 2: Logs de autenticación
 */
export function exampleAuthFlow() {
    // Login exitoso
    logAuth('Login exitoso', {
        userId: 'user-123',
        method: 'email',
        // El token se sanitiza automáticamente
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })

    // Logout
    logger.logAuth('Logout', { userId: 'user-123' })

    // Evento de seguridad
    logger.logSecurity('Intento de acceso no autorizado', {
        path: '/admin',
        userId: null
    })
}

/**
 * Ejemplo 3: Logs de validación
 */
export function exampleValidation() {
    // Validación fallida
    logger.logValidation('El monto debe ser mayor a 1000')

    // Validación de formato
    logger.logValidation('Formato de teléfono inválido: debe tener 10 dígitos')
}

/**
 * Ejemplo 4: Logs de servicios externos
 */
export async function exampleExternalService() {
    const startTime = Date.now()

    try {
        const response = await fetch('https://api.puntored.com/auth', {
            method: 'POST'
        })

        const duration = Date.now() - startTime
        logger.logExternal('POST', 'https://api.puntored.com/auth', response.status, duration)

        return await response.json()
    } catch (error) {
        const duration = Date.now() - startTime
        logger.logExternal('POST', 'https://api.puntored.com/auth', 500, duration)
        throw error
    }
}

/**
 * Ejemplo 5: Logs de UI/UX
 */
export function exampleUILogs() {
    // Navegación
    logger.logUI('Navegando a: /dashboard/recharges')

    // Interacción de usuario
    logger.logUI('Usuario seleccionó proveedor', { supplierId: 'claro' })

    // Cambio de estado de UI
    logger.logUI('Modal abierto', { modalType: 'confirmation' })
}

/**
 * Ejemplo 6: Uso de logs básicos (compatibilidad)
 */
export function exampleBasicLogs() {
    // Estos métodos mantienen compatibilidad con código existente
    logger.log('Mensaje informativo general')
    logger.info('Información importante')
    logger.warn('Advertencia')
    logger.error('Error crítico', new Error('Algo salió mal'))
    logger.debug('Debug info (solo en desarrollo)')
}

/**
 * Salida esperada en consola (desarrollo):
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🌐 POST /api/recharges | Request: abc-123-def-456
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 💾 Validando formulario: {"phoneNumber":"3001234567","amount":10000}
 * 📱 Mostrando indicador de carga
 * 🌐 POST /api/recharges → 200 (1.5s)
 * 💾 Actualizando estado: recharge → completed
 * ✅ Recarga completada exitosamente
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ✅ POST /api/recharges → 200 (1.5s)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
