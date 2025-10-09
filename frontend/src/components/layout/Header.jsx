// src/components/layout/Header.jsx - SIN ANIMACIONES
import { Search, Bell, Calendar, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';

const Header = ({ title, subtitle, actions = [], searchPlaceholder, onSearch, showQuickActions = true }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Quick actions dinámicas según la página
  const getQuickActions = () => {
    // ✅ Siempre usar las acciones pasadas como props si existen
    if (actions && actions.length > 0) {
      return actions;
    }

    // ✅ Fallback: acciones por defecto (sin funcionalidad)
    const path = location.pathname;

    if (path === '/dashboard') {
      return []; // Sin acciones rápidas en dashboard
    }

    if (path === '/pacientes') {
      return [
        { icon: Plus, label: 'Nuevo Paciente', action: () => {}, color: 'from-green-500 to-green-600' }
      ];
    }

    if (path === '/citas') {
      return [
        { icon: Plus, label: 'Nueva Cita', action: () => {}, color: 'from-purple-500 to-purple-600' }
      ];
    }

    return [];
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className="sticky top-0 z-30 p-4 lg:p-6">
      <GlassCard className="p-6 border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">

          {/* Sección Principal - Título e Información */}
          <div className="flex-1">
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6">
              {/* Título, Subtítulo y Notificaciones (Mobile) */}
              <div className="mb-4 lg:mb-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1 bg-gradient-to-r from-white to-white/80 bg-clip-text">
                      {title}
                    </h1>
                    {subtitle && (
                      <p className="text-white/60 text-sm lg:text-base">
                        {subtitle}
                      </p>
                    )}
                  </div>

                  {/* Botón de Notificaciones - Solo Mobile */}
                  {showQuickActions && (
                    <button className="lg:hidden relative p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white ml-3 flex-shrink-0">
                      <Bell size={18} />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        3
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Info Contextual */}
              <div className="hidden lg:flex items-center space-x-6 text-xs text-white/50">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>En línea</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={12} />
                  <span>{getCurrentTime()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Dr. {user?.nombre}</span>
                </div>
              </div>
            </div>

            {/* Barra de Búsqueda */}
            {searchPlaceholder && (
              <div className="mt-4 lg:mt-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={18} />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    onChange={onSearch}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sección de Acciones - Solo Desktop */}
          {showQuickActions && (
            <div className="hidden lg:flex items-center space-x-3">
              {/* Notificaciones - Solo Desktop */}
              <button className="relative p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white">
                <Bell size={18} />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  3
                </div>
              </button>

              {/* Quick Actions Dinámicas */}
              {getQuickActions().map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white
                      backdrop-blur-md border-2 border-white/20
                      transition-all duration-200 hover:scale-105 hover:shadow-2xl active:scale-95
                      bg-gradient-to-r ${action.color} ${action.className || ''}
                      shadow-lg hover:border-white/40`}
                  >
                    <Icon size={20} strokeWidth={2.5} />
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats Footer - Solo visible en páginas específicas */}
        {location.pathname !== '/dashboard' && (
          <div className="hidden lg:flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center space-x-6 text-xs text-white/50">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Sistema Operativo</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Base de Datos Conectada</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                <span>Sesión Activa</span>
              </div>
            </div>

            <div className="text-xs text-white/40">
              MollyVet Pro v2.0.0
            </div>
          </div>
        )}
      </GlassCard>
    </header>
  );
};

export default Header;
