import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Clock, Target, Tag, Edit3, Play, Copy, Loader2 } from 'lucide-react';
import { apiService } from '../services/apiService';

interface Exercise {
  id: string;
  name: string;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  work_type: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description?: string;
  instructions?: string[];
  tags?: string[];
  materials?: string[];
  protection?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface RoutineBuilderProps {
  routine?: any;
  availableTags?: any[];
  onSave: (routine: any) => void;
  onCancel: () => void;
  isOpen: boolean;
  onOpenTagManager?: () => void;
}

interface Block {
  id: string;
  name: string;
  exercises: Exercise[];
  duration: number;
}

const RoutineBuilder: React.FC<RoutineBuilderProps> = ({
                                                         routine,
                                                         availableTags = [],
                                                         onSave,
                                                         onCancel,
                                                         isOpen,
                                                         onOpenTagManager
                                                       }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    objective: '',
    difficulty: 'intermediate',
    level: 'intermedio',
    visibility: 'private',
    isTemplate: false,
    isFavorite: false,
    blocks: [] as Block[],
    tags: [] as string[],
    materials: [] as string[],
    protection: [] as string[],
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'blocks' | 'details'>('basic');
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  // API state for exercises
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [exercisesError, setExercisesError] = useState<string | null>(null);

  // Load exercises from API when component mounts
  useEffect(() => {
    if (isOpen) {
      loadExercises();
    }
  }, [isOpen]);

  const loadExercises = async () => {
    setExercisesLoading(true);
    setExercisesError(null);

    try {
      const response = await apiService.exercises.getAll({
        active: true,
        per_page: 100 // Get more exercises for selection
      });

      if (response.exercises && Array.isArray(response.exercises)) {
        setAvailableExercises(response.exercises);
      } else {
        throw new Error('Invalid exercises response format');
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
      setExercisesError(error instanceof Error ? error.message : 'Error loading exercises');
      setAvailableExercises([]);
    } finally {
      setExercisesLoading(false);
    }
  };

  // Initialize form data from routine prop
  useEffect(() => {
    if (routine) {
      setFormData({
        name: routine.name || '',
        description: routine.description || '',
        objective: routine.objective || '',
        difficulty: routine.difficulty || 'intermediate',
        level: routine.level || 'intermedio',
        visibility: routine.visibility || 'private',
        isTemplate: routine.isTemplate || false,
        isFavorite: routine.isFavorite || false,
        blocks: routine.blocks || [],
        tags: routine.tags || [],
        materials: routine.materials || [],
        protection: routine.protection || [],
      });
    } else {
      // Reset form for new routine
      setFormData({
        name: '',
        description: '',
        objective: '',
        difficulty: 'intermediate',
        level: 'intermedio',
        visibility: 'private',
        isTemplate: false,
        isFavorite: false,
        blocks: [],
        tags: [],
        materials: [],
        protection: [],
      });
    }
  }, [routine]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotalDuration = () => {
    return formData.blocks.reduce((total, block) => {
      const blockDuration = block.exercises.reduce((blockTotal, exercise) => blockTotal + exercise.duration, 0);
      return total + blockDuration;
    }, 0);
  };

  const calculateBlockDuration = (block: Block) => {
    return block.exercises.reduce((total, exercise) => total + exercise.duration, 0);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('El nombre de la rutina es obligatorio');
      return;
    }

    const routineData = {
      ...formData,
      totalDuration: calculateTotalDuration(),
      // Convert to API format
      total_duration: calculateTotalDuration(),
      is_template: formData.isTemplate,
      is_favorite: formData.isFavorite,
      category_ids: [], // You might want to add category selection
    };

    onSave(routineData);
  };

  const addBlock = () => {
    const newBlock: Block = {
      id: `block_${Date.now()}`,
      name: `Bloque ${formData.blocks.length + 1}`,
      exercises: [],
      duration: 0
    };

    setFormData(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };

  const updateBlock = (index: number, updates: Partial<Block>) => {
    const updatedBlocks = [...formData.blocks];
    updatedBlocks[index] = { ...updatedBlocks[index], ...updates };

    setFormData(prev => ({
      ...prev,
      blocks: updatedBlocks
    }));
  };

  const removeBlock = (index: number) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index)
    }));
  };

  const addExerciseToBlock = (blockIndex: number, exercise: Exercise) => {
    const updatedBlocks = [...formData.blocks];
    updatedBlocks[blockIndex].exercises.push({ ...exercise });

    setFormData(prev => ({
      ...prev,
      blocks: updatedBlocks
    }));
  };

  const updateExerciseInBlock = (blockIndex: number, exerciseIndex: number, updates: Partial<Exercise>) => {
    const updatedBlocks = [...formData.blocks];
    updatedBlocks[blockIndex].exercises[exerciseIndex] = {
      ...updatedBlocks[blockIndex].exercises[exerciseIndex],
      ...updates
    };

    setFormData(prev => ({
      ...prev,
      blocks: updatedBlocks
    }));
  };

  const removeExerciseFromBlock = (blockIndex: number, exerciseIndex: number) => {
    const updatedBlocks = [...formData.blocks];
    updatedBlocks[blockIndex].exercises.splice(exerciseIndex, 1);

    setFormData(prev => ({
      ...prev,
      blocks: updatedBlocks
    }));
  };

  const openExerciseModal = (blockIndex: number, exercise?: Exercise) => {
    setCurrentBlockIndex(blockIndex);
    setEditingExercise(exercise || null);
    setShowExerciseModal(true);
  };

  const handleExerciseModalSave = (exercise: Exercise) => {
    if (currentBlockIndex !== null) {
      if (editingExercise) {
        // Update existing exercise
        const exerciseIndex = formData.blocks[currentBlockIndex].exercises.findIndex(ex => ex.id === exercise.id);
        if (exerciseIndex >= 0) {
          updateExerciseInBlock(currentBlockIndex, exerciseIndex, exercise);
        }
      } else {
        // Add new exercise
        addExerciseToBlock(currentBlockIndex, {
          ...exercise,
          id: `exercise_${Date.now()}`
        });
      }
    }
    setShowExerciseModal(false);
    setCurrentBlockIndex(null);
    setEditingExercise(null);
  };

  const addTag = (tagName: string) => {
    if (tagName.trim() && !formData.tags.includes(tagName.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagName.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {routine ? 'Editar Rutina' : 'Nueva Rutina'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {routine ? 'Modifica los detalles de la rutina' : 'Crea una nueva rutina de entrenamiento'}
                  </p>
                </div>
              </div>
              <button
                  onClick={onCancel}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 border-b border-gray-200 dark:border-dark-border">
            <div className="flex space-x-6">
              {[
                { id: 'basic', label: 'Básico', icon: Target },
                { id: 'blocks', label: 'Bloques', icon: Plus },
                { id: 'details', label: 'Detalles', icon: Tag }
              ].map(({ id, label, icon: Icon }) => (
                  <button
                      key={id}
                      onClick={() => setActiveTab(id as any)}
                      className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                          activeTab === id
                              ? 'border-red-500 text-red-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre de la Rutina *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                        placeholder="Ej: Entrenamiento de Técnica Básica"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descripción
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                        placeholder="Describe los objetivos y contenido de la rutina..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Objetivo
                    </label>
                    <input
                        type="text"
                        value={formData.objective}
                        onChange={(e) => handleInputChange('objective', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                        placeholder="Ej: Mejorar técnica de jab y coordinación"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Dificultad
                      </label>
                      <select
                          value={formData.difficulty}
                          onChange={(e) => handleInputChange('difficulty', e.target.value)}
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
                          value={formData.level}
                          onChange={(e) => handleInputChange('level', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                      >
                        <option value="principiante">Principiante</option>
                        <option value="intermedio">Intermedio</option>
                        <option value="avanzado">Avanzado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Visibilidad
                      </label>
                      <select
                          value={formData.visibility}
                          onChange={(e) => handleInputChange('visibility', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                      >
                        <option value="private">Privada</option>
                        <option value="shared">Compartida</option>
                        <option value="public">Pública</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                          type="checkbox"
                          checked={formData.isTemplate}
                          onChange={(e) => handleInputChange('isTemplate', e.target.checked)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Es una plantilla</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                          type="checkbox"
                          checked={formData.isFavorite}
                          onChange={(e) => handleInputChange('isFavorite', e.target.checked)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Marcar como favorita</span>
                    </label>
                  </div>
                </div>
            )}

            {activeTab === 'blocks' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Bloques de Ejercicios
                    </h3>
                    <button
                        onClick={addBlock}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar Bloque</span>
                    </button>
                  </div>

                  {formData.blocks.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p>No hay bloques definidos</p>
                        <p className="text-sm">Agrega bloques para estructurar tu rutina</p>
                      </div>
                  ) : (
                      <div className="space-y-6">
                        {formData.blocks.map((block, blockIndex) => (
                            <div key={block.id} className="p-4 border border-gray-200 dark:border-dark-border rounded-lg">
                              <div className="flex items-center justify-between mb-4">
                                <input
                                    type="text"
                                    value={block.name}
                                    onChange={(e) => updateBlock(blockIndex, { name: e.target.value })}
                                    className="font-medium text-lg text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                                />
                                <div className="flex items-center space-x-2">
                                  <button
                                      onClick={() => openExerciseModal(blockIndex)}
                                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Ejercicio</span>
                                  </button>
                                  <button
                                      onClick={() => removeBlock(blockIndex)}
                                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Block Info */}
                              <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{calculateBlockDuration(block)} min</span>
                                </div>
                                <span>{block.exercises.length} ejercicio(s)</span>
                              </div>

                              {/* Exercises */}
                              {block.exercises.length === 0 ? (
                                  <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
                                    <p>No hay ejercicios en este bloque</p>
                                    <button
                                        onClick={() => openExerciseModal(blockIndex)}
                                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                                    >
                                      Agregar primer ejercicio
                                    </button>
                                  </div>
                              ) : (
                                  <div className="space-y-2">
                                    {block.exercises.map((exercise, exerciseIndex) => (
                                        <div
                                            key={exercise.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-elevated rounded-lg"
                                        >
                                          <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                              <h4 className="font-medium text-gray-900 dark:text-white">
                                                {exercise.name}
                                              </h4>
                                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                  exercise.intensity === 'high'
                                                      ? 'bg-red-100 text-red-800'
                                                      : exercise.intensity === 'medium'
                                                          ? 'bg-yellow-100 text-yellow-800'
                                                          : 'bg-green-100 text-green-800'
                                              }`}>
                                    {exercise.intensity === 'high' ? 'Alta' : exercise.intensity === 'medium' ? 'Media' : 'Baja'}
                                  </span>
                                            </div>
                                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                  <span className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{exercise.duration} min</span>
                                  </span>
                                              <span>{exercise.workType}</span>
                                            </div>
                                            {exercise.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                  {exercise.description}
                                                </p>
                                            )}
                                          </div>
                                          <div className="flex items-center space-x-1 ml-4">
                                            <button
                                                onClick={() => openExerciseModal(blockIndex, exercise)}
                                                className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                                                title="Editar ejercicio"
                                            >
                                              <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                  const duplicated = { ...exercise, id: `exercise_${Date.now()}`, name: `${exercise.name} (Copia)` };
                                                  addExerciseToBlock(blockIndex, duplicated);
                                                }}
                                                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                                                title="Duplicar ejercicio"
                                            >
                                              <Copy className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => removeExerciseFromBlock(blockIndex, exerciseIndex)}
                                                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                                title="Eliminar ejercicio"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </div>
                                    ))}
                                  </div>
                              )}
                            </div>
                        ))}
                      </div>
                  )}

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Duración total: {calculateTotalDuration()} minutos
                  </div>
                </div>
            )}

            {activeTab === 'details' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Etiquetas
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.tags.map((tag) => (
                          <span
                              key={tag}
                              className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center space-x-1"
                          >
                      <span>{tag}</span>
                      <button
                          onClick={() => removeTag(tag)}
                          className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                      ))}
                    </div>
                    <input
                        type="text"
                        placeholder="Escribir etiqueta y presionar Enter"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Materiales
                    </label>
                    <textarea
                        value={formData.materials.join(', ')}
                        onChange={(e) => handleInputChange('materials', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                        placeholder="Guantes, saco, cuerdas... (separar con comas)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Protección
                    </label>
                    <textarea
                        value={formData.protection.join(', ')}
                        onChange={(e) => handleInputChange('protection', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                        placeholder="Casco, protector bucal, espinilleras... (separar con comas)"
                    />
                  </div>
                </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 dark:bg-dark-elevated border-t border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formData.blocks.length} bloque(s) • {calculateTotalDuration()} minutos
              </div>
              <div className="flex space-x-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                >
                  Cancelar
                </button>
                <button
                    onClick={handleSave}
                    disabled={!formData.name.trim()}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{routine ? 'Actualizar' : 'Crear'} Rutina</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Exercise Modal */}
        {showExerciseModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-dark-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {editingExercise ? 'Editar Ejercicio' : 'Agregar Ejercicio'}
                    </h3>
                    <button
                        onClick={() => {
                          setShowExerciseModal(false);
                          setEditingExercise(null);
                          setCurrentBlockIndex(null);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                  {editingExercise ? (
                      <ExerciseForm
                          exercise={editingExercise}
                          onSave={handleExerciseModalSave}
                          onCancel={() => {
                            setShowExerciseModal(false);
                            setEditingExercise(null);
                            setCurrentBlockIndex(null);
                          }}
                      />
                  ) : (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                            Seleccionar Ejercicio Existente
                          </h4>
                          <div className="grid gap-3">
                            {availableExercises.map((exercise) => (
                                <div
                                    key={exercise.id}
                                    className="p-4 border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated cursor-pointer transition-colors"
                                    onClick={() => handleExerciseModalSave({ ...exercise, id: `exercise_${Date.now()}` })}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="font-medium text-gray-900 dark:text-white">
                                        {exercise.name}
                                      </h5>
                                      <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{exercise.duration} min</span>
                                </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            exercise.intensity === 'high'
                                                ? 'bg-red-100 text-red-800'
                                                : exercise.intensity === 'medium'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-green-100 text-green-800'
                                        }`}>
                                  {exercise.intensity === 'high' ? 'Alta' : exercise.intensity === 'medium' ? 'Media' : 'Baja'}
                                </span>
                                        <span>{exercise.workType}</span>
                                      </div>
                                      {exercise.description && (
                                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {exercise.description}
                                          </p>
                                      )}
                                    </div>
                                    <Plus className="w-5 h-5 text-blue-600" />
                                  </div>
                                </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-6 border-t border-gray-200 dark:border-dark-border">
                          <button
                              onClick={() => {
                                const newExercise: Exercise = {
                                  id: `exercise_${Date.now()}`,
                                  name: '',
                                  duration: 3,
                                  intensity: 'medium',
                                  workType: 'technique',
                                  description: '',
                                  instructions: []
                                };
                                setEditingExercise(newExercise);
                              }}
                              className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <Plus className="w-5 h-5" />
                            <span>Crear Nuevo Ejercicio</span>
                          </button>
                        </div>
                      </div>
                  )}
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

// Exercise Form Component
interface ExerciseFormProps {
  exercise: Exercise;
  onSave: (exercise: Exercise) => void;
  onCancel: () => void;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({ exercise, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Exercise>(exercise);

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('El nombre del ejercicio es obligatorio');
      return;
    }
    onSave(formData);
  };

  return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre del Ejercicio *
          </label>
          <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
              placeholder="Ej: Jab básico"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción
          </label>
          <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
              placeholder="Descripción del ejercicio..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duración (min)
            </label>
            <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                min="1"
                max="60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Intensidad
            </label>
            <select
                value={formData.intensity}
                onChange={(e) => setFormData({ ...formData, intensity: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo
            </label>
            <select
                value={formData.workType}
                onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
            >
              <option value="technique">Técnica</option>
              <option value="cardio">Cardio</option>
              <option value="strength">Fuerza</option>
              <option value="coordination">Coordinación</option>
              <option value="flexibility">Flexibilidad</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
              onClick={handleSave}
              disabled={!formData.name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Ejercicio</span>
          </button>
          <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
  );
};

export default RoutineBuilder;