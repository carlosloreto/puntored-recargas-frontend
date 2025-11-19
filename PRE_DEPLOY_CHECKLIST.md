# ✅ Checklist Pre-Deploy

## 🔐 Seguridad

- [x] `.env.local` está en `.gitignore`
- [ ] **IMPORTANTE:** Verificar que `.env.local` NO se haya subido al repositorio
- [x] Variables de entorno de producción están en `.env.production`
- [x] Logger condicional implementado (sin logs en producción)
- [x] Tokens se limpian automáticamente en errores 401

## 📝 Documentación

- [x] `README.md` actualizado con instrucciones completas
- [x] `CHANGELOG.md` creado con todas las features
- [x] `DEPLOYMENT.md` creado con guía de despliegue
- [x] `AUDITORIA_CODIGO.md` con análisis de calidad
- [x] `.env.example` con plantilla de variables
- [x] `package.json` con descripción y metadata

## 🧪 Testing Local

Antes de subir al repositorio, verifica:

### 1. Build exitoso
```bash
npm run build
```
- [ ] Build se completa sin errores
- [ ] No hay warnings críticos
- [ ] Carpeta `dist/` se genera correctamente

### 2. Preview funciona
```bash
npm run preview
```
- [ ] La app carga en http://localhost:4173
- [ ] Login funciona
- [ ] Register funciona
- [ ] Dashboard carga
- [ ] Recargas funcionan
- [ ] Historial carga

### 3. Linter sin errores
```bash
npm run lint
```
- [ ] No hay errores de ESLint

## 📦 Archivos Listos para Git

### ✅ DEBEN estar en el repo:
- [x] `src/` - Todo el código fuente
- [x] `public/` - Assets públicos (logos, favicon)
- [x] `README.md`
- [x] `CHANGELOG.md`
- [x] `DEPLOYMENT.md`
- [x] `AUDITORIA_CODIGO.md`
- [x] `package.json` y `package-lock.json`
- [x] `.env.example`
- [x] `.env.production` (sin credenciales reales)
- [x] `.gitignore`
- [x] `.gitattributes`
- [x] `vite.config.js`
- [x] `tailwind.config.js`
- [x] `postcss.config.js`
- [x] `eslint.config.js`
- [x] `index.html`
- [x] `LICENSE`

### ❌ NO DEBEN estar en el repo:
- [x] `node_modules/` - Ignorado
- [x] `dist/` - Ignorado
- [x] `.env.local` - **CRÍTICO: VERIFICAR QUE NO ESTÉ**
- [x] `.DS_Store` - Ignorado
- [x] `*.log` - Ignorado

## 🔍 Verificación de Credenciales

### ⚠️ CRÍTICO: Verificar que NO haya credenciales en el código

Buscar en todo el proyecto:
```bash
# Buscar credenciales hardcodeadas
grep -r "eyJhbGci" src/  # JWT tokens
grep -r "supabase.co" src/  # URLs de Supabase
grep -r "localhost:8080" src/  # URLs de backend
```

**Resultado esperado:** No debe haber ninguna coincidencia

### ✅ Lugares correctos para credenciales:
- `.env.local` (local, NO en git)
- `.env.example` (plantilla, SÍ en git)
- Variables de entorno en plataforma de deploy (Vercel/Netlify)

## 🚀 Pasos para Subir al Repo

### 1. Verificar estado de Git
```bash
git status
```

### 2. Verificar que .env.local NO esté staged
```bash
git status | grep .env.local
```
- Si aparece: `git reset .env.local`
- No debe aparecer en archivos a commitear

### 3. Agregar archivos
```bash
git add .
```

### 4. Verificar nuevamente
```bash
git status
```
- `.env.local` NO debe estar en la lista

### 5. Commit
```bash
git commit -m "feat: Sistema completo de recargas con JWT y gestión de transacciones

- Autenticación dual (Supabase + Puntored)
- Refresh automático de JWT
- Historial con filtros y paginación
- Validación de formularios
- Manejo robusto de errores
- Logger condicional
- Documentación completa"
```

### 6. Push
```bash
git push origin main
```

## 🌐 Después de Subir al Repo

### Verificar en GitHub/GitLab:
- [ ] Código se subió correctamente
- [ ] README se ve bien
- [ ] **`.env.local` NO está en el repositorio**
- [ ] Todos los archivos de documentación están
- [ ] Logos de operadores están en `public/logos/`

### Siguiente paso: Desplegar

Sigue la guía en `DEPLOYMENT.md` para:
1. Elegir plataforma (Vercel recomendado)
2. Configurar variables de entorno
3. Deploy
4. Verificar funcionamiento

## 📊 Métricas Esperadas

Después de deploy, deberías ver:

### Lighthouse Score (objetivo):
- Performance: 75-85
- Accessibility: 65-75
- Best Practices: 85-90
- SEO: 80-90

### Bundle Size:
- Initial: ~200KB
- Con gzip: ~80KB

### Tiempo de carga:
- First Contentful Paint: < 2s
- Time to Interactive: < 3s

---

## ✅ TODO LISTO

Si todos los checks están marcados:
- ✅ Tu código está listo para producción
- ✅ La documentación está completa
- ✅ No hay credenciales expuestas
- ✅ El build funciona correctamente

**¡Estás listo para subir al repo y desplegar!** 🚀

---

**Última actualización:** 19 de Noviembre, 2025

