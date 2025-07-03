import React, { useState, useEffect } from 'react';
import { 
  Plus, X, Save, Copy, Edit3, Trash2, Search, Filter, 
  Clock, Target, Tag, Package, Shield, Eye, Star,
  Play, Pause, RotateCcw, Settings, BookOpen, Zap,
  Users, Calendar, ChevronDown, ChevronRight, Heart,
  Folder, BarChart3, Database, FileText, AlertTriangle,
  Timer, Repeat
} from 'lucide-react';
import { Routine, Exercise } from './RoutineManager';
import { Category } from './CategoryManager';
import CategorySelector from './CategorySelector';
import BlockEditor, { Block } from './BlockEditor';
import ExerciseEditor from './ExerciseEditor';
import { AdvancedNote } from './AdvancedNotes';
import { MultiTimerExercise } from './MultiTimerExercise';
import { TagType } from './TagManager';
import TagSelector from './TagSelector';

interface RoutineBuilderProps {
  routine?: Routine;
  availableCategories: Category[];
  availableTags?: TagType[];
  onSave: (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  onPlayExercise?: (exercise: Exercise | MultiTimerExercise) => void;
  onPlayBlock?: (block: Block) => void;
  isOpen: boolean;
  onOpenCategoryManager?: () => void;
  onOpenTagManager?: () => void;
}

const RoutineBuilder: React.FC<RoutineBuilderProps> = ({
  routine,
  availableCategories,
  availableTags = [],
  onSave,
  onCancel,
  onPlayExercise,
  onPlayBlock,
  isOpen,
  onOpenCategoryManager,
  onOpenTagManager
}) => {
  const [formData, setFormData] = useState<Partial<Routine>>({
    name: '',
    description: '',
    objective: '',
    exercises: [],
    categories: [],
    materials: [],
    protection: [],
    totalDuration: 0,
    difficulty: 'intermediate',
    visibility: 'private',
    isTemplate: false,
    isFavorite: false,
    trainerNotes: '',
    blockStructure: {
      blocks: []
    },
    tags: [],
    repeatInDays: 0,
    level: 'intermedio'
  });
  
  const [activeTab, setActiveTab] = useState<'structure' | 'details'>('structure');
  const [editingExercise, setEditingExercise] = useState<Exercise | MultiTimerExercise | null>(null);
  const [isExerciseEditorOpen, setIsExerciseEditorOpen] = useState(false);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [isMultiTimerExercise, setIsMultiTimerExercise] = useState(false);

  // Initialize form data from routine prop
  useEffect(() => {
    if (routine) {
      setFormData({
        ...routine,
        blockStructure: routine.blockStructure || {
          blocks: []
        },
        tags: routine.tags || [],
        repeatInDays: routine.repeatInDays || 0,
        level: routine.level || 'intermedio'
      });
    }
  }, [routine]);

  const handleAddBlock = () => {
    const newBlock: Block = {
      id: `block_${Date.now()}`,
      name: `Módulo ${(formData.blockStructure?.blocks.length || 0) + 1}`,
      description: '',
      color: getRandomColor(),
      exercises: [],
      notes: '',
      advancedNotes: null,
      estimatedDuration: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: []
    };
    
    setFormData(prev => ({
      ...prev,
      blockStructure: {
        blocks: [...(prev.blockStructure?.blocks || []), newBlock]
      }
    }));
    
    setSelectedBlockIndex((formData.blockStructure?.blocks.length || 0));
  };

  const handleUpdateBlock = (index: number, updates: Partial<Block>) => {
    const updatedBlocks = [...(formData.blockStructure?.blocks || [])];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      ...updates,
      updatedAt: new Date()
    };
    
    setFormData(prev => ({
      ...prev,
      blockStructure: {
        blocks: updatedBlocks
      }
    }));
  };

