import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, PasswordChangeData, UserProfileUpdateData } from '../types/UserTypes';
import { userService } from '../services/UserService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: UserProfileUpdateData) => Promise<User>;
  changePassword: (data: PasswordChangeData) => Promise<User>;
  isFirstLogin: boolean;
  clearError: () => void;
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

  // Initialize user session on app start
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = await userService.initializeSession();

      if (user) {
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });

        // Check if user has temp password (first login)
        setIsFirstLogin(!!user.tempPassword);
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        setIsFirstLogin(false);
      }
    } catch (error) {
      console.error('Session initialization failed:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null // Don't show error for failed session init
      });
      setIsFirstLogin(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = await userService.login(credentials);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Check if this is first login (user has temp password)
      setIsFirstLogin(!!user.tempPassword);

      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await userService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // Continue with logout even if API call fails
    }

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
      const updatedUser = await userService.updateUserProfile(authState.user.id, data);

      setAuthState({
        user: updatedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar perfil';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
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
      const updatedUser = await userService.changePassword(authState.user.id, data);

      setAuthState({
        user: updatedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Password changed successfully, no longer first login
      setIsFirstLogin(false);

      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar contraseña';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return (
      <AuthContext.Provider
          value={{
            ...authState,
            login,
            logout,
            updateProfile,
            changePassword,
            isFirstLogin,
            clearError
          }}
      >
        {children}
      </AuthContext.Provider>
  );
};