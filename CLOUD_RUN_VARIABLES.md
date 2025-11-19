# Configuración de Variables de Entorno en Google Cloud Run

## ⚠️ Problema Importante

Las variables `VITE_*` se inyectan en **build time**, no en runtime. Esto significa que si solo configuras las variables en Cloud Run (runtime), **NO estarán disponibles durante el build** y la aplicación no funcionará correctamente.

## ✅ Solución Implementada

Se ha creado un script de build (`scripts/build.js`) que:
1. Lee las variables de entorno configuradas en Cloud Run
2. Crea un archivo `.env.production` temporal durante el build
3. Vite puede leer estas variables y las inyecta en el código

## 📋 Pasos para Configurar en Google Cloud Run

### Opción 1: Desde la Consola Web

1. **Ve a Cloud Run Console:**
   - Navega a tu servicio en [Google Cloud Console](https://console.cloud.google.com/run)

2. **Edita el servicio:**
   - Haz clic en **"EDIT & DEPLOY NEW REVISION"**

3. **Configura las variables de entorno:**
   - Ve a la sección **"Variables & Secrets"**
   - Haz clic en **"ADD VARIABLE"** para cada variable
   - Agrega las siguientes variables:

   ```
   VITE_BACKEND_URL = https://puntored-transactions-api-840635133484.southamerica-east1.run.app
   VITE_SUPABASE_URL = https://xewoecsyhbbwhvwdjjew.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhld29lY3N5aGJid2h2d2RqamV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0OTgyODcsImV4cCI6MjA3OTA3NDI4N30.kISqZkUPttsCu5UCFqISO57QEV0mGHg09yowftMaajQ
   NODE_ENV = production
   ```

4. **IMPORTANTE - Configurar para Build Time:**
   - En la sección **"Variables & Secrets"**, busca la opción **"Build-time variables"** o **"Cloud Build variables"**
   - Si no ves esta opción, las variables configuradas en "Variables & Secrets" también estarán disponibles durante el build cuando uses buildpacks
   - **Asegúrate de que las variables estén disponibles durante el build**

5. **Desplegar:**
   - Haz clic en **"DEPLOY"** o **"CREATE"**

### Opción 2: Desde la Línea de Comandos (gcloud CLI)

```bash
gcloud run deploy puntored-recargas-frontend \
  --source . \
  --platform managed \
  --region southamerica-east1 \
  --allow-unauthenticated \
  --set-env-vars VITE_BACKEND_URL=https://puntored-transactions-api-840635133484.southamerica-east1.run.app,VITE_SUPABASE_URL=https://xewoecsyhbbwhvwdjjew.supabase.co,VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhld29lY3N5aGJid2h2d2RqamV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0OTgyODcsImV4cCI6MjA3OTA3NDI4N30.kISqZkUPttsCu5UCFqISO57QEV0mGHg09yowftMaajQ,NODE_ENV=production \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --port 8080
```

### Opción 3: Usar Cloud Build (Recomendado para Build Time)

Si las variables no están disponibles durante el build con buildpacks, puedes usar Cloud Build explícitamente:

1. **Crear un archivo `cloudbuild.yaml`** (opcional, para más control):

```yaml
steps:
  - name: 'gcr.io/cloud-builders/npm'
    args: ['install']
    env:
      - 'VITE_BACKEND_URL=${_VITE_BACKEND_URL}'
      - 'VITE_SUPABASE_URL=${_VITE_SUPABASE_URL}'
      - 'VITE_SUPABASE_ANON_KEY=${_VITE_SUPABASE_ANON_KEY}'
  - name: 'gcr.io/cloud-builders/npm'
    args: ['run', 'build']
    env:
      - 'VITE_BACKEND_URL=${_VITE_BACKEND_URL}'
      - 'VITE_SUPABASE_URL=${_VITE_SUPABASE_URL}'
      - 'VITE_SUPABASE_ANON_KEY=${_VITE_SUPABASE_ANON_KEY}'
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/puntored-recargas-frontend', '.']
```

2. **Configurar variables de sustitución en Cloud Build:**
   - Ve a Cloud Build > Triggers
   - Configura las variables de sustitución:
     - `_VITE_BACKEND_URL`
     - `_VITE_SUPABASE_URL`
     - `_VITE_SUPABASE_ANON_KEY`

## 🔍 Verificación

Después del despliegue, verifica que las variables estén correctas:

1. **Revisa los logs de build:**
   - En Cloud Run Console, ve a la pestaña **"LOGS"**
   - Busca el mensaje: `✅ Archivo .env.production creado con variables de entorno`

2. **Verifica en la aplicación:**
   - Abre la aplicación desplegada
   - Abre la consola del navegador (F12)
   - Verifica que las peticiones a la API usen la URL correcta
   - Verifica que Supabase se conecte correctamente

## 🐛 Troubleshooting

### Las variables no se reconocen durante el build

**Problema**: El build falla o las variables están `undefined`.

**Soluciones**:
1. Verifica que las variables estén configuradas en Cloud Run **antes** de hacer el build
2. Si usas buildpacks, las variables de entorno configuradas en Cloud Run deberían estar disponibles durante el build
3. Si no funcionan, usa Cloud Build explícitamente con variables de sustitución

### El script de build no se ejecuta

**Problema**: El build no usa el script `build.js`.

**Soluciones**:
1. Verifica que `package.json` tenga el script: `"build": "node scripts/build.js"`
2. Verifica que el archivo `scripts/build.js` exista y sea ejecutable
3. Revisa los logs de build en Cloud Run para ver errores

### Las variables están disponibles pero la app no las usa

**Problema**: El build funciona pero la app no conecta a la API.

**Soluciones**:
1. Verifica que el archivo `.env.production` se haya creado durante el build (revisa logs)
2. Verifica que las variables tengan los valores correctos (sin espacios, sin comillas extra)
3. Limpia el cache y vuelve a hacer build: `npm run build` localmente para probar

## 📝 Notas Importantes

1. **Las variables `VITE_*` se inyectan en build time**, por lo que deben estar disponibles durante el build
2. **El script `build.js` crea un `.env.production` temporal** que Vite lee durante el build
3. **No necesitas commitear `.env.production`** - se genera automáticamente durante el build
4. **Las variables se reemplazan en el código JavaScript** durante el build, no se leen en runtime

## 🔐 Seguridad

- Las variables `VITE_*` se exponen en el código JavaScript del frontend
- Las `ANON_KEY` de Supabase están diseñadas para ser públicas
- No uses variables sensibles (como secret keys) con el prefijo `VITE_`
- Para secretos reales, usa Google Secret Manager y léelos en runtime (no en build time)

---

**Última actualización**: Noviembre 2024

