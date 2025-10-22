/**
 * =====================================================
 * CONTEXTO DE TEMA (OSCURO/CLARO)
 * =====================================================
 * Maneja el tema de la aplicación
 */

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark'); // 'dark' o 'light'

  // Cargar tema guardado al montar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  /**
   * Aplicar tema al documento
   */
  const applyTheme = (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme);

    // Actualizar meta theme-color para mobile
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        newTheme === 'dark' ? '#0f172a' : '#ffffff'
      );
    }
  };

  /**
   * Cambiar tema
   */
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  /**
   * Establecer tema específico
   */
  const setSpecificTheme = (newTheme) => {
    if (newTheme !== 'dark' && newTheme !== 'light') return;
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setSpecificTheme,
        isDark: theme === 'dark',
        isLight: theme === 'light'
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};

export default ThemeContext;
