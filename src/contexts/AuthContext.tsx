// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, PasswordChangeData, UserProfileUpdateData } from '../types/UserTypes';
import { userService } from '../services/UserService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: UserProfileUpdateData) => Promise<User>;
  changePassword: (data: PasswordChangeData) => Promise<User>;
  refreshUser: () => Promise<void>;
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

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const currentUser = await userService.refreshCurrentUser();
          if (currentUser) {
            setAuthState({
              user: currentUser,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            // Check if user has temporary password (first login)
            setIsFirstLogin(!!currentUser.tempPassword);
          } else {
            // Token is invalid
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            });
          }
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Authentication initialization failed:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication failed'
        });
      }
    };

    initializeAuth();
  }, []);

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

      // Check if user has temporary password (first login)
      setIsFirstLogin(!!user.tempPassword);

      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await userService.logout();
    } finally {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      setIsFirstLogin(false);
    }
  };

  const updateProfile = async (data: UserProfileUpdateData): Promise<User> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const updatedUser = await userService.updateProfile(data);

      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
        error: null
      }));

      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  };

  const changePassword = async (data: PasswordChangeData): Promise<User> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const updatedUser = await userService.changePassword(data);

      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
        error: null
      }));

      // Clear first login flag after password change
      setIsFirstLogin(false);

      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await userService.refreshCurrentUser();
      if (currentUser) {
        setAuthState(prev => ({
          ...prev,
          user: currentUser,
          error: null
        }));
        setIsFirstLogin(!!currentUser.tempPassword);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
    isFirstLogin,
  };

  return (
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
  );
};