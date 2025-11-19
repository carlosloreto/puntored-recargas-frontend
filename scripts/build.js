#!/usr/bin/env node
/**
 * Script de build para Cloud Run
 * Este script asegura que las variables de entorno VITE_* estén disponibles durante el build
 */

import { writeFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('🔨 Iniciando build de producción...');

// Obtener variables de entorno
const backendUrl = process.env.VITE_BACKEND_URL || 'https://puntored-transactions-api-840635133484.southamerica-east1.run.app';
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Verificar variables requeridas
if (!supabaseUrl) {
  console.warn('⚠️  ADVERTENCIA: VITE_SUPABASE_URL no está definida');
}

if (!supabaseKey) {
  console.warn('⚠️  ADVERTENCIA: VITE_SUPABASE_ANON_KEY no está definida');
}

// Crear archivo .env.production temporal
const envContent = `# Variables de entorno generadas automáticamente durante el build
# Estas variables provienen de las configuradas en Cloud Run
VITE_BACKEND_URL=${backendUrl}
VITE_SUPABASE_URL=${supabaseUrl || ''}
VITE_SUPABASE_ANON_KEY=${supabaseKey || ''}
`;

try {
  writeFileSync('.env.production', envContent, 'utf8');
  console.log('✅ Archivo .env.production creado con variables de entorno');
  
  // Ejecutar el build de Vite
  console.log('📦 Ejecutando build de Vite...');
  execSync('npm run build:vite', { stdio: 'inherit' });
  
  console.log('✅ Build completado exitosamente');
} catch (error) {
  console.error('❌ Error durante el build:', error.message);
  process.exit(1);
}

