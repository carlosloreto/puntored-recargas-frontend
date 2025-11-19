# 🚀 Guía de Despliegue - Puntored Recargas Frontend

## 📋 Pre-requisitos

Antes de desplegar, asegúrate de tener:

- ✅ Backend API desplegado y funcionando
- ✅ Cuenta de Supabase configurada
- ✅ Variables de entorno de producción
- ✅ Repositorio Git con el código

---

## 🌐 Opciones de Despliegue

### 1️⃣ Vercel (Recomendado - Más Rápido)

#### Paso a Paso:

1. **Conectar repositorio:**
   - Ve a [vercel.com](https://vercel.com)
   - Click en "New Project"
   - Importa tu repositorio de GitHub

2. **Configurar variables de entorno:**
   ```env
   VITE_BACKEND_URL=https://tu-backend.com
   VITE_SUPABASE_URL=https://xewoecsyhbbwhvwdjjew.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-de-produccion
   ```

3. **Configuración del proyecto:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Node Version: `18.x`

4. **Deploy:**
   - Click en "Deploy"
   - Espera 1-2 minutos
   - ✅ ¡Listo!

#### Ventajas de Vercel:
- ✅ Deploy automático en cada push
- ✅ HTTPS gratis
- ✅ CDN global
- ✅ Rollback fácil
- ✅ Preview deployments en PRs

---

### 2️⃣ Netlify

#### Paso a Paso:

1. **Conectar repositorio:**
   - Ve a [netlify.com](https://netlify.com)
   - "Add new site" → "Import an existing project"
   - Conecta tu repositorio

2. **Configuración de build:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

3. **Variables de entorno:**
   - Site settings → Environment variables
   - Agregar:
     ```
     VITE_BACKEND_URL
     VITE_SUPABASE_URL
     VITE_SUPABASE_ANON_KEY
     ```

4. **Configurar redirects (importante para React Router):**
   
   Crear archivo `public/_redirects`:
   ```
   /*    /index.html   200
   ```

5. **Deploy:**
   - Click en "Deploy site"
   - ✅ ¡Listo!

---

### 3️⃣ Render

#### Paso a Paso:

1. **Crear Static Site:**
   - Ve a [render.com](https://render.com)
   - "New" → "Static Site"
   - Conecta tu repositorio

2. **Configuración:**
   - Build Command: `npm run build`
   - Publish Directory: `dist`

3. **Variables de entorno:**
   - Agregar en "Environment"

4. **Deploy:**
   - Click en "Create Static Site"
   - ✅ ¡Listo!

---

### 4️⃣ Railway

#### Paso a Paso:

1. **Nuevo proyecto:**
   - Ve a [railway.app](https://railway.app)
   - "New Project" → "Deploy from GitHub"

2. **Configuración:**
   - Root directory: `/`
   - Build command: `npm run build`
   - Start command: `npm run preview`

3. **Variables de entorno:**
   - Agregar en "Variables"

4. **Deploy:**
   - Click en "Deploy"
   - ✅ ¡Listo!

---

## 🔐 Variables de Entorno de Producción

### Backend URL
```env
VITE_BACKEND_URL=https://tu-backend.com
```
**Importante:** 
- ⚠️ Debe ser HTTPS en producción
- ⚠️ No incluir `/` al final
- ⚠️ Debe estar funcionando antes de desplegar el frontend

### Supabase URL
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
```
Obtenlo desde: Supabase Dashboard → Settings → API → URL

### Supabase Anon Key
```env
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```
Obtenlo desde: Supabase Dashboard → Settings → API → anon public

---

## ✅ Checklist Pre-Deploy

### Código
- [ ] Todas las features funcionan en local
- [ ] No hay console.log en código (usar logger)
- [ ] .env.local NO está en git
- [ ] .env.production tiene URLs correctas
- [ ] Build se genera sin errores (`npm run build`)

### Backend
- [ ] Backend API está desplegado y funcionando
- [ ] CORS configurado para tu dominio frontend
- [ ] Endpoints de prueba funcionan

### Supabase
- [ ] Proyecto creado y configurado
- [ ] Autenticación habilitada
- [ ] Email auth configurado
- [ ] URLs y Keys correctas

### Variables de Entorno
- [ ] Todas las variables configuradas en la plataforma
- [ ] URLs son de producción (HTTPS)
- [ ] Keys son las correctas

---

## 🧪 Verificación Post-Deploy

Después de desplegar, verifica:

### 1. Página carga correctamente
```
https://tu-app.vercel.app
```
- ✅ Sin errores de consola
- ✅ Estilos se cargan
- ✅ Favicon aparece

### 2. Registro funciona
- ✅ Formulario de registro funcional
- ✅ Email de confirmación llega
- ✅ Usuario se crea en Supabase

### 3. Login funciona
- ✅ Login con usuario creado
- ✅ Redirección a dashboard
- ✅ Token se guarda

### 4. Funcionalidades principales
- ✅ Cargan los operadores
- ✅ Formulario de recarga funciona
- ✅ Historial se carga
- ✅ Filtros funcionan
- ✅ Paginación funciona

### 5. Errores se manejan bien
- ✅ Error de red muestra mensaje
- ✅ Token expirado refresca automáticamente
- ✅ Logout funciona

---

## 🐛 Troubleshooting

### Error: "Network Error"
**Causa:** Backend URL incorrecta o CORS
**Solución:**
1. Verifica `VITE_BACKEND_URL` en variables de entorno
2. Verifica CORS en backend incluye tu dominio frontend
3. Verifica backend está online

### Error: "Invalid API key"
**Causa:** Supabase keys incorrectas
**Solución:**
1. Verifica `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
2. Copia las keys correctas desde Supabase Dashboard
3. Redeploy con las nuevas variables

### Error: Página en blanco
**Causa:** Variables de entorno no configuradas
**Solución:**
1. Revisa que todas las variables estén en la plataforma
2. Variables deben empezar con `VITE_`
3. Redeploy después de agregar variables

### Error: 404 al refrescar página
**Causa:** React Router no configurado en el servidor
**Solución (Netlify):**
```
Crear public/_redirects:
/*    /index.html   200
```

---

## 📊 Monitoreo Post-Deploy

### Logs
- **Vercel:** Dashboard → Logs
- **Netlify:** Site → Logs
- **Render:** Service → Logs

### Analytics
Considera agregar:
- Google Analytics
- Vercel Analytics
- Sentry para error tracking

---

## 🔄 Actualizar Deploy

### Deploy Automático (Recomendado)
1. Push a la rama `main`
2. La plataforma detecta cambios
3. Build automático
4. Deploy automático
5. ✅ ¡Actualizado!

### Deploy Manual
1. Hacer cambios localmente
2. `git add .`
3. `git commit -m "Descripción"`
4. `git push origin main`
5. Esperar deploy automático

### Rollback
Si algo sale mal:
- **Vercel:** Deployments → Previous → Promote
- **Netlify:** Deploys → Previous → Publish

---

## 🎯 Mejores Prácticas

1. **Siempre probar en local antes de deploy:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Usar variables de entorno diferentes por ambiente:**
   - Desarrollo: `.env.local`
   - Producción: Variables en plataforma

3. **Monitorear errores:**
   - Revisar logs regularmente
   - Configurar alertas

4. **Hacer backups:**
   - Git como backup de código
   - Documentar cambios en CHANGELOG.md

5. **Testing antes de deploy:**
   - Probar todas las funcionalidades
   - Verificar en diferentes navegadores
   - Probar en móvil

---

## 📞 Soporte

Si tienes problemas:
1. Revisa esta guía completa
2. Verifica logs de la plataforma
3. Verifica variables de entorno
4. Contacta al equipo de desarrollo

---

**Última actualización:** 19 de Noviembre, 2025  
**Versión de la guía:** 1.0.0

