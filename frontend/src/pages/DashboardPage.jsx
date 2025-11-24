// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { Users, Calendar, PawPrint, TrendingUp, Plus } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import MobileNavigation from '../components/layout/MobileNavigation';
import StatsCard from '../components/dashboard/StatsCard';
import QuickActions from '../components/dashboard/QuickActions';
import RecentPatients from '../components/dashboard/RecentPatients';
import UpcomingAppointments from '../components/dashboard/UpcomingAppointments';
import AddPatientModal from '../components/patients/AddPatientModal';
import AddAppointmentModal from '../components/appointments/AddAppointmentModal';
import PatientSpotlight from '../components/dashboard/PatientSpotlight';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    completedAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  // Estados para modales
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [isPatientSpotlightOpen, setIsPatientSpotlightOpen] = useState(false);
  const [spotlightRedirectTo, setSpotlightRedirectTo] = useState('historial'); // 'historial' o 'expediente'
  const [collapseSidebar, setCollapseSidebar] = useState(false);

  // Simular carga de datos (reemplazar con API real)
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Aquí harías las llamadas a tu API
        setTimeout(() => {
          setStats({
            totalPatients: 247,
            todayAppointments: 8,
            monthlyRevenue: 45820,
            completedAppointments: 156
          });
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Atajo de teclado Cmd+K / Ctrl+K para abrir el Spotlight
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K (Mac) o Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPatientSpotlightOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const greetingTitle = `${getGreeting()}, Dr. ${user?.nombre}`;
  const formattedDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <AppLayout collapseSidebar={collapseSidebar}>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header - Fijo */}
        <div className="flex-shrink-0">
          <Header title={greetingTitle} subtitle={formattedDate} />
        </div>

        {/* Main Content - Scrolleable */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-6 space-y-6 pb-24 lg:pb-8">
          {/* Quick Stats */}
          <section>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Pacientes"
                value={stats.totalPatients}
                icon={<PawPrint size={24} />}
                trend="+12%"
                color="blue"
                loading={loading}
              />
              <StatsCard
                title="Citas Hoy"
                value={stats.todayAppointments}
                icon={<Calendar size={24} />}
                trend="+5%"
                color="green"
                loading={loading}
              />
              <StatsCard
                title="Ingresos"
                value={`$${stats.monthlyRevenue.toLocaleString()}`}
                icon={<TrendingUp size={24} />}
                trend="+18%"
                color="purple"
                loading={loading}
                className="col-span-2 lg:col-span-1"
              />
              <StatsCard
                title="Consultas"
                value={stats.completedAppointments}
                icon={<Users size={24} />}
                trend="+8%"
                color="orange"
                loading={loading}
                className="col-span-2 lg:col-span-1"
              />
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <QuickActions
              onOpenNewPatient={() => {
                setCollapseSidebar(true);
                setIsNewPatientModalOpen(true);
              }}
              onOpenNewAppointment={(params) => {
                setCollapseSidebar(true);
                setIsNewAppointmentModalOpen(true);
                // params puede contener { tipo: 'urgencia' } para futuras mejoras
              }}
              onOpenPatientSearch={() => {
                setSpotlightRedirectTo('historial');
                setIsPatientSpotlightOpen(true);
              }}
              onOpenExpedienteSearch={() => {
                setSpotlightRedirectTo('expediente');
                setIsPatientSpotlightOpen(true);
              }}
            />
          </section>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Patients */}
            <section>
              <RecentPatients />
            </section>

            {/* Upcoming Appointments */}
            <section>
              <UpcomingAppointments />
            </section>
          </div>
        </main>
      </div>

      {/* Floating Action Button - Mobile */}
      <div className="fixed bottom-24 right-4 lg:hidden z-50">
        <button className="w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-xl flex items-center justify-center text-white">
          <Plus size={24} />
        </button>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Modales */}
      <AddPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => {
          setIsNewPatientModalOpen(false);
          setCollapseSidebar(false);
        }}
        onSuccess={(newPatient) => {
          toast.success(`¡Paciente ${newPatient.nombre_mascota} registrado exitosamente!`);
          // Aquí podrías recargar las estadísticas o la lista de pacientes recientes
        }}
      />

      <AddAppointmentModal
        isOpen={isNewAppointmentModalOpen}
        onClose={() => {
          setIsNewAppointmentModalOpen(false);
          setCollapseSidebar(false);
        }}
        onSuccess={(newAppointment) => {
          toast.success('¡Cita programada exitosamente!');
          // Aquí podrías recargar las citas próximas
        }}
      />

      <PatientSpotlight
        isOpen={isPatientSpotlightOpen}
        onClose={() => setIsPatientSpotlightOpen(false)}
        redirectTo={spotlightRedirectTo}
      />
    </AppLayout>
  );
};

export default DashboardPage;
