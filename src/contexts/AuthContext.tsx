import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, PasswordChangeData, UserProfileUpdateData } from '../types/UserTypes';
import { userService } from '../services/UserService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => void;
  updateProfile: (data: UserProfileUpdateData) => Promise<User>;
  changePassword: (data: PasswordChangeData) => Promise<User>;
  isFirstLogin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  // Cargar usuario actual al iniciar
  useEffect(() => {
    const currentUser = userService.getCurrentUser();
    
    if (currentUser) {
      setAuthState({
        user: currentUser,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      // Verificar si es el primer inicio de sesión (tiene contraseña temporal)
      setIsFirstLogin(!!currentUser.tempPassword);
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const user = userService.login(credentials);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      // Verificar si es el primer inicio de sesión (tiene contraseña temporal)
      setIsFirstLogin(!!user.tempPassword);
      
      return user;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al iniciar sesión'
      }));
      throw error;
    }
  };

  const logout = () => {
    userService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    setIsFirstLogin(false);
  };

  const updateProfile = async (data: UserProfileUpdateData): Promise<User> => {
    if (!authState.user) {
      throw new Error('No hay usuario autenticado');
    }
    
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const updatedUser = userService.updateUserProfile(authState.user.id, data);
      
      setAuthState({
        user: updatedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      return updatedUser;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al actualizar perfil'
      }));
      throw error;
    }
  };

  const changePassword = async (data: PasswordChangeData): Promise<User> => {
    if (!authState.user) {
      throw new Error('No hay usuario autenticado');
    }
    
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const updatedUser = userService.changePassword(authState.user.id, data);
      
      setAuthState({
        user: updatedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      // Ya no es el primer inicio de sesión
      setIsFirstLogin(false);
      
      return updatedUser;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cambiar contraseña'
      }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateProfile,
        changePassword,
        isFirstLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};