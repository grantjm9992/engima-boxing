// src/hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from 'react';
import { apiService } from '../services/apiService';

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'admin' | 'trainer' | 'student';
    subscriptionPlan: 'basic' | 'premium' | 'elite' | 'trial';
    isActive: boolean;
    isEmailVerified: boolean;
    phone?: string;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => Promise<boolean>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
    clearError: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const useAuthProvider = (): AuthContextType => {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: localStorage.getItem('auth-token'),
        isLoading: true,
        isAuthenticated: false,
        error: null,
    });

    // Check if user is authenticated on mount
    const checkAuth = async () => {
        const token = localStorage.getItem('auth-token');

        if (!token) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                isAuthenticated: false,
                user: null,
                token: null
            }));
            return;
        }

        try {
            const response = await apiService.auth.me();
            setState(prev => ({
                ...prev,
                user: {
                    ...response.user,
                    createdAt: new Date(response.user.created_at),
                    updatedAt: new Date(response.user.updated_at),
                    lastLogin: response.user.last_login ? new Date(response.user.last_login) : undefined,
                },
                token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            }));
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('auth-token');
            setState(prev => ({
                ...prev,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: null, // Don't show error for invalid token
            }));
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await apiService.auth.login({ email, password });

            localStorage.setItem('auth-token', response.token);

            setState(prev => ({
                ...prev,
                user: {
                    ...response.user,
                    createdAt: new Date(response.user.created_at),
                    updatedAt: new Date(response.user.updated_at),
                    lastLogin: response.user.last_login ? new Date(response.user.last_login) : undefined,
                },
                token: response.token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            }));

            return true;
        } catch (error) {
            console.error('Login failed:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Login failed',
            }));
            return false;
        }
    };

    const logout = async () => {
        try {
            await apiService.auth.logout();
        } catch (error) {
            console.error('Logout API call failed:', error);
            // Continue with logout even if API call fails
        }

        localStorage.removeItem('auth-token');
        setState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
        });
    };

    const updateProfile = async (data: Partial<User>): Promise<boolean> => {
        if (!state.user) return false;

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await apiService.auth.updateProfile({
                first_name: data.firstName,
                last_name: data.lastName,
                phone: data.phone,
                email: data.email,
            });

            setState(prev => ({
                ...prev,
                user: prev.user ? {
                    ...prev.user,
                    ...response.user,
                    createdAt: new Date(response.user.created_at),
                    updatedAt: new Date(response.user.updated_at),
                    lastLogin: response.user.last_login ? new Date(response.user.last_login) : undefined,
                } : null,
                isLoading: false,
                error: null,
            }));

            return true;
        } catch (error) {
            console.error('Profile update failed:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Profile update failed',
            }));
            return false;
        }
    };

    const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            await apiService.auth.changePassword({
                current_password: currentPassword,
                new_password: newPassword,
            });

            setState(prev => ({
                ...prev,
                isLoading: false,
                error: null,
            }));

            return true;
        } catch (error) {
            console.error('Password change failed:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Password change failed',
            }));
            return false;
        }
    };

    const clearError = () => {
        setState(prev => ({ ...prev, error: null }));
    };

    return {
        ...state,
        login,
        logout,
        updateProfile,
        changePassword,
        clearError,
        checkAuth,
    };
};

export { AuthContext };