// src/components/FirstLoginSetup.tsx
import React, { useState } from 'react';
import { User, Mail, Phone, Save, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileUpdateData, PasswordChangeData } from '../types/UserTypes';

interface FirstLoginSetupProps {
  onComplete: () => void;
}



const FirstLoginSetup: React.FC<FirstLoginSetupProps> = ({ onComplete }) => {
  const { user, updateProfile, changePassword, isFirstLogin } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile data
  const [profileData, setProfileData] = useState<UserProfileUpdateData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  // Password data
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Validation
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateProfile = (): boolean => {
    const errors: Record<string, string> = {};

    if (!profileData.firstName?.trim()) {
      errors.firstName = 'El nombre es requerido';
    }

    if (!profileData.lastName?.trim()) {
      errors.lastName = 'El apellido es requerido';
    }

    if (profileData.phone && !/^[+]?[\s\d\-\(\)]{9,}$/.test(profileData.phone)) {
      errors.phone = 'Formato de teléfono inválido';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = (): boolean => {
    const errors: Record<string, string> = {};

    if (!passwordData.oldPassword) {
      errors.oldPassword = 'La contraseña actual es requerida';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'La nueva contraseña es requerida';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfile()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await updateProfile(profileData);

      // If this is a first login, move to password step
      if (isFirstLogin) {
        setCurrentStep(2);
      } else {
        onComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const changeData: PasswordChangeData = {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      };

      await changePassword(changeData);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipProfile = () => {
    if (isFirstLogin) {
      setCurrentStep(2);
    } else {
      onComplete();
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 dark:from-dark-bg dark:to-dark-elevated flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-md">
          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isFirstLogin ? 'Configuración Inicial' : 'Completar Perfil'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {currentStep === 1
                    ? 'Completa tu información personal'
                    : 'Cambia tu contraseña temporal'
                }
              </p>
            </div>

            {/* Progress Steps for First Login */}
            {isFirstLogin && (
                <div className="flex items-center justify-center mb-8">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= 1
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      1
                    </div>
                    <div className={`w-8 h-1 ${
                        currentStep >= 2 ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= 2
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      2
                    </div>
                  </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h4>
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                </div>
            )}

            {/* Step 1: Profile Information */}
            {currentStep === 1 && (
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
                            onChange={(e) => {
                              setProfileData({ ...profileData, firstName: e.target.value });
                              if (validationErrors.firstName) {
                                setValidationErrors({ ...validationErrors, firstName: '' });
                              }
                            }}
                            className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white ${
                                validationErrors.firstName
                                    ? 'border-red-300 dark:border-red-600'
                                    : 'border-gray-300 dark:border-dark-border'
                            }`}
                            placeholder="Tu nombre"
                        />
                      </div>
                      {validationErrors.firstName && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.firstName}</p>
                      )}
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
                            onChange={(e) => {
                              setProfileData({ ...profileData, lastName: e.target.value });
                              if (validationErrors.lastName) {
                                setValidationErrors({ ...validationErrors, lastName: '' });
                              }
                            }}
                            className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white ${
                                validationErrors.lastName
                                    ? 'border-red-300 dark:border-red-600'
                                    : 'border-gray-300 dark:border-dark-border'
                            }`}
                            placeholder="Tu apellido"
                        />
                      </div>
                      {validationErrors.lastName && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.lastName}</p>
                      )}
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
                          onChange={(e) => {
                            setProfileData({ ...profileData, phone: e.target.value });
                            if (validationErrors.phone) {
                              setValidationErrors({ ...validationErrors, phone: '' });
                            }
                          }}
                          className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white ${
                              validationErrors.phone
                                  ? 'border-red-300 dark:border-red-600'
                                  : 'border-gray-300 dark:border-dark-border'
                          }`}
                          placeholder="+34 666 777 888"
                      />
                    </div>
                    {validationErrors.phone && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 flex justify-center items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Guardando...</span>
                          </>
                      ) : (
                          <>
                            <Save className="h-5 w-5 mr-2" />
                            <span>{isFirstLogin ? 'Continuar' : 'Guardar'}</span>
                          </>
                      )}
                    </button>

                    {!isFirstLogin && (
                        <button
                            type="button"
                            onClick={handleSkipProfile}
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                        >
                          Omitir
                        </button>
                    )}
                  </div>
                </form>
            )}

            {/* Step 2: Password Change */}
            {currentStep === 2 && (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contraseña Actual *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                          id="oldPassword"
                          type="password"
                          value={passwordData.oldPassword}
                          onChange={(e) => {
                            setPasswordData({ ...passwordData, oldPassword: e.target.value });
                            if (validationErrors.oldPassword) {
                              setValidationErrors({ ...validationErrors, oldPassword: '' });
                            }
                          }}
                          className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white ${
                              validationErrors.oldPassword
                                  ? 'border-red-300 dark:border-red-600'
                                  : 'border-gray-300 dark:border-dark-border'
                          }`}
                          placeholder="Tu contraseña temporal"
                      />
                    </div>
                    {validationErrors.oldPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.oldPassword}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nueva Contraseña *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                          id="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => {
                            setPasswordData({ ...passwordData, newPassword: e.target.value });
                            if (validationErrors.newPassword) {
                              setValidationErrors({ ...validationErrors, newPassword: '' });
                            }
                          }}
                          className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white ${
                              validationErrors.newPassword
                                  ? 'border-red-300 dark:border-red-600'
                                  : 'border-gray-300 dark:border-dark-border'
                          }`}
                          placeholder="Mínimo 6 caracteres"
                      />
                      <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {validationErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirmar Nueva Contraseña *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => {
                            setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                            if (validationErrors.confirmPassword) {
                              setValidationErrors({ ...validationErrors, confirmPassword: '' });
                            }
                          }}
                          className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white ${
                              validationErrors.confirmPassword
                                  ? 'border-red-300 dark:border-red-600'
                                  : 'border-gray-300 dark:border-dark-border'
                          }`}
                          placeholder="Repite la nueva contraseña"
                      />
                      <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {validationErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                    >
                      Atrás
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 flex justify-center items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Cambiando...</span>
                          </>
                      ) : (
                          <>
                            <Save className="h-5 w-5 mr-2" />
                            <span>Finalizar</span>
                          </>
                      )}
                    </button>
                  </div>
                </form>
            )}
          </div>
        </div>
      </div>
  );
};

export default FirstLoginSetup;