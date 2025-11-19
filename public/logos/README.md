# Logos de Operadores

## 📁 Estructura de Archivos

Coloca los logos de los operadores en esta carpeta con los siguientes nombres:

```
public/logos/
├── 8753.png    → Logo de Claro
├── 9773.png    → Logo de Movistar
├── 3398.png    → Logo de Tigo
└── 4689.png    → Logo de WOM
```

## 📐 Especificaciones Recomendadas

- **Formato:** PNG con fondo transparente
- **Tamaño:** 200x200px (mínimo 100x100px)
- **Peso:** Máximo 50KB por logo
- **Fondo:** Transparente (recomendado)

## 🔍 Dónde Conseguir los Logos

### Opción 1: Descargar de Sitios Oficiales
- **Claro:** https://www.claro.com.co/
- **Movistar:** https://www.movistar.co/
- **Tigo:** https://www.tigo.com.co/
- **WOM:** https://www.wom.co/

### Opción 2: Bancos de Logos
- https://worldvectorlogo.com/ (buscar "claro colombia", "movistar", etc.)
- https://seeklogo.com/
- https://www.brandsoftheworld.com/

### Opción 3: Usar Iconos (Temporal)
Si no encuentras los logos, por ahora el sistema mostrará emojis como fallback.

## ⚙️ Cómo Funciona

El componente `SupplierCard` intentará cargar:
1. Primero: `/logos/{id}.png` (ej: `/logos/8753.png` para Claro)
2. Si falla: Muestra emoji de fallback (📱, 🌟, 💙, 📞)

## 🎨 Ejemplo de Código

Si necesitas cambiar la ruta o el formato:

```javascript
// En src/components/Recargas/SupplierCard.jsx
const logoPath = `/logos/${supplier.id}.png`

// Para usar .jpg en lugar de .png:
const logoPath = `/logos/${supplier.id}.jpg`

// Para usar una URL externa:
const logoPath = `https://mi-cdn.com/logos/${supplier.id}.png`
```

## ✅ Verificación

Después de agregar los logos:
1. Recarga la página (F5)
2. Deberías ver los logos en lugar de emojis
3. Si aparece emoji = logo no encontrado
4. Si aparece logo = ¡funcionando! ✅

