import React, { useState } from 'react';
import { User, Lock, Camera, Phone, Save, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PasswordChangeData, UserProfileUpdateData } from '../types/UserTypes';

interface FirstLoginSetupProps {
  onSetupComplete: () => void;
}

const FirstLoginSetup: React.FC<FirstLoginSetupProps> = ({ onSetupComplete }) => {
  const { user, changePassword, updateProfile, isLoading, error } = useAuth();
  
  const [step, setStep] = useState<'password' | 'profile'>('password');
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    oldPassword: '',
    newPassword: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileData, setProfileData] = useState<UserProfileUpdateData>({
    firstName: '',
    lastName: '',
    phone: '',
    profilePicture: ''
  });
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    
    // Validar que las contraseñas coincidan
    if (passwordData.newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    
    // Validar longitud mínima
    if (passwordData.newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    try {
      await changePassword(passwordData);
      setStep('profile');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Error al cambiar la contraseña');
    }
  };
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    
    // Validar campos obligatorios
    if (!profileData.firstName || !profileData.lastName) {
      setProfileError('El nombre y apellido son obligatorios');
      return;
    }
    
    try {
      await updateProfile(profileData);
      onSetupComplete();
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Error al actualizar el perfil');
    }
  };
  
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl max-w-2xl w-full p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración Inicial</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {step === 'password' 
            ? 'Cambia tu contraseña temporal para continuar' 
            : 'Completa tu perfil para finalizar la configuración'
          }
        </p>
      </div>
      
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step === 'password' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
          }`}>
            <Lock className="h-4 w-4" />
          </div>
          <div className={`h-1 w-16 ${
            step === 'password' ? 'bg-gray-300 dark:bg-gray-700' : 'bg-green-600 dark:bg-green-500'
          }`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step === 'profile' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          }`}>
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
      
      {step === 'password' ? (
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña Temporal
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="oldPassword"
                type={showOldPassword ? "text" : "password"}
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                placeholder="Ingresa la contraseña que recibiste por correo"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                placeholder="Crea una contraseña segura"
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                placeholder="Repite la nueva contraseña"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          {passwordError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <span className="text-sm text-red-800 dark:text-red-300">{passwordError}</span>
            </div>
          )}
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Requisitos de contraseña</h4>
                <ul className="mt-1 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li className="flex items-center">
                    <span className={`inline-block w-4 h-4 mr-1 rounded-full flex items-center justify-center ${
                      passwordData.newPassword.length >= 6 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      {passwordData.newPassword.length >= 6 && <CheckCircle className="w-3 h-3" />}
                    </span>
                    Al menos 6 caracteres
                  </li>
                  <li className="flex items-center">
                    <span className={`inline-block w-4 h-4 mr-1 rounded-full flex items-center justify-center ${
                      passwordData.newPassword === confirmPassword && passwordData.newPassword.length > 0
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      {passwordData.newPassword === confirmPassword && passwordData.newPassword.length > 0 && <CheckCircle className="w-3 h-3" />}
                    </span>
                    Las contraseñas coinciden
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Continuar</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="firstName"
                  type="text"
                  value={profileData.firstName || ''}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                  placeholder="Tu nombre"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Apellido *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="lastName"
                  type="text"
                  value={profileData.lastName || ''}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                  placeholder="Tu apellido"
                  required
                />
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Teléfono
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phone"
                type="tel"
                value={profileData.phone || ''}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                placeholder="Tu número de teléfono"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Foto de Perfil (URL)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Camera className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="profilePicture"
                type="url"
                value={profileData.profilePicture || ''}
                onChange={(e) => setProfileData({ ...profileData, profilePicture: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                placeholder="https://ejemplo.com/tu-foto.jpg"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ingresa la URL de una imagen para usar como foto de perfil
            </p>
          </div>
          
          {profileError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <span className="text-sm text-red-800 dark:text-red-300">{profileError}</span>
            </div>
          )}
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p>Tu información de contacto solo será visible para los administradores y entrenadores autorizados.</p>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Completar Configuración</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default FirstLoginSetup;