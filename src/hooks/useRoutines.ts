// src/hooks/useRoutines.ts
import { useState, useCallback } from 'react';
import { apiService } from '../services/apiService';

export interface Exercise {
    id: string;
    name: string;
    description?: string;
    duration: number;
    intensity: 'low' | 'medium' | 'high';
    workType: 'strength' | 'coordination' | 'reaction' | 'technique' | 'cardio' | 'flexibility' | 'sparring' | 'conditioning';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    materials: string[];
    protection: string[];
    instructions: string[];
    videoUrl?: string;
    imageUrl?: string;
    isMultiTimer: boolean;
    timers?: Array<{
        name: string;
        duration: number;
        repetitions: number;
        restBetween?: number;
    }>;
    isTemplate: boolean;
    visibility: 'private' | 'shared' | 'public';
    isFavorite?: boolean;
    isActive: boolean;
    categoryIds: string[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RoutineBlock {
    id: string;
    name: string;
    exercises: Exercise[];
    duration: number;
    restBetween?: number;
}

export interface Routine {
    id: string;
    name: string;
    description?: string;
    objective?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    level: 'principiante' | 'intermedio' | 'avanzado';
    tags: string[];
    materials: string[];
    protection: string[];
    totalDuration: number;
    blocks: RoutineBlock[];
    isTemplate: boolean;
    templateCategory?: 'technique' | 'physical' | 'shadow' | 'sparring' | 'conditioning';
    isFavorite: boolean;
    visibility: 'private' | 'shared' | 'public';
    isActive: boolean;
    trainerNotes?: string;
    repeatInDays?: number;
    scheduledDays?: string[];
    categoryIds: string[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

interface RoutinesState {
    routines: Routine[];
    exercises: Exercise[];
    isLoading: boolean;
    error: string | null;
}

export const useRoutines = () => {
    const [state, setState] = useState<RoutinesState>({
        routines: [],
        exercises: [],
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

    // Load routines
    const loadRoutines = useCallback(async (params?: any) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiService.routines.getAll(params);
            const routines = response.routines.map(routine => ({
                ...routine,
                createdAt: new Date(routine.created_at),
                updatedAt: new Date(routine.updated_at),
            }));

            setState(prev => ({ ...prev, routines }));
            return { routines, pagination: response.pagination };
        } catch (error) {
            console.error('Error loading routines:', error);
            setError(error instanceof Error ? error.message : 'Error loading routines');
            return { routines: [], pagination: null };
        } finally {
            setLoading(false);
        }
    }, []);

    // Load exercises
    const loadExercises = useCallback(async (params?: any) => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiService.exercises.getAll(params);
            const exercises = response.exercises.map(exercise => ({
                ...exercise,
                createdAt: new Date(exercise.created_at),
                updatedAt: new Date(exercise.updated_at),
            }));

            setState(prev => ({ ...prev, exercises }));
            return { exercises, pagination: response.pagination };
        } catch (error) {
            console.error('Error loading exercises:', error);
            setError(error instanceof Error ? error.message : 'Error loading exercises');
            return { exercises: [], pagination: null };
        } finally {
            setLoading(false);
        }
    }, []);

    // Get single routine
    const getRoutine = async (id: string): Promise<Routine | null> => {
        try {
            setLoading(true);
            const response = await apiService.routines.getById(id);
            return {
                ...response.routine,
                createdAt: new Date(response.routine.created_at),
                updatedAt: new Date(response.routine.updated_at),
            };
        } catch (error) {
            console.error('Error getting routine:', error);
            setError(error instanceof Error ? error.message : 'Error loading routine');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Get single exercise
    const getExercise = async (id: string): Promise<Exercise | null> => {
        try {
            setLoading(true);
            const response = await apiService.exercises.getById(id);
            return {
                ...response.exercise,
                createdAt: new Date(response.exercise.created_at),
                updatedAt: new Date(response.exercise.updated_at),
            };
        } catch (error) {
            console.error('Error getting exercise:', error);
            setError(error instanceof Error ? error.message : 'Error loading exercise');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Create routine
    const createRoutine = async (routineData: Omit<Routine, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Routine | null> => {
        try {
            setLoading(true);
            const response = await apiService.routines.create({
                name: routineData.name,
                description: routineData.description,
                objective: routineData.objective,
                difficulty: routineData.difficulty,
                level: routineData.level,
                tags: routineData.tags,
                materials: routineData.materials,
                protection: routineData.protection,
                total_duration: routineData.totalDuration,
                blocks: routineData.blocks,
                is_template: routineData.isTemplate,
                template_category: routineData.templateCategory,
                is_favorite: routineData.isFavorite,
                visibility: routineData.visibility,
                is_active: routineData.isActive,
                trainer_notes: routineData.trainerNotes,
                repeat_in_days: routineData.repeatInDays,
                scheduled_days: routineData.scheduledDays,
                category_ids: routineData.categoryIds,
            });

            const newRoutine: Routine = {
                ...response.routine,
                createdAt: new Date(response.routine.created_at),
                updatedAt: new Date(response.routine.updated_at),
            };

            setState(prev => ({
                ...prev,
                routines: [...prev.routines, newRoutine],
            }));

            return newRoutine;
        } catch (error) {
            console.error('Error creating routine:', error);
            setError(error instanceof Error ? error.message : 'Error creating routine');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Create exercise
    const createExercise = async (exerciseData: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Exercise | null> => {
        try {
            setLoading(true);
            const response = await apiService.exercises.create({
                name: exerciseData.name,
                description: exerciseData.description,
                duration: exerciseData.duration,
                intensity: exerciseData.intensity,
                work_type: exerciseData.workType,
                difficulty: exerciseData.difficulty,
                tags: exerciseData.tags,
                materials: exerciseData.materials,
                protection: exerciseData.protection,
                instructions: exerciseData.instructions,
                video_url: exerciseData.videoUrl,
                image_url: exerciseData.imageUrl,
                is_multi_timer: exerciseData.isMultiTimer,
                timers: exerciseData.timers,
                is_template: exerciseData.isTemplate,
                visibility: exerciseData.visibility,
                is_active: exerciseData.isActive,
                category_ids: exerciseData.categoryIds,
            });

            const newExercise: Exercise = {
                ...response.exercise,
                createdAt: new Date(response.exercise.created_at),
                updatedAt: new Date(response.exercise.updated_at),
            };

            setState(prev => ({
                ...prev,
                exercises: [...prev.exercises, newExercise],
            }));

            return newExercise;
        } catch (error) {
            console.error('Error creating exercise:', error);
            setError(error instanceof Error ? error.message : 'Error creating exercise');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Update routine
    const updateRoutine = async (id: string, updates: Partial<Routine>): Promise<Routine | null> => {
        try {
            setLoading(true);
            const response = await apiService.routines.update(id, {
                name: updates.name,
                description: updates.description,
                objective: updates.objective,
                difficulty: updates.difficulty,
                level: updates.level,
                tags: updates.tags,
                materials: updates.materials,
                protection: updates.protection,
                total_duration: updates.totalDuration,
                blocks: updates.blocks,
                is_template: updates.isTemplate,
                template_category: updates.templateCategory,
                is_favorite: updates.isFavorite,
                visibility: updates.visibility,
                is_active: updates.isActive,
                trainer_notes: updates.trainerNotes,
                repeat_in_days: updates.repeatInDays,
                scheduled_days: updates.scheduledDays,
                category_ids: updates.categoryIds,
            });

            const updatedRoutine: Routine = {
                ...response.routine,
                createdAt: new Date(response.routine.created_at),
                updatedAt: new Date(response.routine.updated_at),
            };

            setState(prev => ({
                ...prev,
                routines: prev.routines.map(routine =>
                    routine.id === id ? updatedRoutine : routine
                ),
            }));

            return updatedRoutine;
        } catch (error) {
            console.error('Error updating routine:', error);
            setError(error instanceof Error ? error.message : 'Error updating routine');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Update exercise
    const updateExercise = async (id: string, updates: Partial<Exercise>): Promise<Exercise | null> => {
        try {
            setLoading(true);
            const response = await apiService.exercises.update(id, {
                name: updates.name,
                description: updates.description,
                duration: updates.duration,
                intensity: updates.intensity,
                work_type: updates.workType,
                difficulty: updates.difficulty,
                tags: updates.tags,
                materials: updates.materials,
                protection: updates.protection,
                instructions: updates.instructions,
                video_url: updates.videoUrl,
                image_url: updates.imageUrl,
                is_multi_timer: updates.isMultiTimer,
                timers: updates.timers,
                is_template: updates.isTemplate,
                visibility: updates.visibility,
                is_active: updates.isActive,
                category_ids: updates.categoryIds,
            });

            const updatedExercise: Exercise = {
                ...response.exercise,
                createdAt: new Date(response.exercise.created_at),
                updatedAt: new Date(response.exercise.updated_at),
            };

            setState(prev => ({
                ...prev,
                exercises: prev.exercises.map(exercise =>
                    exercise.id === id ? updatedExercise : exercise
                ),
            }));

            return updatedExercise;
        } catch (error) {
            console.error('Error updating exercise:', error);
            setError(error instanceof Error ? error.message : 'Error updating exercise');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Delete routine
    const deleteRoutine = async (id: string): Promise<boolean> => {
        try {
            setLoading(true);
            await apiService.routines.delete(id);

            setState(prev => ({
                ...prev,
                routines: prev.routines.filter(routine => routine.id !== id),
            }));

            return true;
        } catch (error) {
            console.error('Error deleting routine:', error);
            setError(error instanceof Error ? error.message : 'Error deleting routine');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Delete exercise
    const deleteExercise = async (id: string): Promise<boolean> => {
        try {
            setLoading(true);
            await apiService.exercises.delete(id);

            setState(prev => ({
                ...prev,
                exercises: prev.exercises.filter(exercise => exercise.id !== id),
            }));

            return true;
        } catch (error) {
            console.error('Error deleting exercise:', error);
            setError(error instanceof Error ? error.message : 'Error deleting exercise');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Clone routine
    const cloneRoutine = async (id: string, modifications?: Partial<Routine>): Promise<Routine | null> => {
        try {
            setLoading(true);
            const response = await apiService.routines.clone(id, modifications);

            const clonedRoutine: Routine = {
                ...response.routine,
                createdAt: new Date(response.routine.created_at),
                updatedAt: new Date(response.routine.updated_at),
            };

            setState(prev => ({
                ...prev,
                routines: [...prev.routines, clonedRoutine],
            }));

            return clonedRoutine;
        } catch (error) {
            console.error('Error cloning routine:', error);
            setError(error instanceof Error ? error.message : 'Error cloning routine');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Clone exercise
    const cloneExercise = async (id: string, modifications?: Partial<Exercise>): Promise<Exercise | null> => {
        try {
            setLoading(true);
            const response = await apiService.exercises.clone(id, modifications);

            const clonedExercise: Exercise = {
                ...response.exercise,
                createdAt: new Date(response.exercise.created_at),
                updatedAt: new Date(response.exercise.updated_at),
            };

            setState(prev => ({
                ...prev,
                exercises: [...prev.exercises, clonedExercise],
            }));

            return clonedExercise;
        } catch (error) {
            console.error('Error cloning exercise:', error);
            setError(error instanceof Error ? error.message : 'Error cloning exercise');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Toggle favorite status
    const toggleRoutineFavorite = async (id: string): Promise<boolean> => {
        try {
            const response = await apiService.routines.toggleFavorite(id);

            setState(prev => ({
                ...prev,
                routines: prev.routines.map(routine =>
                    routine.id === id
                        ? { ...routine, isFavorite: response.routine.is_favorite }
                        : routine
                ),
            }));

            return true;
        } catch (error) {
            console.error('Error toggling routine favorite:', error);
            setError(error instanceof Error ? error.message : 'Error updating favorite status');
            return false;
        }
    };

    const toggleExerciseFavorite = async (id: string): Promise<boolean> => {
        try {
            const response = await apiService.exercises.toggleFavorite(id);

            setState(prev => ({
                ...prev,
                exercises: prev.exercises.map(exercise =>
                    exercise.id === id
                        ? { ...exercise, isFavorite: response.exercise.is_favorite }
                        : exercise
                ),
            }));

            return true;
        } catch (error) {
            console.error('Error toggling exercise favorite:', error);
            setError(error instanceof Error ? error.message : 'Error updating favorite status');
            return false;
        }
    };

    // Toggle active status
    const toggleRoutineActive = async (id: string): Promise<boolean> => {
        try {
            const response = await apiService.routines.toggleActive(id);

            setState(prev => ({
                ...prev,
                routines: prev.routines.map(routine =>
                    routine.id === id
                        ? { ...routine, isActive: response.routine.is_active }
                        : routine
                ),
            }));

            return true;
        } catch (error) {
            console.error('Error toggling routine active status:', error);
            setError(error instanceof Error ? error.message : 'Error updating active status');
            return false;
        }
    };

    return {
        // State
        routines: state.routines,
        exercises: state.exercises,
        isLoading: state.isLoading,
        error: state.error,

        // Control functions
        setError,

        // Load functions
        loadRoutines,
        loadExercises,
        getRoutine,
        getExercise,

        // CRUD functions - Routines
        createRoutine,
        updateRoutine,
        deleteRoutine,
        cloneRoutine,
        toggleRoutineFavorite,
        toggleRoutineActive,

        // CRUD functions - Exercises
        createExercise,
        updateExercise,
        deleteExercise,
        cloneExercise,
        toggleExerciseFavorite,
    };
};