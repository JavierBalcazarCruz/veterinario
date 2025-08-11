// src/pages/DashboardPage.jsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Users, Calendar, PawPrint, TrendingUp, Plus } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header'; // ✅ Importa el nuevo componente Header
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import MobileNavigation from '../components/layout/MobileNavigation';
import StatsCard from '../components/dashboard/StatsCard';
import QuickActions from '../components/dashboard/QuickActions';
import RecentPatients from '../components/dashboard/RecentPatients';
import UpcomingAppointments from '../components/dashboard/UpcomingAppointments';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    completedAppointments: 0
  });
  const [loading, setLoading] = useState(true);

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
    <AppLayout>
      <div className="min-h-screen pb-20 lg:pb-8">
        {/* Usa el nuevo componente Header. TopMenu se renderizará automáticamente en desktop. */}
        <Header title={greetingTitle} subtitle={formattedDate} />

        {/* Main Content */}
        <main className="px-4 lg:px-6 space-y-6">
          {/* Quick Stats */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
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
          </motion.section>

          {/* Quick Actions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <QuickActions />
          </motion.section>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Patients */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <RecentPatients />
            </motion.section>

            {/* Upcoming Appointments */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <UpcomingAppointments />
            </motion.section>
          </div>

          {/* Floating Action Button - Mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="fixed bottom-24 right-4 lg:hidden z-50"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-xl flex items-center justify-center text-white"
            >
              <Plus size={24} />
            </motion.button>
          </motion.div>
        </main>

        {/* Mobile Navigation */}
        <MobileNavigation />
      </div>
    </AppLayout>
  );
};

export default DashboardPage;