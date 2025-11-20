// src/components/ui/PasswordStrengthMeter.jsx
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';

const PasswordStrengthMeter = ({ password }) => {
  // Función para calcular la fortaleza de la contraseña
  const calculateStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Sin contraseña', color: 'gray' };

    let score = 0;

    // Longitud
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;

    // Minúsculas
    if (/[a-z]/.test(pass)) score += 1;

    // Mayúsculas
    if (/[A-Z]/.test(pass)) score += 1;

    // Números
    if (/\d/.test(pass)) score += 1;

    // Caracteres especiales
    if (/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/;'`~]/.test(pass)) score += 1;

    // Determinar nivel
    if (score <= 2) return {
      score: 1,
      label: 'Débil',
      color: 'red',
      icon: ShieldX,
      percentage: 33
    };
    if (score <= 4) return {
      score: 2,
      label: 'Media',
      color: 'yellow',
      icon: ShieldAlert,
      percentage: 66
    };
    return {
      score: 3,
      label: 'Fuerte',
      color: 'green',
      icon: ShieldCheck,
      percentage: 100
    };
  };

  const strength = calculateStrength(password);

  const getColorClasses = () => {
    switch (strength.color) {
      case 'red':
        return {
          bg: 'bg-red-500',
          text: 'text-red-400',
          border: 'border-red-400/30',
          bgLight: 'bg-red-500/10'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-500',
          text: 'text-yellow-400',
          border: 'border-yellow-400/30',
          bgLight: 'bg-yellow-500/10'
        };
      case 'green':
        return {
          bg: 'bg-green-500',
          text: 'text-green-400',
          border: 'border-green-400/30',
          bgLight: 'bg-green-500/10'
        };
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-gray-400',
          border: 'border-gray-400/30',
          bgLight: 'bg-gray-500/10'
        };
    }
  };

  const colors = getColorClasses();
  const Icon = strength.icon || Shield;

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      {/* Barra de fortaleza */}
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${strength.percentage}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full ${colors.bg}`}
        />
      </div>

      {/* Indicador con icono */}
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${colors.border} ${colors.bgLight}`}>
        <Icon size={14} className={colors.text} />
        <span className={`text-xs font-medium ${colors.text}`}>
          Contraseña: {strength.label}
        </span>
      </div>

      {/* Requisitos */}
      <div className="space-y-1 text-xs">
        <RequirementItem
          met={password.length >= 6}
          text="Mínimo 6 caracteres"
        />
        <RequirementItem
          met={/[a-z]/.test(password)}
          text="Una letra minúscula"
        />
        <RequirementItem
          met={/[A-Z]/.test(password)}
          text="Una letra mayúscula"
        />
        <RequirementItem
          met={/\d/.test(password)}
          text="Un número"
        />
        <RequirementItem
          met={/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/;'`~]/.test(password)}
          text="Un carácter especial (opcional)"
          optional
        />
      </div>
    </motion.div>
  );
};

const RequirementItem = ({ met, text, optional }) => (
  <div className="flex items-center space-x-2">
    <div className={`w-1.5 h-1.5 rounded-full ${met ? 'bg-green-500' : optional ? 'bg-gray-500' : 'bg-red-500'}`} />
    <span className={`${met ? 'text-green-400' : optional ? 'text-gray-400' : 'text-red-400'}`}>
      {text}
    </span>
  </div>
);

export default PasswordStrengthMeter;
