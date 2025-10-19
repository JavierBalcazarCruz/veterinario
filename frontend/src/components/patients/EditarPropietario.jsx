// src/components/patients/EditarPropietario.jsx - Editar datos del propietario
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, AlertTriangle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import GlassInput from '../ui/GlassInput';
import { propietarioService } from '../../services/propietarioService';

/**
 * EditarPropietario Component
 * ⚠️ FLUJO 2: Editar datos del propietario
 * Advertencia: Afecta a TODAS las mascotas del propietario
 */
const EditarPropietario = ({
  isOpen,
  onClose,
  onSuccess,
  owner, // Datos del propietario a editar
  petsCount = 0 // Número de mascotas que serán afectadas
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [ownerData, setOwnerData] = useState({
    nombre: '',
    apellidos: '',
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

  // Cargar datos del propietario cuando se abre el modal
  useEffect(() => {
    if (isOpen && owner) {
      console.log('📝 Cargando datos del propietario:', owner);

      setOwnerData({
        nombre: owner.nombre || owner.nombre_propietario || '',
        apellidos: owner.apellidos || owner.apellidos_propietario || '',
        telefono: owner.telefono || owner.telefono_principal || '',
        email: owner.email || '',
        tipo_telefono: owner.tipo_telefono || 'celular',
        calle: owner.direccion?.calle || owner.calle || '',
        numero_ext: owner.direccion?.numero_ext || owner.numero_ext || '',
        numero_int: owner.direccion?.numero_int || owner.numero_int || '',
        codigo_postal: owner.direccion?.codigo_postal || owner.codigo_postal || '',
        colonia: owner.direccion?.colonia || owner.colonia || '',
        id_municipio: owner.direccion?.id_municipio || owner.id_municipio || 1,
        referencias: owner.direccion?.referencias || owner.referencias || ''
      });
    }
  }, [isOpen, owner]);

  const handleClose = () => {
    setShowWarning(true);
    setOwnerData({
      nombre: '',
      apellidos: '',
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
    onClose();
  };

  // Manejar cambios en los campos
  const handleChange = (field, value) => {
    setOwnerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validación de teléfono - solo números
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    handleChange('telefono', onlyNumbers);
  };

  // Validación de nombre - solo letras
  const handleNameChange = (field, e) => {
    const value = e.target.value;
    const cleanValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s'\-]/g, '');
    handleChange(field, cleanValue);
  };

  // Validación de código postal - solo números, 5 dígitos
  const handleCodigoPostalChange = (e) => {
    const value = e.target.value;
    const onlyNumbers = value.replace(/[^0-9]/g, '').slice(0, 5);
    handleChange('codigo_postal', onlyNumbers);
  };

  // Enviar actualización
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validar datos
      const validation = propietarioService.validate(ownerData);
      if (!validation.isValid) {
        console.error('❌ Errores de validación:', validation.errors);
        Object.values(validation.errors).forEach(error => toast.error(error));
        return;
      }

      setIsSubmitting(true);

      console.log('🔧 Actualizando propietario ID:', owner.id || owner.id_propietario);
      console.log('📤 Datos a enviar:', ownerData);

      const ownerId = owner.id || owner.id_propietario;
      const result = await propietarioService.update(ownerId, ownerData);

      console.log('✅ Propietario actualizado:', result);

      // Mostrar mensaje de éxito con información de mascotas afectadas
      const totalMascotas = result.total_mascotas || petsCount;
      toast.success(
        `Propietario actualizado correctamente. ${totalMascotas} mascota(s) afectada(s).`,
        { duration: 4000 }
      );

      // Callback de éxito
      if (onSuccess) {
        onSuccess(result.data || result);
      }

      handleClose();
    } catch (error) {
      console.error('❌ Error al actualizar propietario:', error);

      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.msg) {
          toast.error(errorData.msg);
        } else if (errorData.errors) {
          Object.values(errorData.errors).forEach(err => toast.error(err));
        } else {
          toast.error('Error al actualizar propietario');
        }
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Error de conexión al servidor');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !owner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 overflow-y-auto flex items-start justify-center pt-8 pb-8 px-4"
        style={{ zIndex: 10000 }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full max-w-4xl mx-auto shadow-2xl"
        >
          <GlassCard className="p-0">

            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <User className="text-primary-400" />
                    Editar Propietario
                  </h2>
                  <p className="text-white/70 mt-1">
                    {ownerData.nombre} {ownerData.apellidos}
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

            {/* Advertencia prominente */}
            {showWarning && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border-b border-yellow-400/30">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-12 h-12 bg-yellow-500/30 rounded-full flex items-center justify-center"
                      >
                        <AlertTriangle size={28} className="text-yellow-300" />
                      </motion.div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-yellow-200 mb-2">
                        ⚠️ Advertencia Importante
                      </h3>
                      <p className="text-yellow-100/90 mb-3">
                        Los cambios que realices afectarán a <span className="font-bold text-yellow-200 text-xl">{petsCount}</span> mascota(s) registrada(s) bajo este propietario.
                      </p>
                      <ul className="text-yellow-100/80 text-sm space-y-1 mb-4">
                        <li>• El nombre y apellidos se actualizarán en TODAS las mascotas</li>
                        <li>• El teléfono de contacto cambiará para TODAS las mascotas</li>
                        <li>• La dirección será la misma para TODAS las mascotas</li>
                      </ul>
                      <div className="flex items-center gap-3">
                        <p className="text-yellow-200 font-semibold text-sm">
                          Si solo quieres editar UNA mascota, usa la opción "Editar Paciente".
                        </p>
                        <button
                          onClick={() => setShowWarning(false)}
                          className="ml-auto px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30 rounded-lg text-yellow-200 text-sm font-medium transition-colors"
                        >
                          Entendido
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {/* Datos personales */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User size={20} />
                  Datos Personales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassInput
                    name="nombre"
                    value={ownerData.nombre}
                    onChange={(e) => handleNameChange('nombre', e)}
                    placeholder="Nombre"
                    label="Nombre *"
                    icon={<User size={20} />}
                  />

                  <GlassInput
                    name="apellidos"
                    value={ownerData.apellidos}
                    onChange={(e) => handleNameChange('apellidos', e)}
                    placeholder="Apellidos"
                    label="Apellidos *"
                    icon={<User size={20} />}
                  />
                </div>
              </div>

              {/* Datos de contacto */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Phone size={20} />
                  Datos de Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <GlassInput
                    name="telefono"
                    value={ownerData.telefono}
                    onChange={handlePhoneChange}
                    type="tel"
                    placeholder="Teléfono (10 dígitos)"
                    label="Teléfono *"
                    icon={<Phone size={20} />}
                    maxLength={10}
                  />

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Tipo de Teléfono *
                    </label>
                    <select
                      value={ownerData.tipo_telefono}
                      onChange={(e) => handleChange('tipo_telefono', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border-2 border-white/20
                        rounded-xl text-white font-medium
                        focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
                        appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="celular" className="bg-gray-800">📱 Celular</option>
                      <option value="casa" className="bg-gray-800">🏠 Casa</option>
                      <option value="trabajo" className="bg-gray-800">💼 Trabajo</option>
                    </select>
                  </div>

                  <GlassInput
                    name="email"
                    value={ownerData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    type="email"
                    placeholder="correo@ejemplo.com"
                    label="Email (Opcional)"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  Dirección (Opcional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="md:col-span-2 lg:col-span-3">
                    <GlassInput
                      name="calle"
                      value={ownerData.calle}
                      onChange={(e) => handleChange('calle', e.target.value)}
                      placeholder="Calle"
                      label="Calle"
                      icon={<MapPin size={20} />}
                    />
                  </div>

                  <GlassInput
                    name="numero_ext"
                    value={ownerData.numero_ext}
                    onChange={(e) => handleChange('numero_ext', e.target.value)}
                    placeholder="Núm. Ext."
                    label="Número Exterior"
                  />

                  <GlassInput
                    name="numero_int"
                    value={ownerData.numero_int}
                    onChange={(e) => handleChange('numero_int', e.target.value)}
                    placeholder="Núm. Int."
                    label="Número Interior"
                  />

                  <GlassInput
                    name="codigo_postal"
                    value={ownerData.codigo_postal}
                    onChange={handleCodigoPostalChange}
                    placeholder="Código Postal"
                    label="Código Postal"
                    maxLength={5}
                  />

                  <div className="md:col-span-2">
                    <GlassInput
                      name="colonia"
                      value={ownerData.colonia}
                      onChange={(e) => handleChange('colonia', e.target.value)}
                      placeholder="Colonia"
                      label="Colonia"
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <GlassInput
                      name="referencias"
                      value={ownerData.referencias}
                      onChange={(e) => handleChange('referencias', e.target.value)}
                      placeholder="Referencias de ubicación"
                      label="Referencias"
                    />
                  </div>
                </div>
              </div>

            </form>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-between gap-3">
              <GlassButton
                onClick={handleClose}
                variant="secondary"
                disabled={isSubmitting}
              >
                Cancelar
              </GlassButton>
              <GlassButton
                onClick={handleSubmit}
                variant="primary"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Actualizar Propietario
                  </>
                )}
              </GlassButton>
            </div>

          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditarPropietario;
