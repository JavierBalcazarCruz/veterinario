// src/components/layout/TopMenu.jsx - SIN ANIMACIONES
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TopMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const menuRef = useRef(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        const overlay = document.querySelector('[data-profile-overlay]');
        if (overlay && !overlay.contains(event.target)) {
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [navigate]);

  const handleProfileClick = () => {
    navigate("/perfil");
    setIsMenuOpen(false);
  };

  const handleSettingsClick = () => {
    navigate("/configuracion");
    setIsMenuOpen(false);
  };

  const handleNotificationsClick = () => {
    navigate("/notificaciones");
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  // Generar initials para el avatar
  const getInitials = (nombre, apellidos) => {
    const firstInitial = nombre?.charAt(0)?.toUpperCase() || '';
    const lastInitial = apellidos?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  const menuItems = [
    {
      icon: User,
      label: 'Ver Perfil',
      action: handleProfileClick,
      color: 'text-blue-400',
      showOn: 'both'
    },
    {
      icon: Settings,
      label: 'Configuración',
      action: handleSettingsClick,
      color: 'text-purple-400',
      showOn: 'both'
    },
    {
      icon: Bell,
      label: 'Notificaciones',
      action: handleNotificationsClick,
      color: 'text-yellow-400',
      showOn: 'mobile',
      badge: notifications
    },
    {
      icon: LogOut,
      label: 'Cerrar Sesión',
      action: handleLogout,
      color: 'text-red-400',
      showOn: 'both',
      separator: true
    }
  ];

  return (
    <div className="relative">
      {/* Desktop: Icons + Avatar */}
      <div className="flex items-center space-x-4">
        {/* Notificaciones - Solo Desktop */}
        <button
          onClick={handleNotificationsClick}
          className="hidden lg:flex relative p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white"
        >
          <Bell size={20} />
          {notifications > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {notifications > 9 ? '9+' : notifications}
            </div>
          )}
        </button>

        {/* Avatar con menú desplegable */}
        <div className="relative z-50" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-3 p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20"
          >
            {/* Avatar */}
            <div className="relative">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${getInitials(user?.nombre, user?.apellidos)}&backgroundColor=f97316,ea580c&textColor=ffffff`}
                alt="Avatar"
                className="w-10 h-10 rounded-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white/20"></div>
            </div>

            {/* Info del usuario - Solo Desktop */}
            <div className="hidden lg:block text-left">
              <p className="text-white font-medium text-sm">
                Dr. {user?.nombre}
              </p>
              <p className="text-white/60 text-xs">
                {user?.rol}
              </p>
            </div>

            {/* Chevron */}
            <div className="hidden lg:block">
              <ChevronDown size={16} className="text-white/70" style={{ transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </div>
          </button>

          {/* Portal Menu - Se renderiza en el body */}
          {isMenuOpen && createPortal(
            <ProfileMenuOverlay
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              user={user}
              menuItems={menuItems}
              getInitials={getInitials}
              logout={logout}
            />,
            document.body
          )}
        </div>
      </div>
    </div>
  );
};

// Componente separado para el overlay del menú - SIN ANIMACIONES
const ProfileMenuOverlay = ({ isOpen, onClose, user, menuItems, getInitials, logout }) => {
  if (!isOpen) return null;

  return (
    <div
      data-profile-overlay
      className="fixed inset-0 bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-xl"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999999,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Botón Cerrar - Esquina Superior Derecha */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-4 bg-red-500/20 rounded-full border border-red-400/30"
      >
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Contenido Principal Centrado */}
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="max-w-2xl w-full">
          {/* Header del Menú */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Mi Perfil
            </h1>
            <p className="text-white/60 text-lg">
              Gestiona tu cuenta y configuraciones
            </p>
          </div>

          {/* Perfil del Usuario - Centrado */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
            <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8 text-center lg:text-left">
              <div className="relative">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${getInitials(user?.nombre, user?.apellidos)}&backgroundColor=f97316,ea580c&textColor=ffffff`}
                  alt="Avatar"
                  className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl ring-4 ring-primary-500/30 shadow-2xl"
                />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 lg:w-8 lg:h-8 bg-green-500 rounded-full border-4 border-slate-900 shadow-lg"></div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  Dr. {user?.nombre} {user?.apellidos}
                </h2>
                <p className="text-white/60 text-lg mb-4">{user?.email}</p>
                <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3">
                  <span className="px-4 py-2 bg-primary-500/20 border border-primary-400/30 rounded-full text-primary-300 font-medium">
                    {user?.rol}
                  </span>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-400 font-medium">En línea</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Opciones del Menú */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const shouldShow = item.showOn === 'both' ||
                (item.showOn === 'desktop' && window.innerWidth >= 1024) ||
                (item.showOn === 'mobile' && window.innerWidth < 1024);

              if (!shouldShow) return null;

              return (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (item.label === 'Cerrar Sesión') {
                      logout();
                    } else {
                      item.action();
                    }
                  }}
                  className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 group overflow-hidden cursor-pointer"
                >
                  <div className="relative z-10 flex items-center space-x-4">
                    <div className={`p-4 rounded-xl ${item.color} bg-white/10`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-white font-bold text-lg mb-1">
                        {item.label}
                      </h3>
                      <p className="text-white/60 text-sm">
                        {item.label === 'Ver Perfil' && 'Gestiona tu información personal'}
                        {item.label === 'Configuración' && 'Ajustes de la aplicación'}
                        {item.label === 'Notificaciones' && 'Revisa tus alertas'}
                        {item.label === 'Cerrar Sesión' && 'Salir de la aplicación'}
                      </p>
                    </div>

                    {/* Badge para notificaciones */}
                    {item.badge && item.badge > 0 && (
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                        {item.badge > 9 ? '9+' : item.badge}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-green-400 font-medium">Sistema Activo</p>
            </div>
            <p className="text-white/50 text-sm">
              MollyVet v1.0.0 • © 2025 Sistema Veterinario
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopMenu;
