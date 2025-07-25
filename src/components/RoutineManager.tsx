import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Filter, Edit3, Trash2, Copy, Heart, Play,
  MoreHorizontal, Star, Clock, Users, Target, Zap,
  Settings, Download, Upload, RefreshCw, Loader2, AlertCircle
} from 'lucide-react';
import { useRoutines, type Routine, type Exercise } from '../hooks/useRoutines';
import { useRoutineDatabase } from '../hooks/useRoutineDatabase';
import {useAuth} from "../contexts/AuthContext.tsx";

interface RoutineManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoutine?: (routine: Routine) => void;
  onEditRoutine?: (routine: Routine) => void;
  selectionMode?: boolean;
}

const RoutineManager: React.FC<RoutineManagerProps> = ({
                                                         isOpen,
                                                         onClose,
                                                         onSelectRoutine,
                                                         onEditRoutine,
                                                         selectionMode = false
                                                       }) => {
  const { user } = useAuth();
  const {
    routines,
    isLoading: routinesLoading,
    error: routinesError,
    loadRoutines,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    cloneRoutine,
    toggleRoutineFavorite,
    toggleRoutineActive,
    setError: setRoutinesError
  } = useRoutines();

  const {
    categories,
    tags,
    isLoading: dbLoading,
    error: dbError,
    setError: setDbError
  } = useRoutineDatabase();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'duration'>('updated');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showTemplatesOnly, setShowTemplatesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedRoutines, setSelectedRoutines] = useState<string[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);

  // Load routines when component opens
  useEffect(() => {
    if (isOpen) {
      loadRoutinesData();
    }
  }, [isOpen]);

  const loadRoutinesData = async () => {
    try {
      await loadRoutines({
        search: searchTerm,
        category_id: filterCategory !== 'all' ? filterCategory : undefined,
        difficulty: filterDifficulty !== 'all' ? filterDifficulty : undefined,
        level: filterLevel !== 'all' ? filterLevel : undefined,
        is_favorite: showFavoritesOnly || undefined,
        is_template: showTemplatesOnly || undefined,
        sort_by: sortBy,
        sort_direction: 'desc',
        per_page: 50
      });
    } catch (error) {
      console.error('Failed to load routines:', error);
    }
  };

  // Reload when filters change
  useEffect(() => {
    if (isOpen) {
      const debounceTimer = setTimeout(() => {
        loadRoutinesData();
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, filterCategory, filterDifficulty, filterLevel, sortBy, showFavoritesOnly, showTemplatesOnly]);

  const handleCreateRoutine = () => {
    // This would open a create routine modal/form
    if (onEditRoutine) {
      onEditRoutine(null as any); // Signal to create new routine
    }
  };

  const handleEditRoutine = (routine: Routine) => {
    if (onEditRoutine) {
      onEditRoutine(routine);
    }
  };

  const handleDeleteRoutine = async (routineId: string) => {
    try {
      const success = await deleteRoutine(routineId);
      if (success) {
        setShowConfirmDelete(false);
        setRoutineToDelete(null);
        // Reload routines
        loadRoutinesData();
      }
    } catch (error) {
      console.error('Failed to delete routine:', error);
    }
  };

  const handleCloneRoutine = async (routine: Routine) => {
    try {
      const cloned = await cloneRoutine(routine.id, {
        name: `${routine.name} (Copia)`,
        visibility: 'private',
        isFavorite: false
      });
      if (cloned) {
        // Reload routines to show the new clone
        loadRoutinesData();
      }
    } catch (error) {
      console.error('Failed to clone routine:', error);
    }
  };

  const handleToggleFavorite = async (routineId: string) => {
    try {
      await toggleRoutineFavorite(routineId);
      // The state is updated automatically by the hook
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleToggleActive = async (routineId: string) => {
    try {
      await toggleRoutineActive(routineId);
      // The state is updated automatically by the hook
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'principiante': return 'text-blue-600 bg-blue-100';
      case 'intermedio': return 'text-purple-600 bg-purple-100';
      case 'avanzado': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      if (routinesError) setRoutinesError(null);
      if (dbError) setDbError(null);
    };
  }, [routinesError, dbError, setRoutinesError, setDbError]);

  if (!isOpen) return null;

  const isLoading = routinesLoading || dbLoading;
  const error = routinesError || dbError;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectionMode ? 'Seleccionar Rutina' : 'Gestión de Rutinas'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectionMode
                        ? 'Elige una rutina para usar en tu clase'
                        : 'Crea y administra rutinas de entrenamiento'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!selectionMode && (
                    <button
                        onClick={handleCreateRoutine}
                        disabled={isLoading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nueva Rutina</span>
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-lg transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-200 dark:border-dark-border">
            {/* Error Display */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                  <button
                      onClick={() => {
                        setRoutinesError(null);
                        setDbError(null);
                      }}
                      className="ml-auto text-red-700 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
            )}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-dark-surface dark:text-white"
                    placeholder="Buscar rutinas..."
                    disabled={isLoading}
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center space-x-3">
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-dark-surface dark:text-white text-sm"
                    disabled={isLoading}
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                  ))}
                </select>

                <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-dark-surface dark:text-white text-sm"
                    disabled={isLoading}
                >
                  <option value="all">Todas las dificultades</option>
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-dark-surface dark:text-white text-sm"
                    disabled={isLoading}
                >
                  <option value="updated">Última actualización</option>
                  <option value="created">Fecha de creación</option>
                  <option value="name">Nombre</option>
                  <option value="duration">Duración</option>
                </select>

                <button
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`px-3 py-2 rounded-lg transition-colors text-sm flex items-center space-x-1 ${
                        showFavoritesOnly
                            ? 'bg-purple-600 text-white'
                            : 'border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-elevated'
                    }`}
                    disabled={isLoading}
                >
                  <Heart className="w-4 h-4" />
                  <span>Favoritas</span>
                </button>

                <button
                    onClick={() => setShowTemplatesOnly(!showTemplatesOnly)}
                    className={`px-3 py-2 rounded-lg transition-colors text-sm flex items-center space-x-1 ${
                        showTemplatesOnly
                            ? 'bg-purple-600 text-white'
                            : 'border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-elevated'
                    }`}
                    disabled={isLoading}
                >
                  <Star className="w-4 h-4" />
                  <span>Plantillas</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading && routines.length === 0 ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
                  <p className="text-gray-500 dark:text-gray-400">Cargando rutinas...</p>
                </div>
            ) : routines.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Target className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-semibold mb-2">No hay rutinas disponibles</h3>
                  <p className="mb-4">
                    {searchTerm
                        ? `No se encontraron rutinas que coincidan con "${searchTerm}"`
                        : 'Aún no has creado ninguna rutina'
                    }
                  </p>
                  {!selectionMode && !searchTerm && (
                      <button
                          onClick={handleCreateRoutine}
                          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Crear primera rutina</span>
                      </button>
                  )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {routines.map((routine) => (
                      <div
                          key={routine.id}
                          className={`bg-white dark:bg-dark-elevated rounded-lg border border-gray-200 dark:border-dark-border p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                              selectedRoutines.includes(routine.id) ? 'ring-2 ring-purple-500' : ''
                          }`}
                          onClick={() => {
                            if (selectionMode && onSelectRoutine) {
                              onSelectRoutine(routine);
                            }
                          }}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                              {routine.name}
                            </h3>
                            {routine.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {routine.description}
                                </p>
                            )}
                          </div>
                          {!selectionMode && (
                              <div className="flex items-center space-x-1 ml-2">
                                <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleFavorite(routine.id);
                                    }}
                                    className={`p-1 rounded transition-colors ${
                                        routine.isFavorite
                                            ? 'text-red-500 hover:text-red-600'
                                            : 'text-gray-400 hover:text-red-500'
                                    }`}
                                >
                                  <Heart className={`w-4 h-4 ${routine.isFavorite ? 'fill-current' : ''}`} />
                                </button>
                                <div className="relative group">
                                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                    <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditRoutine(routine);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-elevated flex items-center space-x-2"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                      <span>Editar</span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCloneRoutine(routine);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-elevated flex items-center space-x-2"
                                    >
                                      <Copy className="w-4 h-4" />
                                      <span>Duplicar</span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setRoutineToDelete(routine.id);
                                          setShowConfirmDelete(true);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center space-x-2"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span>Eliminar</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                          )}
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(routine.difficulty)}`}>
                      {routine.difficulty}
                    </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(routine.level)}`}>
                      {routine.level}
                    </span>
                          {routine.isTemplate && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium text-purple-600 bg-purple-100">
                        Plantilla
                      </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDuration(routine.totalDuration)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Zap className="w-4 h-4" />
                            <span>{routine.blocks.length} bloques</span>
                          </div>
                        </div>

                        {/* Tags */}
                        {routine.tags && routine.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {routine.tags.slice(0, 3).map((tag, index) => (
                                  <span
                                      key={index}
                                      className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400"
                                  >
                          #{tag}
                        </span>
                              ))}
                              {routine.tags.length > 3 && (
                                  <span className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400">
                          +{routine.tags.length - 3}
                        </span>
                              )}
                            </div>
                        )}

                        {/* Action Button */}
                        {selectionMode && (
                            <button
                                onClick={() => onSelectRoutine && onSelectRoutine(routine)}
                                className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                            >
                              <Play className="w-4 h-4" />
                              <span>Seleccionar</span>
                            </button>
                        )}
                      </div>
                  ))}
                </div>
            )}
          </div>

          {/* Confirmation Modal */}
          {showConfirmDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Confirmar eliminación
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    ¿Estás seguro de que quieres eliminar esta rutina? Esta acción no se puede deshacer.
                  </p>
                  <div className="flex space-x-3">
                    <button
                        onClick={() => routineToDelete && handleDeleteRoutine(routineToDelete)}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Eliminando...' : 'Eliminar'}
                    </button>
                    <button
                        onClick={() => {
                          setShowConfirmDelete(false);
                          setRoutineToDelete(null);
                        }}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

export default RoutineManager;