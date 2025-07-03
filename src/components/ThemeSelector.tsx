import React, { useState } from 'react';
import { Sun, Moon, Monitor, Settings, X, Palette } from 'lucide-react';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ isOpen, onClose }) => {
  const { theme, actualTheme, setTheme } = useTheme();

  const themeOptions = [
    {
      id: 'light' as ThemeMode,
      name: 'Modo Claro',
      description: 'Interfaz clara y brillante',
      icon: Sun,
      preview: 'bg-white border-gray-200'
    },
    {
      id: 'dark' as ThemeMode,
      name: 'Modo Oscuro',
      description: 'Interfaz oscura inspirada en Enigma',
      icon: Moon,
      preview: 'bg-enigma-dark border-gray-700'
    },
    {
      id: 'auto' as ThemeMode,
      name: 'Automático',
      description: 'Sigue la configuración del sistema',
      icon: Monitor,
      preview: 'bg-gradient-to-r from-white to-enigma-dark border-gray-400'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-enigma-dark rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border dark:border-gray-700">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-red-600 to-red-700 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="pr-12">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Personalización Visual</h1>
                <p className="text-red-100">Selecciona tu tema preferido</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Tema actual: {actualTheme === 'dark' ? 'Oscuro' : 'Claro'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {themeOptions.map((option) => {
              const IconComponent = option.icon;
              const isSelected = theme === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => setTheme(option.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isSelected 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {option.name}
                        </h3>
                        {isSelected && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {option.description}
                      </p>
                    </div>

                    {/* Theme Preview */}
                    <div className="w-16 h-12 rounded-lg border-2 overflow-hidden">
                      <div className={`w-full h-full ${option.preview}`}>
                        {option.id === 'auto' && (
                          <div className="w-full h-full flex">
                            <div className="w-1/2 bg-white"></div>
                            <div className="w-1/2 bg-enigma-dark"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Brand Information */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span>Diseño Enigma Boxing Club</span>
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              El modo oscuro utiliza el color de marca <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">#1D1D1B</span> 
              como base, con el rojo característico <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">#EA0029</span> 
              para elementos activos, manteniendo la identidad visual y garantizando máxima legibilidad.
            </p>
          </div>

          {/* Accessibility Note */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-2">
              <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900 dark:text-blue-100">Accesibilidad</h5>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Todos los temas cumplen con los estándares WCAG 2.1 AA para contraste de color, 
                  garantizando legibilidad óptima para todos los usuarios.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Tu preferencia se guardará automáticamente
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Listo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;