  const handleRemoveBlock = (index: number) => {
    const updatedBlocks = [...(formData.blockStructure?.blocks || [])];
    updatedBlocks.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      blockStructure: {
        blocks: updatedBlocks
      }
    }));
    
    if (selectedBlockIndex === index) {
      setSelectedBlockIndex(null);
    } else if (selectedBlockIndex !== null && selectedBlockIndex > index) {
      setSelectedBlockIndex(selectedBlockIndex - 1);
    }
  };

  const handleAddExerciseToBlock = (blockIndex: number, isMultiTimer: boolean = false) => {
    setIsMultiTimerExercise(isMultiTimer);
    
    if (isMultiTimer) {
      const newExercise: MultiTimerExercise = {
        id: `exercise_${Date.now()}`,
        name: 'Nuevo Ejercicio Multifase',
        description: '',
        timers: [],
        rounds: 1,
        tags: [],
        level: 'intermedio'
      };
      setEditingExercise(newExercise);
    } else {
      const newExercise: Exercise = {
        id: `exercise_${Date.now()}`,
        name: 'Nuevo Ejercicio',
        description: '',
        duration: 180, // 3 minutes
        restTime: 60, // 1 minute
        rounds: 1,
        intensity: 'medium',
        category: 'technique',
        instructions: [],
        materials: [],
        protection: [],
        categories: [],
        advancedNotes: null,
        tags: [],
        level: 'intermedio',
        variants: {}
      };
      setEditingExercise(newExercise);
    }
    
    setIsExerciseEditorOpen(true);
    setSelectedBlockIndex(blockIndex);
  };

  const handleSaveExercise = (exercise: Exercise | MultiTimerExercise) => {
    if (selectedBlockIndex === null) return;
    
    const updatedBlocks = [...(formData.blockStructure?.blocks || [])];
    const blockExercises = [...updatedBlocks[selectedBlockIndex].exercises];
    
    const existingIndex = blockExercises.findIndex(ex => ex.id === exercise.id);
    
    if (existingIndex >= 0) {
      blockExercises[existingIndex] = exercise;
    } else {
      blockExercises.push(exercise);
    }
    
    updatedBlocks[selectedBlockIndex] = {
      ...updatedBlocks[selectedBlockIndex],
      exercises: blockExercises,
      updatedAt: new Date()
    };
    
    setFormData(prev => ({
      ...prev,
      blockStructure: {
        blocks: updatedBlocks
      }
    }));
    
    setIsExerciseEditorOpen(false);
    setEditingExercise(null);
    setIsMultiTimerExercise(false);
  };

  const handleEditExercise = (exercise: Exercise | MultiTimerExercise) => {
    setIsMultiTimerExercise('timers' in exercise);
    setEditingExercise({ ...exercise });
    setIsExerciseEditorOpen(true);
  };

  const handleDuplicateExercise = (exercise: Exercise | MultiTimerExercise) => {
    if (selectedBlockIndex === null) return;
    
    const isMultiTimer = 'timers' in exercise;
    
    let duplicatedExercise;
    
    if (isMultiTimer) {
      duplicatedExercise = {
        ...exercise,
        id: `exercise_${Date.now()}`,
        name: `${exercise.name} (Copia)`,
        tags: [...(exercise.tags || [])]
      } as MultiTimerExercise;
    } else {
      duplicatedExercise = {
        ...exercise,
        id: `exercise_${Date.now()}`,
        name: `${exercise.name} (Copia)`,
        tags: [...(exercise.tags || [])],
        variants: exercise.variants ? JSON.parse(JSON.stringify(exercise.variants)) : {}
      } as Exercise;
    }
    
    const updatedBlocks = [...(formData.blockStructure?.blocks || [])];
    updatedBlocks[selectedBlockIndex] = {
      ...updatedBlocks[selectedBlockIndex],
      exercises: [...updatedBlocks[selectedBlockIndex].exercises, duplicatedExercise],
      updatedAt: new Date()
    };
    
    setFormData(prev => ({
      ...prev,
      blockStructure: {
        blocks: updatedBlocks
      }
    }));
  };

  const handleRemoveExercise = (blockIndex: number, exerciseId: string) => {
    const updatedBlocks = [...(formData.blockStructure?.blocks || [])];
    updatedBlocks[blockIndex] = {
      ...updatedBlocks[blockIndex],
      exercises: updatedBlocks[blockIndex].exercises.filter(ex => ex.id !== exerciseId),
      updatedAt: new Date()
    };
    
    setFormData(prev => ({
      ...prev,
      blockStructure: {
        blocks: updatedBlocks
      }
    }));
  };

  const handleSaveRoutine = () => {
    // Calculate total duration from blocks
    const totalDuration = (formData.blockStructure?.blocks || []).reduce((total, block) => {
      const blockDuration = block.exercises.reduce((sum, exercise) => {
        if ('timers' in exercise) {
          // Multi-timer exercise
          const multiTimerExercise = exercise as MultiTimerExercise;
          const timersDuration = multiTimerExercise.timers.reduce((timerSum, timer) => {
            const timerTime = timer.duration * timer.repetitions;
            const restTime = timer.restBetween ? timer.restBetween * (timer.repetitions - 1) : 0;
            return timerSum + timerTime + restTime;
          }, 0);
          
          const globalRest = multiTimerExercise.globalRestTime || 0;
          const exerciseDuration = (timersDuration + globalRest) * multiTimerExercise.rounds / 60; // convert to minutes
          return sum + exerciseDuration;
        } else {
          // Standard exercise
          const standardExercise = exercise as Exercise;
          const exerciseDuration = (standardExercise.duration * standardExercise.rounds) / 60; // convert to minutes
          const restDuration = (standardExercise.restTime * (standardExercise.rounds - 1)) / 60; // rest between rounds
          return sum + exerciseDuration + restDuration;
        }
      }, 0);
      return total + blockDuration;
    }, 0);
    
    // Collect all exercises from blocks
    const allExercises = (formData.blockStructure?.blocks || []).flatMap(block => block.exercises);
    
    // Collect all materials and protection from exercises
    const allMaterials = Array.from(new Set(allExercises
      .filter(ex => !('timers' in ex)) // Filter out multi-timer exercises
      .flatMap(ex => (ex as Exercise).materials)));
      
    const allProtection = Array.from(new Set(allExercises
      .filter(ex => !('timers' in ex)) // Filter out multi-timer exercises
      .flatMap(ex => (ex as Exercise).protection)));
    
    onSave({
      ...formData as Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>,
      exercises: allExercises,
      materials: allMaterials.map(name => ({ id: `material_${Date.now()}_${Math.random()}`, name, required: false, category: 'equipment' })),
      protection: allProtection,
      totalDuration: Math.round(totalDuration),
      tags: formData.tags || [],
      repeatInDays: formData.repeatInDays || 0,
      level: formData.level || 'intermedio'
    });
  };

  const getRandomColor = () => {
    const colors = [
      '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
      '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
      '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const calculateTotalDuration = () => {
    return (formData.blockStructure?.blocks || []).reduce((total, block) => {
      const blockDuration = block.exercises.reduce((sum, exercise) => {
        if ('timers' in exercise) {
          // Multi-timer exercise
          const multiTimerExercise = exercise as MultiTimerExercise;
          const timersDuration = multiTimerExercise.timers.reduce((timerSum, timer) => {
            const timerTime = timer.duration * timer.repetitions;
            const restTime = timer.restBetween ? timer.restBetween * (timer.repetitions - 1) : 0;
            return timerSum + timerTime + restTime;
          }, 0);
          
          const globalRest = multiTimerExercise.globalRestTime || 0;
          const exerciseDuration = (timersDuration + globalRest) * multiTimerExercise.rounds / 60; // convert to minutes
          return sum + exerciseDuration;
        } else {
          // Standard exercise
          const standardExercise = exercise as Exercise;
          const exerciseDuration = (standardExercise.duration * standardExercise.rounds) / 60; // convert to minutes
          const restDuration = (standardExercise.restTime * (standardExercise.rounds - 1)) / 60; // rest between rounds
          return sum + exerciseDuration + restDuration;
        }
      }, 0);
      return total + blockDuration;
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-red-600 to-red-700 text-white">
          <button
            onClick={onCancel}
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
                <h1 className="text-2xl font-bold">
                  {routine ? 'Editar Rutina' : 'Nueva Rutina'}
                </h1>
                <p className="text-red-100">Diseña una rutina completa con módulos y ejercicios</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('structure')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'structure' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                Estructura
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'details' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                Detalles
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          {activeTab === 'structure' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Blocks List */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Módulos
                    </h3>
                    <button
                      onClick={handleAddBlock}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      title="Añadir módulo"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {(formData.blockStructure?.blocks || []).map((block, index) => (
                    <div 
                      key={block.id} 
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedBlockIndex === index
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-dark-border hover:border-red-300 dark:hover:border-red-600'
                      }`}
                      onClick={() => setSelectedBlockIndex(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: block.color }}
                          >
                            <span>{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{block.name}</h4>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>{block.exercises.length} ejercicio{block.exercises.length !== 1 ? 's' : ''}</span>
                              {block.advancedNotes && (
                                <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                                  <FileText className="w-3 h-3" />
                                  <span>Material</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBlock(index);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Eliminar módulo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {(formData.blockStructure?.blocks || []).length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p>No hay módulos creados</p>
                      <p className="text-sm">Añade módulos para organizar los ejercicios</p>
                    </div>
                  )}
                </div>

                {/* Block Editor */}
                <div className="lg:col-span-2">
                  {selectedBlockIndex !== null && formData.blockStructure?.blocks[selectedBlockIndex] ? (
                    <div className="space-y-4">
                      <BlockEditor
                        block={formData.blockStructure.blocks[selectedBlockIndex]}
                        availableTags={availableTags}
                        onUpdateBlock={(updates) => handleUpdateBlock(selectedBlockIndex, updates)}
                        onAddExercise={() => handleAddExerciseToBlock(selectedBlockIndex, false)}
                        onEditExercise={handleEditExercise}
                        onDuplicateExercise={handleDuplicateExercise}
                        onRemoveExercise={(exerciseId) => handleRemoveExercise(selectedBlockIndex, exerciseId)}
                        onPlayExercise={onPlayExercise}
                        onPlayBlock={onPlayBlock ? () => onPlayBlock(formData.blockStructure!.blocks[selectedBlockIndex]) : undefined}
                        onOpenTagManager={onOpenTagManager}
                      />
                      
                      {/* Add Multi-Timer Exercise Button */}
                      <button
                        onClick={() => handleAddExerciseToBlock(selectedBlockIndex, true)}
                        className="w-full p-3 border-2 border-dashed border-red-300 dark:border-red-600 rounded-lg hover:border-red-600 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center space-x-2 text-red-600 dark:text-red-400"
                      >
                        <Timer className="w-4 h-4" />
                        <span>Añadir Ejercicio Multifase</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <Target className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Selecciona un módulo
                      </h3>
                      <p>Selecciona un módulo para editarlo o crea uno nuevo</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 dark:bg-dark-elevated rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Información General
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre de la Rutina *
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                        placeholder="Ej: Entrenamiento técnico avanzado"
                        required
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tipo de Rutina
                        </label>
                        {onOpenCategoryManager && (
                          <button
                            onClick={onOpenCategoryManager}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Gestionar tipos
                          </button>
                        )}
                      </div>
                      <CategorySelector
                        availableCategories={availableCategories}
                        selectedCategories={formData.categories || []}
                        onCategoriesChange={(categories) => setFormData({ ...formData, categories })}
                        onCreateCategory={onOpenCategoryManager}
                        placeholder="Seleccionar tipo de rutina..."
                        multiple={true}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                      rows={2}
                      placeholder="Descripción general de la rutina..."
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Objetivo de la Sesión
                    </label>
                    <textarea
                      value={formData.objective || ''}
                      onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                      rows={2}
                      placeholder="¿Qué se busca lograr con esta rutina?"
                    />
                  </div>
                  
                  {/* Tags Selector */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Etiquetas
                      </label>
                      {onOpenTagManager && (
                        <button
                          onClick={onOpenTagManager}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Gestionar etiquetas
                        </button>
                      )}
                    </div>
                    <TagSelector
                      availableTags={availableTags}
                      selectedTags={formData.tags || []}
                      onTagsChange={(tags) => setFormData({ ...formData, tags })}
                      onCreateTag={onOpenTagManager}
                      placeholder="Seleccionar etiquetas..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Dificultad
                      </label>
                      <select
                        value={formData.difficulty || 'intermediate'}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                      >
                        <option value="beginner">Principiante</option>
                        <option value="intermediate">Intermedio</option>
                        <option value="advanced">Avanzado</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nivel
                      </label>
                      <select
                        value={formData.level || 'intermedio'}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                      >
                        <option value="principiante">Principiante</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="avanzado">Avanzado</option>
                        <option value="competidor">Competidor</option>
                        <option value="elite">Élite</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Visibilidad
                      </label>
                      <select
                        value={formData.visibility || 'private'}
                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                      >
                        <option value="private">Privada (solo entrenador)</option>
                        <option value="shared">Compartida (visible para estudiantes)</option>
                      </select>
                    </div>
                  </div>

                  {/* Repetición automática */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Repetición Automática (días)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={formData.repeatInDays || 0}
                        onChange={(e) => setFormData({ ...formData, repeatInDays: parseInt(e.target.value) || 0 })}
                        className="w-24 px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.repeatInDays && formData.repeatInDays > 0 
                          ? `Repetir cada ${formData.repeatInDays} día${formData.repeatInDays !== 1 ? 's' : ''}` 
                          : 'Sin repetición automática'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Establece en 0 para desactivar la repetición automática
                    </p>
                  </div>
                </div>

                {/* Trainer Notes */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span>Notas del Entrenador</span>
                  </h3>
                  
                  <textarea
                    value={formData.trainerNotes || ''}
                    onChange={(e) => setFormData({ ...formData, trainerNotes: e.target.value })}
                    className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-dark-surface dark:text-white"
                    rows={4}
                    placeholder="Notas privadas para el entrenador, consideraciones especiales, recordatorios..."
                  />
                  
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                    ⚠️ Estas notas son privadas y solo visibles para el entrenador
                  </p>
                </div>

                {/* Options */}
                <div className="bg-gray-50 dark:bg-dark-elevated rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Opciones Adicionales
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isTemplate"
                        checked={formData.isTemplate || false}
                        onChange={(e) => setFormData({ ...formData, isTemplate: e.target.checked })}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <label htmlFor="isTemplate" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Guardar como plantilla
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isFavorite"
                        checked={formData.isFavorite || false}
                        onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <label htmlFor="isFavorite" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Marcar como favorita
                      </label>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Resumen
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Módulos</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formData.blockStructure?.blocks.length || 0}
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Ejercicios</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formData.blockStructure?.blocks.reduce((sum, block) => sum + block.exercises.length, 0) || 0}
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Duración Total</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.round(calculateTotalDuration())} min
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Material Audiovisual</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formData.blockStructure?.blocks.filter(block => block.advancedNotes !== null).length || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-dark-elevated border-t border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formData.blockStructure?.blocks.length || 0} módulo(s) • 
              {formData.blockStructure?.blocks.reduce((sum, block) => sum + block.exercises.length, 0) || 0} ejercicio(s) • 
              {Math.round(calculateTotalDuration())} minutos
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRoutine}
                disabled={!formData.name?.trim() || (formData.blockStructure?.blocks.length || 0) === 0}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Rutina</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Editor Modal */}
      {isExerciseEditorOpen && editingExercise && !isMultiTimerExercise && (
        <ExerciseEditor
          exercise={editingExercise as Exercise}
          availableTags={availableTags}
          onSave={handleSaveExercise}
          onCancel={() => {
            setIsExerciseEditorOpen(false);
            setEditingExercise(null);
          }}
          isOpen={isExerciseEditorOpen}
          onOpenTagManager={onOpenTagManager}
        />
      )}

      {/* Multi-Timer Exercise Editor */}
      {isExerciseEditorOpen && editingExercise && isMultiTimerExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-red-600 to-red-700 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  Ejercicio Multifase
                </h2>
                <button
                  onClick={() => {
                    setIsExerciseEditorOpen(false);
                    setEditingExercise(null);
                  }}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <MultiTimerExercise
                exercise={editingExercise as MultiTimerExercise}
                onUpdate={(updatedExercise) => setEditingExercise(updatedExercise)}
                isEditing={true}
                availableTags={availableTags}
                onOpenTagManager={onOpenTagManager}
              />
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 dark:bg-dark-elevated border-t border-gray-200 dark:border-dark-border">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsExerciseEditorOpen(false);
                    setEditingExercise(null);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleSaveExercise(editingExercise as MultiTimerExercise)}
                  disabled={!(editingExercise as MultiTimerExercise).name?.trim()}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineBuilder;