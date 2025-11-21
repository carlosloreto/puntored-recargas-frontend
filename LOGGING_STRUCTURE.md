# Estructura del Sistema de Logging - Frontend

## Resumen
Sistema de logging dual: consola en desarrollo, logs estructurados JSON en producción para Google Cloud Logging.

## Arquitectura

### 1. Capas de Logging

```
logger.js (Wrapper) → cloudLogger.js (Servicio) → Cloud Logging
```

- **logger.js**: Adapta según entorno (dev/prod)
- **cloudLogger.js**: Genera logs estructurados JSON

### 2. Niveles de Severidad

- `ERROR`: Errores críticos (siempre registrados)
- `WARNING`: Advertencias
- `INFO`: Información general
- `DEBUG`: Solo en desarrollo

### 3. Formato de Log Estructurado (Producción)

```json
{
  "severity": "ERROR|WARNING|INFO|DEBUG",
  "message": "Mensaje descriptivo del evento",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "puntored-recargas-frontend",
  "environment": "production|development",
  "userAgent": "Mozilla/5.0...",
  "language": "es-ES",
  "platform": "MacIntel",
  "url": "https://app.run.app/",
  "referrer": "https://referrer.com/",
  "user": {
    "userId": "uuid-del-usuario"
  },
  "category": "authentication|api|error-boundary",
  "error": {
    "name": "Error",
    "message": "Mensaje de error",
    "stack": "Stack trace completo"
  },
  "metadata": { /* datos adicionales sanitizados */ }
}
```

### 4. Campos Obligatorios

- `severity`: Nivel del log
- `message`: Mensaje descriptivo
- `timestamp`: ISO 8601
- `service`: Nombre del servicio
- `environment`: "production" o "development"

### 5. Campos de Contexto

**Navegador/Cliente:**
- `userAgent`: User agent del navegador
- `language`: Idioma del navegador
- `platform`: Plataforma del sistema
- `url`: URL actual
- `referrer`: URL de referencia

**Usuario:**
- `user.userId`: ID del usuario (JWT sub/user_id)
- ⚠️ **NUNCA** incluir: email, tokens completos, passwords

### 6. Categorías Especiales

- `category: "authentication"`: Eventos de auth (login, logout, signup)
- `category: "api"`: Llamadas a API (método, URL, status)
- `category: "error-boundary"`: Errores capturados por ErrorBoundary

### 7. Sanitización de Datos

**Campos automáticamente redactados:**
- `password`, `token`, `secret`, `key`, `authorization`, `auth`

**Regla:** Cualquier campo que contenga estas palabras se reemplaza por `[REDACTED]`

### 8. Helpers Especializados

**logAuth(action, details)**
- Acción: "login", "logout", "signup", "signin-success", "signin-failed"
- Sanitiza automáticamente tokens

**logApi(method, url, details)**
- Registra: método HTTP, URL, status code, tiempo de respuesta
- Sanitiza headers sensibles

### 9. Implementación en Producción

**Cloud Run captura automáticamente:**
- Logs JSON en `stdout`/`stderr` vía `console.log(JSON.stringify(logEntry))`
- No requiere SDK adicional
- Los logs se indexan automáticamente en Cloud Logging

**Filtros útiles en Cloud Logging:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="nombre-del-servicio"
jsonPayload.service="nombre-del-servicio"
jsonPayload.severity="ERROR"
jsonPayload.category="authentication"
```

## Estructura para Backend

### Implementación Recomendada

1. **Servicio de Logging Centralizado**
   - Función `createStructuredLog(severity, message, metadata)`
   - Sanitización automática de datos sensibles
   - Contexto de request (IP, user-agent, user ID)

2. **Niveles de Log**
   - ERROR, WARNING, INFO, DEBUG
   - ERROR siempre registrado, DEBUG solo en desarrollo

3. **Formato JSON Estructurado**
   - Mismos campos base: severity, message, timestamp, service, environment
   - Contexto del servidor: requestId, method, path, statusCode
   - Contexto del usuario: userId (sin datos sensibles)

4. **Categorías**
   - `authentication`, `api`, `database`, `external-service`, `validation`

5. **Salida**
   - Desarrollo: formato legible en consola
   - Producción: `console.log(JSON.stringify(logEntry))` para Cloud Logging

### Ejemplo de Log Backend

```json
{
  "severity": "ERROR",
  "message": "Error procesando recarga",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "puntored-recargas-backend",
  "environment": "production",
  "requestId": "uuid-request",
  "method": "POST",
  "path": "/api/recharges",
  "statusCode": 500,
  "user": {
    "userId": "uuid-usuario"
  },
  "category": "api",
  "error": {
    "name": "DatabaseError",
    "message": "Connection timeout",
    "stack": "..."
  },
  "metadata": {
    "supplierId": "123",
    "amount": 50
  }
}
```

