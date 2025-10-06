// src/components/ui/GlassInput.jsx
import { motion } from 'framer-motion';
import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const GlassInput = forwardRef(({ 
  label,
  error,
  icon,
  type = 'text',
  placeholder,
  className = '',
  containerClassName = '',
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${containerClassName}`}
    >
      {/* Label */}
      {label && (
        <motion.label
          animate={{
            color: error ? '#ef4444' : isFocused ? '#f97316' : '#ffffff',
          }}
          className="block text-sm font-medium mb-2 transition-colors duration-200"
        >
          {label}
        </motion.label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 z-10">
            {icon}
          </div>
        )}

        {/* Input */}
        <motion.input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full
            ${icon ? 'pl-12' : 'pl-4'}
            ${type === 'password' ? 'pr-12' : 'pr-4'}
            py-3
            bg-white/5
            backdrop-blur-md
            border border-white/15
            rounded-xl
            text-white
            placeholder-white/50
            focus:outline-none
            focus:ring-2
            focus:ring-primary-500/50
            focus:border-primary-400/50
            focus:bg-white/10
            transition-all duration-300
            ${error ? 'border-red-400/50 focus:border-red-400/50 focus:ring-red-500/50' : ''}
            ${className}
          `}
          {...props}
        />

        {/* Password Toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}

        {/* Focus Border Effect */}
        <motion.div
          initial={false}
          animate={{
            scale: isFocused ? 1 : 0,
            opacity: isFocused ? 1 : 0
          }}
          className="absolute inset-0 rounded-xl border-2 border-primary-400/50 pointer-events-none"
        />
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-400 flex items-center gap-1"
        >
          <span>⚠️</span>
          {error}
        </motion.p>
      )}
    </motion.div>
  );
});

GlassInput.displayName = 'GlassInput';

export default GlassInput;