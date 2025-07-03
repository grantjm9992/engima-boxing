export type UserRole = 'admin' | 'trainer' | 'student';
export type SubscriptionPlan = 'basic' | 'premium' | 'elite' | 'trial';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  phone?: string;
  subscriptionPlan?: SubscriptionPlan;
  tempPassword?: string;
  tempPasswordExpiry?: Date;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRegistrationData {
  email: string;
  role: UserRole;
  subscriptionPlan?: SubscriptionPlan;
}

export interface UserProfileUpdateData {
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  phone?: string;
}

export interface PasswordChangeData {
  oldPassword: string;
  newPassword: string;
}

export interface PasswordResetData {
  email: string;
  tempPassword: string;
  newPassword: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}