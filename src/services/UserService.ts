// src/services/UserService.ts
import {
  User,
  LoginCredentials,
  UserRegistrationData,
  UserProfileUpdateData,
  PasswordChangeData
} from '../types/UserTypes';
import { apiService } from './ApiService';

class UserService {
  private currentUser: User | null = null;

  constructor() {
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const response = await apiService.getCurrentUser();
        this.currentUser = response.user;
      }
    } catch (error) {
      console.error('Failed to initialize user service:', error);
      localStorage.removeItem('auth_token');
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiService.login(credentials);
      this.currentUser = response.user;
      return response.user;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.logout();
    } finally {
      this.currentUser = null;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async refreshCurrentUser(): Promise<User | null> {
    try {
      const response = await apiService.getCurrentUser();
      this.currentUser = response.user;
      return response.user;
    } catch (error) {
      this.currentUser = null;
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && localStorage.getItem('auth_token') !== null;
  }

  // Profile management
  async updateProfile(data: UserProfileUpdateData): Promise<User> {
    try {
      const response = await apiService.updateProfile(data);
      this.currentUser = response.user;
      return response.user;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Profile update failed');
    }
  }

  async changePassword(data: PasswordChangeData): Promise<User> {
    try {
      const response = await apiService.changePassword(data);
      this.currentUser = response.user;
      return response.user;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Password change failed');
    }
  }

  // User management (admin/trainer only)
  async getAllUsers(filters?: {
    role?: string;
    active?: boolean;
    search?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    page?: number;
    perPage?: number;
  }): Promise<{ users: User[]; pagination: any }> {
    try {
      const response = await apiService.getUsers({
        role: filters?.role,
        active: filters?.active,
        search: filters?.search,
        sort_by: filters?.sortBy,
        sort_direction: filters?.sortDirection,
        page: filters?.page,
        per_page: filters?.perPage,
      });

      return {
        users: response.data,
        pagination: response.pagination,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch users');
    }
  }

  async getUser(id: string): Promise<User> {
    try {
      const response = await apiService.getUser(id);
      return response.user;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch user');
    }
  }

  async createUser(userData: UserRegistrationData): Promise<{ user: User; tempPassword: string }> {
    try {
      const response = await apiService.createUser(userData);
      return {
        user: response.user,
        tempPassword: response.temp_password,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'User creation failed');
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await apiService.updateUser(id, userData);
      return response.user;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'User update failed');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await apiService.deleteUser(id);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'User deletion failed');
    }
  }

  async resetPassword(email: string): Promise<{ user: User; tempPassword: string }> {
    try {
      const userResponse = await apiService.getUsers({ search: email });
      const user = userResponse.data.find(u => u.email === email);

      if (!user) {
        throw new Error('User not found');
      }

      const response = await apiService.resetUserPassword(user.id.toString());

      return {
        user,
        tempPassword: response.temp_password,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Password reset failed');
    }
  }

  async toggleUserActive(id: string): Promise<User> {
    try {
      const response = await apiService.toggleUserActive(id);
      return response.user;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to toggle user status');
    }
  }

  async getUserStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    byRole: Record<string, number>;
    bySubscription: Record<string, number>;
    recentLogins: number;
    pendingEmailVerification: number;
  }> {
    try {
      const stats = await apiService.getUserStatistics();
      return {
        totalUsers: stats.total_users,
        activeUsers: stats.active_users,
        byRole: stats.by_role,
        bySubscription: stats.by_subscription,
        recentLogins: stats.recent_logins,
        pendingEmailVerification: stats.pending_email_verification,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch statistics');
    }
  }

  // Email simulation methods (for development)
  sendWelcomeEmail(user: User, tempPassword: string): void {
    console.log('📧 Welcome Email Sent:');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Bienvenido a Enigma Boxing Club`);
    console.log(`Temporary Password: ${tempPassword}`);
    console.log('---');
  }

  sendPasswordResetEmail(user: User, tempPassword: string): void {
    console.log('📧 Password Reset Email Sent:');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Restablecimiento de Contraseña - Enigma Boxing Club`);
    console.log(`Temporary Password: ${tempPassword}`);
    console.log('---');
  }

  // Helper methods for role checking
  hasPermission(requiredRole: string, targetUserId?: string): boolean {
    if (!this.currentUser) return false;

    const user = this.currentUser;

    // Admin can do everything
    if (user.role === 'admin') return true;

    // Trainer can manage students and their own profile
    if (user.role === 'trainer') {
      if (requiredRole === 'student') return true;
      if (targetUserId && user.id.toString() === targetUserId) return true;
    }

    // Students can only manage their own profile
    if (user.role === 'student') {
      if (targetUserId && user.id.toString() === targetUserId) return true;
    }

    return false;
  }
}

export const userService = new UserService();