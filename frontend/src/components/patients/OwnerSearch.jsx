// src/components/patients/OwnerSearch.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Phone, Mail, PawPrint, Check, Loader } from 'lucide-react';
import { patientService } from '../../services/patientService';
import toast from 'react-hot-toast';

/**
 * Componente para buscar y seleccionar propietarios existentes
 */
const OwnerSearch = ({ onSelectOwner, selectedOwner }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchBoxRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-focus en el input cuando el componente se muestra
  useEffect(() => {
    if (inputRef.current && !selectedOwner) {
      inputRef.current.focus();
    }
  }, [selectedOwner]);

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setShowResults(false);
        setSearchTerm(''); // Limpiar el input si no se seleccionó nada
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await patientService.searchOwners(searchTerm);
        setResults(response.data || []);
        setShowResults(true);
      } catch (error) {
        console.error('Error al buscar propietarios:', error);
        toast.error('Error al buscar propietarios');
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const handleSelectOwner = (owner) => {
    onSelectOwner(owner);
    setShowResults(false);
    setSearchTerm('');
  };

  // Manejar tecla Tab para cerrar el dropdown
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      setShowResults(false);
      setSearchTerm('');
    }
  };

  if (selectedOwner) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-500/10 border-2 border-green-500/30 rounded-xl p-4 sm:p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <Check size={24} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm text-green-400 font-medium">Propietario seleccionado</p>
              <p className="text-white font-semibold text-lg">{selectedOwner.nombre_completo}</p>
            </div>
          </div>
          <button
            onClick={() => onSelectOwner(null)}
            className="text-white/60 hover:text-white text-sm underline"
          >
            Cambiar
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 text-white/80 text-sm">
            <Phone size={16} className="text-green-400" />
            <span>{selectedOwner.telefono || 'Sin teléfono'}</span>
          </div>
          {selectedOwner.email && (
            <div className="flex items-center space-x-2 text-white/80 text-sm">
              <Mail size={16} className="text-green-400" />
              <span className="truncate">{selectedOwner.email}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-white/80 text-sm">
            <PawPrint size={16} className="text-green-400" />
            <span>{selectedOwner.total_mascotas} mascota(s) registrada(s)</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div ref={searchBoxRef} className="relative">
      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40"
        />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar por nombre, teléfono o email..."
          className="w-full pl-12 pr-12 py-3 sm:py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all text-sm sm:text-base"
        />
        {searching && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <Loader size={20} className="text-primary-400 animate-spin" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showResults && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-gray-900 backdrop-blur-xl border-2 border-white/30 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto"
          >
            <div className="p-2">
              <p className="text-white/60 text-xs px-3 py-2">
                {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
              </p>
              {results.map((owner) => (
                <motion.button
                  key={owner.id}
                  onClick={() => handleSelectOwner(owner)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full text-left p-3 sm:p-4 hover:bg-white/10 rounded-lg transition-colors group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500/30 transition-colors">
                      <User size={20} className="text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm sm:text-base truncate">
                        {owner.nombre_completo}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                        {owner.telefono && (
                          <div className="flex items-center space-x-1 text-white/70 text-xs sm:text-sm">
                            <Phone size={12} />
                            <span>{owner.telefono}</span>
                          </div>
                        )}
                        {owner.email && (
                          <div className="flex items-center space-x-1 text-white/70 text-xs sm:text-sm truncate">
                            <Mail size={12} />
                            <span className="truncate">{owner.email}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-primary-400 text-xs mt-1">
                        <PawPrint size={12} />
                        <span>{owner.total_mascotas} mascota(s)</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showResults && results.length === 0 && searchTerm.trim().length >= 2 && !searching && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-50 w-full mt-2 bg-gray-900 backdrop-blur-xl border-2 border-white/30 rounded-xl shadow-2xl p-6 text-center"
        >
          <User size={48} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/60 text-sm">
            No se encontraron propietarios
          </p>
          <p className="text-white/40 text-xs mt-1">
            Intenta con otro término de búsqueda
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default OwnerSearch;
