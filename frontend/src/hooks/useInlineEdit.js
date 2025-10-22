/**
 * =====================================================
 * HOOK PARA EDICIÓN INLINE
 * =====================================================
 * Maneja el estado y lógica de edición inline de registros
 */

import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook para manejar edición inline
 * @param {Function} onSave - Función para guardar cambios
 * @param {Function} onCancel - Función para cancelar edición (opcional)
 */
export const useInlineEdit = (onSave, onCancel) => {
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);

  /**
   * Iniciar edición de un registro
   */
  const startEdit = (id, initialData) => {
    setEditingId(id);
    setEditedData({ ...initialData });
  };

  /**
   * Cancelar edición
   */
  const cancelEdit = () => {
    setEditingId(null);
    setEditedData({});
    if (onCancel) onCancel();
  };

  /**
   * Actualizar campo editado
   */
  const updateField = (fieldName, value) => {
    setEditedData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  /**
   * Guardar cambios
   */
  const saveChanges = async () => {
    if (!editingId) return;

    try {
      setSaving(true);
      await onSave(editingId, editedData);
      toast.success('Cambios guardados exitosamente');
      setEditingId(null);
      setEditedData({});
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error(error.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Verificar si un registro está siendo editado
   */
  const isEditing = (id) => editingId === id;

  return {
    editingId,
    editedData,
    saving,
    startEdit,
    cancelEdit,
    updateField,
    saveChanges,
    isEditing
  };
};

export default useInlineEdit;
