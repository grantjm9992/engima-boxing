import React, { useState, useEffect } from 'react';
import {
  Plus, X, Save, Copy, Edit3, Trash2, Search, Filter,
  Clock, Target, Tag, Package, Shield, Eye, Star,
  Play, Pause, RotateCcw, Settings, BookOpen, Zap,
  Users, Calendar, ChevronDown, ChevronRight, Heart,
  Folder, BarChart3, Database, FileText, AlertTriangle,
  Timer, Repeat, Loader
} from 'lucide-react';
import { useRoutines, Routine } from '../hooks/useRoutines';
import { Exercise } from './ExerciseEditor';
import BlockEditor, { Block } from './BlockEditor';
import ExerciseEditor from './ExerciseEditor';
import { AdvancedNote } from './AdvancedNotes';
import { MultiTimerExercise } from './MultiTimerExercise';
import RoutineBuilder from './RoutineBuilder';
import CompletionTracker from './CompletionTracker';
import RoutineDatabase from './RoutineDatabase';
import { useRoutineDatabase } from '../hooks/useRoutineDatabase';
import CategoryAnalytics from './CategoryAnalytics';
import RunModeExecutor from './RunModeExecutor';
import TimerPlayback from './TimerPlayback';
import TagManager, { TagType } from './TagManager';
import TagSelector from './TagSelector';
import TagDisplay from './TagDisplay';
import ConfirmDialog from './ConfirmDialog';

interface RoutineManagerProps {
  students: any[]; // StudentProfile[]
  isOpen: boolean;
  onClose: () => void;
}

