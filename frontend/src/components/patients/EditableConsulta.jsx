/**
 * =====================================================
 * COMPONENTE DE CONSULTA EDITABLE INLINE
 * =====================================================
 * Permite editar consultas médicas directamente en la vista
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Edit2,
  Save,
  X,
  FileText,
  Calendar,
  User,
  Loader
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import GlassInput from '../ui/GlassInput';
import { historialService } from '../../services/historialService';
import toast from 'react-hot-toast';

/**
 * Componente principal de consulta editable
 */
const EditableConsulta = ({ consulta, onUpdate, showActions = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedData, setEditedData] = useState(consulta);

  /**
   * Iniciar edición
   */
  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedData({ ...consulta });
  };

  /**
   * Cancelar edición
   */
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(consulta);
  };

  /**
   * Guardar cambios
   */
  const handleSave = async () => {
    try {
      setSaving(true);

      // Validación básica
      if (!editedData.motivo_consulta?.trim()) {
        toast.error('El motivo de consulta es obligatorio');
        return;
      }

      // Llamar al servicio para actualizar
      const response = await historialService.actualizarConsulta(
        consulta.id,
        editedData
      );

      if (response.success) {
        toast.success('Consulta actualizada exitosamente');
        setIsEditing(false);
        if (onUpdate) {
          onUpdate(response.data);
        }
      } else {
        throw new Error(response.message || 'Error al actualizar');
      }
    } catch (error) {
      console.error('Error al guardar consulta:', error);
      toast.error(error.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Actualizar campo
   */
  const updateField = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Modo solo lectura
  if (!isEditing) {
    return (
      <GlassCard className="p-4 hover:border-blue-400/30 transition-all group">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white text-lg">
                {consulta.motivo_consulta}
              </h3>
            </div>

            <div className="space-y-2 text-sm">
              {consulta.diagnostico && (
                <p className="text-white/70">
                  <span className="text-white/50">Diagnóstico:</span> {consulta.diagnostico}
                </p>
              )}

              {consulta.tratamiento && (
                <p className="text-white/70">
                  <span className="text-white/50">Tratamiento:</span> {consulta.tratamiento}
                </p>
              )}

              <div className="flex items-center gap-4 text-white/50 mt-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(consulta.fecha_consulta)}</span>
                </div>
                {consulta.veterinario && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Dr. {consulta.veterinario}</span>
                  </div>
                )}
              </div>

              {/* Signos vitales */}
              {(consulta.peso_actual || consulta.temperatura) && (
                <div className="flex gap-4 mt-3 pt-3 border-t border-white/10">
                  {consulta.peso_actual && (
                    <span className="text-white/60 text-xs">
                      Peso: <span className="text-white font-medium">{consulta.peso_actual} kg</span>
                    </span>
                  )}
                  {consulta.temperatura && (
                    <span className="text-white/60 text-xs">
                      Temp: <span className="text-white font-medium">{consulta.temperatura}°C</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botón editar */}
          {showActions && (
            <motion.button
              onClick={handleStartEdit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </GlassCard>
    );
  }

  // Modo edición
  return (
    <GlassCard className="p-4 border-2 border-blue-400/50">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Edit2 className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Editando Consulta</h3>
        </div>

        {/* Motivo de consulta */}
        <div>
          <label className="text-white/70 text-sm mb-2 block">
            Motivo de Consulta *
          </label>
          <input
            type="text"
            value={editedData.motivo_consulta || ''}
            onChange={(e) => updateField('motivo_consulta', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400/50"
            placeholder="Ej: Revisión general"
          />
        </div>

        {/* Diagnóstico */}
        <div>
          <label className="text-white/70 text-sm mb-2 block">Diagnóstico</label>
          <textarea
            value={editedData.diagnostico || ''}
            onChange={(e) => updateField('diagnostico', e.target.value)}
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400/50 resize-none"
            placeholder="Diagnóstico médico..."
          />
        </div>

        {/* Tratamiento */}
        <div>
          <label className="text-white/70 text-sm mb-2 block">Tratamiento</label>
          <textarea
            value={editedData.tratamiento || ''}
            onChange={(e) => updateField('tratamiento', e.target.value)}
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400/50 resize-none"
            placeholder="Tratamiento prescrito..."
          />
        </div>

        {/* Observaciones */}
        <div>
          <label className="text-white/70 text-sm mb-2 block">Observaciones</label>
          <textarea
            value={editedData.observaciones || ''}
            onChange={(e) => updateField('observaciones', e.target.value)}
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400/50 resize-none"
            placeholder="Observaciones adicionales..."
          />
        </div>

        {/* Signos vitales */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              value={editedData.peso_actual || ''}
              onChange={(e) => updateField('peso_actual', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400/50"
              placeholder="0.0"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Temperatura (°C)</label>
            <input
              type="number"
              step="0.1"
              value={editedData.temperatura || ''}
              onChange={(e) => updateField('temperatura', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400/50"
              placeholder="0.0"
            />
          </div>
        </div>

        {/* Veterinario */}
        <div>
          <label className="text-white/70 text-sm mb-2 block">Veterinario</label>
          <input
            type="text"
            value={editedData.veterinario || ''}
            onChange={(e) => updateField('veterinario', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400/50"
            placeholder="Nombre del veterinario"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <GlassButton
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-green-500/20 hover:bg-green-500/30 border-green-400/30 text-green-400"
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar
              </>
            )}
          </GlassButton>

          <GlassButton
            onClick={handleCancelEdit}
            disabled={saving}
            className="bg-red-500/20 hover:bg-red-500/30 border-red-400/30 text-red-400"
          >
            <X className="w-4 h-4" />
            Cancelar
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  );
};

export default EditableConsulta;
