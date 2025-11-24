// src/App.jsx - VERSIÓN CORREGIDA CON TOAST DE MAYOR DURACIÓN
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import EsteticaPage from './pages/EsteticaPage';
import HistorialClinicoPage from './pages/HistorialClinicoPage';
import HistorialCompartidoPage from './pages/HistorialCompartidoPage';
import ConfirmAccountPage from './pages/ConfirmAccountPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import ExpedienteClinicoPage from './pages/ExpedienteClinicoPage';
import ExpedienteDetallePage from './pages/ExpedienteDetallePage';

// Estilos globales
import './styles/globals.css';
import './styles/themes.css';

// Componente para manejar redirecciones automáticas
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  console.log('🧭 AppRoutes - Estado:', {
    isAuthenticated,
    loading,
    currentPath: location.pathname
  });

  // Mostrar loading inicial - Simplificado para carga rápida
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/confirmar/:token" element={<ConfirmAccountPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/olvide-password/:token" element={<ResetPasswordPage />} />
      <Route path="/historial-compartido/:token" element={<HistorialCompartidoPage />} />

      {/* Rutas protegidas */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      
      <Route path="/pacientes" element={
        <ProtectedRoute>
          <PatientsPage />
        </ProtectedRoute>
      } />

      <Route path="/historial/:pacienteId" element={
        <ProtectedRoute>
          <HistorialClinicoPage />
        </ProtectedRoute>
      } />

      <Route path="/expediente/:pacienteId?" element={
        <ProtectedRoute>
          <ExpedienteClinicoPage />
        </ProtectedRoute>
      } />

      <Route path="/expediente/:pacienteId/detalle/:expedienteId" element={
        <ProtectedRoute>
          <ExpedienteDetallePage />
        </ProtectedRoute>
      } />

      <Route path="/citas" element={
        <ProtectedRoute>
          <AppointmentsPage />
        </ProtectedRoute>
      } />

      <Route path="/estetica" element={
        <ProtectedRoute>
          <EsteticaPage />
        </ProtectedRoute>
      } />

      <Route path="/perfil" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />

      {/* Redirección por defecto */}
      <Route 
        path="/" 
        element={
          <Navigate 
            to={isAuthenticated ? "/dashboard" : "/login"} 
            replace 
          />
        } 
      />
      
      {/* Ruta 404 */}
      <Route 
        path="*" 
        element={
          <Navigate 
            to={isAuthenticated ? "/dashboard" : "/login"} 
            replace 
          />
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="App">
          {/* ✅ CORREGIDO: Configuración de toast mejorada con mayor duración */}
          <Toaster
            position="top-center" // ✅ Cambiar a top-center para mejor visibilidad
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              // ✅ CORREGIDO: Duración por defecto más larga
              duration: 6000, // 6 segundos por defecto (antes 4)
              
              // ✅ Estilos base mejorados
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(249, 115, 22, 0.3)',
                color: '#fff',
                borderRadius: '16px',
                padding: '16px 20px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                maxWidth: '420px',
                wordBreak: 'break-word'
              },
              
              // ✅ CORREGIDO: Configuración específica para toast de éxito
              success: {
                duration: 8000, // ✅ 8 segundos para mensajes de éxito importantes
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
                style: {
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#fff',
                  borderRadius: '16px',
                  padding: '18px 24px',
                  fontSize: '15px',
                  fontWeight: '600',
                  boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                  maxWidth: '500px',
                  wordBreak: 'break-word',
                  textAlign: 'center'
                }
              },
              
              // ✅ Configuración para toast de error
              error: {
                duration: 6000, // 6 segundos para errores
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
                style: {
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fff',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.4)',
                  maxWidth: '420px'
                }
              },
              
              // ✅ Configuración para toast de loading
              loading: {
                duration: Infinity, // No se cierra automáticamente
                iconTheme: {
                  primary: '#F97316',
                  secondary: '#fff',
                },
                style: {
                  background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.95) 0%, rgba(234, 88, 12, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(249, 115, 22, 0.4)',
                  color: '#fff',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 25px 50px -12px rgba(249, 115, 22, 0.4)',
                  maxWidth: '380px'
                }
              },
              
              // ✅ Configuración para toast de información
              custom: {
                duration: 5000,
                style: {
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  color: '#fff',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.4)',
                  maxWidth: '420px'
                }
              }
            }}
          />

          {/* Rutas principales */}
          <AppRoutes />
        </div>
      </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;