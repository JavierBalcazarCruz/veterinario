# 📦 INSTALACIÓN DE DEPENDENCIAS PARA FUNCIONALIDADES AVANZADAS

## Ejecutar en el directorio `frontend/`:

```bash
# Navegar al frontend
cd frontend

# Instalar todas las dependencias necesarias
npm install jspdf html2canvas recharts xlsx file-saver react-to-print date-fns

# O con pnpm (si lo prefieres):
pnpm install jspdf html2canvas recharts xlsx file-saver react-to-print date-fns
```

## Detalle de cada dependencia:

### 📄 PDF y Exportación
- **jspdf** - Generación de PDFs
- **html2canvas** - Captura de contenido HTML para PDF
- **xlsx** - Exportación a Excel
- **file-saver** - Guardar archivos en el cliente
- **react-to-print** - Imprimir componentes React

### 📊 Gráficas y Visualización
- **recharts** - Librería de gráficas para React (moderna y fácil)

### 📅 Utilidades de Fecha
- **date-fns** - Manipulación de fechas (más moderna que moment.js)

## ✅ Verificar instalación:

Después de instalar, verificar en `package.json` que aparezcan:

```json
{
  "dependencies": {
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1",
    "recharts": "^2.10.3",
    "xlsx": "^0.18.5",
    "file-saver": "^2.0.5",
    "react-to-print": "^2.15.1",
    "date-fns": "^3.0.6"
  }
}
```

## 🚨 IMPORTANTE

Ejecutar `npm install` **ANTES** de probar las nuevas funcionalidades.

Sin estas librerías, las funcionalidades de exportación y gráficas no funcionarán.
