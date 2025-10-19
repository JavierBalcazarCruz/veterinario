// src/components/ui/PatientModal.jsx - Componente reutilizable para crear/editar pacientes
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { X, User, PawPrint, Phone, MapPin, Save } from 'lucide-react';
import * as yup from 'yup';

import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import GlassInput from './GlassInput';
import OwnerSearch from '../patients/OwnerSearch';
import { useForm } from '../../hooks/useForm';
import { patientService } from '../../services/patientService';
import toast from 'react-hot-toast';

// ✅ Esquema de validación
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

const PatientModal = ({
  isOpen,
  onClose,
  onSuccess,
  editMode = false,        // ✅ Modo edición
  initialData = null       // ✅ Datos iniciales para editar
}) => {
  const [step, setStep] = useState(1);
  const [razas, setRazas] = useState([]);
  const [razasFiltradas, setRazasFiltradas] = useState([]);
  const [loadingRazas, setLoadingRazas] = useState(false);
  const [especieSeleccionada, setEspecieSeleccionada] = useState('Perro');
  const [busquedaRaza, setBusquedaRaza] = useState('');
  const [ownerType, setOwnerType] = useState('new'); // 'new' o 'existing'
  const [selectedOwner, setSelectedOwner] = useState(null);

  // ✅ Ref para evitar que se recarguen los datos múltiples veces
  const datosYaCargados = useRef(false);

  // ✅ Cargar razas al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadRazas();
    }
  }, [isOpen]);

  // ✅ Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const loadRazas = async () => {
    try {
      setLoadingRazas(true);
      const razasData = await patientService.getRaces();
      console.log('✅ Razas cargadas:', razasData);
      setRazas(razasData);
      setRazasFiltradas(razasData.filter(r => r.especie === especieSeleccionada));
    } catch (error) {
      console.error('❌ Error al cargar razas:', error);
      // Fallback a razas por defecto
      const fallbackRazas = [
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
      ];
      setRazas(fallbackRazas);
      setRazasFiltradas(fallbackRazas.filter(r => r.especie === especieSeleccionada));
    } finally {
      setLoadingRazas(false);
    }
  };

  // ✅ Filtrar razas por especie y búsqueda
  useEffect(() => {
    let filtered = razas.filter(r => r.especie === especieSeleccionada);

    if (busquedaRaza.trim()) {
      filtered = filtered.filter(r =>
        r.nombre.toLowerCase().includes(busquedaRaza.toLowerCase())
      );
    }

    setRazasFiltradas(filtered);
  }, [especieSeleccionada, busquedaRaza, razas]);

  // ✅ Valores iniciales
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

  // ✅ Cargar datos iniciales en modo edición - SOLO UNA VEZ
  useEffect(() => {
    // Si ya cargamos los datos, no volver a cargarlos
    if (datosYaCargados.current) {
      return;
    }

    if (isOpen && editMode && initialData && razas.length > 0) {
      console.log('📝 Cargando datos para editar (SOLO UNA VEZ):', initialData);

      // Marcar que ya cargamos los datos
      datosYaCargados.current = true;

      // ✅ Mapear EXPLÍCITAMENTE cada campo necesario
      // Datos del paciente
      if (initialData.nombre_mascota) setValue('nombre_mascota', initialData.nombre_mascota);
      if (initialData.fecha_nacimiento) {
        // Convertir fecha de MySQL a formato yyyy-MM-dd para input type="date"
        const fecha = new Date(initialData.fecha_nacimiento);
        const fechaFormateada = fecha.toISOString().split('T')[0];
        setValue('fecha_nacimiento', fechaFormateada);
        console.log('📅 Fecha cargada:', fechaFormateada);
      }
      if (initialData.peso) setValue('peso', initialData.peso);
      if (initialData.id_raza) setValue('id_raza', initialData.id_raza);
      if (initialData.foto_url) setValue('foto_url', initialData.foto_url);

      // Datos del propietario
      if (initialData.nombre_propietario) setValue('nombre_propietario', initialData.nombre_propietario);
      if (initialData.apellidos_propietario) setValue('apellidos_propietario', initialData.apellidos_propietario);
      if (initialData.email) setValue('email', initialData.email);

      // ✅ Teléfono del propietario (soporta ambos formatos)
      const telefono = initialData.telefono || initialData.telefono_principal;
      if (telefono) {
        setValue('telefono', telefono);
        console.log('📞 Teléfono cargado:', telefono);
      }
      if (initialData.tipo_telefono) setValue('tipo_telefono', initialData.tipo_telefono);

      // ✅ Dirección del propietario (soporta objeto direccion O campos individuales)
      const direccion = initialData.direccion || initialData;

      if (direccion.calle) {
        setValue('calle', direccion.calle);
        console.log('🏠 Calle cargada:', direccion.calle);
      }
      if (direccion.numero_ext) setValue('numero_ext', direccion.numero_ext);
      if (direccion.numero_int) setValue('numero_int', direccion.numero_int);
      if (direccion.codigo_postal) {
        setValue('codigo_postal', direccion.codigo_postal);
        console.log('📮 Código postal cargado:', direccion.codigo_postal);
      }
      if (direccion.colonia) {
        setValue('colonia', direccion.colonia);
        console.log('🏘️ Colonia cargada:', direccion.colonia);
      }
      if (direccion.id_municipio) setValue('id_municipio', direccion.id_municipio);
      if (direccion.referencias) setValue('referencias', direccion.referencias);

      // Detectar especie automáticamente según la raza
      if (initialData.especie) {
        setEspecieSeleccionada(initialData.especie);
        console.log('🐾 Especie detectada:', initialData.especie);
      } else if (initialData.nombre_raza && razas.length > 0) {
        const razaEncontrada = razas.find(r => r.id === initialData.id_raza);
        if (razaEncontrada) {
          setEspecieSeleccionada(razaEncontrada.especie);
          console.log('🐾 Especie detectada desde raza:', razaEncontrada.especie);
        }
      }
    }
  }, [isOpen, editMode, initialData, razas]); // ✅ Removí setValue de las dependencias

  // ✅ Validación de teléfono - solo números
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Solo permitir números (0-9)
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    setValue('telefono', onlyNumbers);
  };

  // ✅ Validación de número exterior - máximo 6 caracteres alfanuméricos
  const handleNumeroExtChange = (e) => {
    const value = e.target.value;
    // Solo permitir letras y números, sin caracteres especiales, máximo 6 caracteres
    const alphanumeric = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
    setValue('numero_ext', alphanumeric);
  };

  // ✅ Validación de nombre de mascota - sin caracteres especiales, solo letras y espacios
  const handleNombreMascotaChange = (e) => {
    const value = e.target.value;
    // Solo permitir letras, espacios, acentos y ñ
    const cleanValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    setValue('nombre_mascota', cleanValue);
  };

  // ✅ Validación de nombre del propietario - sin caracteres especiales
  const handleNombrePropietarioChange = (e) => {
    const value = e.target.value;
    // Solo permitir letras, espacios, acentos y ñ
    const cleanValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    setValue('nombre_propietario', cleanValue);
  };

  // ✅ Validación de apellidos del propietario - sin caracteres especiales
  const handleApellidosPropietarioChange = (e) => {
    const value = e.target.value;
    // Solo permitir letras, espacios, acentos y ñ
    const cleanValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    setValue('apellidos_propietario', cleanValue);
  };

  // ✅ Validación de calle - sin caracteres especiales peligrosos
  const handleCalleChange = (e) => {
    const value = e.target.value;
    // Permitir letras, números, espacios, puntos, comas y guiones
    const cleanValue = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,\-]/g, '');
    setValue('calle', cleanValue);
  };

  // ✅ Validación de número interior - máximo 3 dígitos, sin caracteres especiales
  const handleNumeroIntChange = (e) => {
    const value = e.target.value;
    // Solo permitir números, máximo 3 dígitos
    const onlyNumbers = value.replace(/[^0-9]/g, '').slice(0, 3);
    setValue('numero_int', onlyNumbers);
  };

  // ✅ Validación de código postal - exactamente 5 dígitos
  const handleCodigoPostalChange = (e) => {
    const value = e.target.value;
    // Solo permitir números, máximo 5 dígitos
    const onlyNumbers = value.replace(/[^0-9]/g, '').slice(0, 5);
    setValue('codigo_postal', onlyNumbers);
  };

  // ✅ Validación de colonia - sin caracteres especiales peligrosos
  const handleColoniaChange = (e) => {
    const value = e.target.value;
    // Permitir letras, números, espacios, puntos, comas y guiones
    const cleanValue = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,\-]/g, '');
    setValue('colonia', cleanValue);
  };

  // ✅ Validación de referencias - sin caracteres especiales, máximo 80 caracteres
  const handleReferenciasChange = (e) => {
    const value = e.target.value;
    // Permitir letras, números, espacios, puntos, comas y guiones, máximo 80 caracteres
    const cleanValue = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,\-]/g, '').slice(0, 80);
    setValue('referencias', cleanValue);
  };

  const handleClose = () => {
    reset();
    setStep(1);
    setBusquedaRaza('');
    setEspecieSeleccionada('Perro');
    setOwnerType('new');
    setSelectedOwner(null);
    // ✅ Resetear el flag para que se puedan cargar datos en la próxima edición
    datosYaCargados.current = false;
    onClose();
  };

  // ✅ Enviar datos (crear o actualizar)
  const onSubmit = async (formData) => {
    try {
      console.log('📤 Datos del formulario antes de enviar:', formData);
      console.log('🔍 Estado de selectedOwner:', selectedOwner);
      console.log('🔍 Modo edición:', editMode);
      console.log('🔍 Tipo de propietario:', ownerType);

      let dataToSend = {};

      // ✅ MODO EDITAR + PROPIETARIO EXISTENTE SELECCIONADO
      // Solo enviar ID del nuevo propietario, NO enviar datos del propietario
      if (editMode && selectedOwner) {
        console.log('🎯 MODO: Editar paciente + Cambiar a propietario existente');
        console.log('📌 Solo enviando ID del nuevo propietario:', selectedOwner.id);

        dataToSend = {
          // Datos del paciente (OBLIGATORIOS)
          nombre_mascota: formData.nombre_mascota.trim(),
          peso: parseFloat(formData.peso),
          id_raza: parseInt(formData.id_raza),

          // Datos opcionales del paciente
          fecha_nacimiento: formData.fecha_nacimiento || null,
          foto_url: formData.foto_url || null,

          // ✅ SOLO el ID del nuevo propietario
          id_propietario_existente: selectedOwner.id
        };

        console.log('✅ NO se envían datos del propietario, solo el ID de relación');
      }
      // ✅ MODO CREAR + PROPIETARIO EXISTENTE SELECCIONADO
      else if (!editMode && selectedOwner) {
        console.log('🎯 MODO: Crear paciente + Propietario existente');

        dataToSend = {
          // Datos del paciente (OBLIGATORIOS)
          nombre_mascota: formData.nombre_mascota.trim(),
          peso: parseFloat(formData.peso),
          id_raza: parseInt(formData.id_raza),

          // Datos opcionales del paciente
          fecha_nacimiento: formData.fecha_nacimiento || null,
          foto_url: formData.foto_url || null,

          // Datos del propietario (necesarios para el backend en modo crear)
          nombre_propietario: formData.nombre_propietario.trim(),
          apellidos_propietario: formData.apellidos_propietario.trim(),
          telefono: formData.telefono.replace(/\D/g, ''),
          email: formData.email ? formData.email.trim().toLowerCase() : null,
          tipo_telefono: formData.tipo_telefono || 'celular',

          // Datos de dirección (opcionales)
          calle: formData.calle ? formData.calle.trim() : null,
          numero_ext: formData.numero_ext ? formData.numero_ext.trim() : null,
          numero_int: formData.numero_int ? formData.numero_int.trim() : null,
          codigo_postal: formData.codigo_postal ? formData.codigo_postal.trim() : null,
          colonia: formData.colonia ? formData.colonia.trim() : null,
          id_municipio: parseInt(formData.id_municipio) || 1,
          referencias: formData.referencias ? formData.referencias.trim() : null,

          // ✅ ID del propietario existente
          id_propietario_existente: selectedOwner.id
        };
      }
      // ✅ CUALQUIER MODO SIN PROPIETARIO EXISTENTE (nuevo o editar manualmente)
      else {
        console.log('🎯 MODO:', editMode ? 'Editar propietario actual' : 'Crear nuevo propietario');

        dataToSend = {
          // Datos del propietario (OBLIGATORIOS)
          nombre_propietario: formData.nombre_propietario.trim(),
          apellidos_propietario: formData.apellidos_propietario.trim(),
          telefono: formData.telefono.replace(/\D/g, ''),
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
      }

      console.log('📋 Datos finales a enviar:', dataToSend);

      // ✅ Validar datos antes de enviar (SOLO si NO es modo editar con propietario existente)
      // En modo editar con propietario existente, no enviamos datos del propietario, así que no validar
      if (!(editMode && selectedOwner)) {
        const validation = patientService.validate(dataToSend);
        if (!validation.isValid) {
          console.error('❌ Errores de validación:', validation.errors);
          Object.keys(validation.errors).forEach(field => {
            toast.error(`${field}: ${validation.errors[field]}`);
          });
          return;
        }
      } else {
        console.log('✅ Validación de yup omitida: propietario existente en modo editar');
      }

      // ✅ Crear o actualizar según el modo
      let result;
      if (editMode && initialData?.id) {
        console.log('🔄 Actualizando paciente ID:', initialData.id);
        console.log('📤 Enviando datos:', dataToSend);
        console.log('📤 URL del request:', `/api/pacientes/${initialData.id}`);
        result = await patientService.update(initialData.id, dataToSend);
        console.log('✅ Respuesta COMPLETA del servidor:', result);
        console.log('✅ result.data:', result?.data);
        console.log('✅ result.success:', result?.success);
        console.log('✅ result.msg:', result?.msg);

        // Si la respuesta tiene datos del paciente actualizado, verificar el id_propietario
        if (result?.data) {
          console.log('🔍 Propietario en respuesta - id_propietario:', result.data.id_propietario);
          console.log('🔍 Nombre del propietario en respuesta:', result.data.nombre_propietario);
        }

        // Verificar que la actualización fue exitosa
        if (result && (result.success || result.data)) {
          toast.success('Paciente actualizado exitosamente');
        } else {
          throw new Error('La actualización no devolvió datos válidos');
        }
      } else {
        console.log('➕ Creando nuevo paciente');
        console.log('📤 Enviando datos:', dataToSend);
        result = await patientService.create(dataToSend);
        console.log('✅ Respuesta del servidor:', result);

        // Verificar que la creación fue exitosa
        if (result && (result.success || result.data)) {
          toast.success('Paciente agregado exitosamente');
        } else {
          throw new Error('La creación no devolvió datos válidos');
        }
      }

      console.log('✅ Operación completada con éxito:', result);

      // ✅ Callback de éxito
      if (onSuccess) {
        onSuccess(result.data || result);
      }

      handleClose();
    } catch (error) {
      console.error('❌ Error al guardar paciente:', error);

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
          toast.error(editMode ? 'Error al actualizar paciente' : 'Error al agregar paciente');
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

  // ✅ Validar paso actual
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
        // ✅ Si está en modo EDITAR y seleccionó un propietario existente, NO validar campos
        if (editMode && selectedOwner) {
          console.log('✅ Validación omitida: propietario existente seleccionado en modo editar');
          return true; // ✅ Permitir continuar sin validar campos bloqueados
        }

        // Verificar si el usuario está llenando campos manualmente
        const hasManualData = values.nombre_propietario?.trim() ||
                             values.apellidos_propietario?.trim() ||
                             values.telefono?.trim();

        // Si está en modo "existing" pero está escribiendo datos manualmente, cambiar a modo "new"
        if (ownerType === 'existing' && hasManualData && !selectedOwner) {
          setOwnerType('new');
        }

        // Si está en modo "existing" y no ha escrito nada ni seleccionado, pedir que seleccione o escriba
        if (ownerType === 'existing' && !hasManualData) {
          if (!selectedOwner) {
            toast.error('Por favor selecciona un propietario de la lista o ingresa los datos manualmente');
            return false;
          }
          return true;
        }

        // Si es nuevo propietario o está editando manualmente, validar campos
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
        className="fixed inset-0 overflow-y-auto"
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '2rem', paddingBottom: '2rem', zIndex: 10000 }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
        />

        {/* Modal - Aparece arriba tanto en mobile como desktop, más grande */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full sm:max-w-3xl lg:max-w-5xl mx-2 sm:mx-4 shadow-2xl"
        >
          <GlassCard className="p-0">
            {/* Header - Mobile Optimized */}
            <div className="p-4 sm:p-6 border-b border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {editMode ? '✏️ Editar Paciente' : '➕ Nuevo Paciente'}
                  </h2>
                  <p className="text-sm sm:text-base text-white/70 mt-1">
                    {editMode ? 'Solo datos de la mascota' : `Paso ${step} de 3`}
                  </p>
                </div>

                <motion.button
                  onClick={handleClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 sm:p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors active:bg-white/30 touch-manipulation"
                >
                  <X size={24} className="text-white sm:w-5 sm:h-5" />
                </motion.button>
              </div>

              {/* Progress bar - Más grueso para mobile (solo en modo crear) */}
              {!editMode && (
                <div className="flex space-x-2">
                  {[1, 2, 3].map((stepNumber) => (
                    <div
                      key={stepNumber}
                      className={`flex-1 h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                        step >= stepNumber
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30'
                          : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Content - Optimized for both mobile and desktop */}
            <div className="p-5 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar" style={{maxHeight: 'calc(90vh - 200px)'}}>
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Paso 1: Datos de la mascota */}
                {step === 1 && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="text-5xl sm:text-4xl mb-3">🐾</div>
                      <h3 className="text-lg sm:text-xl font-semibold text-white">
                        Información de la Mascota
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                      <div className="md:col-span-2 lg:col-span-3">
                        <GlassInput
                          name="nombre_mascota"
                          value={values.nombre_mascota}
                          onChange={handleNombreMascotaChange}
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

                      <div className="hidden lg:block"></div>

                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm sm:text-base font-medium text-white mb-3">
                          Raza *
                        </label>

                        {loadingRazas ? (
                          <div className="flex items-center justify-center p-6 bg-white/5 rounded-xl">
                            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                            <span className="ml-3 text-white/70">Cargando razas...</span>
                          </div>
                        ) : (
                          <>
                            {/* Selector de especie - Tabs */}
                            <div className="flex gap-2 mb-4">
                              <button
                                type="button"
                                onClick={() => {
                                  setEspecieSeleccionada('Perro');
                                  setBusquedaRaza('');
                                }}
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 touch-manipulation ${
                                  especieSeleccionada === 'Perro'
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                                }`}
                              >
                                🐕 Perro
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEspecieSeleccionada('Gato');
                                  setBusquedaRaza('');
                                }}
                                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 touch-manipulation ${
                                  especieSeleccionada === 'Gato'
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                                }`}
                              >
                                🐱 Gato
                              </button>
                            </div>

                            {/* Buscador de razas - Desktop */}
                            <div className="hidden lg:block mb-4">
                              <input
                                type="text"
                                value={busquedaRaza}
                                onChange={(e) => setBusquedaRaza(e.target.value)}
                                placeholder={`Buscar raza de ${especieSeleccionada.toLowerCase()}...`}
                                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border-2 border-white/20
                                  rounded-xl text-white placeholder-white/50
                                  focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
                                  transition-all duration-200"
                              />
                            </div>

                            {/* Select nativo - Mobile */}
                            <div className="lg:hidden mb-4">
                              <select
                                value={values.id_raza}
                                onChange={(e) => setValue('id_raza', e.target.value)}
                                className="w-full px-4 py-3.5 bg-white/10 backdrop-blur-md border-2 border-white/20
                                  rounded-xl text-white font-medium
                                  focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
                                  touch-manipulation appearance-none cursor-pointer"
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                  backgroundPosition: 'right 0.5rem center',
                                  backgroundRepeat: 'no-repeat',
                                  backgroundSize: '1.5em 1.5em',
                                  paddingRight: '2.5rem'
                                }}
                              >
                                <option value="" className="bg-gray-800">
                                  {razasFiltradas.length > 0 ? 'Selecciona una raza' : 'No hay razas disponibles'}
                                </option>
                                {razasFiltradas.map((raza) => (
                                  <option key={raza.id} value={raza.id} className="bg-gray-800">
                                    {raza.especie === 'Perro' ? '🐕' : '🐱'} {raza.nombre}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Grid de tarjetas - Desktop */}
                            <div className="hidden lg:grid grid-cols-3 xl:grid-cols-5 gap-3 max-h-64 overflow-y-auto custom-scrollbar">
                              {razasFiltradas.length > 0 ? (
                                razasFiltradas.map((raza) => (
                                  <motion.label
                                    key={raza.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                      parseInt(values.id_raza) === raza.id
                                        ? 'bg-primary-500/30 border-primary-400/70 shadow-lg shadow-primary-500/20'
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
                                      <div className="text-3xl mb-1">
                                        {raza.especie === 'Perro' ? '🐕' : '🐱'}
                                      </div>
                                      <div className="text-white text-xs font-semibold">
                                        {raza.nombre}
                                      </div>
                                    </div>
                                  </motion.label>
                                ))
                              ) : (
                                <div className="col-span-full text-center py-6 text-white/60">
                                  No se encontraron razas
                                </div>
                              )}
                            </div>
                          </>
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

                {/* Paso 2: Datos del propietario (SOLO en modo crear) */}
                {step === 2 && !editMode && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="text-5xl sm:text-4xl mb-3">👤</div>
                      <h3 className="text-lg sm:text-xl font-semibold text-white">
                        Información del Propietario
                      </h3>
                    </div>

                    {/* Radio Buttons: Nuevo vs Existente - SOLO en modo crear */}
                    <div className="mb-6">
                      <label className="block text-sm sm:text-base font-medium text-white mb-3">
                        ¿El propietario ya está registrado?
                      </label>
                      <div className="flex gap-3">
                        <motion.button
                          type="button"
                          onClick={() => {
                            setOwnerType('new');
                            setSelectedOwner(null);
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex-1 py-3 sm:py-4 px-4 rounded-xl font-semibold transition-all duration-200 border-2 ${
                            ownerType === 'new'
                              ? 'bg-primary-500/30 border-primary-400/70 text-white shadow-lg shadow-primary-500/20'
                              : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          ✨ No, nuevo propietario
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => setOwnerType('existing')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex-1 py-3 sm:py-4 px-4 rounded-xl font-semibold transition-all duration-200 border-2 ${
                            ownerType === 'existing'
                              ? 'bg-green-500/30 border-green-400/70 text-white shadow-lg shadow-green-500/20'
                              : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          🔍 Sí, buscar existente
                        </motion.button>
                      </div>
                    </div>

                    {/* Buscador de propietarios existentes */}
                    {ownerType === 'existing' && (
                      <div className="mb-6">
                        <label className="block text-sm sm:text-base font-medium text-white mb-3">
                          Buscar Propietario
                        </label>
                        <OwnerSearch
                          onSelectOwner={(owner) => {
                            console.log('🎯 Owner seleccionado desde dropdown:', owner);
                            setSelectedOwner(owner);
                            if (owner) {
                              // Rellenar campos automáticamente
                              setValue('nombre_propietario', owner.nombre);
                              setValue('apellidos_propietario', owner.apellidos);
                              setValue('telefono', owner.telefono);
                              setValue('email', owner.email || '');
                              if (owner.direccion) {
                                setValue('calle', owner.direccion.calle || '');
                                setValue('numero_ext', owner.direccion.numero_ext || '');
                                setValue('numero_int', owner.direccion.numero_int || '');
                                setValue('codigo_postal', owner.direccion.codigo_postal || '');
                                setValue('colonia', owner.direccion.colonia || '');
                                setValue('id_municipio', owner.direccion.id_municipio || 1);
                              }
                              console.log('✅ Propietario guardado en estado. ID:', owner.id);
                            } else {
                              console.log('⚠️ Se limpió la selección de propietario');
                            }
                          }}
                          selectedOwner={selectedOwner}
                        />
                      </div>
                    )}

                    {/* Campos del propietario - Siempre visibles pero bloqueados si se seleccionó uno existente */}
                    {(ownerType === 'new' || selectedOwner) && (
                      <>
                        {/* Mensaje informativo cuando está bloqueado */}
                        {selectedOwner && editMode && (
                          <div className="mb-4 p-4 bg-blue-500/10 border-2 border-blue-400/30 rounded-xl">
                            <p className="text-blue-300 text-sm font-medium flex items-center gap-2">
                              <span>🔒</span>
                              Los campos están bloqueados porque seleccionaste un propietario existente.
                              Para modificar estos datos, haz clic en "Editar manualmente".
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                          <div className="lg:col-span-2">
                            <GlassInput
                              name="nombre_propietario"
                              value={values.nombre_propietario}
                              onChange={handleNombrePropietarioChange}
                              placeholder="Nombre"
                              label="Nombre *"
                              icon={<User size={20} />}
                              error={errors.nombre_propietario}
                              disabled={editMode && selectedOwner}
                            />
                          </div>

                          <GlassInput
                            name="apellidos_propietario"
                            value={values.apellidos_propietario}
                            onChange={handleApellidosPropietarioChange}
                            placeholder="Apellidos"
                            label="Apellidos *"
                            icon={<User size={20} />}
                            error={errors.apellidos_propietario}
                            disabled={editMode && selectedOwner}
                          />

                          <GlassInput
                            name="telefono"
                            value={values.telefono}
                            onChange={handlePhoneChange}
                            type="tel"
                            placeholder="Teléfono (10 dígitos)"
                            label="Teléfono *"
                            icon={<Phone size={20} />}
                            error={errors.telefono}
                            maxLength={10}
                            disabled={editMode && selectedOwner}
                          />

                          <div>
                            <label className="block text-sm sm:text-base font-medium text-white mb-2">
                              Tipo de Teléfono
                            </label>
                            <select
                              {...getFieldProps('tipo_telefono')}
                              disabled={editMode && selectedOwner}
                              className={`w-full px-4 py-3.5 sm:py-3 bg-white/10 backdrop-blur-md border-2 border-white/20
                                rounded-xl text-white text-base sm:text-sm font-medium
                                focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
                                touch-manipulation appearance-none ${editMode && selectedOwner ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                              style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'}}
                            >
                              <option value="celular" className="bg-gray-800">📱 Celular</option>
                              <option value="casa" className="bg-gray-800">🏠 Casa</option>
                              <option value="trabajo" className="bg-gray-800">💼 Trabajo</option>
                            </select>
                          </div>

                          <div className="md:col-span-2 lg:col-span-3">
                            <GlassInput
                              {...getFieldProps('email')}
                              type="email"
                              placeholder="correo@ejemplo.com (opcional)"
                              label="Email (Opcional)"
                              error={errors.email}
                              disabled={editMode && selectedOwner}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* Paso 3: Dirección (SOLO en modo crear) */}
                {step === 3 && !editMode && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="text-5xl sm:text-4xl mb-3">🏠</div>
                      <h3 className="text-lg sm:text-xl font-semibold text-white">
                        Dirección (Opcional)
                      </h3>
                      <p className="text-white/60 text-sm sm:text-base mt-2">
                        Puedes completar estos datos después
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                      <div className="md:col-span-2 lg:col-span-3">
                        <GlassInput
                          name="calle"
                          value={values.calle}
                          onChange={handleCalleChange}
                          placeholder="Calle"
                          label="Calle"
                          icon={<MapPin size={20} />}
                        />
                      </div>

                      <GlassInput
                        name="numero_ext"
                        value={values.numero_ext}
                        onChange={handleNumeroExtChange}
                        placeholder="Número exterior (máx. 6 caracteres)"
                        label="Número Exterior"
                        maxLength={6}
                      />

                      <GlassInput
                        name="numero_int"
                        value={values.numero_int}
                        onChange={handleNumeroIntChange}
                        placeholder="Número interior (máx. 3 dígitos)"
                        label="Número Interior"
                        maxLength={3}
                      />

                      <GlassInput
                        name="codigo_postal"
                        value={values.codigo_postal}
                        onChange={handleCodigoPostalChange}
                        placeholder="Código postal (5 dígitos)"
                        label="Código Postal"
                        maxLength={5}
                      />

                      <div className="md:col-span-2">
                        <GlassInput
                          name="colonia"
                          value={values.colonia}
                          onChange={handleColoniaChange}
                          placeholder="Colonia"
                          label="Colonia"
                        />
                      </div>

                      <div className="md:col-span-2 lg:col-span-3">
                        <GlassInput
                          name="referencias"
                          value={values.referencias}
                          onChange={handleReferenciasChange}
                          placeholder="Referencias de ubicación (máx. 80 caracteres)"
                          label="Referencias"
                          maxLength={80}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>

            {/* Footer - Mobile Optimized Buttons */}
            <div className="p-4 sm:p-6 border-t border-white/10">
              <div className="flex gap-3 justify-between">
                {/* Botón Anterior (solo en modo crear y paso > 1) */}
                {!editMode && step > 1 ? (
                  <button
                    onClick={prevStep}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-6 py-3.5 sm:py-3 bg-white/10 hover:bg-white/15 active:bg-white/20
                      border-2 border-white/20 rounded-xl text-white font-semibold
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
                  >
                    ← Anterior
                  </button>
                ) : (
                  <div></div>
                )}

                {/* Botón Siguiente o Guardar */}
                {editMode ? (
                  // En modo edición, siempre mostrar botón de guardar
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-6 py-3.5 sm:py-3 bg-gradient-to-r from-green-500 to-green-600
                      hover:from-green-600 hover:to-green-700 active:from-green-700 active:to-green-800
                      border-2 border-green-400/50 rounded-xl text-white font-bold
                      shadow-lg shadow-green-500/30 hover:shadow-green-500/50
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200 hover:scale-105 active:scale-95
                      flex items-center justify-center gap-2 touch-manipulation"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Actualizar Paciente
                      </>
                    )}
                  </button>
                ) : step < 3 ? (
                  // Modo crear: botón siguiente
                  <button
                    onClick={nextStep}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-6 py-3.5 sm:py-3 bg-gradient-to-r from-primary-500 to-primary-600
                      hover:from-primary-600 hover:to-primary-700 active:from-primary-700 active:to-primary-800
                      border-2 border-primary-400/50 rounded-xl text-white font-semibold
                      shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
                  >
                    Siguiente →
                  </button>
                ) : (
                  // Modo crear: botón guardar (paso 3)
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-6 py-3.5 sm:py-3 bg-gradient-to-r from-green-500 to-green-600
                      hover:from-green-600 hover:to-green-700 active:from-green-700 active:to-green-800
                      border-2 border-green-400/50 rounded-xl text-white font-bold
                      shadow-lg shadow-green-500/30 hover:shadow-green-500/50
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200 hover:scale-105 active:scale-95
                      flex items-center justify-center gap-2 touch-manipulation"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Guardar Paciente
                      </>
                    )}
                  </button>
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

export default PatientModal;
