import React, { useState, useEffect } from 'react';
import {
    Plus, X, BookOpen, Loader, AlertTriangle, Star,
    Play, Edit3, Copy, Trash2, Search, Repeat
} from 'lucide-react';
import { useRoutines, Routine } from '../hooks/useRoutines';

interface RoutineManagerProps {
    students: any[];
    isOpen: boolean;
    onClose: () => void;
}

const SafeRoutineManager: React.FC<RoutineManagerProps> = ({
                                                               students,
                                                               isOpen,
                                                               onClose
                                                           }) => {
    const {
        routines,
        loading,
        error,
        createRoutine,
        updateRoutine,
        deleteRoutine,
        duplicateRoutine,
        toggleFavorite,
        refreshRoutines
    } = useRoutines();

    const [searchTerm, setSearchTerm] = useState('');

    // Safe accessor functions
    const safeGetExercisesLength = (routine: any): number => {
        try {
            return routine?.exercises?.length || 0;
        } catch (e) {
            console.warn('Error accessing exercises length:', e);
            return 0;
        }
    };

    const safeGetTags = (routine: any): string[] => {
        try {
            return routine?.tags || [];
        } catch (e) {
            console.warn('Error accessing tags:', e);
            return [];
        }
    };

    const safeGetRepeatInDays = (routine: any): number => {
        try {
            return routine?.repeatInDays || 0;
        } catch (e) {
            console.warn('Error accessing repeatInDays:', e);
            return 0;
        }
    };

    const formatDuration = (minutes: number) => {
        if (!minutes || isNaN(minutes)) return '0 min';
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    };

    // Filter routines safely
    const filteredRoutines = (routines || []).filter(routine => {
        if (!routine) return false;

        const name = routine.name || '';
        const description = routine.description || '';

        return searchTerm === '' ||
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            description.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleToggleFavorite = async (routine: Routine) => {
        try {
            await toggleFavorite(routine);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleDuplicateRoutine = async (routine: Routine) => {
        try {
            await duplicateRoutine(routine);
        } catch (error) {
            console.error('Error duplicating routine:', error);
        }
    };

    const handleDeleteRoutine = async (routineId: string) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta rutina?')) {
            try {
                await deleteRoutine(routineId);
            } catch (error) {
                console.error('Error deleting routine:', error);
            }
        }
    };

    if (!isOpen) return null;

    // Show loading state
    if (loading && (!routines || routines.length === 0)) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl p-8 text-center">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600 dark:text-gray-400">Cargando rutinas...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error && (!routines || routines.length === 0)) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl p-8 text-center max-w-md">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Error al cargar rutinas
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <div className="flex space-x-3 justify-center">
                        <button
                            onClick={refreshRoutines}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Reintentar
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
                {/* Header */}
                <div className="relative p-6 bg-gradient-to-r from-red-600 to-red-700 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="pr-12">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Gestión de Rutinas</h1>
                                <p className="text-red-100">Crear, editar y organizar rutinas de entrenamiento</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
                    <div className="p-6">
                        {/* Debug info */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
                                <strong>Debug:</strong> {routines?.length || 0} rutinas cargadas
                                {loading && <span className="text-blue-600 ml-2">• Cargando...</span>}
                                {error && <span className="text-red-600 ml-2">• Error: {error}</span>}
                            </div>
                        )}

                        {/* Loading indicator */}
                        {loading && (
                            <div className="flex items-center justify-center py-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
                                <Loader className="w-4 h-4 animate-spin mr-2 text-blue-600" />
                                <span className="text-blue-600 dark:text-blue-400">Actualizando rutinas...</span>
                            </div>
                        )}

                        {/* Error indicator */}
                        {error && (
                            <div className="flex items-center justify-between py-4 px-4 bg-red-50 dark:bg-red-900/20 rounded-lg mb-6">
                                <div className="flex items-center">
                                    <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                                    <span className="text-red-600 dark:text-red-400">{error}</span>
                                </div>
                                <button
                                    onClick={refreshRoutines}
                                    className="text-red-600 hover:text-red-700 underline"
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}

                        {/* Search */}
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                                    placeholder="Buscar rutinas..."
                                />
                            </div>
                        </div>

                        {/* Routines Grid */}
                        {filteredRoutines.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No se encontraron rutinas
                                </h3>
                                <p>Crea tu primera rutina o ajusta los filtros</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredRoutines.map((routine) => {
                                    // Safely access properties
                                    const name = routine?.name || 'Sin nombre';
                                    const description = routine?.description || '';
                                    const isFavorite = routine?.isFavorite || false;
                                    const isTemplate = routine?.isTemplate || false;
                                    const totalDuration = routine?.totalDuration || 0;
                                    const exercisesLength = safeGetExercisesLength(routine);
                                    const tags = safeGetTags(routine);
                                    const repeatInDays = safeGetRepeatInDays(routine);
                                    const updatedAt = routine?.updatedAt;
                                    const visibility = routine?.visibility || 'private';

                                    return (
                                        <div
                                            key={routine.id}
                                            className="bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border rounded-lg p-4 hover:shadow-md dark:hover:shadow-dark transition-shadow"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                                            {name}
                                                        </h3>
                                                        {isFavorite && (
                                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                        )}
                                                        {isTemplate && (
                                                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
                                Plantilla
                              </span>
                                                        )}
                                                    </div>

                                                    {description && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                            {description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDuration(totalDuration)}
                            </span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                              {exercisesLength} ejercicio{exercisesLength !== 1 ? 's' : ''}
                            </span>
                                                    </div>

                                                    {/* Repetición automática */}
                                                    {repeatInDays > 0 && (
                                                        <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 mb-2">
                                                            <Repeat className="w-3 h-3" />
                                                            <span>
                                Repetir cada {repeatInDays} día{repeatInDays !== 1 ? 's' : ''}
                              </span>
                                                        </div>
                                                    )}

                                                    {/* Tags */}
                                                    {tags.length > 0 && (
                                                        <div className="mb-2">
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                                Etiquetas: {tags.length}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col space-y-1 ml-2">
                                                    <button
                                                        onClick={() => handleToggleFavorite(routine)}
                                                        className={`p-1 rounded transition-colors ${
                                                            isFavorite
                                                                ? 'text-yellow-500 hover:text-yellow-600'
                                                                : 'text-gray-400 hover:text-yellow-500'
                                                        }`}
                                                        title="Marcar como favorita"
                                                    >
                                                        <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDuplicateRoutine(routine)}
                                                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                                        title="Duplicar"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteRoutine(routine.id)}
                                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-dark-border pt-2">
                                                <div className="flex items-center justify-between">
                          <span>
                            Actualizada: {updatedAt ? updatedAt.toLocaleDateString() : 'N/A'}
                          </span>
                                                    <span className={`px-2 py-1 rounded-full ${
                                                        visibility === 'shared'
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                                                    }`}>
                            {visibility === 'shared' ? 'Compartida' : 'Privada'}
                          </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SafeRoutineManager;