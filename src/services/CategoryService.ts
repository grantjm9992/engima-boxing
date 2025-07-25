// src/services/CategoryService.ts
import { apiService } from './ApiService';

export interface Category {
    id: number;
    name: string;
    description?: string;
    color: string;
    type: 'phase' | 'period' | 'load-type' | 'custom';
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;

    // Computed attributes
    usage_stats?: {
        exercise_count: number;
        routine_count: number;
        completion_count: number;
        last_used?: string;
    };
    total_minutes?: number;
    average_rating?: number;
    popular_exercises?: any[];
}

export interface CategoryFilters {
    type?: string;
    active?: boolean;
    search?: string;
    with_stats?: boolean;
}

export interface CategoryCreateData {
    name: string;
    description?: string;
    color: string;
    type: 'phase' | 'period' | 'load-type' | 'custom';
}

export interface CategoryUpdateData {
    name?: string;
    description?: string;
    color?: string;
    type?: 'phase' | 'period' | 'load-type' | 'custom';
    is_active?: boolean;
}

class CategoryService {

    /**
     * Get all categories with optional filtering
     */
    async getAllCategories(filters?: CategoryFilters): Promise<{ categories: Category[]; total: number }> {
        try {
            const params = new URLSearchParams();

            if (filters?.type && filters.type !== 'all') {
                params.append('type', filters.type);
            }

            if (filters?.active !== undefined) {
                params.append('active', filters.active.toString());
            }

            if (filters?.search) {
                params.append('search', filters.search);
            }

            if (filters?.with_stats) {
                params.append('with_stats', 'true');
            }

            const response = await fetch(`${apiService.baseURL}/categories?${params}`, {
                headers: apiService.getHeaders(),
            });

            const data = await apiService.handleResponse<{ categories: Category[]; total: number }>(response);
            return data;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch categories');
        }
    }

    /**
     * Get category options for dropdowns
     */
    async getCategoryOptions(type?: string): Promise<Category[]> {
        try {
            const params = new URLSearchParams();
            if (type) {
                params.append('type', type);
            }

            const response = await fetch(`${apiService.baseURL}/categories/options?${params}`, {
                headers: apiService.getHeaders(),
            });

            const data = await apiService.handleResponse<{ categories: Category[] }>(response);
            return data.categories;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch category options');
        }
    }

    /**
     * Get a specific category with details
     */
    async getCategory(id: number): Promise<Category> {
        try {
            const response = await fetch(`${apiService.baseURL}/categories/${id}`, {
                headers: apiService.getHeaders(),
            });

            const data = await apiService.handleResponse<{ category: Category }>(response);
            return data.category;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch category');
        }
    }

    /**
     * Create a new category
     */
    async createCategory(categoryData: CategoryCreateData): Promise<Category> {
        try {
            const response = await fetch(`${apiService.baseURL}/categories`, {
                method: 'POST',
                headers: apiService.getHeaders(),
                body: JSON.stringify(categoryData),
            });

            const data = await apiService.handleResponse<{ category: Category }>(response);
            return data.category;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to create category');
        }
    }

    /**
     * Update a category
     */
    async updateCategory(id: number, categoryData: CategoryUpdateData): Promise<Category> {
        try {
            const response = await fetch(`${apiService.baseURL}/categories/${id}`, {
                method: 'PUT',
                headers: apiService.getHeaders(),
                body: JSON.stringify(categoryData),
            });

            const data = await apiService.handleResponse<{ category: Category }>(response);
            return data.category;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to update category');
        }
    }

    /**
     * Delete a category
     */
    async deleteCategory(id: number): Promise<void> {
        try {
            const response = await fetch(`${apiService.baseURL}/categories/${id}`, {
                method: 'DELETE',
                headers: apiService.getHeaders(),
            });

            await apiService.handleResponse(response);
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to delete category');
        }
    }

