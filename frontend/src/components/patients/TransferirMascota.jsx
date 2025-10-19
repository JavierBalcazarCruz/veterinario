// src/components/patients/TransferirMascota.jsx - Transfer pet with Pokémon GO-style animation
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, User, ArrowRight, Sparkles, Check } from 'lucide-react';
import toast from 'react-hot-toast';

import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import GlassInput from '../ui/GlassInput';
import OwnerSearch from './OwnerSearch';
import { patientService } from '../../services/patientService';

/**
 * TransferirMascota Component
 * Componente para transferir una mascota a otro propietario
 * con animación estilo Pokémon GO
 */
const TransferirMascota = ({
  isOpen,
  onClose,
  onSuccess,
  patient // Datos completos del paciente a transferir
}) => {
  const [step, setStep] = useState(1); // 1: Selección, 2: Confirmación, 3: Animación, 4: Éxito
  const [transferMode, setTransferMode] = useState('existing'); // 'existing' o 'new'
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [isTransferring, setIsTransferring] = useState(false);

  // Datos para crear nuevo propietario
  const [newOwnerData, setNewOwnerData] = useState({
    nombre_propietario: '',
    apellidos_propietario: '',
    telefono: '',
    email: '',
    tipo_telefono: 'celular',
    calle: '',
    numero_ext: '',
    numero_int: '',
    codigo_postal: '',
    colonia: '',
    id_municipio: 1,
    referencias: ''
  });

  // Estado de la animación
  const [animationPhase, setAnimationPhase] = useState('idle'); // idle, transferring, success
  const [transferResult, setTransferResult] = useState(null);

  const handleClose = () => {
    setStep(1);
    setTransferMode('existing');
    setSelectedOwner(null);
    setNewOwnerData({
      nombre_propietario: '',
      apellidos_propietario: '',
      telefono: '',
      email: '',
      tipo_telefono: 'celular',
      calle: '',
      numero_ext: '',
      numero_int: '',
      codigo_postal: '',
      colonia: '',
      id_municipio: 1,
      referencias: ''
    });
    setAnimationPhase('idle');
    setTransferResult(null);
    onClose();
  };

  // Validar datos del nuevo propietario
  const validateNewOwner = () => {
    const errors = [];

    if (!newOwnerData.nombre_propietario.trim()) {
      errors.push('El nombre del propietario es obligatorio');
    }

    if (!newOwnerData.apellidos_propietario.trim()) {
      errors.push('Los apellidos son obligatorios');
    }

    if (!newOwnerData.telefono.trim()) {
      errors.push('El teléfono es obligatorio');
    } else if (newOwnerData.telefono.replace(/\D/g, '').length < 10) {
      errors.push('El teléfono debe tener al menos 10 dígitos');
    }

    if (newOwnerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newOwnerData.email)) {
      errors.push('Email inválido');
    }

    return errors;
  };

  // Ejecutar la transferencia
  const handleTransfer = async () => {
    try {
      setIsTransferring(true);
      setStep(3); // Mostrar animación
      setAnimationPhase('transferring');

      let dataToSend = {};

      if (transferMode === 'existing' && selectedOwner) {
        // Transferir a propietario existente
        dataToSend = {
          id_propietario_nuevo: selectedOwner.id
        };
      } else if (transferMode === 'new') {
        // Crear nuevo propietario y transferir
        const validationErrors = validateNewOwner();
        if (validationErrors.length > 0) {
          validationErrors.forEach(error => toast.error(error));
          setStep(1);
          setAnimationPhase('idle');
          setIsTransferring(false);
          return;
        }

        dataToSend = {
          nuevo_propietario: {
            nombre_propietario: newOwnerData.nombre_propietario.trim(),
            apellidos_propietario: newOwnerData.apellidos_propietario.trim(),
            telefono: newOwnerData.telefono.replace(/\D/g, ''),
            email: newOwnerData.email.trim() || null,
            tipo_telefono: newOwnerData.tipo_telefono,
            calle: newOwnerData.calle.trim() || null,
            numero_ext: newOwnerData.numero_ext.trim() || null,
            numero_int: newOwnerData.numero_int.trim() || null,
            codigo_postal: newOwnerData.codigo_postal.trim() || null,
            colonia: newOwnerData.colonia.trim() || null,
            id_municipio: parseInt(newOwnerData.id_municipio) || 1,
            referencias: newOwnerData.referencias.trim() || null
          }
        };
      }

      console.log('🔄 Transfiriendo paciente ID:', patient.id);
      console.log('📤 Datos de transferencia:', dataToSend);

      // Llamar al servicio de transferencia
      const result = await patientService.transfer(patient.id, dataToSend);

      console.log('✅ Transferencia exitosa:', result);
      setTransferResult(result.data);

      // Animación de éxito después de 2 segundos
      setTimeout(() => {
        setAnimationPhase('success');
        setStep(4);
      }, 2000);

    } catch (error) {
      console.error('❌ Error al transferir mascota:', error);
      toast.error(error.response?.data?.msg || 'Error al transferir mascota');
      setStep(1);
      setAnimationPhase('idle');
    } finally {
      setIsTransferring(false);
    }
  };

  // Manejar cambios en campos del nuevo propietario
  const handleNewOwnerChange = (field, value) => {
    setNewOwnerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validación de teléfono - solo números
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    handleNewOwnerChange('telefono', onlyNumbers);
  };

  // Validación de nombre - solo letras
  const handleNameChange = (field, e) => {
    const value = e.target.value;
    const cleanValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s'\-]/g, '');
    handleNewOwnerChange(field, cleanValue);
  };

  if (!isOpen || !patient) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4"
        style={{ zIndex: 10000 }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
          onClick={() => step !== 3 && handleClose()} // No cerrar durante animación
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-4xl mx-auto shadow-2xl"
        >
          <GlassCard className="p-0 overflow-hidden">

            {/* PASO 1 & 2: Selección de propietario y Confirmación */}
            {(step === 1 || step === 2) && (
              <>
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ArrowRight className="text-primary-400" />
                        Transferir Mascota
                      </h2>
                      <p className="text-white/70 mt-1">
                        {step === 1 ? 'Selecciona el nuevo propietario' : 'Confirma la transferencia'}
                      </p>
                    </div>
                    <motion.button
                      onClick={handleClose}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                    >
                      <X size={20} className="text-white" />
                    </motion.button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                  {/* Información del paciente actual */}
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-3xl">
                        {patient.foto_url ? (
                          <img src={patient.foto_url} alt={patient.nombre_mascota} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          '🐾'
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{patient.nombre_mascota}</h3>
                        <p className="text-white/70">
                          Propietario actual: <span className="font-semibold text-white">
                            {patient.nombre_propietario} {patient.apellidos_propietario}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {step === 1 && (
                    <>
                      {/* Selector de modo */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-3">
                          ¿El nuevo propietario ya está registrado?
                        </label>
                        <div className="flex gap-3">
                          <motion.button
                            type="button"
                            onClick={() => setTransferMode('existing')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex-1 py-4 px-4 rounded-xl font-semibold transition-all duration-200 border-2 ${
                              transferMode === 'existing'
                                ? 'bg-green-500/30 border-green-400/70 text-white shadow-lg shadow-green-500/20'
                                : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            🔍 Sí, buscar existente
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={() => setTransferMode('new')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex-1 py-4 px-4 rounded-xl font-semibold transition-all duration-200 border-2 ${
                              transferMode === 'new'
                                ? 'bg-primary-500/30 border-primary-400/70 text-white shadow-lg shadow-primary-500/20'
                                : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            ✨ No, crear nuevo
                          </motion.button>
                        </div>
                      </div>

                      {/* Buscar propietario existente */}
                      {transferMode === 'existing' && (
                        <div>
                          <label className="block text-sm font-medium text-white mb-3">
                            Buscar Propietario
                          </label>
                          <OwnerSearch
                            onSelectOwner={(owner) => {
                              console.log('🎯 Propietario seleccionado para transferencia:', owner);
                              setSelectedOwner(owner);
                            }}
                            selectedOwner={selectedOwner}
                          />
                          {selectedOwner && (
                            <div className="mt-4 p-4 bg-green-500/10 border-2 border-green-400/30 rounded-xl">
                              <p className="text-green-300 font-medium">
                                ✅ Propietario seleccionado: {selectedOwner.nombre} {selectedOwner.apellidos}
                              </p>
                              <p className="text-green-300/70 text-sm">
                                📞 {selectedOwner.telefono}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Formulario para nuevo propietario */}
                      {transferMode === 'new' && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <User size={20} />
                            Datos del Nuevo Propietario
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <GlassInput
                              name="nombre_propietario"
                              value={newOwnerData.nombre_propietario}
                              onChange={(e) => handleNameChange('nombre_propietario', e)}
                              placeholder="Nombre"
                              label="Nombre *"
                              icon={<User size={20} />}
                            />

                            <GlassInput
                              name="apellidos_propietario"
                              value={newOwnerData.apellidos_propietario}
                              onChange={(e) => handleNameChange('apellidos_propietario', e)}
                              placeholder="Apellidos"
                              label="Apellidos *"
                              icon={<User size={20} />}
                            />

                            <GlassInput
                              name="telefono"
                              value={newOwnerData.telefono}
                              onChange={handlePhoneChange}
                              type="tel"
                              placeholder="Teléfono (10 dígitos)"
                              label="Teléfono *"
                              maxLength={10}
                            />

                            <GlassInput
                              name="email"
                              value={newOwnerData.email}
                              onChange={(e) => handleNewOwnerChange('email', e.target.value)}
                              type="email"
                              placeholder="correo@ejemplo.com"
                              label="Email (Opcional)"
                            />
                          </div>

                          {/* Campos adicionales opcionales */}
                          <details className="group">
                            <summary className="cursor-pointer text-white/70 hover:text-white transition-colors font-medium">
                              + Agregar dirección (opcional)
                            </summary>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-white/10">
                              <div className="md:col-span-2">
                                <GlassInput
                                  name="calle"
                                  value={newOwnerData.calle}
                                  onChange={(e) => handleNewOwnerChange('calle', e.target.value)}
                                  placeholder="Calle"
                                  label="Calle"
                                />
                              </div>

                              <GlassInput
                                name="numero_ext"
                                value={newOwnerData.numero_ext}
                                onChange={(e) => handleNewOwnerChange('numero_ext', e.target.value)}
                                placeholder="Núm. Ext."
                                label="Número Exterior"
                              />

                              <GlassInput
                                name="colonia"
                                value={newOwnerData.colonia}
                                onChange={(e) => handleNewOwnerChange('colonia', e.target.value)}
                                placeholder="Colonia"
                                label="Colonia"
                              />

                              <GlassInput
                                name="codigo_postal"
                                value={newOwnerData.codigo_postal}
                                onChange={(e) => handleNewOwnerChange('codigo_postal', e.target.value.replace(/\D/g, '').slice(0, 5))}
                                placeholder="C.P."
                                label="Código Postal"
                                maxLength={5}
                              />
                            </div>
                          </details>
                        </div>
                      )}
                    </>
                  )}

                  {step === 2 && (
                    <>
                      {/* Confirmación visual */}
                      <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-400/30 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
                          <Sparkles className="animate-pulse" />
                          Confirma la Transferencia
                        </h3>

                        <div className="space-y-4">
                          {/* Propietario anterior */}
                          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                              <User size={24} className="text-red-300" />
                            </div>
                            <div>
                              <p className="text-white/60 text-sm">Propietario Anterior</p>
                              <p className="text-white font-semibold">
                                {patient.nombre_propietario} {patient.apellidos_propietario}
                              </p>
                            </div>
                          </div>

                          {/* Flecha */}
                          <div className="flex justify-center">
                            <motion.div
                              animate={{ x: [0, 10, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                              <ArrowRight size={32} className="text-primary-400" />
                            </motion.div>
                          </div>

                          {/* Nuevo propietario */}
                          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                              <User size={24} className="text-green-300" />
                            </div>
                            <div>
                              <p className="text-white/60 text-sm">Nuevo Propietario</p>
                              <p className="text-white font-semibold">
                                {transferMode === 'existing' && selectedOwner
                                  ? `${selectedOwner.nombre} ${selectedOwner.apellidos}`
                                  : `${newOwnerData.nombre_propietario} ${newOwnerData.apellidos_propietario}`
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        <p className="text-yellow-200/80 text-sm mt-4 text-center">
                          Esta acción transferirá la mascota al nuevo propietario.
                          La información del propietario anterior se mantendrá en el historial.
                        </p>
                      </div>
                    </>
                  )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-between gap-3">
                  {step === 1 ? (
                    <>
                      <GlassButton
                        onClick={handleClose}
                        variant="secondary"
                      >
                        Cancelar
                      </GlassButton>
                      <GlassButton
                        onClick={() => {
                          if (transferMode === 'existing' && !selectedOwner) {
                            toast.error('Por favor selecciona un propietario');
                            return;
                          }
                          if (transferMode === 'new') {
                            const errors = validateNewOwner();
                            if (errors.length > 0) {
                              errors.forEach(error => toast.error(error));
                              return;
                            }
                          }
                          setStep(2);
                        }}
                        variant="primary"
                      >
                        Continuar →
                      </GlassButton>
                    </>
                  ) : (
                    <>
                      <GlassButton
                        onClick={() => setStep(1)}
                        variant="secondary"
                      >
                        ← Volver
                      </GlassButton>
                      <GlassButton
                        onClick={handleTransfer}
                        variant="success"
                        disabled={isTransferring}
                      >
                        {isTransferring ? 'Transfiriendo...' : 'Confirmar Transferencia'}
                      </GlassButton>
                    </>
                  )}
                </div>
              </>
            )}

            {/* PASO 3: Animación de Transferencia (estilo Pokémon GO) */}
            {step === 3 && (
              <div className="relative h-[600px] bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center overflow-hidden">

                {/* Fondo animado con estrellas */}
                <div className="absolute inset-0">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>

                {/* Contenedor de la animación */}
                <div className="relative z-10 flex items-center justify-center gap-8">

                  {/* Propietario anterior (izquierda) */}
                  <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-3 border-4 border-red-400/50">
                      <User size={40} className="text-red-300" />
                    </div>
                    <p className="text-white/70 text-sm text-center max-w-[120px]">
                      {patient.nombre_propietario}
                    </p>
                  </motion.div>

                  {/* Mascota (centro) - Animación de transferencia */}
                  <motion.div
                    className="relative"
                    animate={
                      animationPhase === 'transferring'
                        ? {
                            x: [0, 200, 200],
                            y: [0, -50, 0],
                            scale: [1, 1.2, 1],
                            rotate: [0, 360, 360],
                          }
                        : {}
                    }
                    transition={{
                      duration: 2,
                      times: [0, 0.5, 1],
                      ease: "easeInOut",
                    }}
                  >
                    {/* Aura brillante */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-2xl"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />

                    {/* Icono de la mascota */}
                    <div className="relative w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
                      {patient.foto_url ? (
                        <img src={patient.foto_url} alt={patient.nombre_mascota} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span className="text-6xl">🐾</span>
                      )}
                    </div>

                    {/* Partículas alrededor */}
                    {animationPhase === 'transferring' && (
                      <>
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                            style={{
                              left: '50%',
                              top: '50%',
                            }}
                            animate={{
                              x: [0, Math.cos((i / 8) * Math.PI * 2) * 60],
                              y: [0, Math.sin((i / 8) * Math.PI * 2) * 60],
                              opacity: [1, 0],
                              scale: [1, 0],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.1,
                            }}
                          />
                        ))}
                      </>
                    )}
                  </motion.div>

                  {/* Nuevo propietario (derecha) */}
                  <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-3 border-4 border-green-400/50">
                      <User size={40} className="text-green-300" />
                    </div>
                    <p className="text-white/70 text-sm text-center max-w-[120px]">
                      {transferMode === 'existing' && selectedOwner
                        ? selectedOwner.nombre
                        : newOwnerData.nombre_propietario
                      }
                    </p>
                  </motion.div>

                </div>

                {/* Texto de estado */}
                <motion.div
                  className="absolute bottom-12 left-0 right-0 text-center"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <p className="text-white text-xl font-bold">
                    {animationPhase === 'transferring' ? 'Transfiriendo...' : 'Procesando...'}
                  </p>
                  <p className="text-white/60 text-sm mt-2">
                    {patient.nombre_mascota}
                  </p>
                </motion.div>

              </div>
            )}

            {/* PASO 4: Éxito */}
            {step === 4 && (
              <div className="relative h-[600px] bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex flex-col items-center justify-center overflow-hidden">

                {/* Confetti */}
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: '-10%',
                      backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'][Math.floor(Math.random() * 4)],
                    }}
                    animate={{
                      y: ['0vh', '110vh'],
                      x: [0, (Math.random() - 0.5) * 200],
                      rotate: [0, 360],
                      opacity: [1, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      delay: Math.random() * 0.5,
                      ease: 'linear',
                    }}
                  />
                ))}

                {/* Icono de éxito */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="mb-8"
                >
                  <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-2xl">
                    <Check size={64} className="text-white" strokeWidth={3} />
                  </div>
                </motion.div>

                {/* Mensaje de éxito */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center px-6"
                >
                  <h2 className="text-4xl font-bold text-white mb-4">
                    ¡Transferencia Exitosa!
                  </h2>
                  <p className="text-white/80 text-lg mb-2">
                    <span className="font-semibold text-yellow-300">{patient.nombre_mascota}</span> ahora pertenece a
                  </p>
                  <p className="text-white text-2xl font-bold mb-6">
                    {transferResult?.propietario_nuevo?.nombre} {transferResult?.propietario_nuevo?.apellidos}
                  </p>

                  {/* Información adicional */}
                  <div className="bg-white/10 rounded-xl p-4 mb-8 max-w-md mx-auto">
                    <p className="text-white/60 text-sm mb-2">Propietario anterior:</p>
                    <p className="text-white font-medium">
                      {transferResult?.propietario_anterior?.nombre} {transferResult?.propietario_anterior?.apellidos}
                    </p>
                  </div>

                  <GlassButton
                    onClick={() => {
                      if (onSuccess) {
                        onSuccess(transferResult);
                      }
                      handleClose();
                    }}
                    variant="success"
                    className="px-8 py-3"
                  >
                    Finalizar
                  </GlassButton>
                </motion.div>

              </div>
            )}

          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TransferirMascota;
