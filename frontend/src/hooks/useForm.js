// src/hooks/useForm.js - VERSIÓN CORREGIDA
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

    // ✅ MEJORADO: Validar inmediatamente el campo si ya fue tocado
    if (touched[name] && validationSchema) {
      setTimeout(() => {
        validateField(name, value);
      }, 100); // Pequeño delay para mejor UX
    }
  }, [touched, validationSchema]);

  // ✅ MEJORADO: Manejar cambio en input con mejor debounce
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    // ✅ Limpiar error del campo al empezar a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // ✅ Validación inmediata para campos críticos después del primer toque
    if (touched[name] && validationSchema) {
      // Validar después de un pequeño delay para no interrumpir la escritura
      setTimeout(() => {
        validateField(name, newValue);
      }, 300);
    }
  }, [errors, touched, validationSchema]);

  // Manejar blur (cuando el usuario sale del campo)
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // ✅ MEJORADO: Validar campo al salir si hay esquema de validación
    if (validationSchema) {
      validateField(name, value);
    }
  }, [validationSchema]);

  // ✅ MEJORADO: Validar un campo específico con mejor manejo de errores
  const validateField = useCallback((fieldName, fieldValue) => {
    if (!validationSchema) return true;

    try {
      // ✅ Usar validateSyncAt para validar un campo específico
      validationSchema.validateSyncAt(fieldName, { 
        ...values, 
        [fieldName]: fieldValue 
      });
      
      // Si no hay error, limpiar el error del campo
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
      return true;
    } catch (error) {
      // Si hay error, establecerlo
      setErrors(prev => ({
        ...prev,
        [fieldName]: error.message
      }));
      return false;
    }
  }, [validationSchema, values]);

  // ✅ MEJORADO: Validar todo el formulario
  const validate = useCallback(() => {
    if (!validationSchema) return true;

    try {
      validationSchema.validateSync(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      const newErrors = {};
      
      // ✅ MEJORADO: Mejor manejo de errores múltiples
      if (error.inner && Array.isArray(error.inner)) {
        error.inner.forEach(err => {
          if (err.path) {
            newErrors[err.path] = err.message;
          }
        });
      } else if (error.path && error.message) {
        // Error único
        newErrors[error.path] = error.message;
      }
      
      setErrors(newErrors);
      console.log('🔍 Errores de validación:', newErrors); // Para debug
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

  // ✅ MEJORADO: Manejar submit del formulario
  const handleSubmit = useCallback((onSubmit) => {
    return async (e) => {
      e?.preventDefault();
      
      console.log('📝 Iniciando submit del formulario');
      console.log('📋 Valores actuales:', values);
      
      // Marcar todos los campos como tocados
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(allTouched);

      // ✅ MEJORADO: Validar con logs para debug
      const isValid = validate();
      console.log('✅ Validación:', isValid ? 'EXITOSA' : 'FALLIDA');
      
      if (!isValid) {
        console.log('❌ Errores encontrados:', errors);
        return;
      }

      setIsSubmitting(true);
      
      try {
        console.log('🚀 Ejecutando onSubmit...');
        await onSubmit(values);
        console.log('✅ Submit completado exitosamente');
      } catch (error) {
        console.error('❌ Error en submit:', error);
        
        // ✅ MEJORADO: Manejo de errores del servidor
        if (error.response?.data?.errors) {
          console.log('🔍 Errores del servidor:', error.response.data.errors);
          setErrors(error.response.data.errors);
        }
        
        // Re-lanzar el error para que el componente lo maneje
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [values, validate, errors]);

  // ✅ MEJORADO: Obtener props para un input específico
  const getFieldProps = useCallback((name) => {
    const fieldError = touched[name] ? errors[name] : '';
    
    return {
      name,
      value: values[name] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      error: fieldError
    };
  }, [values, handleChange, handleBlur, touched, errors]);

  // ✅ AGREGADO: Función para verificar si un campo específico es válido
  const isFieldValid = useCallback((name) => {
    return !errors[name] && touched[name];
  }, [errors, touched]);

  // ✅ AGREGADO: Función para verificar si un campo tiene error
  const hasFieldError = useCallback((name) => {
    return !!(touched[name] && errors[name]);
  }, [errors, touched]);

  // Verificar si hay errores
  const hasErrors = Object.keys(errors).some(key => errors[key]);

  // Verificar si el formulario está sucio (ha sido modificado)
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  // ✅ AGREGADO: Verificar si el formulario es válido
  const isValid = !hasErrors && Object.keys(touched).length > 0;

  return {
    // Valores y estado
    values,
    errors,
    touched,
    isSubmitting,
    hasErrors,
    isDirty,
    isValid,

    // Métodos principales
    setValue,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    validateField,
    reset,
    getFieldProps,

    // ✅ NUEVOS: Métodos auxiliares
    isFieldValid,
    hasFieldError
  };
};