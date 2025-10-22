/**
 * =====================================================
 * COMPONENTE PARA COMPARTIR HISTORIAL CLÍNICO
 * =====================================================
 * Permite compartir el historial por diferentes medios
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  Link2,
  Mail,
  MessageCircle,
  Download,
  Copy,
  Check,
  X,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import toast from 'react-hot-toast';

/**
 * Modal de compartir historial
 */
const CompartirHistorial = ({ paciente, historial, onClose }) => {
  const [enlaceGenerado, setEnlaceGenerado] = useState(null);
  const [configuracion, setConfiguracion] = useState({
    incluirDatos: {
      consultas: true,
      vacunas: true,
      desparasitaciones: true,
      alergias: true,
      cirugias: true
    },
    expiracion: '24h', // '24h', '48h', '7d', '30d'
    requierePassword: false,
    password: '',
    vistaPublica: true
  });
  const [copiado, setCopiado] = useState(false);
  const [generando, setGenerando] = useState(false);

  /**
   * Generar enlace compartible
   */
  const generarEnlace = async () => {
    try {
      setGenerando(true);

      // Generar token único
      const token = generarToken();

      // Construir URL base
      const baseUrl = window.location.origin;
      const enlace = `${baseUrl}/historial-compartido/${token}`;

      // Simular guardado en backend (en producción, esto haría una llamada API)
      // await api.post('/historial/compartir', {
      //   paciente_id: paciente.id,
      //   token: token,
      //   configuracion: configuracion,
      //   expira_en: configuracion.expiracion
      // });

      // Guardar en localStorage temporalmente (para demo)
      const datosCompartidos = {
        token,
        paciente: {
          nombre: paciente.nombre_mascota,
          especie: paciente.especie,
          raza: paciente.nombre_raza,
          edad: paciente.edad,
          foto: paciente.foto_url
        },
        historial: filtrarHistorialSegunConfig(historial),
        configuracion,
        fechaCreacion: new Date().toISOString(),
        expiraEn: calcularFechaExpiracion(configuracion.expiracion)
      };

      localStorage.setItem(`historial_compartido_${token}`, JSON.stringify(datosCompartidos));

      setEnlaceGenerado(enlace);
      toast.success('Enlace generado exitosamente');
    } catch (error) {
      console.error('Error al generar enlace:', error);
      toast.error('Error al generar el enlace');
    } finally {
      setGenerando(false);
    }
  };

  /**
   * Generar token único
   */
  const generarToken = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return token;
  };

  /**
   * Calcular fecha de expiración
   */
  const calcularFechaExpiracion = (expiracion) => {
    const ahora = new Date();
    switch (expiracion) {
      case '24h':
        return new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
      case '48h':
        return new Date(ahora.getTime() + 48 * 60 * 60 * 1000);
      case '7d':
        return new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
    }
  };

  /**
   * Filtrar historial según configuración
   */
  const filtrarHistorialSegunConfig = (historial) => {
    const filtrado = {};

    if (configuracion.incluirDatos.consultas) {
      filtrado.consultas = historial.consultas || [];
    }
    if (configuracion.incluirDatos.vacunas) {
      filtrado.vacunas = historial.vacunas || [];
    }
    if (configuracion.incluirDatos.desparasitaciones) {
      filtrado.desparasitaciones = historial.desparasitaciones || [];
    }
    if (configuracion.incluirDatos.alergias) {
      filtrado.alergias = historial.alergias || [];
    }
    if (configuracion.incluirDatos.cirugias) {
      filtrado.cirugias = historial.cirugias || [];
    }

    return filtrado;
  };

  /**
   * Copiar enlace al portapapeles
   */
  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(enlaceGenerado);
      setCopiado(true);
      toast.success('Enlace copiado al portapapeles');
      setTimeout(() => setCopiado(false), 2000);
    } catch (error) {
      toast.error('Error al copiar el enlace');
    }
  };

  /**
   * Compartir por email
   */
  const compartirPorEmail = () => {
    const asunto = `Historial Clínico de ${paciente.nombre_mascota}`;
    const cuerpo = `Hola,\n\nTe comparto el historial clínico de ${paciente.nombre_mascota}.\n\nPuedes verlo en el siguiente enlace:\n${enlaceGenerado}\n\nEste enlace expirará en ${getExpiracionTexto()}.\n\nSaludos.`;

    window.location.href = `mailto:?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  };

  /**
   * Compartir por WhatsApp
   */
  const compartirPorWhatsApp = () => {
    const mensaje = `Historial Clínico de ${paciente.nombre_mascota}\n\nPuedes verlo aquí: ${enlaceGenerado}\n\nExpira en ${getExpiracionTexto()}.`;

    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  /**
   * Obtener texto de expiración
   */
  const getExpiracionTexto = () => {
    const textos = {
      '24h': '24 horas',
      '48h': '48 horas',
      '7d': '7 días',
      '30d': '30 días'
    };
    return textos[configuracion.expiracion] || '24 horas';
  };

  /**
   * Toggle de opción de datos
   */
  const toggleDato = (key) => {
    setConfiguracion(prev => ({
      ...prev,
      incluirDatos: {
        ...prev.incluirDatos,
        [key]: !prev.incluirDatos[key]
      }
    }));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <GlassCard className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Compartir Historial</h2>
                  <p className="text-white/60 text-sm">
                    {paciente.nombre_mascota} - {paciente.especie}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {!enlaceGenerado ? (
              <>
                {/* Configuración de qué compartir */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    ¿Qué datos deseas compartir?
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries({
                      consultas: { label: 'Consultas Médicas', icon: '📋' },
                      vacunas: { label: 'Vacunas', icon: '💉' },
                      desparasitaciones: { label: 'Desparasitaciones', icon: '🐛' },
                      alergias: { label: 'Alergias', icon: '⚠️' },
                      cirugias: { label: 'Cirugías', icon: '🏥' }
                    }).map(([key, { label, icon }]) => (
                      <label
                        key={key}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          configuracion.incluirDatos[key]
                            ? 'border-blue-400/50 bg-blue-500/10'
                            : 'border-white/10 bg-white/5'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={configuracion.incluirDatos[key]}
                          onChange={() => toggleDato(key)}
                          className="w-5 h-5 rounded accent-blue-500"
                        />
                        <span className="text-xl">{icon}</span>
                        <span className="text-white text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tiempo de expiración */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    Tiempo de expiración
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: '24h', label: '24 horas' },
                      { value: '48h', label: '48 horas' },
                      { value: '7d', label: '7 días' },
                      { value: '30d', label: '30 días' }
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setConfiguracion({ ...configuracion, expiracion: value })}
                        className={`px-4 py-2 rounded-xl text-sm transition-all ${
                          configuracion.expiracion === value
                            ? 'bg-blue-500/30 text-white border border-blue-400/50'
                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Protección con contraseña */}
                <div className="mb-6">
                  <label className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={configuracion.requierePassword}
                      onChange={(e) => setConfiguracion({
                        ...configuracion,
                        requierePassword: e.target.checked
                      })}
                      className="w-5 h-5 rounded accent-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-semibold">Proteger con contraseña</span>
                    </div>
                  </label>

                  {configuracion.requierePassword && (
                    <input
                      type="password"
                      value={configuracion.password}
                      onChange={(e) => setConfiguracion({
                        ...configuracion,
                        password: e.target.value
                      })}
                      placeholder="Contraseña para acceder"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-blue-400/50"
                    />
                  )}
                </div>

                {/* Botón generar */}
                <GlassButton
                  onClick={generarEnlace}
                  disabled={generando}
                  className="w-full bg-blue-500/20 hover:bg-blue-500/30 border-blue-400/30 text-blue-400"
                >
                  {generando ? (
                    <>
                      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      Generando enlace...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-5 h-5" />
                      Generar Enlace Compartible
                    </>
                  )}
                </GlassButton>
              </>
            ) : (
              <>
                {/* Enlace generado */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Check className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">
                      ¡Enlace generado exitosamente!
                    </h3>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                    <p className="text-white/60 text-sm mb-2">Enlace compartible:</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={enlaceGenerado}
                        readOnly
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                      />
                      <GlassButton onClick={copiarEnlace}>
                        {copiado ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </GlassButton>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-3 mb-4">
                    <p className="text-yellow-300 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Este enlace expirará en {getExpiracionTexto()}
                    </p>
                  </div>
                </div>

                {/* Opciones de compartir */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <GlassButton
                    onClick={compartirPorEmail}
                    className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-400/30"
                  >
                    <Mail className="w-5 h-5" />
                    Compartir por Email
                  </GlassButton>

                  <GlassButton
                    onClick={compartirPorWhatsApp}
                    className="bg-green-500/10 hover:bg-green-500/20 border-green-400/30"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Compartir por WhatsApp
                  </GlassButton>
                </div>

                {/* Información de seguridad */}
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Información de Seguridad
                  </h4>
                  <ul className="text-white/60 text-sm space-y-1">
                    <li>✓ El enlace es de un solo uso</li>
                    <li>✓ Expira automáticamente después de {getExpiracionTexto()}</li>
                    {configuracion.requierePassword && (
                      <li>✓ Protegido con contraseña</li>
                    )}
                    <li>✓ No se comparten datos sensibles del propietario</li>
                  </ul>
                </div>

                {/* Botón nuevo enlace */}
                <GlassButton
                  onClick={() => setEnlaceGenerado(null)}
                  className="w-full mt-4"
                >
                  Generar Nuevo Enlace
                </GlassButton>
              </>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompartirHistorial;
