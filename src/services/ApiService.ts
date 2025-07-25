// src/services/apiService.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:80/api';

export interface ApiResponse<T> {
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

class ApiService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = localStorage.getItem('auth-token');

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Direct auth methods (backward compatibility)
    async login(credentials: { email: string; password: string }) {
        return this.request<{ user: any; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async logout() {
        return this.request<void>('/auth/logout', {
            method: 'POST',
        });
    }

    async me() {
        return this.request<{ user: any; is_first_login?: boolean }>('/auth/me');
    }

    async updateProfile(data: any) {
        return this.request<{ user: any }>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async changePassword(data: { old_password: string; new_password: string; new_password_confirmation: string }) {
        return this.request<{ user: any }>('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Auth API (namespaced version)
    auth = {
        login: (credentials: { email: string; password: string }) => this.login(credentials),
        logout: () => this.logout(),
        me: () => this.me(),
        updateProfile: (data: any) => this.updateProfile(data),
        changePassword: (data: { current_password: string; new_password: string }) =>
            this.changePassword({
                old_password: data.current_password,
                new_password: data.new_password,
                new_password_confirmation: data.new_password
            }),
    };

    // Categories API
    categories = {
        getAll: (params?: Record<string, any>) => {
            const searchParams = new URLSearchParams(params);
            return this.request<{ categories: any[]; total: number }>(`/categories?${searchParams}`);
        },

        getById: (id: string) =>
            this.request<{ category: any }>(`/categories/${id}`),

        create: (data: any) =>
            this.request<{ category: any; message: string }>('/categories', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        update: (id: string, data: any) =>
            this.request<{ category: any; message: string }>(`/categories/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),

        delete: (id: string) =>
            this.request<{ message: string }>(`/categories/${id}`, {
                method: 'DELETE',
            }),

        updateSortOrder: (categoryIds: string[]) =>
            this.request<{ message: string }>('/categories/sort-order', {
                method: 'POST',
                body: JSON.stringify({ category_ids: categoryIds }),
            }),

        getUsageStatistics: () =>
            this.request<any>('/categories/statistics/usage'),
    };

    // Tags API
    tags = {
        getAll: (params?: Record<string, any>) => {
            const searchParams = new URLSearchParams(params);
            return this.request<{ tags: any[]; total: number }>(`/tags?${searchParams}`);
        },

        getById: (id: string) =>
            this.request<{ tag: any }>(`/tags/${id}`),

        create: (data: { name: string; color: string; description?: string }) =>
            this.request<{ tag: any; message: string }>('/tags', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        update: (id: string, data: any) =>
            this.request<{ tag: any; message: string }>(`/tags/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),

        delete: (id: string) =>
            this.request<{ message: string }>(`/tags/${id}`, {
                method: 'DELETE',
            }),

        getUsageStatistics: () =>
            this.request<any>('/tags/statistics/usage'),
    };

    // Exercises API
    exercises = {
        getAll: (params?: Record<string, any>) => {
            const searchParams = new URLSearchParams(params);
            return this.request<{ exercises: any[]; pagination: any }>(`/exercises?${searchParams}`);
        },

        getById: (id: string) =>
            this.request<{ exercise: any }>(`/exercises/${id}`),

        create: (data: any) =>
            this.request<{ exercise: any; message: string }>('/exercises', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        update: (id: string, data: any) =>
            this.request<{ exercise: any; message: string }>(`/exercises/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),

        delete: (id: string) =>
            this.request<{ message: string }>(`/exercises/${id}`, {
                method: 'DELETE',
            }),

        clone: (id: string, data?: any) =>
            this.request<{ exercise: any; message: string }>(`/exercises/${id}/clone`, {
                method: 'POST',
                body: JSON.stringify(data || {}),
            }),

        toggleFavorite: (id: string) =>
            this.request<{ exercise: any; message: string }>(`/exercises/${id}/toggle-favorite`, {
                method: 'POST',
            }),

        getUsageStatistics: () =>
            this.request<any>('/exercises/statistics/usage'),
    };

    // Routines API
    routines = {
        getAll: (params?: Record<string, any>) => {
            const searchParams = new URLSearchParams(params);
            return this.request<{ routines: any[]; pagination: any }>(`/routines?${searchParams}`);
        },

        getById: (id: string) =>
            this.request<{ routine: any }>(`/routines/${id}`),

        create: (data: any) =>
            this.request<{ routine: any; message: string }>('/routines', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        update: (id: string, data: any) =>
            this.request<{ routine: any; message: string }>(`/routines/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),

        delete: (id: string) =>
            this.request<{ message: string }>(`/routines/${id}`, {
                method: 'DELETE',
            }),

        clone: (id: string, data?: any) =>
            this.request<{ routine: any; message: string }>(`/routines/${id}/clone`, {
                method: 'POST',
                body: JSON.stringify(data || {}),
            }),

        toggleFavorite: (id: string) =>
            this.request<{ routine: any; message: string }>(`/routines/${id}/toggle-favorite`, {
                method: 'POST',
            }),

        toggleActive: (id: string) =>
            this.request<{ routine: any; message: string }>(`/routines/${id}/toggle-active`, {
                method: 'POST',
            }),

        getUsageStatistics: () =>
            this.request<any>('/routines/statistics/usage'),
    };

    // Planned Classes API
    plannedClasses = {
        getAll: (params?: Record<string, any>) => {
            const searchParams = new URLSearchParams(params);
            return this.request<{ classes: any[]; pagination: any }>(`/planned-classes?${searchParams}`);
        },

        getById: (id: string) =>
            this.request<{ class: any; target_students: any[] }>(`/planned-classes/${id}`),

        create: (data: any) =>
            this.request<{ class: any; message: string }>('/planned-classes', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        update: (id: string, data: any) =>
            this.request<{ class: any; message: string }>(`/planned-classes/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),

        delete: (id: string) =>
            this.request<{ message: string }>(`/planned-classes/${id}`, {
                method: 'DELETE',
            }),

        duplicate: (id: string, data?: any) =>
            this.request<{ class: any; message: string }>(`/planned-classes/${id}/duplicate`, {
                method: 'POST',
                body: JSON.stringify(data || {}),
            }),

        markComplete: (id: string, data: any) =>
            this.request<{ class: any; message: string }>(`/planned-classes/${id}/complete`, {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        getCalendarView: (params?: Record<string, any>) => {
            const searchParams = new URLSearchParams(params);
            return this.request<{ classes: any[] }>(`/planned-classes/calendar/view?${searchParams}`);
        },

        getUpcoming: (params?: Record<string, any>) => {
            const searchParams = new URLSearchParams(params);
            return this.request<{ classes: any[]; count: number }>(`/planned-classes/upcoming/list?${searchParams}`);
        },

        getStatistics: () =>
            this.request<any>('/planned-classes/statistics'),
    };

    // Routine Completions API
    routineCompletions = {
        getAll: (params?: Record<string, any>) => {
            const searchParams = new URLSearchParams(params);
            return this.request<{ completions: any[]; pagination: any }>(`/routine-completions?${searchParams}`);
        },

        getById: (id: string) =>
            this.request<{ completion: any }>(`/routine-completions/${id}`),

        create: (data: any) =>
            this.request<{ completion: any; message: string }>('/routine-completions', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        update: (id: string, data: any) =>
            this.request<{ completion: any; message: string }>(`/routine-completions/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),

        delete: (id: string) =>
            this.request<{ message: string }>(`/routine-completions/${id}`, {
                method: 'DELETE',
            }),

        getDailyStats: (params?: Record<string, any>) => {
            const searchParams = new URLSearchParams(params);
            return this.request<any>(`/routine-completions/statistics/daily?${searchParams}`);
        },

        getStudentStats: (params?: Record<string, any>) => {
            const searchParams = new URLSearchParams(params);
            return this.request<any>(`/routine-completions/statistics/student?${searchParams}`);
        },

        getCategoryStats: (params?: Record<string, any>) => {
            const searchParams = new URLSearchParams(params);
            return this.request<any>(`/routine-completions/statistics/category?${searchParams}`);
        },

        exportData: (params?: Record<string, any>) =>
            this.request<{ download_url: string }>('/routine-completions/export', {
                method: 'POST',
                body: JSON.stringify(params || {}),
            }),
    };

    // Students API
    students = {
        getAll: (params?: Record<string, any>) => {
            const searchParams = new URLSearchParams(params);
            return this.request<{ users: any[]; pagination: any }>(`/students?${searchParams}`);
        },

        getById: (id: string) =>
            this.request<{ user: any }>(`/students/${id}`),

        updateProfile: (id: string, data: any) =>
            this.request<{ user: any; message: string }>(`/students/${id}/profile`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),

        updateWeight: (id: string, data: { weight: number; date?: string }) =>
            this.request<{ user: any; message: string }>(`/students/${id}/weight`, {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        addPendingNote: (id: string, data: { note: string }) =>
            this.request<{ user: any; message: string }>(`/students/${id}/pending-notes`, {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        removePendingNote: (id: string, noteIndex: number) =>
            this.request<{ user: any; message: string }>(`/students/${id}/pending-notes/${noteIndex}`, {
                method: 'DELETE',
            }),

        updateTacticalNotes: (id: string, data: { notes: string }) =>
            this.request<{ user: any; message: string }>(`/students/${id}/tactical-notes`, {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        getStatistics: () =>
            this.request<any>('/students/statistics'),
    };

    // Users API (admin/trainer only)
    users = {
        getAll: (params?: Record<string, any>) => {
            const searchParams = new URLSearchParams(params);
            return this.request<{ users: any[]; pagination: any }>(`/users?${searchParams}`);
        },

        getById: (id: string) =>
            this.request<{ user: any }>(`/users/${id}`),

        create: (data: any) =>
            this.request<{ user: any; message: string }>('/users', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        update: (id: string, data: any) =>
            this.request<{ user: any; message: string }>(`/users/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),

        delete: (id: string) =>
            this.request<{ message: string }>(`/users/${id}`, {
                method: 'DELETE',
            }),

        resetPassword: (id: string, data: { password: string }) =>
            this.request<{ message: string }>(`/users/${id}/reset-password`, {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        toggleActive: (id: string) =>
            this.request<{ user: any; message: string }>(`/users/${id}/toggle-active`, {
                method: 'POST',
            }),

        getStatistics: () =>
            this.request<any>('/users/statistics'),
    };
}

export const apiService = new ApiService();
export default apiService;