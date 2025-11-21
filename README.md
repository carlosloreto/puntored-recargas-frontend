# Puntored Recargas - Frontend

Sistema de recargas móviles para Puntored. Aplicación React con autenticación JWT, gestión de recargas y historial de transacciones.

## 🚀 Características

- ✅ Autenticación segura con Supabase (JWT)
- ✅ Refresh automático de JWT sin intervención del usuario
- ✅ Sistema de recargas para Claro, Movistar, Tigo y WOM
- ✅ Historial de transacciones con filtros avanzados
- ✅ Paginación de resultados
- ✅ Validación de formularios en tiempo real
- ✅ Diseño responsive con Tailwind CSS
- ✅ Manejo robusto de errores y timeouts
- ✅ Logger condicional (solo logs en desarrollo)
- ✅ Pruebas automatizadas (Vitest + RTL)

## 📋 Requisitos

- Node.js >= 18.x
- npm >= 9.x
- Backend API corriendo (ver configuración)
- Cuenta de Supabase configurada

## 🔧 Instalación

1. **Clonar el repositorio:**

```bash
git clone <url-repositorio>
cd puntored-recargas-frontend
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Configurar variables de entorno:**

Copia el archivo `.env.example` a `.env.local` y completa con tus credenciales:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores:

```env
VITE_BACKEND_URL=http://localhost:8080
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

4. **Iniciar el servidor de desarrollo:**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🏗️ Build para Producción

1. **Configurar variables de producción:**

Edita `.env.production` con las URLs de producción:

```env
VITE_BACKEND_URL=https://api.puntored.co
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-produccion
```

2. **Generar build:**

```bash
npm run build
```

Los archivos optimizados se generarán en `/dist`

3. **Preview del build:**

```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Auth/           # Login, Register, ProtectedRoute
│   ├── Common/         # Loading, ErrorMessage
│   ├── Layout/         # Header, Footer
│   ├── Recargas/       # RechargeForm, SupplierCard
│   └── Transactions/   # TransactionList, TransactionCard
├── context/            # React Context (AuthContext)
├── hooks/              # Custom Hooks (useAuthToken)
├── pages/              # Páginas principales
├── services/           # Servicios API (axios, supabase)
├── utils/              # Utilidades (constants, formatters, logger)
└── App.jsx             # Configuración de rutas y providers
```

## 🔐 Autenticación

El proyecto utiliza **Supabase Auth** como única fuente de verdad para la autenticación:

- **Supabase JWT**: Se utiliza tanto para la sesión de usuario como para autenticar todas las peticiones al backend (incluyendo `/api/suppliers`).
- **Refresh Automático**: El token se refresca automáticamente antes de expirar.
- **Seguridad**: No se almacenan tokens sensibles adicionales en el cliente.

### Flujo de Autenticación

```
Usuario → Login → Supabase JWT → API Backend (Bearer Token)
```

## 🛠️ Tecnologías

- **React 18** - Librería UI
- **Vite 6** - Build tool y dev server
- **Tailwind CSS** - Framework CSS
- **React Router DOM** - Enrutamiento
- **Axios** - Cliente HTTP
- **Supabase** - Backend as a Service
- **React Hook Form** - Manejo de formularios
- **React Hot Toast** - Notificaciones
- **Lucide React** - Iconos
- **Vitest** - Framework de pruebas
- **React Testing Library** - Pruebas de componentes

## 🔒 Seguridad

- ✅ JWT tokens con refresh automático
- ✅ Validación de formularios
- ✅ Manejo seguro de tokens (no se exponen en producción)
- ✅ Timeouts configurados en todas las peticiones (15s)
- ✅ Protección de rutas con autenticación
- ✅ Limpieza automática de tokens expirados

## 🐛 Scripts Disponibles

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Genera build de producción
npm run preview  # Preview del build
npm run lint     # Ejecuta el linter
npm run test     # Ejecuta las pruebas automatizadas
```

## 🧪 Pruebas Automatizadas

El proyecto cuenta con un sistema de pruebas automatizadas utilizando **Vitest** y **React Testing Library**.

### Ejecutar Pruebas

```bash
npm run test
```

### Cobertura

- **Unitarias**: Validación de reglas de negocio (teléfono, montos, emails) en `src/utils/constants.test.js`.
- **Componentes**: Pruebas de integración del formulario de recargas en `src/components/Recargas/RechargeForm.test.jsx` (renderizado, validación, envío, manejo de errores).

## 📝 Notas Importantes

1. **Logos de Proveedores**: 
   - Coloca las imágenes en `/public/logos/`
   - Nombra los archivos según el ID del proveedor: `8753.png`, `9773.png`, etc.
   - Formato recomendado: PNG con fondo transparente

2. **Variables de Entorno**:
   - `.env.local` - Desarrollo (NO subir a git)
   - `.env.production` - Producción (actualizar antes de build)
   - `.env.example` - Plantilla (SÍ subir a git)

3. **Logs**:
   - En desarrollo: Los logs aparecen en consola con formato visual
   - En producción: Los logs se envían a Google Cloud Logging (o consola estructurada)

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel:
   - `VITE_BACKEND_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático en cada push a main

### Netlify

1. Conecta tu repositorio a Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Agrega las variables de entorno en Netlify

### Render / Railway

1. Crear nuevo Static Site
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configurar variables de entorno

## 🔍 Características Técnicas Destacadas

- ✅ **Refresh automático de JWT**: Maneja la expiración de tokens sin interrumpir al usuario
- ✅ **Logger condicional**: Logs visuales en dev, estructurados en prod
- ✅ **Retry logic**: Reintentos inteligentes con límites para evitar loops infinitos
- ✅ **Error boundaries**: Manejo robusto de errores con interceptores de Axios
- ✅ **Timeouts configurados**: 15 segundos para todas las peticiones HTTP
- ✅ **Queue system**: Evita múltiples refreshes de JWT simultáneos
- ✅ **Arquitectura escalable**: Separación de concerns con custom hooks y contextos

## 🚀 Optimizaciones de Rendimiento (v1.1.0)

- ✅ **Lazy Loading**: Code splitting implementado para todas las rutas (LoginPage, RegisterPage, DashboardPage, HistoryPage)
- ✅ **Bundle Reducido**: Bundle inicial reducido ~30% gracias al code splitting
- ✅ **useAuthToken Optimizado**: Eliminado polling de localStorage, ahora usa Context directamente (-75% de código)
- ✅ **Validaciones Optimizadas**: Eliminadas validaciones redundantes en componentes

## 📚 Documentación Adicional

- `AUDITORIA_CODIGO.md` - Análisis completo de calidad de código
- `.env.example` - Plantilla de variables de entorno
- `public/logos/README.md` - Guía para agregar logos de operadores

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es propiedad de Puntored.

## 📧 Contacto

Para soporte o consultas, contacta al equipo de desarrollo de Puntored.

---

**Desarrollado con ❤️ por el equipo de Puntored**
