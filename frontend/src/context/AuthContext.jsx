// src/context/AuthContext.jsx
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

  // Verificar token al cargar la app
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          // Verificar si el token es válido
          const userData = await authService.getProfile();
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: userData,
              token: token
            }
          });
        }
      } catch (error) {
        // Token inválido o expirado
        authService.removeToken();
        dispatch({ type: 'LOGOUT' });
      } finally {
        // Terminar loading inicial
        if (state.loading) {
          dispatch({ type: 'LOGIN_ERROR', payload: null });
        }
      }
    };

    initAuth();
  }, []);

  // Login
  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authService.login(credentials);
      
      // Guardar token
      authService.setToken(response.token);
      
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
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'Error al iniciar sesión';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Registro
  const register = async (userData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authService.register(userData);
      
      toast.success('Registro exitoso. Revisa tu email para confirmar tu cuenta.');
      dispatch({ type: 'LOGOUT' }); // Limpiar estado después del registro
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'Error en el registro';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    authService.removeToken();
    dispatch({ type: 'LOGOUT' });
    toast.success('Sesión cerrada correctamente');
  };

  // Actualizar perfil de usuario
  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  // Limpiar errores
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Verificar rol del usuario
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