const RoutineManager: React.FC<RoutineManagerProps> = ({
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

  const [activeView, setActiveView] = useState<'list' | 'builder' | 'categories' | 'tracker' | 'database' | 'analytics' | 'run' | 'tags'>('list');
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'duration'>('updated');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedStudentsForTracking, setSelectedStudentsForTracking] = useState<any[]>([]);
  const [selectedMultiTimerExercise, setSelectedMultiTimerExercise] = useState<MultiTimerExercise | null>(null);
  const [showTimerPlayback, setShowTimerPlayback] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);

  // Tag management state
  const [tags, setTags] = useState<TagType[]>(() => {
    const savedTags = localStorage.getItem('enigma-tags');
    return savedTags ? JSON.parse(savedTags).map((tag: any) => ({
      ...tag,
      createdAt: new Date(tag.createdAt)
    })) : [];
  });

  // Use the routine database hook
  const {
    categories,
    completions,
    createCategory,
    updateCategory,
    deleteCategory,
    addCompletion,
    exportData,
    categoryUsageData
  } = useRoutineDatabase();

  const templateCategories = [
    { value: 'technique', label: 'Técnica' },
    { value: 'physical', label: 'Físico' },
    { value: 'shadow', label: 'Sombra' },
    { value: 'sparring', label: 'Sparring' },
    { value: 'conditioning', label: 'Acondicionamiento' }
  ];

  const difficultyOptions = [
    { value: 'beginner', label: 'Principiante', color: 'bg-green-100 text-green-800' },
    { value: 'intermediate', label: 'Intermedio', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'advanced', label: 'Avanzado', color: 'bg-red-100 text-red-800' }
  ];

  const levelOptions = [
    { value: 'principiante', label: 'Principiante', color: 'bg-green-100 text-green-800' },
    { value: 'intermedio', label: 'Intermedio', color: 'bg-blue-100 text-blue-800' },
    { value: 'avanzado', label: 'Avanzado', color: 'bg-purple-100 text-purple-800' },
    { value: 'competidor', label: 'Competidor', color: 'bg-orange-100 text-orange-800' },
    { value: 'elite', label: 'Élite', color: 'bg-red-100 text-red-800' }
  ];

  // Save tags to localStorage (TODO: Move to API)
  const saveTags = (updatedTags: TagType[]) => {
    try {
      localStorage.setItem('enigma-tags', JSON.stringify(updatedTags));
    } catch (error) {
      console.error('Error saving tags:', error);
    }
  };

  // Tag management functions (TODO: Move to API)
  const handleCreateTag = (tagData: Omit<TagType, 'id' | 'createdAt'>) => {
    const newTag: TagType = {
      ...tagData,
      id: `tag_${Date.now()}`,
      createdAt: new Date()
    };
    const updatedTags = [...tags, newTag];
    setTags(updatedTags);
    saveTags(updatedTags);
  };

  const handleUpdateTag = (id: string, updates: Partial<TagType>) => {
    const updatedTags = tags.map(tag =>
        tag.id === id ? { ...tag, ...updates } : tag
    );
    setTags(updatedTags);
    saveTags(updatedTags);
  };

  const handleDeleteTag = (id: string) => {
    const updatedTags = tags.filter(tag => tag.id !== id);
    setTags(updatedTags);
    saveTags(updatedTags);
  };

  // Filter and sort routines
  const filteredRoutines = routines
      .filter(routine => {
        const matchesSearch = searchTerm === '' ||
            routine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            routine.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = filterCategory === 'all' ||
            (routine.isTemplate && routine.templateCategory === filterCategory) ||
            (!routine.isTemplate && filterCategory === 'routines');

        const matchesDifficulty = filterDifficulty === 'all' || routine.difficulty === filterDifficulty;

        const matchesLevel = filterLevel === 'all' || routine.level === filterLevel;

        const matchesFavorites = !showFavoritesOnly || routine.isFavorite;

        return matchesSearch && matchesCategory && matchesDifficulty && matchesLevel && matchesFavorites;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'created':
            return b.createdAt.getTime() - a.createdAt.getTime();
          case 'updated':
            return b.updatedAt.getTime() - a.updatedAt.getTime();
          case 'duration':
            return a.totalDuration - b.totalDuration;
          default:
            return 0;
        }
      });

  const handleCreateRoutine = async (routineData: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createRoutine(routineData);
      setActiveView('list');
      setSelectedRoutine(null);
    } catch (error) {
      console.error('Error creating routine:', error);
      // Handle error (show notification, etc.)
    }
  };

  const handleUpdateRoutine = async (routineData: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedRoutine) {
      try {
        await updateRoutine(selectedRoutine.id, routineData);
        setActiveView('list');
        setSelectedRoutine(null);
      } catch (error) {
        console.error('Error updating routine:', error);
        // Handle error (show notification, etc.)
      }
    }
  };

  const startEditing = (routine: Routine) => {
    setSelectedRoutine(routine);
    setActiveView('builder');
  };

  const startCreating = () => {
    setSelectedRoutine(null);
    setActiveView('builder');
  };

  const startTracking = (routine: Routine) => {
    setSelectedRoutine(routine);
    setActiveView('tracker');
  };

  const startRunMode = (routine: Routine) => {
    setSelectedRoutine(routine);
    setActiveView('run');
  };

  const handleToggleFavorite = async (routine: Routine) => {
    try {
      await toggleFavorite(routine);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Handle error (show notification, etc.)
    }
  };

  const handleDeleteRoutineClick = (routineId: string) => {
    setRoutineToDelete(routineId);
    setShowConfirmDelete(true);
  };

  const confirmDeleteRoutine = async () => {
    if (routineToDelete) {
      try {
        await deleteRoutine(routineToDelete);
        setRoutineToDelete(null);
        setShowConfirmDelete(false);
      } catch (error) {
        console.error('Error deleting routine:', error);
        // Handle error (show notification, etc.)
      }
    }
  };

  const handleDuplicateRoutine = async (routine: Routine) => {
    try {
      await duplicateRoutine(routine);
    } catch (error) {
      console.error('Error duplicating routine:', error);
      // Handle error (show notification, etc.)
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    return difficultyOptions.find(d => d.value === difficulty)?.color || 'bg-gray-100 text-gray-800';
  };

  const getLevelColor = (level?: string) => {
    if (!level) return 'bg-gray-100 text-gray-800';
    return levelOptions.find(l => l.value === level)?.color || 'bg-gray-100 text-gray-800';
  };

  const getLevelLabel = (level?: string) => {
    if (!level) return '';
    return levelOptions.find(l => l.value === level)?.label || level;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const handlePlayExercise = (exercise: Exercise | MultiTimerExercise) => {
    if ('timers' in exercise) {
      // It's a multi-timer exercise
      setSelectedMultiTimerExercise(exercise);
      setShowTimerPlayback(true);
    }
    // For standard exercises, implement play logic if needed
  };

  const handlePlayBlock = (block: any) => {
    // Implement block play logic if needed
  };

  if (!isOpen) return null;

  // Show loading state
  if (loading && routines.length === 0) {
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
  if (error && routines.length === 0) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl p-8 text-center max-w-md">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error al cargar rutinas</h3>
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
      <>
        {activeView === 'list' && (
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

                    <div className="flex items-center space-x-6">
                      <button
                          onClick={startCreating}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Crear Nueva Rutina</span>
                      </button>

                      <button
                          onClick={() => setActiveView('tags')}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Tag className="w-4 h-4" />
                        <span>Etiquetas</span>
                      </button>

                      <button
                          onClick={() => setActiveView('database')}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Database className="w-4 h-4" />
                        <span>Base de Datos</span>
                      </button>

                      <button
                          onClick={() => setActiveView('analytics')}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Análisis</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
                  <div className="p-6">
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

                    {/* Filters and Search */}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                            placeholder="Buscar rutinas..."
                        />
                      </div>

                      <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                      >
                        <option value="all">Todos los tipos de rutina</option>
                        <option value="routines">Solo rutinas</option>
                        {templateCategories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>

                      <select
                          value={filterDifficulty}
                          onChange={(e) => setFilterDifficulty(e.target.value)}
                          className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                      >
                        <option value="all">Todas las dificultades</option>
                        {difficultyOptions.map(diff => (
                            <option key={diff.value} value={diff.value}>{diff.label}</option>
                        ))}
                      </select>

                      <select
                          value={filterLevel}
                          onChange={(e) => setFilterLevel(e.target.value)}
                          className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                      >
                        <option value="all">Todos los niveles</option>
                        {levelOptions.map(level => (
                            <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>

                      <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="favorites"
                            checked={showFavoritesOnly}
                            onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <label htmlFor="favorites" className="text-sm text-gray-700 dark:text-gray-300">Solo favoritas</label>
                      </div>
                    </div>

                    {/* Routines Grid */}
                    {filteredRoutines.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No se encontraron rutinas</h3>
                          <p>Crea tu primera rutina o ajusta los filtros</p>
                          <button
                              onClick={startCreating}
                              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 mx-auto"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Crear Primera Rutina</span>
                          </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredRoutines.map((routine) => (
                              <div key={routine.id} className="bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border rounded-lg p-4 hover:shadow-md dark:hover:shadow-dark transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h3 className="font-semibold text-gray-900 dark:text-white">{routine.name}</h3>
                                      {routine.isFavorite && (
                                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                      )}
                                      {routine.isTemplate && (
                                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
                                  Plantilla
                                </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{routine.description}</p>
                                    <div className="flex items-center space-x-2 mb-2">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(routine.difficulty)}`}>
                                {difficultyOptions.find(d => d.value === routine.difficulty)?.label}
                              </span>
                                      {routine.level && (
                                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(routine.level)}`}>
                                  {getLevelLabel(routine.level)}
                                </span>
                                      )}
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDuration(routine.totalDuration)}
                              </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                {routine.exercises?.length || 0} ejercicios
                              </span>
                                    </div>

                                    {/* Repetición automática */}
                                    {routine.repeatInDays && (
                                        <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 mb-2">
                                          <Repeat className="w-3 h-3" />
                                          <span>Repetir cada {routine.repeatInDays} día{routine.repeatInDays !== 1 ? 's' : ''}</span>
                                        </div>
                                    )}

                                    {/* Tags Display */}
                                    {routine.tags && routine.tags.length > 0 && (
                                        <div className="mb-2">
                                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Etiquetas:</div>
                                          <TagDisplay
                                              tags={tags}
                                              selectedTagIds={routine.tags}
                                              size="sm"
                                              maxDisplay={2}
                                          />
                                        </div>
                                    )}
                                  </div>

                                  <div className="flex flex-col space-y-1 ml-2">
                                    <button
                                        onClick={() => handleToggleFavorite(routine)}
                                        className={`p-1 rounded transition-colors ${
                                            routine.isFavorite
                                                ? 'text-yellow-500 hover:text-yellow-600'
                                                : 'text-gray-400 hover:text-yellow-500'
                                        }`}
                                        title="Marcar como favorita"
                                    >
                                      <Star className={`w-4 h-4 ${routine.isFavorite ? 'fill-current' : ''}`} />
                                    </button>
                                    <button
                                        onClick={() => startRunMode(routine)}
                                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                        title="Ejecutar rutina"
                                    >
                                      <Play className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => startTracking(routine)}
                                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                        title="Seguimiento de sesión"
                                    >
                                      <BarChart3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => startEditing(routine)}
                                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                        title="Editar"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDuplicateRoutine(routine)}
                                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                        title="Duplicar"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteRoutineClick(routine.id)}
                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                        title="Eliminar"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-dark-border pt-2">
                                  <div className="flex items-center justify-between">
                                    <span>Actualizada: {routine.updatedAt.toLocaleDateString()}</span>
                                    <span className={`px-2 py-1 rounded-full ${
                                        routine.visibility === 'shared'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                                    }`}>
                              {routine.visibility === 'shared' ? 'Compartida' : 'Privada'}
                            </span>
                                  </div>
                                </div>
                              </div>
                          ))}
                        </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Routine Builder */}
        {activeView === 'builder' && (
            <RoutineBuilder
                routine={selectedRoutine || undefined}
                availableTags={tags}
                onSave={selectedRoutine ? handleUpdateRoutine : handleCreateRoutine}
                onCancel={() => {
                  setActiveView('list');
                  setSelectedRoutine(null);
                }}
                onPlayExercise={handlePlayExercise}
                onPlayBlock={handlePlayBlock}
                isOpen={true}
                onOpenTagManager={() => setActiveView('tags')}
            />
        )}

        {/* Tag Manager */}
        {activeView === 'tags' && (
            <TagManager
                tags={tags}
                onCreateTag={handleCreateTag}
                onUpdateTag={handleUpdateTag}
                onDeleteTag={handleDeleteTag}
                isOpen={true}
                onClose={() => setActiveView('list')}
            />
        )}

        {/* Completion Tracker */}
        {activeView === 'tracker' && selectedRoutine && (
            <CompletionTracker
                routine={selectedRoutine}
                attendees={selectedStudentsForTracking}
                onComplete={(completion) => {
                  addCompletion(completion);
                  setActiveView('list');
                  setSelectedRoutine(null);
                  setSelectedStudentsForTracking([]);
                }}
                isOpen={true}
                onClose={() => {
                  setActiveView('list');
                  setSelectedRoutine(null);
                  setSelectedStudentsForTracking([]);
                }}
            />
        )}

        {/* Run Mode Executor */}
        {activeView === 'run' && selectedRoutine && (
            <RunModeExecutor
                routine={selectedRoutine}
                isOpen={true}
                onClose={() => {
                  setActiveView('list');
                  setSelectedRoutine(null);
                }}
                onExitRunMode={() => {
                  setActiveView('list');
                  setSelectedRoutine(null);
                }}
            />
        )}

        {/* Database View */}
        {activeView === 'database' && (
            <RoutineDatabase
                completions={completions}
                students={students}
                isOpen={true}
                onClose={() => setActiveView('list')}
                onExportData={exportData}
            />
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
            <CategoryAnalytics
                categories={categories}
                usageData={categoryUsageData}
                isOpen={true}
                onClose={() => setActiveView('list')}
                onExportData={exportData}
            />
        )}

        {/* Multi-Timer Playback */}
        {showTimerPlayback && selectedMultiTimerExercise && (
            <TimerPlayback
                exercise={selectedMultiTimerExercise}
                isOpen={showTimerPlayback}
                onClose={() => {
                  setShowTimerPlayback(false);
                  setSelectedMultiTimerExercise(null);
                }}
            />
        )}

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
            isOpen={showConfirmDelete}
            title="Eliminar Rutina"
            message="¿Estás seguro de que deseas eliminar esta rutina? Esta acción no se puede deshacer."
            confirmLabel="Eliminar"
            cancelLabel="Cancelar"
            onConfirm={confirmDeleteRoutine}
            onCancel={() => {
              setShowConfirmDelete(false);
              setRoutineToDelete(null);
            }}
            confirmButtonClass="bg-red-600 hover:bg-red-700"
        />
      </>
  );
};

export default RoutineManager;