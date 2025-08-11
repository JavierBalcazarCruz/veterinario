// src/context/AuthContext.jsx - VERSIÓN CORREGIDA
import { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Estados del reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
        user: null,
        token: null
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null
        // ✅ NO cambiar isAuthenticated a true después del registro
      };
    default:
      return state;
  }
};

// Estado inicial
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ✅ Verificar token al cargar la app
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getToken();
        console.log('Token encontrado:', token ? 'Sí' : 'No');
        
        if (token) {
          console.log('Verificando token...');
          const userData = await authService.getProfile();
          console.log('Datos de usuario obtenidos:', userData);
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: userData,
              token: token
            }
          });
          console.log('✅ Sesión restaurada exitosamente');
        } else {
          console.log('❌ No hay token, usuario no autenticado');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('❌ Error al verificar token:', error);
        authService.removeToken();
        dispatch({ type: 'LOGOUT' });
      } finally {
        setTimeout(() => {
          dispatch({ type: 'SET_LOADING', payload: false });
        }, 500);
      }
    };

    initAuth();
  }, []);

  // ✅ Login
  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      console.log('Intentando login con:', credentials.email);
      const response = await authService.login(credentials);
      console.log('Respuesta del login:', response);
      
      authService.setToken(response.token);
      console.log('Token guardado:', response.token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: {
            id: response.id,
            nombre: response.nombre,
            apellidos: response.apellidos,
            email: response.email,
            rol: response.rol
          },
          token: response.token
        }
      });

      toast.success(`¡Bienvenido ${response.nombre}!`);
      console.log('✅ Login exitoso');
      return response;
    } catch (error) {
      console.error('❌ Error en login:', error);
      const errorMessage = error.response?.data?.msg || 'Error al iniciar sesión';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // ✅ CORREGIDO: Registro SIN autenticación automática
  const register = async (userData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      console.log('Intentando registro con:', userData.email);
      const response = await authService.register(userData);
      console.log('Respuesta del registro:', response);
      
      // ✅ CAMBIO PRINCIPAL: Solo marcar como éxito, NO autenticar
      dispatch({ type: 'REGISTER_SUCCESS' });
      
      // ✅ NO mostrar toast aquí, dejarlo para la página
      console.log('✅ Registro exitoso, pendiente de verificación');
      return response;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      const errorMessage = error.response?.data?.msg || 'Error en el registro';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
      // ✅ Sí mostrar toast de error
      toast.error(errorMessage);
      throw error;
    }
  };

  // ✅ Logout
  const logout = () => {
    console.log('Cerrando sesión...');
    authService.removeToken();
    dispatch({ type: 'LOGOUT' });
    toast.success('Sesión cerrada correctamente');
    console.log('✅ Sesión cerrada');
  };

  // Actualizar perfil de usuario
  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  // Limpiar errores
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // ✅ Verificar rol del usuario
  const hasRole = (requiredRole) => {
    if (!state.user) return false;
    
    const roles = {
      'superadmin': 4,
      'admin': 3,
      'doctor': 2,
      'recepcion': 1
    };
    
    const userLevel = roles[state.user.rol] || 0;
    const requiredLevel = roles[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  };

  const value = {
    // Estado
    ...state,
    
    // Acciones
    login,
    register,
    logout,
    updateUser,
    clearError,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;