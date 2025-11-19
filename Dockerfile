# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci --only=production=false

# Copiar código fuente
COPY . .

# Variables de entorno en build time (se pasan como ARG)
ARG VITE_BACKEND_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Exportar como ENV para que Vite las use durante el build
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Build de producción
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS runner

WORKDIR /app

# Instalar solo serve (runtime)
RUN npm install -g serve@14.2.1

# Copiar archivos build desde builder
COPY --from=builder /app/dist ./dist

# Exponer puerto (Cloud Run usa PORT variable)
ENV PORT=8080
EXPOSE 8080

# Comando para servir archivos estáticos
CMD ["sh", "-c", "serve -s dist -l $PORT"]

