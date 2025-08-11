// src/App.jsx - VERSIÓN CORREGIDA
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ConfirmAccountPage from './pages/ConfirmAccountPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Estilos globales
import './styles/globals.css';

// ✅ AGREGADO: Componente para manejar redirecciones automáticas
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  console.log('🧭 AppRoutes - Estado:', {
    isAuthenticated,
    loading,
    currentPath: location.pathname
  });

  // Mostrar loading inicial
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white">Cargando MollyVet...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ✅ CORREGIDO: Rutas públicas sin redirección automática */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/confirmar/:token" element={<ConfirmAccountPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/olvide-password/:token" element={<ResetPasswordPage />} />

      {/* ✅ CORREGIDO: Rutas protegidas */}
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
      
      <Route path="/citas" element={
        <ProtectedRoute>
          <AppointmentsPage />
        </ProtectedRoute>
      } />

      {/* ✅ CORREGIDO: Redirección por defecto */}
      <Route 
        path="/" 
        element={
          <Navigate 
            to={isAuthenticated ? "/dashboard" : "/login"} 
            replace 
          />
        } 
      />
      
      {/* ✅ CORREGIDO: Ruta 404 */}
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
      <AuthProvider>
        <div className="App">
          {/* ✅ CORREGIDO: Configuración de notificaciones mejorada */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(249, 115, 22, 0.3)',
                color: '#fff',
                borderRadius: '16px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }
              },
              loading: {
                iconTheme: {
                  primary: '#F97316',
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                }
              }
            }}
          />

          {/* ✅ Rutas principales */}
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;