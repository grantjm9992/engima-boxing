// src/services/UserService.ts
import { User, LoginCredentials, UserProfileUpdateData, PasswordChangeData, UserRegistrationData } from '../types/UserTypes';
import { apiService } from './apiService';

class UserService {
  private currentUser: User | null = null;
  private readonly currentUserKey = 'enigma-current-user';

  constructor() {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    try {
      const saved = localStorage.getItem(this.currentUserKey);
      if (saved) {
        const parsedUser = JSON.parse(saved);
        this.currentUser = {
          ...parsedUser,
          createdAt: new Date(parsedUser.createdAt),
          updatedAt: new Date(parsedUser.updatedAt),
          tempPasswordExpiry: parsedUser.tempPasswordExpiry ? new Date(parsedUser.tempPasswordExpiry) : undefined,
          lastLogin: parsedUser.lastLogin ? new Date(parsedUser.lastLogin) : undefined
        };
      }
    } catch (error) {
      console.error('Error loading current user:', error);
      this.currentUser = null;
    }
  }

  private saveCurrentUser(): void {
    try {
      if (this.currentUser) {
        localStorage.setItem(this.currentUserKey, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(this.currentUserKey);
      }
    } catch (error) {
      console.error('Error saving current user:', error);
    }
  }

  private mapApiUserToUser(apiUser: any): User {
    return {
      id: apiUser.id,
      email: apiUser.email,
      firstName: apiUser.first_name,
      lastName: apiUser.last_name,
      role: apiUser.role,
      subscriptionPlan: apiUser.subscription_plan || 'basic',
      tempPassword: apiUser.temp_password,
      tempPasswordExpiry: apiUser.temp_password_expiry ? new Date(apiUser.temp_password_expiry) : undefined,
      isActive: apiUser.is_active,
      isEmailVerified: apiUser.is_email_verified,
      phone: apiUser.phone,
      profilePicture: apiUser.profile_picture,
      lastLogin: apiUser.last_login ? new Date(apiUser.last_login) : undefined,
      createdAt: new Date(apiUser.created_at),
      updatedAt: new Date(apiUser.updated_at)
    };
  }

  // Login method that matches the existing interface
  public async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiService.login({
        email: credentials.email,
        password: credentials.password
      });

      // Store the token
      localStorage.setItem('auth-token', response.token);

      // Map the API user to our User type
      const user = this.mapApiUserToUser(response.user);

      this.currentUser = user;
      this.saveCurrentUser();

      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Logout method
  public async logout(): Promise<void> {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with logout even if API call fails
    }

    localStorage.removeItem('auth-token');
    this.currentUser = null;
    this.saveCurrentUser();
  }

  // Get current user
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return this.currentUser !== null && localStorage.getItem('auth-token') !== null;
  }

  // Update user profile
  public async updateUserProfile(userId: string, profileData: UserProfileUpdateData): Promise<User> {
    try {
      const response = await apiService.updateProfile({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        profile_picture: profileData.profilePicture
      });

      const updatedUser = this.mapApiUserToUser(response.user);

      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser = updatedUser;
        this.saveCurrentUser();
      }

      return updatedUser;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }

  // Change password
  public async changePassword(userId: string, passwordData: PasswordChangeData): Promise<User> {
    try {
      const response = await apiService.changePassword({
        old_password: passwordData.oldPassword,
        new_password: passwordData.newPassword,
        new_password_confirmation: passwordData.newPassword
      });

      const updatedUser = this.mapApiUserToUser(response.user);

      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser = updatedUser;
        this.saveCurrentUser();
      }

      return updatedUser;
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
    }
  }

  // Initialize user session (check if token is valid)
  public async initializeSession(): Promise<User | null> {
    const token = localStorage.getItem('auth-token');

    if (!token) {
      this.currentUser = null;
      this.saveCurrentUser();
      return null;
    }

    try {
      const response = await apiService.me();
      const user = this.mapApiUserToUser(response.user);

      this.currentUser = user;
      this.saveCurrentUser();

      return user;
    } catch (error) {
      console.error('Session initialization failed:', error);
      // Token is invalid, clear it
      localStorage.removeItem('auth-token');
      this.currentUser = null;
      this.saveCurrentUser();
      return null;
    }
  }

  // Register user (for admin use)
  public async registerUser(userData: UserRegistrationData): Promise<{ user: User; tempPassword: string }> {
    try {
      const response = await apiService.users.create({
        email: userData.email,
        role: userData.role,
        subscription_plan: userData.subscriptionPlan,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone
      });

      const user = this.mapApiUserToUser(response.user);

      return {
        user,
        tempPassword: response.temp_password || ''
      };
    } catch (error) {
      console.error('User registration failed:', error);
      throw error;
    }
  }

  // Get all users (admin only)
  public async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiService.users.getAll();
      return response.users.map(apiUser => this.mapApiUserToUser(apiUser));
    } catch (error) {
      console.error('Failed to get all users:', error);
      throw error;
    }
  }

  // Toggle user active status
  public async toggleUserActive(userId: string, isActive: boolean): Promise<User> {
    try {
      const response = await apiService.users.toggleActive(userId);
      return this.mapApiUserToUser(response.user);
    } catch (error) {
      console.error('Failed to toggle user active status:', error);
      throw error;
    }
  }

  // Delete user
  public async deleteUser(userId: string): Promise<void> {
    try {
      await apiService.users.delete(userId);

      // If deleting current user, logout
      if (this.currentUser && this.currentUser.id === userId) {
        await this.logout();
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  }

  // Reset password (admin only)
  public async resetPassword(email: string): Promise<{ user: User; tempPassword: string }> {
    try {
      // This would need to be implemented in the API
      // For now, we'll throw an error
      throw new Error('Password reset not implemented in API yet');
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  }

  // Clear all data (development helper)
  public clearAllData(): void {
    localStorage.removeItem('auth-token');
    this.currentUser = null;
    this.saveCurrentUser();
    console.log('All user data cleared!');
  }
}

// Export a singleton instance
export const userService = new UserService();
export default userService;