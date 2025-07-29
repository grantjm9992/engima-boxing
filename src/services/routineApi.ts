// src/services/routineApi.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:80';

export interface CreateRoutineRequest {
    name: string;
    description?: string;
    objective?: string;
    exercises?: any[];
    materials?: any[];
    protection?: string[];
    totalDuration?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    visibility?: 'private' | 'shared';
    isTemplate?: boolean;
    templateCategory?: 'technique' | 'physical' | 'shadow' | 'sparring' | 'conditioning';
    isFavorite?: boolean;
    trainerNotes?: string;
    blockStructure?: any;
    tags?: string[];
    repeatInDays?: number;
    level?: 'principiante' | 'intermedio' | 'avanzado' | 'competidor' | 'elite';
}

export interface UpdateRoutineRequest extends Partial<CreateRoutineRequest> {}

export interface RoutineResponse {
    _id?: string;  // MongoDB ObjectId
    id?: string;   // Alternative ID field
    name: string;
    description?: string;
    objective?: string;
    exercises?: any[];
    materials?: any[];
    protection?: string[];
    totalDuration?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    visibility?: 'private' | 'shared';
    isTemplate?: boolean;
    templateCategory?: 'technique' | 'physical' | 'shadow' | 'sparring' | 'conditioning';
    isFavorite?: boolean;
    trainerNotes?: string;
    createdAt: string;
    updatedAt: string;
    blockStructure?: any;
    tags?: string[];
    repeatInDays?: number;
    level?: 'principiante' | 'intermedio' | 'avanzado' | 'competidor' | 'elite';
}

class RoutineApiService {
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
            method: 'GET',
            ...options,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Get all routines
    async getRoutines(): Promise<RoutineResponse[]> {
        return this.request<RoutineResponse[]>('/routines');
    }

    // Get a specific routine
    async getRoutine(id: string): Promise<RoutineResponse> {
        return this.request<RoutineResponse>(`/routines/${id}`);
    }

    // Create a new routine
    async createRoutine(routine: CreateRoutineRequest): Promise<RoutineResponse> {
        return this.request<RoutineResponse>('/routines', {
            method: 'POST',
            body: JSON.stringify(routine),
        });
    }

    // Update a routine
    async updateRoutine(id: string, updates: UpdateRoutineRequest): Promise<RoutineResponse> {
        return this.request<RoutineResponse>(`/routines/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    }

    // Delete a routine
    async deleteRoutine(id: string): Promise<{ message: string }> {
        return this.request<{ message: string }>(`/routines/${id}`, {
            method: 'DELETE',
        });
    }

    // Duplicate a routine
    async duplicateRoutine(id: string): Promise<RoutineResponse> {
        return this.request<RoutineResponse>(`/routines/${id}/duplicate`, {
            method: 'POST',
        });
    }

    // Toggle favorite status
    async toggleFavorite(id: string, isFavorite: boolean): Promise<RoutineResponse> {
        return this.request<RoutineResponse>(`/routines/${id}/favorite`, {
            method: 'PATCH',
            body: JSON.stringify({ isFavorite }),
        });
    }

    // Get routines by tags
    async getRoutinesByTags(tagIds: string[]): Promise<RoutineResponse[]> {
        const params = new URLSearchParams();
        tagIds.forEach(tagId => params.append('tags', tagId));
        return this.request<RoutineResponse[]>(`/routines/by-tags?${params}`);
    }

    // Get templates
    async getTemplates(): Promise<RoutineResponse[]> {
        return this.request<RoutineResponse[]>('/routines/templates');
    }

    // Search routines
    async searchRoutines(query: string): Promise<RoutineResponse[]> {
        return this.request<RoutineResponse[]>(`/routines/search?q=${encodeURIComponent(query)}`);
    }
}

export const routineApi = new RoutineApiService();