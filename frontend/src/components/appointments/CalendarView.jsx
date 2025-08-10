// src/components/appointments/CalendarView.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';

const CalendarView = ({ appointments = [], selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Días del siguiente mes
    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let day = 1; days.length < totalCells; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  const getAppointmentsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.fecha === dateString);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (date) => {
    onDateSelect(date);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const getStatusColor = (estado) => {
    const colors = {
      programada: 'bg-blue-400',
      confirmada: 'bg-green-400',
      en_curso: 'bg-yellow-400',
      completada: 'bg-purple-400',
      cancelada: 'bg-red-400'
    };
    return colors[estado] || 'bg-gray-400';
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <GlassCard className="p-6">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={handlePrevMonth}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={20} className="text-white" />
          </motion.button>

          <h2 className="text-2xl font-bold text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>

          <motion.button
            onClick={handleNextMonth}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ChevronRight size={20} className="text-white" />
          </motion.button>
        </div>

        <motion.button
          onClick={() => {
            const today = new Date();
            setCurrentMonth(today);
            onDateSelect(today);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-primary-500/20 border border-primary-400/50 rounded-lg text-primary-300 hover:bg-primary-500/30 transition-colors"
        >
          Hoy
        </motion.button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map((day) => (
          <div
            key={day}
            className="h-10 flex items-center justify-center text-white/60 font-medium text-sm"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Días del calendario */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((dayInfo, index) => {
          const dayAppointments = getAppointmentsForDate(dayInfo.date);
          const isCurrentMonth = dayInfo.isCurrentMonth;
          const isTodayDate = isToday(dayInfo.date);
          const isSelectedDate = isSelected(dayInfo.date);

          return (
            <motion.button
              key={index}
              onClick={() => handleDateClick(dayInfo.date)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              className={`
                relative h-20 p-2 rounded-xl border transition-all duration-200
                ${isCurrentMonth ? 'text-white' : 'text-white/30'}
                ${isTodayDate 
                  ? 'bg-primary-500/30 border-primary-400/50' 
                  : isSelectedDate 
                    ? 'bg-white/20 border-white/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              {/* Número del día */}
              <div className={`text-sm font-medium ${isTodayDate ? 'text-white' : ''}`}>
                {dayInfo.date.getDate()}
              </div>

              {/* Indicadores de citas */}
              {dayAppointments.length > 0 && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="flex justify-center space-x-1">
                    {dayAppointments.slice(0, 3).map((apt, aptIndex) => (
                      <motion.div
                        key={apt.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: aptIndex * 0.1 }}
                        className={`w-1.5 h-1.5 rounded-full ${getStatusColor(apt.estado)}`}
                      />
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                    )}
                  </div>
                  
                  {/* Contador de citas */}
                  {dayAppointments.length > 0 && (
                    <div className="text-xs text-center text-white/70 mt-1">
                      {dayAppointments.length}
                    </div>
                  )}
                </div>
              )}

              {/* Efecto hover */}
              <motion.div
                className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                whileHover={{ opacity: 0.1 }}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Leyenda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-white">Leyenda</h3>
          <div className="flex items-center space-x-2 text-xs text-white/60">
            <Calendar size={14} />
            <span>Estados de citas</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { estado: 'programada', label: 'Programada', color: 'bg-blue-400' },
            { estado: 'confirmada', label: 'Confirmada', color: 'bg-green-400' },
            { estado: 'en_curso', label: 'En Curso', color: 'bg-yellow-400' },
            { estado: 'completada', label: 'Completada', color: 'bg-purple-400' },
            { estado: 'cancelada', label: 'Cancelada', color: 'bg-red-400' }
          ].map((item) => (
            <div key={item.estado} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-white/70 text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Citas del día seleccionado */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-white">
              Citas del {selectedDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-white/60">
              <Clock size={14} />
              <span>{getAppointmentsForDate(selectedDate).length} citas</span>
            </div>
          </div>

          <div className="space-y-3">
            {getAppointmentsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-white/60 text-sm">
                  No hay citas programadas para este día
                </p>
              </div>
            ) : (
              getAppointmentsForDate(selectedDate)
                .sort((a, b) => a.hora.localeCompare(b.hora))
                .map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    {/* Hora */}
                    <div className="flex-shrink-0 text-center">
                      <div className="text-sm font-bold text-white">
                        {appointment.hora}
                      </div>
                      <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${getStatusColor(appointment.estado)}`} />
                    </div>

                    {/* Info del paciente */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-white text-sm truncate">
                          {appointment.paciente.nombre}
                        </h4>
                        <span className="text-xs text-white/60">
                          {appointment.tipo_consulta === 'urgencia' ? '🚨' : 
                           appointment.tipo_consulta === 'vacunacion' ? '💉' : 
                           appointment.tipo_consulta === 'seguimiento' ? '📋' : '🆕'}
                        </span>
                      </div>
                      <p className="text-white/60 text-xs truncate">
                        {appointment.propietario.nombre}
                      </p>
                    </div>

                    {/* Estado */}
                    <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                      appointment.estado === 'programada' ? 'bg-blue-500/20 text-blue-300' :
                      appointment.estado === 'confirmada' ? 'bg-green-500/20 text-green-300' :
                      appointment.estado === 'en_curso' ? 'bg-yellow-500/20 text-yellow-300' :
                      appointment.estado === 'completada' ? 'bg-purple-500/20 text-purple-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {appointment.estado === 'programada' ? 'Programada' :
                       appointment.estado === 'confirmada' ? 'Confirmada' :
                       appointment.estado === 'en_curso' ? 'En Curso' :
                       appointment.estado === 'completada' ? 'Completada' :
                       'Cancelada'}
                    </div>
                  </motion.div>
                ))
            )}
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
};

export default CalendarView;