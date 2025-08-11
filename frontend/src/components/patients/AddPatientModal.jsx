// src/components/patients/AddPatientModal.jsx - VERSIÓN FINAL CORREGIDA
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, User, PawPrint, Phone, MapPin, Save } from 'lucide-react';
import * as yup from 'yup';

import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import GlassInput from '../ui/GlassInput';
import { useForm } from '../../hooks/useForm';
import { patientService } from '../../services/patientService';
import toast from 'react-hot-toast';

// ✅ CORREGIDO: Esquema de validación que coincide EXACTAMENTE con el backend
const validationSchema = yup.object({
  nombre_mascota: yup
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .required('El nombre de la mascota es obligatorio'),
  nombre_propietario: yup
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .required('El nombre del propietario es obligatorio'),
  apellidos_propietario: yup
    .string()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres')
    .required('Los apellidos son obligatorios'),
  telefono: yup
    .string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .required('El teléfono es obligatorio'),
  email: yup
    .string()
    .email('Email inválido')
    .nullable()
    .transform((value) => value === '' ? null : value),
  peso: yup
    .number()
    .positive('El peso debe ser mayor a 0')
    .required('El peso es obligatorio'),
  id_raza: yup
    .number()
    .required('Selecciona una raza'),
});

const AddPatientModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [razas, setRazas] = useState([]);
  const [loadingRazas, setLoadingRazas] = useState(false);

  // ✅ Cargar razas al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadRazas();
    }
  }, [isOpen]);

  const loadRazas = async () => {
    try {
      setLoadingRazas(true);
      const razasData = await patientService.getRaces();
      console.log('✅ Razas cargadas:', razasData);
      setRazas(razasData);
    } catch (error) {
      console.error('❌ Error al cargar razas:', error);
      // Fallback a razas por defecto
      setRazas([
        { id: 1, nombre: 'Mestizo', especie: 'Perro' },
        { id: 2, nombre: 'Golden Retriever', especie: 'Perro' },
        { id: 3, nombre: 'Labrador', especie: 'Perro' },
        { id: 4, nombre: 'Pastor Alemán', especie: 'Perro' },
        { id: 5, nombre: 'Bulldog', especie: 'Perro' },
        { id: 6, nombre: 'Persa', especie: 'Gato' },
        { id: 7, nombre: 'Siamés', especie: 'Gato' },
        { id: 8, nombre: 'Maine Coon', especie: 'Gato' },
        { id: 9, nombre: 'Angora', especie: 'Gato' },
        { id: 10, nombre: 'Común Europeo', especie: 'Gato' },
      ]);
    } finally {
      setLoadingRazas(false);
    }
  };

  // ✅ CORREGIDO: Valores iniciales que coinciden EXACTAMENTE con el backend
  const {
    values,
    handleSubmit,
    getFieldProps,
    isSubmitting,
    reset,
    setValue,
    errors
  } = useForm(
    {
      // Datos del paciente
      nombre_mascota: '',
      fecha_nacimiento: '',
      peso: '',
      id_raza: '',
      foto_url: '',
      
      // Datos del propietario
      nombre_propietario: '',
      apellidos_propietario: '',
      email: '',
      telefono: '',
      tipo_telefono: 'celular',
      
      // Datos de dirección (opcionales)
      calle: '',
      numero_ext: '',
      numero_int: '',
      codigo_postal: '',
      colonia: '',
      id_municipio: 1,
      referencias: ''
    },
    validationSchema
  );

  const handleClose = () => {
    reset();
    setStep(1);
    onClose();
  };

  // ✅ CORREGIDO: Enviar datos con el formato EXACTO que espera el backend
  const onSubmit = async (formData) => {
    try {
      console.log('📤 Datos del formulario antes de enviar:', formData);
      
      // ✅ Formatear datos EXACTAMENTE como espera el backend
      const dataToSend = {
        // Datos del propietario (OBLIGATORIOS)
        nombre_propietario: formData.nombre_propietario.trim(),
        apellidos_propietario: formData.apellidos_propietario.trim(),
        telefono: formData.telefono.replace(/\D/g, ''), // Solo números
        email: formData.email ? formData.email.trim().toLowerCase() : null,
        tipo_telefono: formData.tipo_telefono || 'celular',
        
        // Datos del paciente (OBLIGATORIOS)
        nombre_mascota: formData.nombre_mascota.trim(),
        peso: parseFloat(formData.peso),
        id_raza: parseInt(formData.id_raza),
        
        // Datos opcionales
        fecha_nacimiento: formData.fecha_nacimiento || null,
        foto_url: formData.foto_url || null,
        
        // Datos de dirección (opcionales)
        calle: formData.calle ? formData.calle.trim() : null,
        numero_ext: formData.numero_ext ? formData.numero_ext.trim() : null,
        numero_int: formData.numero_int ? formData.numero_int.trim() : null,
        codigo_postal: formData.codigo_postal ? formData.codigo_postal.trim() : null,
        colonia: formData.colonia ? formData.colonia.trim() : null,
        id_municipio: parseInt(formData.id_municipio) || 1,
        referencias: formData.referencias ? formData.referencias.trim() : null
      };

      console.log('📋 Datos formateados para enviar:', dataToSend);
      
      // ✅ Validar datos antes de enviar
      const validation = patientService.validate(dataToSend);
      if (!validation.isValid) {
        console.error('❌ Errores de validación:', validation.errors);
        Object.keys(validation.errors).forEach(field => {
          toast.error(`${field}: ${validation.errors[field]}`);
        });
        return;
      }
      
      // ✅ Enviar al backend
      const newPatient = await patientService.create(dataToSend);
      console.log('✅ Paciente creado exitosamente:', newPatient);
      
      // ✅ Callback de éxito
      if (onSuccess) {
        onSuccess(newPatient.data || newPatient);
      }
      
      toast.success('Paciente agregado exitosamente');
      handleClose();
    } catch (error) {
      console.error('❌ Error al agregar paciente:', error);
      
      // ✅ Manejo detallado de errores
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.errors) {
          // Errores de validación específicos
          Object.keys(errorData.errors).forEach(field => {
            toast.error(`${field}: ${errorData.errors[field]}`);
          });
        } else if (errorData.msg) {
          toast.error(errorData.msg);
        } else {
          toast.error('Error al agregar paciente');
        }
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Error de conexión al servidor');
      }
    }
  };

  const nextStep = () => {
    // ✅ Validar paso actual antes de continuar
    const currentStepValid = validateCurrentStep();
    if (currentStepValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // ✅ CORREGIDO: Validar paso actual
  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        const hasRequiredPetData = values.nombre_mascota?.trim() && 
                                  values.peso && 
                                  parseFloat(values.peso) > 0 && 
                                  values.id_raza;
        if (!hasRequiredPetData) {
          if (!values.nombre_mascota?.trim()) toast.error('El nombre de la mascota es obligatorio');
          if (!values.peso || parseFloat(values.peso) <= 0) toast.error('El peso debe ser mayor a 0');
          if (!values.id_raza) toast.error('Selecciona una raza');
        }
        return hasRequiredPetData;
        
      case 2:
        const hasRequiredOwnerData = values.nombre_propietario?.trim() && 
                                    values.apellidos_propietario?.trim() && 
                                    values.telefono?.trim() &&
                                    values.telefono.replace(/\D/g, '').length >= 10;
        if (!hasRequiredOwnerData) {
          if (!values.nombre_propietario?.trim()) toast.error('El nombre del propietario es obligatorio');
          if (!values.apellidos_propietario?.trim()) toast.error('Los apellidos son obligatorios');
          if (!values.telefono?.trim()) toast.error('El teléfono es obligatorio');
          if (values.telefono && values.telefono.replace(/\D/g, '').length < 10) toast.error('El teléfono debe tener al menos 10 dígitos');
        }
        return hasRequiredOwnerData;
        
      default:
        return true;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          <GlassCard className="p-0">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Nuevo Paciente
                  </h2>
                  <p className="text-white/70">
                    Paso {step} de 3
                  </p>
                </div>
                
                <motion.button
                  onClick={handleClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X size={20} className="text-white" />
                </motion.button>
              </div>

              {/* Progress bar */}
              <div className="mt-4 flex space-x-2">
                {[1, 2, 3].map((stepNumber) => (
                  <div
                    key={stepNumber}
                    className={`flex-1 h-2 rounded-full transition-colors duration-300 ${
                      step >= stepNumber 
                        ? 'bg-primary-500' 
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Paso 1: Datos de la mascota */}
                {step === 1 && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-2">🐾</div>
                      <h3 className="text-xl font-semibold text-white">
                        Información de la Mascota
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <GlassInput
                          {...getFieldProps('nombre_mascota')}
                          placeholder="Nombre de la mascota"
                          label="Nombre de la Mascota *"
                          icon={<PawPrint size={20} />}
                          error={errors.nombre_mascota}
                        />
                      </div>

                      <GlassInput
                        {...getFieldProps('fecha_nacimiento')}
                        type="date"
                        label="Fecha de Nacimiento (Opcional)"
                      />

                      <GlassInput
                        {...getFieldProps('peso')}
                        type="number"
                        step="0.1"
                        placeholder="Peso en kg"
                        label="Peso (kg) *"
                        error={errors.peso}
                      />

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-white mb-3">
                          Raza *
                        </label>
                        {loadingRazas ? (
                          <div className="flex items-center justify-center p-4 bg-white/5 rounded-xl">
                            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                            <span className="ml-2 text-white/70">Cargando razas...</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                            {razas.map((raza) => (
                              <motion.label
                                key={raza.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                                  parseInt(values.id_raza) === raza.id
                                    ? 'bg-primary-500/20 border-primary-400/50'
                                    : 'bg-white/5 border-white/20 hover:bg-white/10'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="id_raza"
                                  value={raza.id}
                                  checked={parseInt(values.id_raza) === raza.id}
                                  onChange={getFieldProps('id_raza').onChange}
                                  className="sr-only"
                                />
                                <div className="text-center">
                                  <div className="text-lg mb-1">
                                    {raza.especie === 'Perro' ? '🐕' : '🐱'}
                                  </div>
                                  <div className="text-white text-xs font-medium">
                                    {raza.nombre}
                                  </div>
                                  <div className="text-white/60 text-xs">
                                    {raza.especie}
                                  </div>
                                </div>
                              </motion.label>
                            ))}
                          </div>
                        )}
                        {errors.id_raza && (
                          <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                            <span>⚠️</span>
                            {errors.id_raza}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Paso 2: Datos del propietario */}
                {step === 2 && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-2">👤</div>
                      <h3 className="text-xl font-semibold text-white">
                        Información del Propietario
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <GlassInput
                        {...getFieldProps('nombre_propietario')}
                        placeholder="Nombre"
                        label="Nombre *"
                        icon={<User size={20} />}
                        error={errors.nombre_propietario}
                      />

                      <GlassInput
                        {...getFieldProps('apellidos_propietario')}
                        placeholder="Apellidos"
                        label="Apellidos *"
                        icon={<User size={20} />}
                        error={errors.apellidos_propietario}
                      />

                      <GlassInput
                        {...getFieldProps('telefono')}
                        type="tel"
                        placeholder="Teléfono (10 dígitos)"
                        label="Teléfono *"
                        icon={<Phone size={20} />}
                        error={errors.telefono}
                      />

                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Tipo de Teléfono
                        </label>
                        <select
                          {...getFieldProps('tipo_telefono')}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        >
                          <option value="celular">Celular</option>
                          <option value="casa">Casa</option>
                          <option value="trabajo">Trabajo</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <GlassInput
                          {...getFieldProps('email')}
                          type="email"
                          placeholder="correo@ejemplo.com (opcional)"
                          label="Email (Opcional)"
                          error={errors.email}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Paso 3: Dirección */}
                {step === 3 && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-2">🏠</div>
                      <h3 className="text-xl font-semibold text-white">
                        Dirección (Opcional)
                      </h3>
                      <p className="text-white/60 text-sm mt-2">
                        Puedes completar estos datos después
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <GlassInput
                          {...getFieldProps('calle')}
                          placeholder="Calle"
                          label="Calle"
                          icon={<MapPin size={20} />}
                        />
                      </div>

                      <GlassInput
                        {...getFieldProps('numero_ext')}
                        placeholder="Número exterior"
                        label="Número Exterior"
                      />

                      <GlassInput
                        {...getFieldProps('numero_int')}
                        placeholder="Número interior (opcional)"
                        label="Número Interior"
                      />

                      <GlassInput
                        {...getFieldProps('codigo_postal')}
                        placeholder="Código postal"
                        label="Código Postal"
                      />

                      <GlassInput
                        {...getFieldProps('colonia')}
                        placeholder="Colonia"
                        label="Colonia"
                      />

                      <div className="md:col-span-2">
                        <GlassInput
                          {...getFieldProps('referencias')}
                          placeholder="Referencias de ubicación"
                          label="Referencias"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10">
              <div className="flex justify-between">
                {step > 1 ? (
                  <GlassButton
                    onClick={prevStep}
                    variant="ghost"
                    disabled={isSubmitting}
                  >
                    Anterior
                  </GlassButton>
                ) : (
                  <div></div>
                )}

                {step < 3 ? (
                  <GlassButton
                    onClick={nextStep}
                    disabled={isSubmitting}
                  >
                    Siguiente
                  </GlassButton>
                ) : (
                  <GlassButton
                    onClick={handleSubmit(onSubmit)}
                    loading={isSubmitting}
                    icon={!isSubmitting && <Save size={20} />}
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar Paciente'}
                  </GlassButton>
                )}
              </div>
              
              {/* Mostrar errores de validación */}
              {Object.keys(errors).length > 0 && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm font-medium mb-2">
                    Por favor corrige los siguientes errores:
                  </p>
                  <ul className="text-red-400/80 text-xs space-y-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddPatientModal;