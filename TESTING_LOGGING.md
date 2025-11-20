# Guía de Pruebas - Sistema de Logging

## Cómo Probar el Sistema de Logging

### 1. Pruebas en Desarrollo (Local)

#### 1.1. Iniciar la aplicación en modo desarrollo

```bash
npm run dev
```

#### 1.2. Abrir la consola del navegador

1. Abre la aplicación en `http://localhost:3000`
2. Abre las DevTools (F12 o Cmd+Option+I en Mac)
3. Ve a la pestaña "Console"

#### 1.3. Probar diferentes tipos de logs

**A. Probar logs de autenticación:**
- Intenta hacer login con credenciales incorrectas
- Deberías ver logs con formato: `🔐 [Auth] signin-failed`
- Haz login exitoso
- Deberías ver: `🔐 [Auth] signin-success`

**B. Probar logs de API:**
- Navega al dashboard
- Intenta hacer una recarga
- Deberías ver logs: `🌐 [API] POST /api/recharges`
- Si hay errores, verás logs estructurados con detalles

**C. Probar Error Boundary:**
- Abre la consola
- Ejecuta en la consola del navegador:
```javascript
// Forzar un error para probar ErrorBoundary
throw new Error('Test error from console')
```
- Deberías ver el ErrorBoundary capturando el error
- En la consola verás: `Error capturado por ErrorBoundary:`

**D. Probar logs de errores:**
- Intenta hacer una recarga con datos inválidos
- Verás logs de error con contexto completo

### 2. Pruebas en Producción (Cloud Run)

#### 2.1. Verificar que la app está desplegada

Asegúrate de que la aplicación esté desplegada en Cloud Run.

#### 2.2. Acceder a Google Cloud Logging

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto
3. Navega a **Logging** > **Logs Explorer**

#### 2.3. Ver logs estructurados

**Filtro básico para ver todos los logs de la app:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="puntored-recargas-frontend"
jsonPayload.service="puntored-recargas-frontend"
```

**Ver solo errores:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="puntored-recargas-frontend"
jsonPayload.severity="ERROR"
```

**Ver logs de autenticación:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="puntored-recargas-frontend"
jsonPayload.category="authentication"
```

**Ver logs de API:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="puntored-recargas-frontend"
jsonPayload.category="api-error"
```

#### 2.4. Probar en producción

1. Accede a tu aplicación desplegada
2. Realiza acciones que generen logs:
   - Login/Logout
   - Crear recargas
   - Generar errores (intencionalmente)
3. Espera unos segundos
4. Refresca el Logs Explorer en Cloud Console
5. Deberías ver los logs estructurados en formato JSON

### 3. Verificar Estructura de Logs

Los logs en producción deberían tener esta estructura:

```json
{
  "severity": "ERROR",
  "message": "Error capturado por ErrorBoundary",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "puntored-recargas-frontend",
  "environment": "production",
  "userAgent": "Mozilla/5.0...",
  "url": "https://tu-app.run.app/",
  "user": {
    "userId": "uuid-del-usuario"
  },
  "category": "error-boundary",
  "error": {
    "name": "Error",
    "message": "Test error",
    "stack": "..."
  }
}
```

### 4. Pruebas Específicas por Componente

#### 4.1. Probar ErrorBoundary

1. Abre la aplicación
2. En la consola del navegador, ejecuta:
```javascript
// Esto debería activar el ErrorBoundary
React.createElement(() => { throw new Error('Test') })
```

3. Verifica que:
   - Se muestra la UI de fallback
   - En desarrollo: se ve el error en consola
   - En producción: el error se envía a Cloud Logging

#### 4.2. Probar Logging de API

1. Abre Network tab en DevTools
2. Realiza una acción que llame a la API
3. Verifica que:
   - En desarrollo: se ven logs en consola con formato `🌐 [API]`
   - En producción: se envían logs estructurados a Cloud Logging

#### 4.3. Probar Logging de Autenticación

1. Intenta hacer login
2. Verifica que:
   - En desarrollo: se ven logs `🔐 [Auth]`
   - En producción: se envían logs estructurados con `category: "authentication"`

### 5. Verificar Sanitización de Datos

Los logs NO deben contener:
- Tokens completos
- Passwords
- Datos sensibles

Para verificar:
1. Busca en los logs por palabras como "token", "password", "secret"
2. Deberías ver `[REDACTED]` en lugar de valores reales

### 6. Comandos Útiles

```bash
# Ver logs locales en tiempo real (si usas algún servicio de logging local)
# No aplica para este proyecto, pero puedes usar:

# Build de producción para probar
npm run build

# Preview de producción local
npm run preview

# Linting
npm run lint
```

### 7. Checklist de Verificación

- [ ] Los logs aparecen en consola en desarrollo
- [ ] Los logs tienen formato legible en desarrollo
- [ ] Los logs se envían a Cloud Logging en producción
- [ ] Los logs tienen formato JSON estructurado en producción
- [ ] Los errores se capturan correctamente
- [ ] Los datos sensibles están sanitizados
- [ ] El contexto del usuario se incluye (solo ID, no email)
- [ ] Los logs de API incluyen URL, método y status
- [ ] Los logs de autenticación incluyen eventos correctos

### 8. Troubleshooting

**Problema: No veo logs en Cloud Logging**
- Verifica que la app esté desplegada en Cloud Run
- Espera unos segundos (los logs pueden tardar en aparecer)
- Verifica los filtros en Logs Explorer
- Asegúrate de estar en el proyecto correcto

**Problema: Los logs no tienen formato JSON**
- Verifica que `import.meta.env.PROD` sea `true` en producción
- Revisa que `cloudLogger.js` esté importado correctamente

**Problema: Veo datos sensibles en los logs**
- Verifica que `sanitizeData()` esté funcionando
- Revisa que no estés loggeando directamente sin sanitizar

