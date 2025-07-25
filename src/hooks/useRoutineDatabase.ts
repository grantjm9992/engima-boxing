// src/hooks/useRoutineDatabase.ts
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  type: 'phase' | 'period' | 'load-type' | 'custom';
  createdAt: Date;
  isActive?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: Date;
  isActive?: boolean;
}

export interface RoutineCompletion {
  id: string;
  routineId: string;
  categoryId?: string;
  completedAt: Date;
  duration: number;
  rating?: number;
  notes?: string;
  attendees: string[];
  morningSession: boolean;
  afternoonSession: boolean;
  isFullDayComplete?: boolean;
  completedBy: string;
}

export interface PlannedClass {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  routineId?: string;
  classType: 'morning' | 'afternoon' | 'evening' | 'custom';
  tags: string[];
  totalDuration: number;
  blocks: any[];
  objective?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  status?: 'scheduled' | 'completed' | 'cancelled';
  maxParticipants?: number;
  targetStudents?: string[];
}

interface DatabaseState {
  categories: Category[];
  tags: Tag[];
  completions: RoutineCompletion[];
  plannedClasses: PlannedClass[];
  isLoading: boolean;
  error: string | null;
}

export const useRoutineDatabase = () => {
  const [state, setState] = useState<DatabaseState>({
    categories: [],
    tags: [],
    completions: [],
    plannedClasses: [],
    isLoading: false,
    error: null,
  });

  // Loading and error handling
  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  // Load initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [categoriesResponse, tagsResponse, completionsResponse, classesResponse] = await Promise.all([
        apiService.categories.getAll({ with_stats: true }),
        apiService.tags.getAll({ with_stats: true }),
        apiService.routineCompletions.getAll(),
        apiService.plannedClasses.getAll(),
      ]);

      setState(prev => ({
        ...prev,
        categories: categoriesResponse.categories.map(cat => ({
          ...cat,
          createdAt: new Date(cat.created_at),
        })),
        tags: tagsResponse.tags.map(tag => ({
          ...tag,
          createdAt: new Date(tag.created_at),
        })),
        completions: completionsResponse.completions?.map(comp => ({
          ...comp,
          completedAt: new Date(comp.completed_at),
        })) || [],
        plannedClasses: classesResponse.classes?.map(cls => ({
          ...cls,
          createdAt: new Date(cls.created_at),
          updatedAt: new Date(cls.updated_at),
        })) || [],
      }));
    } catch (error) {
      console.error('Error loading routine database:', error);
      setError(error instanceof Error ? error.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Category management
  const createCategory = async (categoryData: Omit<Category, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      const response = await apiService.categories.create({
        name: categoryData.name,
        description: categoryData.description,
        color: categoryData.color,
        type: categoryData.type,
      });

      const newCategory: Category = {
        ...response.category,
        createdAt: new Date(response.category.created_at),
      };

      setState(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory],
      }));

      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      setError(error instanceof Error ? error.message : 'Error creating category');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      setLoading(true);
      const response = await apiService.categories.update(id, updates);

      const updatedCategory: Category = {
        ...response.category,
        createdAt: new Date(response.category.created_at),
      };

      setState(prev => ({
        ...prev,
        categories: prev.categories.map(category =>
            category.id === id ? updatedCategory : category
        ),
      }));

      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      setError(error instanceof Error ? error.message : 'Error updating category');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setLoading(true);
      await apiService.categories.delete(id);

      setState(prev => ({
        ...prev,
        categories: prev.categories.filter(category => category.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting category:', error);
      setError(error instanceof Error ? error.message : 'Error deleting category');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Tag management
  const createTag = async (tagData: Omit<Tag, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      const response = await apiService.tags.create({
        name: tagData.name,
        color: tagData.color,
        description: tagData.description,
      });

      const newTag: Tag = {
        ...response.tag,
        createdAt: new Date(response.tag.created_at),
      };

      setState(prev => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));

      return newTag;
    } catch (error) {
      console.error('Error creating tag:', error);
      setError(error instanceof Error ? error.message : 'Error creating tag');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTag = async (id: string, updates: Partial<Tag>) => {
    try {
      setLoading(true);
      const response = await apiService.tags.update(id, updates);

      const updatedTag: Tag = {
        ...response.tag,
        createdAt: new Date(response.tag.created_at),
      };

      setState(prev => ({
        ...prev,
        tags: prev.tags.map(tag =>
            tag.id === id ? updatedTag : tag
        ),
      }));

      return updatedTag;
    } catch (error) {
      console.error('Error updating tag:', error);
      setError(error instanceof Error ? error.message : 'Error updating tag');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async (id: string) => {
    try {
      setLoading(true);
      await apiService.tags.delete(id);

      setState(prev => ({
        ...prev,
        tags: prev.tags.filter(tag => tag.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting tag:', error);
      setError(error instanceof Error ? error.message : 'Error deleting tag');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Planned Classes management
  const createPlannedClass = async (classData: Omit<PlannedClass, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      const response = await apiService.plannedClasses.create({
        title: classData.title,
        description: classData.notes,
        date: classData.date,
        start_time: classData.startTime,
        end_time: classData.endTime,
        routine_id: classData.routineId,
        class_type: classData.classType,
        max_participants: classData.maxParticipants,
        target_students: classData.targetStudents,
        objective: classData.objective,
        blocks: classData.blocks,
        tags: classData.tags,
      });

      const newClass: PlannedClass = {
        ...response.class,
        createdAt: new Date(response.class.created_at),
        updatedAt: new Date(response.class.updated_at),
      };

      setState(prev => ({
        ...prev,
        plannedClasses: [...prev.plannedClasses, newClass],
      }));

      return newClass;
    } catch (error) {
      console.error('Error creating planned class:', error);
      setError(error instanceof Error ? error.message : 'Error creating planned class');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePlannedClass = async (id: string, updates: Partial<PlannedClass>) => {
    try {
      setLoading(true);
      const response = await apiService.plannedClasses.update(id, {
        title: updates.title,
        description: updates.notes,
        date: updates.date,
        start_time: updates.startTime,
        end_time: updates.endTime,
        routine_id: updates.routineId,
        class_type: updates.classType,
        max_participants: updates.maxParticipants,
        target_students: updates.targetStudents,
        objective: updates.objective,
        blocks: updates.blocks,
        tags: updates.tags,
      });

      const updatedClass: PlannedClass = {
        ...response.class,
        createdAt: new Date(response.class.created_at),
        updatedAt: new Date(response.class.updated_at),
      };

      setState(prev => ({
        ...prev,
        plannedClasses: prev.plannedClasses.map(cls =>
            cls.id === id ? updatedClass : cls
        ),
      }));

      return updatedClass;
    } catch (error) {
      console.error('Error updating planned class:', error);
      setError(error instanceof Error ? error.message : 'Error updating planned class');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePlannedClass = async (id: string) => {
    try {
      setLoading(true);
      await apiService.plannedClasses.delete(id);

      setState(prev => ({
        ...prev,
        plannedClasses: prev.plannedClasses.filter(cls => cls.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting planned class:', error);
      setError(error instanceof Error ? error.message : 'Error deleting planned class');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const duplicatePlannedClass = async (id: string, newDate?: string) => {
    try {
      setLoading(true);
      const response = await apiService.plannedClasses.duplicate(id, {
        date: newDate,
      });

      const duplicatedClass: PlannedClass = {
        ...response.class,
        createdAt: new Date(response.class.created_at),
        updatedAt: new Date(response.class.updated_at),
      };

      setState(prev => ({
        ...prev,
        plannedClasses: [...prev.plannedClasses, duplicatedClass],
      }));

      return duplicatedClass;
    } catch (error) {
      console.error('Error duplicating planned class:', error);
      setError(error instanceof Error ? error.message : 'Error duplicating planned class');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Completion management
  const addCompletion = async (completionData: Omit<RoutineCompletion, 'id'>) => {
    try {
      setLoading(true);
      const response = await apiService.routineCompletions.create({
        routine_id: completionData.routineId,
        category_id: completionData.categoryId,
        completed_at: completionData.completedAt.toISOString(),
        duration: completionData.duration,
        rating: completionData.rating,
        notes: completionData.notes,
        attendees: completionData.attendees,
        morning_session: completionData.morningSession,
        afternoon_session: completionData.afternoonSession,
        completed_by: completionData.completedBy,
      });

      const newCompletion: RoutineCompletion = {
        ...response.completion,
        completedAt: new Date(response.completion.completed_at),
      };

      setState(prev => ({
        ...prev,
        completions: [...prev.completions, newCompletion],
      }));

      return newCompletion;
    } catch (error) {
      console.error('Error adding completion:', error);
      setError(error instanceof Error ? error.message : 'Error adding completion');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCompletion = async (id: string) => {
    try {
      setLoading(true);
      await apiService.routineCompletions.delete(id);

      setState(prev => ({
        ...prev,
        completions: prev.completions.filter(completion => completion.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting completion:', error);
      setError(error instanceof Error ? error.message : 'Error deleting completion');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Analytics functions using API
  const getDailyStats = async (studentIds?: string[], dateRange?: { start: Date; end: Date }) => {
    try {
      const params: any = {};
      if (studentIds) params.student_ids = studentIds.join(',');
      if (dateRange) {
        params.start_date = dateRange.start.toISOString().split('T')[0];
        params.end_date = dateRange.end.toISOString().split('T')[0];
      }

      const response = await apiService.routineCompletions.getDailyStats(params);
      return response.statistics || [];
    } catch (error) {
      console.error('Error getting daily stats:', error);
      return [];
    }
  };

  const getStudentStats = async (dateRange?: { start: Date; end: Date }) => {
    try {
      const params: any = {};
      if (dateRange) {
        params.start_date = dateRange.start.toISOString().split('T')[0];
        params.end_date = dateRange.end.toISOString().split('T')[0];
      }

      const response = await apiService.routineCompletions.getStudentStats(params);
      return response.statistics || [];
    } catch (error) {
      console.error('Error getting student stats:', error);
      return [];
    }
  };

  const getCategoryStats = async (dateRange?: { start: Date; end: Date }) => {
    try {
      const params: any = {};
      if (dateRange) {
        params.start_date = dateRange.start.toISOString().split('T')[0];
        params.end_date = dateRange.end.toISOString().split('T')[0];
      }

      const response = await apiService.routineCompletions.getCategoryStats(params);
      return response.statistics || [];
    } catch (error) {
      console.error('Error getting category stats:', error);
      return [];
    }
  };

  // Export functionality
  const exportData = async () => {
    try {
      const response = await apiService.routineCompletions.exportData();
      if (response.download_url) {
        window.open(response.download_url, '_blank');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      setError(error instanceof Error ? error.message : 'Error exporting data');
    }
  };

  return {
    // State
    categories: state.categories,
    tags: state.tags,
    completions: state.completions,
    plannedClasses: state.plannedClasses,
    isLoading: state.isLoading,
    error: state.error,

    // Control functions
    loadData,
    setError,

    // Category management
    createCategory,
    updateCategory,
    deleteCategory,

    // Tag management
    createTag,
    updateTag,
    deleteTag,

    // Planned Classes management
    createPlannedClass,
    updatePlannedClass,
    deletePlannedClass,
    duplicatePlannedClass,

    // Completion management
    addCompletion,
    deleteCompletion,

    // Analytics
    getDailyStats,
    getStudentStats,
    getCategoryStats,

    // Export
    exportData,
  };
};