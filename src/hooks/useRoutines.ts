// src/hooks/useRoutines.ts
import { useState, useEffect, useCallback } from 'react';
import { routineApi, RoutineResponse, CreateRoutineRequest, UpdateRoutineRequest } from '../services/routineApi';

export interface Routine {
    id: string;
    name: string;
    description: string;
    objective: string;
    exercises: any[];
    materials: any[];
    protection: string[];
    totalDuration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    visibility: 'private' | 'shared';
    isTemplate: boolean;
    templateCategory?: 'technique' | 'physical' | 'shadow' | 'sparring' | 'conditioning';
    isFavorite: boolean;
    trainerNotes: string;
    createdAt: Date;
    updatedAt: Date;
    blockStructure?: any;
    tags: string[];
    repeatInDays: number;
    level?: 'principiante' | 'intermedio' | 'avanzado' | 'competidor' | 'elite';
}

interface UseRoutinesReturn {
    routines: Routine[];
    loading: boolean;
    error: string | null;
    createRoutine: (routine: CreateRoutineRequest) => Promise<Routine>;
    updateRoutine: (id: string, updates: UpdateRoutineRequest) => Promise<Routine>;
    deleteRoutine: (id: string) => Promise<void>;
    duplicateRoutine: (routine: Routine) => Promise<Routine>;
    toggleFavorite: (routine: Routine) => Promise<Routine>;
    refreshRoutines: () => Promise<void>;
    getRoutineById: (id: string) => Routine | undefined;
}

// Helper function to convert API response to local format
const convertApiRoutine = (apiRoutine: RoutineResponse): Routine => {
    console.log('Converting API routine:', apiRoutine);

    // Handle MongoDB _id or regular id
    const routineId = apiRoutine.id || apiRoutine._id;

    if (!routineId) {
        console.error('Routine missing ID field:', apiRoutine);
        throw new Error('Routine missing ID field');

    }

    const converted: Routine = {
        // Use _id or id, whichever is available
        id: routineId,
        name: apiRoutine.name,

        // Fields with defaults
        description: apiRoutine.description || '',
        objective: apiRoutine.objective || '',
        exercises: apiRoutine.exercises || [],
        materials: apiRoutine.materials || [],
        protection: apiRoutine.protection || [],
        tags: apiRoutine.tags || [],
        trainerNotes: apiRoutine.trainerNotes || '',
        totalDuration: apiRoutine.totalDuration || 0,
        repeatInDays: apiRoutine.repeatInDays || 0,
        difficulty: apiRoutine.difficulty || 'intermediate',
        visibility: apiRoutine.visibility || 'private',
        isTemplate: apiRoutine.isTemplate || false,
        isFavorite: apiRoutine.isFavorite || false,
        level: apiRoutine.level,
        templateCategory: apiRoutine.templateCategory,
        blockStructure: apiRoutine.blockStructure,

        // Convert date strings to Date objects safely
        createdAt: apiRoutine.createdAt ? new Date(apiRoutine.createdAt) : new Date(),
        updatedAt: apiRoutine.updatedAt ? new Date(apiRoutine.updatedAt) : new Date(),
    };

    console.log('Converted routine with ID:', converted.id, converted);
    return converted;
};

export const useRoutines = (): UseRoutinesReturn => {
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load routines from API
    const loadRoutines = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const apiRoutines = await routineApi.getRoutines();
            const convertedRoutines = apiRoutines.map(convertApiRoutine);
            setRoutines(convertedRoutines);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error loading routines';
            setError(errorMessage);
            console.error('Error loading routines:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create a new routine
    const createRoutine = useCallback(async (routineData: CreateRoutineRequest): Promise<Routine> => {
        try {
            setError(null);
            const apiRoutine = await routineApi.createRoutine(routineData);
            const newRoutine = convertApiRoutine(apiRoutine);

            setRoutines(prev => [...prev, newRoutine]);
            return newRoutine;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error creating routine';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    // Update an existing routine
    const updateRoutine = useCallback(async (id: string, updates: UpdateRoutineRequest): Promise<Routine> => {
        try {
            setError(null);
            const apiRoutine = await routineApi.updateRoutine(id, updates);
            const updatedRoutine = convertApiRoutine(apiRoutine);

            setRoutines(prev =>
                prev.map(routine =>
                    routine.id === id ? updatedRoutine : routine
                )
            );
            return updatedRoutine;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error updating routine';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    // Delete a routine
    const deleteRoutine = useCallback(async (id: string): Promise<void> => {
        try {
            setError(null);
            await routineApi.deleteRoutine(id);
            setRoutines(prev => prev.filter(routine => routine.id !== id));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error deleting routine';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    // Duplicate a routine
    const duplicateRoutine = useCallback(async (routine: Routine): Promise<Routine> => {
        try {
            setError(null);
            const apiRoutine = await routineApi.duplicateRoutine(routine.id);
            const duplicatedRoutine = convertApiRoutine(apiRoutine);

            setRoutines(prev => [...prev, duplicatedRoutine]);
            return duplicatedRoutine;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error duplicating routine';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    // Toggle favorite status
    const toggleFavorite = useCallback(async (routine: Routine): Promise<Routine> => {
        try {
            setError(null);
            const apiRoutine = await routineApi.toggleFavorite(routine.id, !routine.isFavorite);
            const updatedRoutine = convertApiRoutine(apiRoutine);

            setRoutines(prev =>
                prev.map(r =>
                    r.id === routine.id ? updatedRoutine : r
                )
            );
            return updatedRoutine;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error updating favorite status';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    }, []);

    // Refresh routines
    const refreshRoutines = useCallback(async (): Promise<void> => {
        await loadRoutines();
    }, [loadRoutines]);

    // Get routine by ID
    const getRoutineById = useCallback((id: string): Routine | undefined => {
        return routines.find(routine => routine.id === id);
    }, [routines]);

    // Load routines on mount
    useEffect(() => {
        loadRoutines();
    }, [loadRoutines]);

    return {
        routines,
        loading,
        error,
        createRoutine,
        updateRoutine,
        deleteRoutine,
        duplicateRoutine,
        toggleFavorite,
        refreshRoutines,
        getRoutineById,
    };
};