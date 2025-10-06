/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          50: 'rgba(255, 255, 255, 0.05)',
          100: 'rgba(255, 255, 255, 0.1)',
          200: 'rgba(255, 255, 255, 0.2)',
          300: 'rgba(255, 255, 255, 0.3)',
        },
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        white: {
          DEFAULT: '#ffffff',
        }
      },
      // Agregar opacidades personalizadas para bg-white
      backgroundColor: {
        'white/3': 'rgba(255, 255, 255, 0.03)',
        'white/5': 'rgba(255, 255, 255, 0.05)',
        'white/8': 'rgba(255, 255, 255, 0.08)',
        'white/12': 'rgba(255, 255, 255, 0.12)',
        'white/15': 'rgba(255, 255, 255, 0.15)',
        'white/25': 'rgba(255, 255, 255, 0.25)',
      },
      borderColor: {
        'white/5': 'rgba(255, 255, 255, 0.05)',
        'white/8': 'rgba(255, 255, 255, 0.08)',
        'white/12': 'rgba(255, 255, 255, 0.12)',
        'white/15': 'rgba(255, 255, 255, 0.15)',
        'white/25': 'rgba(255, 255, 255, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'macos-fade': 'macOsFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'macos-expand': 'macOsExpand 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        /*'glass-shimmer': 'glassShimmer 2s infinite', Animacion de izquierda a derecha desactivada*/
      }
    },
  },
  plugins: [],
}