    /**
     * Update sort order of categories
     */
    async updateSortOrder(categoryIds: number[]): Promise<void> {
        try {
            const response = await fetch(`${apiService.baseURL}/categories/sort-order`, {
                method: 'POST',
                headers: apiService.getHeaders(),
                body: JSON.stringify({ category_ids: categoryIds }),
            });

            await apiService.handleResponse(response);
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to update sort order');
        }
    }

    /**
     * Toggle category active status
     */
    async toggleActive(id: number): Promise<Category> {
        try {
            const response = await fetch(`${apiService.baseURL}/categories/${id}/toggle-active`, {
                method: 'POST',
                headers: apiService.getHeaders(),
            });

            const data = await apiService.handleResponse<{ category: Category }>(response);
            return data.category;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to toggle category status');
        }
    }

    /**
     * Get category statistics
     */
    async getStatistics(): Promise<any> {
        try {
            const response = await fetch(`${apiService.baseURL}/categories/statistics`, {
                headers: apiService.getHeaders(),
            });

            return await apiService.handleResponse(response);
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch category statistics');
        }
    }

    /**
     * Get category analytics
     */
    async getAnalytics(id: number, startDate?: string, endDate?: string): Promise<any> {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            const response = await fetch(`${apiService.baseURL}/categories/${id}/analytics?${params}`, {
                headers: apiService.getHeaders(),
            });

            return await apiService.handleResponse(response);
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch category analytics');
        }
    }

    /**
     * Get category type label
     */
    getTypeLabel(type: string): string {
        const labels: Record<string, string> = {
            'phase': 'Fase',
            'period': 'Periodo',
            'load-type': 'Tipo de Carga',
            'custom': 'Personalizada',
        };
        return labels[type] || type;
    }

    /**
     * Get predefined category colors
     */
    getPredefinedColors(): string[] {
        return [
            '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
            '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
            '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E'
        ];
    }

    /**
     * Validate category data
     */
    validateCategoryData(data: CategoryCreateData | CategoryUpdateData): string[] {
        const errors: string[] = [];

        if ('name' in data && data.name !== undefined) {
            if (!data.name || data.name.trim().length === 0) {
                errors.push('El nombre es requerido');
            } else if (data.name.length > 255) {
                errors.push('El nombre no puede tener más de 255 caracteres');
            }
        }

        if ('color' in data && data.color !== undefined) {
            if (!data.color || !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
                errors.push('El color debe ser un código hexadecimal válido (ej: #FF5733)');
            }
        }

        if ('type' in data && data.type !== undefined) {
            if (!['phase', 'period', 'load-type', 'custom'].includes(data.type)) {
                errors.push('El tipo de categoría no es válido');
            }
        }

        if ('description' in data && data.description !== undefined && data.description.length > 1000) {
            errors.push('La descripción no puede tener más de 1000 caracteres');
        }

        return errors;
    }

    /**
     * Map backend category to frontend format
     */
    mapToFrontendCategory(backendCategory: any): Category {
        return {
            id: backendCategory.id,
            name: backendCategory.name,
            description: backendCategory.description,
            color: backendCategory.color,
            type: backendCategory.type,
            is_active: backendCategory.is_active,
            sort_order: backendCategory.sort_order,
            created_at: backendCategory.created_at,
            updated_at: backendCategory.updated_at,
            usage_stats: backendCategory.usage_stats,
            total_minutes: backendCategory.total_minutes,
            average_rating: backendCategory.average_rating,
            popular_exercises: backendCategory.popular_exercises,
        };
    }

    /**
     * Map frontend category to backend format
     */
    mapToBackendCategory(frontendCategory: Partial<Category>): Partial<CategoryCreateData | CategoryUpdateData> {
        const backendData: any = {};

        if (frontendCategory.name !== undefined) backendData.name = frontendCategory.name;
        if (frontendCategory.description !== undefined) backendData.description = frontendCategory.description;
        if (frontendCategory.color !== undefined) backendData.color = frontendCategory.color;
        if (frontendCategory.type !== undefined) backendData.type = frontendCategory.type;
        if (frontendCategory.is_active !== undefined) backendData.is_active = frontendCategory.is_active;

        return backendData;
    }
}

export const categoryService = new CategoryService();