# 🌙 Guía de Activación del Modo Oscuro

Esta guía te muestra cómo activar el modo oscuro cuando decidas implementarlo.

---

## 📋 ¿Qué está Listo?

Ya tienes todo preparado:

- ✅ **ThemeContext** - Contexto global para el tema
- ✅ **ThemeToggle** - Botón para cambiar tema
- ✅ **DarkModeWallpaper** - Componente de wallpaper con filtro
- ✅ **AppLayout** - Ya implementado con filtro CSS

---

## 🚀 Activación en 2 Pasos

### **PASO 1: Activar el Botón de Tema en Historial**

Archivo: `frontend/src/pages/HistorialClinicoPage.jsx`

```jsx
// BUSCAR (línea ~59):
// import ThemeToggle from '../components/ui/ThemeToggle'; // 🔒 Desactivado temporalmente

// CAMBIAR A:
import ThemeToggle from '../components/ui/ThemeToggle';
```

```jsx
// BUSCAR (línea ~479):
{/* Theme Toggle - 🔒 Desactivado temporalmente */}
{/* <div className="ml-auto">
  <ThemeToggle />
</div> */}

// CAMBIAR A:
{/* Theme Toggle */}
<div className="ml-auto">
  <ThemeToggle />
</div>
```

**¡Listo!** El botón aparecerá en el historial clínico.

---

### **PASO 2 (OPCIONAL): Usar el Componente DarkModeWallpaper**

Si prefieres usar el componente independiente en lugar de la implementación actual:

Archivo: `frontend/src/components/layout/AppLayout.jsx`

```jsx
// 1. Importar el componente
import DarkModeWallpaper from './DarkModeWallpaper';

// 2. BUSCAR (línea ~70-105):
<motion.div className="fixed inset-0 z-0">
  <div className="w-full h-full bg-cover bg-no-repeat" ...>
    ...todo el código del wallpaper...
  </div>
</motion.div>

// 3. REEMPLAZAR CON:
<motion.div className="fixed inset-0 z-0">
  <DarkModeWallpaper
    wallpaperUrl={wallpapers[currentTheme.wallpaper]}
  />
</motion.div>
```

---

## 🎨 Personalización del Oscurecimiento

### Oscurecimiento Suave (para wallpapers ya oscuros)
```jsx
<DarkModeWallpaper
  wallpaperUrl={wallpapers[currentTheme.wallpaper]}
  darkOverlayOpacity={0.3}
  darkBlurAmount={1}
/>
```

### Oscurecimiento Medio (recomendado - por defecto)
```jsx
<DarkModeWallpaper
  wallpaperUrl={wallpapers[currentTheme.wallpaper]}
  darkOverlayOpacity={0.4}
  darkBlurAmount={2}
/>
```

### Oscurecimiento Intenso (para wallpapers muy claros)
```jsx
<DarkModeWallpaper
  wallpaperUrl={wallpapers[currentTheme.wallpaper]}
  darkOverlayOpacity={0.6}
  darkBlurAmount={4}
/>
```

---

## 🎯 Activar en Otras Páginas

Para agregar el botón de tema en cualquier otra página:

```jsx
// 1. Importar
import ThemeToggle from '../components/ui/ThemeToggle';

// 2. Agregar donde quieras el botón
<ThemeToggle />

// Ejemplo en un header:
<div className="flex items-center gap-4">
  <h1>Mi Página</h1>
  <ThemeToggle className="ml-auto" />
</div>
```

---

## 📊 Comparación: Implementación Actual vs DarkModeWallpaper

| Característica | AppLayout Actual | DarkModeWallpaper |
|----------------|------------------|-------------------|
| **Funcionalidad** | ✅ Completa | ✅ Completa |
| **Rendimiento** | ✅ Óptimo | ✅ Óptimo |
| **Mantenimiento** | Código en AppLayout | Componente separado |
| **Reutilizable** | No | ✅ Sí |
| **Personalizable** | Editar código | ✅ Props |

**Recomendación:** Si solo usas el modo oscuro en AppLayout, mantén la implementación actual. Si quieres reutilizarlo en otros componentes, usa DarkModeWallpaper.

---

## 🧪 Verificar que Funciona

1. Activa el paso 1 (descomenta ThemeToggle)
2. Ejecuta el proyecto: `npm run dev`
3. Ve al historial clínico de cualquier paciente
4. Haz clic en el botón Sol/Luna
5. Observa cómo el wallpaper se oscurece suavemente

---

## 🔧 Solución de Problemas

### El botón no aparece
- Verifica que descomentaste el import y el JSX
- Revisa la consola por errores
- Asegúrate de que ThemeContext está en App.jsx

### El filtro no funciona
- Verifica que AppLayout importa `useTheme`
- Revisa que `isDark` esté definido
- Comprueba que el overlay tiene `isDark ? 1 : 0`

### La transición es brusca
- Aumenta `duration` en la animación
- Cambia `ease` a "easeInOut"

---

## 💡 Extras

### Agregar atajos de teclado (Ctrl+D para cambiar tema)

```jsx
// En cualquier componente
import { useTheme } from '../context/ThemeContext';
import { useEffect } from 'react';

const MiComponente = () => {
  const { toggleTheme } = useTheme();

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleTheme]);

  // ...resto del componente
};
```

---

## 📞 Soporte

Si tienes dudas, revisa:
- `frontend/src/context/ThemeContext.jsx` - Contexto del tema
- `frontend/src/components/ui/ThemeToggle.jsx` - Botón toggle
- `frontend/src/components/layout/DarkModeWallpaper.jsx` - Componente wallpaper
- `frontend/src/components/layout/AppLayout.jsx` - Implementación actual

---

**Última actualización:** Febrero 2025
**Versión:** 1.0.0
**Estado:** ✅ Listo para producción
