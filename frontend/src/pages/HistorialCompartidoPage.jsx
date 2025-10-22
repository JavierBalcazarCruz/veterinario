/**
 * =====================================================
 * PÁGINA PÚBLICA DE HISTORIAL COMPARTIDO
 * =====================================================
 * Vista pública de historial clínico compartido
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Syringe,
  Bug,
  AlertTriangle,
  Scissors,
  Calendar,
  Lock,
  XCircle,
  CheckCircle,
  Loader,
  Eye
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';

const HistorialCompartidoPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [requierePassword, setRequierePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordIncorrecto, setPasswordIncorrecto] = useState(false);

  useEffect(() => {
    cargarHistorialCompartido();
  }, [token]);

  /**
   * Cargar historial compartido
   */
  const cargarHistorialCompartido = async () => {
    try {
      setLoading(true);

      // En producción, esto sería una llamada al backend
      // const response = await api.get(`/historial-compartido/${token}`);

      // Por ahora, recuperamos de localStorage (demo)
      const datosGuardados = localStorage.getItem(`historial_compartido_${token}`);

      if (!datosGuardados) {
        setError('Este enlace no existe o ha expirado');
        setLoading(false);
        return;
      }

      const datosParseados = JSON.parse(datosGuardados);

      // Verificar expiración
      const ahora = new Date();
      const expiracion = new Date(datosParseados.expiraEn);

      if (ahora > expiracion) {
        setError('Este enlace ha expirado');
        localStorage.removeItem(`historial_compartido_${token}`);
        setLoading(false);
        return;
      }

      // Verificar si requiere contraseña
      if (datosParseados.configuracion.requierePassword) {
        setRequierePassword(true);
        setDatos(datosParseados);
        setLoading(false);
        return;
      }

      setDatos(datosParseados);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setError('Error al cargar el historial compartido');
      setLoading(false);
    }
  };

  /**
   * Verificar contraseña
   */
  const verificarPassword = () => {
    if (password === datos.configuracion.password) {
      setRequierePassword(false);
      setPasswordIncorrecto(false);
    } else {
      setPasswordIncorrecto(true);
    }
  };

  /**
   * Formatear fecha
   */
  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Cargando historial...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
        <GlassCard className="p-8 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Enlace No Válido
          </h2>
          <p className="text-white/60 mb-6">{error}</p>
          <GlassButton onClick={() => navigate('/')}>
            Ir al Inicio
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  // Password required
  if (requierePassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <GlassCard className="p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Lock className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Historial Protegido
            </h2>
            <p className="text-white/60">
              Este historial está protegido con contraseña
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordIncorrecto(false);
                }}
                onKeyPress={(e) => e.key === 'Enter' && verificarPassword()}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-400/50"
                placeholder="Ingresa la contraseña"
              />
              {passwordIncorrecto && (
                <p className="text-red-400 text-sm mt-2">Contraseña incorrecta</p>
              )}
            </div>

            <GlassButton
              onClick={verificarPassword}
              className="w-full bg-blue-500/20 hover:bg-blue-500/30 border-blue-400/30"
            >
              <Eye className="w-5 h-5" />
              Ver Historial
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Vista del historial
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <GlassCard className="p-6 mb-6">
          <div className="flex items-center gap-4">
            {datos.paciente.foto && (
              <img
                src={datos.paciente.foto}
                alt={datos.paciente.nombre}
                className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-1">
                {datos.paciente.nombre}
              </h1>
              <p className="text-white/70">
                {datos.paciente.raza} • {datos.paciente.especie} • {datos.paciente.edad}
              </p>
            </div>
            <div className="text-right">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-1" />
              <p className="text-white/60 text-sm">Historial Verificado</p>
            </div>
          </div>
        </GlassCard>

        {/* Consultas */}
        {datos.historial.consultas && datos.historial.consultas.length > 0 && (
          <GlassCard className="p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-400" />
              Consultas Médicas
            </h2>
            <div className="space-y-4">
              {datos.historial.consultas.map((consulta, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{consulta.motivo_consulta}</h3>
                    <span className="text-white/50 text-sm">
                      {formatearFecha(consulta.fecha_consulta)}
                    </span>
                  </div>
                  {consulta.diagnostico && (
                    <p className="text-white/70 text-sm mb-2">
                      <span className="font-medium">Diagnóstico:</span> {consulta.diagnostico}
                    </p>
                  )}
                  {consulta.tratamiento && (
                    <p className="text-white/70 text-sm">
                      <span className="font-medium">Tratamiento:</span> {consulta.tratamiento}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Vacunas */}
        {datos.historial.vacunas && datos.historial.vacunas.length > 0 && (
          <GlassCard className="p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Syringe className="w-6 h-6 text-green-400" />
              Vacunas
            </h2>
            <div className="grid gap-3">
              {datos.historial.vacunas.map((vacuna, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{vacuna.tipo_vacuna}</span>
                    <span className="text-white/50 text-sm">
                      {formatearFecha(vacuna.fecha_aplicacion)}
                    </span>
                  </div>
                  {vacuna.fecha_proxima && (
                    <p className="text-white/60 text-sm mt-1">
                      Próxima dosis: {formatearFecha(vacuna.fecha_proxima)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Alergias */}
        {datos.historial.alergias && datos.historial.alergias.length > 0 && (
          <GlassCard className="p-6 mb-6 border-2 border-red-400/30">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              Alergias Activas
            </h2>
            <div className="space-y-3">
              {datos.historial.alergias.map((alergia, index) => (
                <div key={index} className="bg-red-500/10 rounded-xl p-3 border border-red-400/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{alergia.nombre_alergeno}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alergia.severidad === 'critica' ? 'bg-red-500/30 text-red-300' :
                      alergia.severidad === 'severa' ? 'bg-orange-500/30 text-orange-300' :
                      'bg-yellow-500/30 text-yellow-300'
                    }`}>
                      {alergia.severidad}
                    </span>
                  </div>
                  {alergia.sintomas && (
                    <p className="text-white/70 text-sm">{alergia.sintomas}</p>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Footer */}
        <div className="text-center text-white/40 text-sm mt-8">
          <p>Historial compartido de forma segura</p>
          <p className="mt-1">
            Válido hasta: {formatearFecha(datos.expiraEn)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistorialCompartidoPage;
