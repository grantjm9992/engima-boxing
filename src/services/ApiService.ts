// src/services/ApiService.ts
import { User, LoginCredentials, UserRegistrationData, UserProfileUpdateData, PasswordChangeData } from '../types/UserTypes';

export interface ApiResponse<T = any> {
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
    data: T[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

class ApiService {
    public baseURL: string;
    private token: string | null = null;

    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:80/api';
        this.token = localStorage.getItem('auth_token');
    }

    public getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    public async handleResponse<T = any>(response: Response): Promise<T> {
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                this.clearToken();
                window.location.href = '/login';
            }
            throw new Error(data.message || 'An error occurred');
        }

        return data;
    }

    private setToken(token: string): void {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    private clearToken(): void {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    // Generic HTTP methods
    public async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
        const url = new URL(`${this.baseURL}${endpoint}`);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, value.toString());
                }
            });
        }

        const response = await fetch(url.toString(), {
            headers: this.getHeaders(),
        });

        return this.handleResponse<T>(response);
    }

    public async post<T = any>(endpoint: string, data?: any): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });

        return this.handleResponse<T>(response);
    }

    public async put<T = any>(endpoint: string, data?: any): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });

        return this.handleResponse<T>(response);
    }

    public async delete<T = any>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });

        return this.handleResponse<T>(response);
    }

    // Auth endpoints
    async login(credentials: LoginCredentials): Promise<{ user: User; token: string; is_first_login: boolean }> {
        const response = await fetch(`${this.baseURL}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(credentials),
        });

        const data = await this.handleResponse<{ user: User; token: string; is_first_login: boolean }>(response);
        this.setToken(data.token);
        return data;
    }

    async register(userData: UserRegistrationData): Promise<{ user: User; temp_password: string }> {
        const response = await fetch(`${this.baseURL}/auth/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(userData),
        });

        return this.handleResponse(response);
    }

    async getCurrentUser(): Promise<{ user: User; is_first_login: boolean }> {
        const response = await fetch(`${this.baseURL}/auth/me`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse(response);
    }

    async updateProfile(data: UserProfileUpdateData): Promise<{ user: User }> {
        const response = await fetch(`${this.baseURL}/auth/profile`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        return this.handleResponse(response);
    }

    async changePassword(data: PasswordChangeData): Promise<{ user: User }> {
        const response = await fetch(`${this.baseURL}/auth/change-password`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                old_password: data.oldPassword,
                new_password: data.newPassword,
                new_password_confirmation: data.newPassword,
            }),
        });

        return this.handleResponse(response);
    }

    async resetPassword(email: string): Promise<{ temp_password: string }> {
        const response = await fetch(`${this.baseURL}/auth/reset-password`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email }),
        });

        return this.handleResponse(response);
    }

    async logout(): Promise<void> {
        try {
            await fetch(`${this.baseURL}/auth/logout`, {
                method: 'POST',
                headers: this.getHeaders(),
            });
        } finally {
            this.clearToken();
        }
    }

    // User management endpoints
    async getUsers(params?: {
        role?: string;
        active?: boolean;
        search?: string;
        sort_by?: string;
        sort_direction?: string;
        per_page?: number;
        page?: number;
    }): Promise<PaginatedResponse<User>> {
        const searchParams = new URLSearchParams();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, value.toString());
                }
            });
        }

        const response = await fetch(`${this.baseURL}/users?${searchParams}`, {
            headers: this.getHeaders(),
        });

        const data = await this.handleResponse<{ users: User[]; pagination: any }>(response);
        return {
            data: data.users,
            pagination: data.pagination,
        };
    }

    async getUser(id: string): Promise<{ user: User }> {
        const response = await fetch(`${this.baseURL}/users/${id}`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse(response);
    }

    async createUser(userData: UserRegistrationData): Promise<{ user: User; temp_password: string }> {
        const response = await fetch(`${this.baseURL}/users`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(userData),
        });

        return this.handleResponse(response);
    }

    async updateUser(id: string, userData: Partial<User>): Promise<{ user: User }> {
        const response = await fetch(`${this.baseURL}/users/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(userData),
        });

        return this.handleResponse(response);
    }

    async deleteUser(id: string): Promise<void> {
        const response = await fetch(`${this.baseURL}/users/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });

        await this.handleResponse(response);
    }

    async resetUserPassword(id: string): Promise<{ temp_password: string }> {
        const response = await fetch(`${this.baseURL}/users/${id}/reset-password`, {
            method: 'POST',
            headers: this.getHeaders(),
        });

        return this.handleResponse(response);
    }

    async toggleUserActive(id: string): Promise<{ user: User }> {
        const response = await fetch(`${this.baseURL}/users/${id}/toggle-active`, {
            method: 'POST',
            headers: this.getHeaders(),
        });

        return this.handleResponse(response);
    }

    async getUserStatistics(): Promise<{
        total_users: number;
        active_users: number;
        by_role: Record<string, number>;
        by_subscription: Record<string, number>;
        recent_logins: number;
        pending_email_verification: number;
    }> {
        const response = await fetch(`${this.baseURL}/users/statistics`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse(response);
    }

    // Student endpoints
    async getStudents(params?: {
        level?: string;
        min_age?: number;
        max_age?: number;
        search?: string;
        sort_by?: string;
        sort_direction?: string;
        per_page?: number;
        page?: number;
    }): Promise<PaginatedResponse<any>> {
        const searchParams = new URLSearchParams();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, value.toString());
                }
            });
        }

        const response = await fetch(`${this.baseURL}/students?${searchParams}`, {
            headers: this.getHeaders(),
        });

        const data = await this.handleResponse<{ students: any[]; pagination: any }>(response);
        return {
            data: data.students,
            pagination: data.pagination,
        };
    }

    async getStudent(id: string): Promise<{ student: any }> {
        const response = await fetch(`${this.baseURL}/students/${id}`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse(response);
    }

    async updateStudentProfile(id: string, profileData: {
        age?: number;
        height?: number;
        weight?: number;
        level?: string;
        strengths?: string[];
        weaknesses?: string[];
        notes?: string;
    }): Promise<{ student: any }> {
        const response = await fetch(`${this.baseURL}/students/${id}/profile`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(profileData),
        });

        return this.handleResponse(response);
    }

    async updateStudentWeight(id: string, weight: number): Promise<{ student: any }> {
        const response = await fetch(`${this.baseURL}/students/${id}/weight`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ weight }),
        });

        return this.handleResponse(response);
    }

    async updateStudentTacticalNotes(id: string, tacticalNotes: string): Promise<{ student: any }> {
        const response = await fetch(`${this.baseURL}/students/${id}/tactical-notes`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ tactical_notes: tacticalNotes }),
        });

        return this.handleResponse(response);
    }

    async addStudentPendingNote(id: string, note: string): Promise<{ student: any }> {
        const response = await fetch(`${this.baseURL}/students/${id}/pending-notes`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ note }),
        });

        return this.handleResponse(response);
    }

    async removeStudentPendingNote(id: string, noteIndex: number): Promise<{ student: any }> {
        const response = await fetch(`${this.baseURL}/students/${id}/pending-notes/${noteIndex}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });

        return this.handleResponse(response);
    }

    async getStudentStatistics(): Promise<{
        total_students: number;
        active_students: number;
        by_level: Record<string, number>;
        by_age_group: Record<string, number>;
        average_age: number;
        with_profiles: number;
        pending_notes_count: number;
    }> {
        const response = await fetch(`${this.baseURL}/students/statistics`, {
            headers: this.getHeaders(),
        });

        return this.handleResponse(response);
    }
}

export const apiService = new ApiService();
