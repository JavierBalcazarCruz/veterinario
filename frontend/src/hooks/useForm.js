// src/hooks/useForm.js
import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, validationSchema = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Actualizar valor de un campo
  const setValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Manejar cambio en input
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setValue(name, newValue);
  }, [setValue]);

  // Manejar blur (cuando el usuario sale del campo)
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validar campo individual si hay esquema de validación
    if (validationSchema) {
      validateField(name, values[name]);
    }
  }, [values, validationSchema]);

  // Validar un campo específico
  const validateField = useCallback((fieldName, fieldValue) => {
    if (!validationSchema) return true;

    try {
      validationSchema.validateSyncAt(fieldName, { [fieldName]: fieldValue });
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
      return true;
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: error.message
      }));
      return false;
    }
  }, [validationSchema]);

  // Validar todo el formulario
  const validate = useCallback(() => {
    if (!validationSchema) return true;

    try {
      validationSchema.validateSync(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      const newErrors = {};
      error.inner.forEach(err => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  }, [values, validationSchema]);

  // Resetear formulario
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Manejar submit del formulario
  const handleSubmit = useCallback((onSubmit) => {
    return async (e) => {
      e.preventDefault();
      
      // Marcar todos los campos como tocados
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(allTouched);

      // Validar
      if (!validate()) {
        return;
      }

      setIsSubmitting(true);
      
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Error en submit:', error);
        
        // Si el error viene del servidor con errores específicos de campos
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        }
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [values, validate]);

  // Obtener props para un input específico
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] ? errors[name] : ''
  }), [values, handleChange, handleBlur, touched, errors]);

  // Verificar si hay errores
  const hasErrors = Object.keys(errors).some(key => errors[key]);

  // Verificar si el formulario está sucio (ha sido modificado)
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  return {
    // Valores y estado
    values,
    errors,
    touched,
    isSubmitting,
    hasErrors,
    isDirty,

    // Métodos
    setValue,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    validateField,
    reset,
    getFieldProps
  };
};