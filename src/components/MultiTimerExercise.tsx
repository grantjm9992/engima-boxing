import React, { useState, useEffect } from 'react';
import { 
  Plus, X, Edit3, Trash2, Play, Clock, Palette, 
  ChevronUp, ChevronDown, Copy, Save, RotateCcw, Repeat,
  Tag, Shield, Package, FileText, Video, Link, Image,
  Star, Heart, Target, Users, Eye, Info, AlertTriangle
} from 'lucide-react';
import TimeInput from './TimeInput';
import { TagType } from './TagManager';
import TagSelector from './TagSelector';
import TagDisplay from './TagDisplay';
import AdvancedNotes, { AdvancedNote } from './AdvancedNotes';

export interface CustomTimer {
  id: string;
  name: string;
  color: string;
  duration: number; // seconds
  repetitions: number; // How many times this timer repeats
  restBetween?: number; // optional rest between repetitions
  isSilent?: boolean; // no sound notification
}

export interface MultiTimerExercise {
  id: string;
  name: string;
  description: string;
  timers: CustomTimer[];
  globalRestTime?: number; // rest after all timers complete
  rounds: number; // how many times to repeat the entire timer sequence
  tags?: string[]; // Tag IDs for categorization
  level?: string; // Nivel del ejercicio: principiante, intermedio, avanzado, etc.
  instructions?: string[]; // Instructions for the exercise
  materials?: string[]; // Required materials
  protection?: string[]; // Required protection equipment
  advancedNotes?: AdvancedNote | null; // Advanced notes with media
  isFavorite?: boolean; // Marked as favorite
  variants?: {
    principiante?: Omit<MultiTimerExercise, 'id' | 'variants'>;
    intermedio?: Omit<MultiTimerExercise, 'id' | 'variants'>;
    avanzado?: Omit<MultiTimerExercise, 'id' | 'variants'>;
  };
}

interface MultiTimerExerciseProps {
  exercise: MultiTimerExercise;
  onUpdate: (exercise: MultiTimerExercise) => void;
  onPlay?: (exercise: MultiTimerExercise) => void;
  isEditing?: boolean;
  onEditToggle?: () => void;
  isLocked?: boolean; // For run mode
  availableTags?: TagType[];
  onOpenTagManager?: () => void;
}

const MultiTimerExercise: React.FC<MultiTimerExerciseProps> = ({
  exercise,
  onUpdate,
  onPlay,
  isEditing = false,
  onEditToggle,
  isLocked = false,
  availableTags = [],
  onOpenTagManager
}) => {
  const [timerForm, setTimerForm] = useState<Partial<CustomTimer>>({
    name: '',
    color: '#EF4444',
    duration: 60,
    repetitions: 1,
    restBetween: 0,
    isSilent: false
  });
  const [isAddingTimer, setIsAddingTimer] = useState(false);
  const [editingTimerId, setEditingTimerId] = useState<string | null>(null);
  const [newInstruction, setNewInstruction] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newProtection, setNewProtection] = useState('');
  const [isEditingAdvancedNotes, setIsEditingAdvancedNotes] = useState(false);
  const [activeTab, setActiveTab] = useState<'timers' | 'details' | 'materials' | 'notes'>('timers');
  const [showVariants, setShowVariants] = useState(false);
  const [activeVariant, setActiveVariant] = useState<'principiante' | 'intermedio' | 'avanzado' | null>(null);

  const timerColors = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E',
    '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'
  ];

  const timerPresets = [
    { name: 'Explosivo', duration: 30, color: '#EF4444', repetitions: 3 },
    { name: 'Control Lento', duration: 90, color: '#3B82F6', repetitions: 2 },
    { name: 'Caos', duration: 45, color: '#F97316', repetitions: 4 },
    { name: 'Técnico', duration: 120, color: '#22C55E', repetitions: 1 },
    { name: 'Potencia', duration: 20, color: '#8B5CF6', repetitions: 5 },
    { name: 'Resistencia', duration: 180, color: '#06B6D4', repetitions: 1 }
  ];

  const levelOptions = [
    { value: 'principiante', label: 'Principiante', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'intermedio', label: 'Intermedio', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'avanzado', label: 'Avanzado', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    { value: 'competidor', label: 'Competidor', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
    { value: 'elite', label: 'Élite', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
  ];

  const calculateTotalDuration = () => {
    const timersDuration = exercise.timers.reduce((total, timer) => {
      const timerTime = timer.duration * timer.repetitions;
      const restTime = timer.restBetween ? timer.restBetween * (timer.repetitions - 1) : 0;
      return total + timerTime + restTime;
    }, 0);
    
    const globalRest = exercise.globalRestTime || 0;
    return (timersDuration + globalRest) * exercise.rounds;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${minutes}:00`;
  };

  const addTimer = () => {
    if (!timerForm.name?.trim() || !timerForm.duration) return;

    const newTimer: CustomTimer = {
      id: `timer_${Date.now()}`,
      name: timerForm.name.trim(),
      color: timerForm.color || '#EF4444',
      duration: timerForm.duration,
      repetitions: timerForm.repetitions || 1,
      restBetween: timerForm.restBetween || 0,
      isSilent: timerForm.isSilent || false
    };

    onUpdate({
      ...exercise,
      timers: [...exercise.timers, newTimer]
    });

    setTimerForm({
      name: '',
      color: '#EF4444',
      duration: 60,
      repetitions: 1,
      restBetween: 0,
      isSilent: false
    });
    setIsAddingTimer(false);
  };

  const updateTimer = (timerId: string, updates: Partial<CustomTimer>) => {
    onUpdate({
      ...exercise,
      timers: exercise.timers.map(timer =>
        timer.id === timerId ? { ...timer, ...updates } : timer
      )
    });
  };

  const deleteTimer = (timerId: string) => {
    onUpdate({
      ...exercise,
      timers: exercise.timers.filter(timer => timer.id !== timerId)
    });
  };

  const moveTimer = (timerId: string, direction: 'up' | 'down') => {
    const index = exercise.timers.findIndex(timer => timer.id === timerId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= exercise.timers.length) return;
    
    const newTimers = [...exercise.timers];
    [newTimers[index], newTimers[newIndex]] = [newTimers[newIndex], newTimers[index]];
    
    onUpdate({
      ...exercise,
      timers: newTimers
    });
  };

  const duplicateTimer = (timerId: string) => {
    const timer = exercise.timers.find(t => t.id === timerId);
    if (timer) {
      const duplicated: CustomTimer = {
        ...timer,
        id: `timer_${Date.now()}`,
        name: `${timer.name} (Copia)`
      };
      
      onUpdate({
        ...exercise,
        timers: [...exercise.timers, duplicated]
      });
    }
  };

  const usePreset = (preset: typeof timerPresets[0]) => {
    setTimerForm(prev => ({
      ...prev,
      name: preset.name,
      duration: preset.duration,
      color: preset.color,
      repetitions: preset.repetitions
    }));
  };

  const handleAddInstruction = () => {
    if (newInstruction.trim()) {
      onUpdate({
        ...exercise,
        instructions: [...(exercise.instructions || []), newInstruction.trim()]
      });
      setNewInstruction('');
    }
  };

  const handleRemoveInstruction = (index: number) => {
    if (!exercise.instructions) return;
    
    onUpdate({
      ...exercise,
      instructions: exercise.instructions.filter((_, i) => i !== index)
    });
  };

  const handleAddMaterial = () => {
    if (newMaterial.trim()) {
      onUpdate({
        ...exercise,
        materials: [...(exercise.materials || []), newMaterial.trim()]
      });
      setNewMaterial('');
    }
  };

  const handleRemoveMaterial = (index: number) => {
    if (!exercise.materials) return;
    
    onUpdate({
      ...exercise,
      materials: exercise.materials.filter((_, i) => i !== index)
    });
  };

  const handleAddProtection = () => {
    if (newProtection.trim()) {
      onUpdate({
        ...exercise,
        protection: [...(exercise.protection || []), newProtection.trim()]
      });
      setNewProtection('');
    }
  };

  const handleRemoveProtection = (index: number) => {
    if (!exercise.protection) return;
    
    onUpdate({
      ...exercise,
      protection: exercise.protection.filter((_, i) => i !== index)
    });
  };

  const handleUpdateAdvancedNotes = (id: string, updates: Partial<AdvancedNote>) => {
    onUpdate({
      ...exercise,
      advancedNotes: {
        ...exercise.advancedNotes!,
        ...updates,
        updatedAt: new Date()
      }
    });
  };

  const handleSaveAdvancedNotes = (note: Omit<AdvancedNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    onUpdate({
      ...exercise,
      advancedNotes: {
        id: `note_${Date.now()}`,
        ...note,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  };

  const handleToggleFavorite = () => {
    onUpdate({
      ...exercise,
      isFavorite: !exercise.isFavorite
    });
  };

  const handleCreateVariant = (level: 'principiante' | 'intermedio' | 'avanzado') => {
    // Crear una variante basada en el ejercicio principal pero sin ID ni variantes
    const { id, variants, ...baseExercise } = exercise;
    
    const newVariants = { ...(exercise.variants || {}) };
    newVariants[level] = { ...baseExercise };
    
    onUpdate({
      ...exercise,
      variants: newVariants
    });
    
    setActiveVariant(level);
  };

  const handleUpdateVariant = (level: 'principiante' | 'intermedio' | 'avanzado', updates: Partial<Omit<MultiTimerExercise, 'id' | 'variants'>>) => {
    if (!exercise.variants) return;
    
    const updatedVariants = { ...exercise.variants };
    updatedVariants[level] = { ...(updatedVariants[level] || {}), ...updates };
    
    onUpdate({
      ...exercise,
      variants: updatedVariants
    });
  };

  const handleRemoveVariant = (level: 'principiante' | 'intermedio' | 'avanzado') => {
    if (!exercise.variants) return;
    
    const updatedVariants = { ...exercise.variants };
    delete updatedVariants[level];
    
    onUpdate({
      ...exercise,
      variants: updatedVariants
    });
    
    setActiveVariant(null);
  };

  const hasVariant = (level: 'principiante' | 'intermedio' | 'avanzado'): boolean => {
    return !!exercise.variants && !!exercise.variants[level];
  };

  return (
    <div className={`border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden ${
      isLocked ? 'opacity-75' : ''
    }`}>
      {/* Exercise Header */}
      <div className="p-4 bg-gray-50 dark:bg-dark-elevated border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isEditing && !isLocked ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={exercise.name}
                  onChange={(e) => onUpdate({ ...exercise, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                  placeholder="Nombre del ejercicio"
                />
                <textarea
                  value={exercise.description}
                  onChange={(e) => onUpdate({ ...exercise, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                  rows={2}
                  placeholder="Descripción del ejercicio"
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{exercise.name}</h4>
                  {exercise.isFavorite && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                  {exercise.level && (
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      levelOptions.find(l => l.value === exercise.level)?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      {levelOptions.find(l => l.value === exercise.level)?.label || exercise.level}
                    </span>
                  )}
                  {exercise.variants && Object.keys(exercise.variants).length > 0 && (
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                      {Object.keys(exercise.variants).length} variante(s)
                    </span>
                  )}
                </div>
                {exercise.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{exercise.description}</p>
                )}
                
                {/* Tags Display */}
                {exercise.tags && exercise.tags.length > 0 && availableTags.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Categoría:</div>
                    <TagDisplay 
                      tags={availableTags} 
                      selectedTagIds={exercise.tags} 
                      size="sm"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {isEditing && !isLocked && (
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  exercise.isFavorite 
                    ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                    : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                }`}
                title={exercise.isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}
              >
                <Star className={`w-4 h-4 ${exercise.isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
            
            {exercise.timers.length > 0 && onPlay && (
              <button
                onClick={() => onPlay(exercise)}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="Reproducir secuencia completa"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            
            {onEditToggle && !isLocked && (
              <button
                onClick={onEditToggle}
                className={`p-2 rounded-lg transition-colors ${
                  isEditing 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                title={isEditing ? "Finalizar edición" : "Editar ejercicio"}
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Exercise Stats */}
        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <div className="font-medium text-blue-900 dark:text-blue-400">Timers</div>
            <div className="text-blue-600 dark:text-blue-300">{exercise.timers.length}</div>
          </div>
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <div className="font-medium text-green-900 dark:text-green-400">Duración Total</div>
            <div className="text-green-600 dark:text-green-300">{formatDuration(calculateTotalDuration())}</div>
          </div>
          <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
            <div className="font-medium text-purple-900 dark:text-purple-400">Rondas</div>
            <div className="text-purple-600 dark:text-purple-300">{exercise.rounds}</div>
          </div>
        </div>

        {/* Tabs for editing */}
        {isEditing && !isLocked && (
          <div className="mt-4 border-t border-gray-200 dark:border-dark-border pt-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('timers')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  activeTab === 'timers' 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Timers
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  activeTab === 'details' 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Detalles
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  activeTab === 'materials' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Material
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  activeTab === 'notes' 
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Notas
              </button>
            </div>
          </div>
        )}

        {/* Global Settings */}
        {isEditing && !isLocked && activeTab === 'timers' && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rondas del Ejercicio
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={exercise.rounds}
                onChange={(e) => onUpdate({ ...exercise, rounds: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descanso Global (segundos)
              </label>
              <input
                type="number"
                min="0"
                value={exercise.globalRestTime || 0}
                onChange={(e) => onUpdate({ ...exercise, globalRestTime: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Level and Tags Selector */}
        {isEditing && !isLocked && activeTab === 'details' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nivel
              </label>
              <select
                value={exercise.level || 'intermedio'}
                onChange={(e) => onUpdate({ ...exercise, level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
              >
                {levelOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            {/* Tags Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Categoría
                </label>
                {onOpenTagManager && (
                  <button
                    onClick={onOpenTagManager}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Gestionar
                  </button>
                )}
              </div>
              <TagSelector
                availableTags={availableTags}
                selectedTags={exercise.tags || []}
                onTagsChange={(tags) => onUpdate({ ...exercise, tags })}
                onCreateTag={onOpenTagManager}
                placeholder="Seleccionar categoría..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Content based on active tab */}
      <div className="p-4">
        {activeTab === 'timers' && isEditing && !isLocked && (
          <>
            {/* Timers List */}
            <div className="space-y-3 mb-4">
              {exercise.timers.map((timer, index) => (
                <div key={timer.id} className="border border-gray-200 dark:border-dark-border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: timer.color }}
                      >
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        {editingTimerId === timer.id ? (
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={timer.name}
                              onChange={(e) => updateTimer(timer.id, { name: e.target.value })}
                              className="px-2 py-1 text-sm border border-gray-300 dark:border-dark-border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                              placeholder="Nombre del timer"
                            />
                            <div className="flex space-x-1">
                              {timerColors.slice(0, 5).map(color => (
                                <button
                                  key={color}
                                  onClick={() => updateTimer(timer.id, { color })}
                                  className={`w-6 h-6 rounded border-2 transition-all ${
                                    timer.color === color ? 'border-gray-800 dark:border-gray-200 scale-110' : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                                  }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">{timer.name}</h5>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>{formatDuration(timer.duration)}</span>
                              <div className="flex items-center space-x-1">
                                <Repeat className="w-3 h-3" />
                                <span>{timer.repetitions}x</span>
                              </div>
                              {timer.restBetween && timer.restBetween > 0 && (
                                <span>Descanso: {timer.restBetween}s</span>
                              )}
                              {timer.isSilent && (
                                <span className="text-xs text-gray-500 dark:text-gray-500">Silencioso</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-1 ml-2">
                      {editingTimerId === timer.id ? (
                        <button
                          onClick={() => setEditingTimerId(null)}
                          className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                          title="Guardar cambios"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingTimerId(timer.id)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Editar timer"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => duplicateTimer(timer.id)}
                            className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                            title="Duplicar timer"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moveTimer(timer.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Mover arriba"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moveTimer(timer.id, 'down')}
                            disabled={index === exercise.timers.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Mover abajo"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteTimer(timer.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Eliminar timer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Timer Details in Edit Mode */}
                  {editingTimerId === timer.id && (
                    <div className="mt-3 grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Duración
                        </label>
                        <TimeInput
                          value={timer.duration}
                          onChange={(seconds) => updateTimer(timer.id, { duration: seconds })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Repeticiones *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={timer.repetitions}
                          onChange={(e) => updateTimer(timer.id, { repetitions: parseInt(e.target.value) || 1 })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-dark-border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                          title="Cuántas veces se repite este timer antes de pasar al siguiente"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Descanso (s)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={timer.restBetween || 0}
                          onChange={(e) => updateTimer(timer.id, { restBetween: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-dark-border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                          title="Descanso entre repeticiones de este timer"
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`silent-${timer.id}`}
                            checked={timer.isSilent || false}
                            onChange={(e) => updateTimer(timer.id, { isSilent: e.target.checked })}
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                          <label htmlFor={`silent-${timer.id}`} className="ml-2 text-xs text-gray-700 dark:text-gray-300">
                            Silencioso
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Timer Button */}
            {!isAddingTimer ? (
              <button
                onClick={() => setIsAddingTimer(true)}
                className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-600 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Timer Personalizado</span>
              </button>
            ) : (
              <div className="border-2 border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Nuevo Timer</h5>
                
                {/* Quick Presets */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Presets Rápidos
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {timerPresets.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => usePreset(preset)}
                        className="p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                      >
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: preset.color }}
                        ></div>
                        <span className="text-gray-700 dark:text-gray-300">{preset.name}</span>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Repeat className="w-2 h-2" />
                          <span>{preset.repetitions}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre del Timer *
                    </label>
                    <input
                      type="text"
                      value={timerForm.name || ''}
                      onChange={(e) => setTimerForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                      placeholder="Ej: Explosivo, Control Lento..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Color
                    </label>
                    <div className="flex space-x-2">
                      {timerColors.map(color => (
                        <button
                          key={color}
                          onClick={() => setTimerForm(prev => ({ ...prev, color }))}
                          className={`w-8 h-8 rounded-lg border-2 transition-all ${
                            timerForm.color === color ? 'border-gray-800 dark:border-gray-200 scale-110' : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duración
                    </label>
                    <TimeInput
                      value={timerForm.duration || 60}
                      onChange={(seconds) => setTimerForm(prev => ({ ...prev, duration: seconds }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Repeticiones *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={timerForm.repetitions || 1}
                      onChange={(e) => setTimerForm(prev => ({ ...prev, repetitions: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                      title="Cuántas veces se repite este timer"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descanso (s)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={timerForm.restBetween || 0}
                      onChange={(e) => setTimerForm(prev => ({ ...prev, restBetween: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                      title="Descanso entre repeticiones"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Total
                    </label>
                    <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                      {formatDuration(
                        (timerForm.duration || 0) * (timerForm.repetitions || 1) + 
                        ((timerForm.restBetween || 0) * ((timerForm.repetitions || 1) - 1))
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isSilent"
                      checked={timerForm.isSilent || false}
                      onChange={(e) => setTimerForm(prev => ({ ...prev, isSilent: e.target.checked }))}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor="isSilent" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Timer silencioso (sin sonido de alerta)
                    </label>
                  </div>
                </div>

                {/* Repetition Example */}
                {(timerForm.repetitions || 1) > 1 && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-400 mb-1">
                      Ejemplo de Ejecución:
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                      {Array.from({ length: timerForm.repetitions || 1 }, (_, i) => (
                        <span key={i}>
                          {timerForm.name || 'Timer'} ({formatDuration(timerForm.duration || 0)})
                          {i < (timerForm.repetitions || 1) - 1 && timerForm.restBetween && timerForm.restBetween > 0 && (
                            <span> → Descanso ({timerForm.restBetween}s)</span>
                          )}
                          {i < (timerForm.repetitions || 1) - 1 && ' → '}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={addTimer}
                    disabled={!timerForm.name?.trim() || !timerForm.duration}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Timer</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingTimer(false);
                      setTimerForm({
                        name: '',
                        color: '#EF4444',
                        duration: 60,
                        repetitions: 1,
                        restBetween: 0,
                        isSilent: false
                      });
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'details' && isEditing && !isLocked && (
          <>
            {/* Instructions */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Instrucciones
              </h3>
              
              <div className="space-y-2 mb-3">
                {(exercise.instructions || []).map((instruction, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-dark-elevated rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">{instruction}</span>
                    <button
                      onClick={() => handleRemoveInstruction(index)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddInstruction()}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                  placeholder="Añadir instrucción..."
                />
                <button
                  onClick={handleAddInstruction}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Variants Section */}
            <div className="border border-gray-200 dark:border-dark-border rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                  <Copy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Variantes por Nivel</span>
                </h3>
                <button
                  onClick={() => setShowVariants(!showVariants)}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                >
                  {showVariants ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {showVariants && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Crea versiones adaptadas de este ejercicio para diferentes niveles de alumnos.
                  </p>

                  {/* Variant Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {['principiante', 'intermedio', 'avanzado'].map((level) => {
                      const hasVariantForLevel = hasVariant(level as any);
                      const isActive = activeVariant === level;
                      const levelInfo = levelOptions.find(l => l.value === level);
                      
                      return (
                        <div key={level} className="flex items-center space-x-2">
                          {hasVariantForLevel ? (
                            <>
                              <button
                                onClick={() => setActiveVariant(isActive ? null : level as any)}
                                className={`px-3 py-1 rounded-lg transition-colors ${
                                  isActive 
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-700' 
                                    : `${levelInfo?.color} border border-gray-200 dark:border-gray-700`
                                }`}
                              >
                                {levelInfo?.label}
                              </button>
                              <button
                                onClick={() => handleRemoveVariant(level as any)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Eliminar variante"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleCreateVariant(level as any)}
                              className="px-3 py-1 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-gray-600 dark:text-gray-400"
                            >
                              + {levelInfo?.label}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Active Variant Editor */}
                  {activeVariant && exercise.variants && exercise.variants[activeVariant] && (
                    <div className="mt-4 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                        <span className={levelOptions.find(l => l.value === activeVariant)?.color}>
                          Variante para {levelOptions.find(l => l.value === activeVariant)?.label}
                        </span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descripción Adaptada
                          </label>
                          <textarea
                            value={exercise.variants[activeVariant].description}
                            onChange={(e) => handleUpdateVariant(activeVariant, { description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                            rows={2}
                            placeholder="Descripción adaptada para este nivel..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Rondas
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={exercise.variants[activeVariant].rounds}
                            onChange={(e) => handleUpdateVariant(activeVariant, { rounds: parseInt(e.target.value) || 1 })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Descanso Global (segundos)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={exercise.variants[activeVariant].globalRestTime || 0}
                          onChange={(e) => handleUpdateVariant(activeVariant, { globalRestTime: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'materials' && isEditing && !isLocked && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span>Material</span>
              </h3>
              
              <div className="space-y-2 mb-3">
                {(exercise.materials || []).map((material, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-dark-elevated rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">{material}</span>
                    <button
                      onClick={() => handleRemoveMaterial(index)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMaterial()}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                  placeholder="Añadir material..."
                />
                <button
                  onClick={handleAddMaterial}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span>Protección</span>
              </h3>
              
              <div className="space-y-2 mb-3">
                {(exercise.protection || []).map((protection, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-dark-elevated rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">{protection}</span>
                    <button
                      onClick={() => handleRemoveProtection(index)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newProtection}
                  onChange={(e) => setNewProtection(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddProtection()}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                  placeholder="Añadir protección..."
                />
                <button
                  onClick={handleAddProtection}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && isEditing && !isLocked && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span>Material Audiovisual y Notas Técnicas</span>
            </h3>
            
            <AdvancedNotes
              note={exercise.advancedNotes}
              onSaveNote={handleSaveAdvancedNotes}
              onUpdateNote={handleUpdateAdvancedNotes}
              isEditing={isEditingAdvancedNotes}
              onToggleEdit={() => setIsEditingAdvancedNotes(!isEditingAdvancedNotes)}
              placeholder="Añade notas técnicas detalladas, enlaces a videos demostrativos, imágenes de referencia..."
              title="Material Técnico y Audiovisual"
            />
          </div>
        )}

        {/* Display content when not editing */}
        {(!isEditing || isLocked) && (
          <>
            {/* Instructions */}
            {exercise.instructions && exercise.instructions.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Instrucciones</h3>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {exercise.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Materials and Protection */}
            {((exercise.materials && exercise.materials.length > 0) || 
              (exercise.protection && exercise.protection.length > 0)) && (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {exercise.materials && exercise.materials.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-1">
                      <Package className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span>Material</span>
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {exercise.materials.map((material, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{material}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {exercise.protection && exercise.protection.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center space-x-1">
                      <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span>Protección</span>
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {exercise.protection.map((protection, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-1 h-1 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{protection}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Timer Sequence Preview */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-dark-elevated rounded-lg">
              <h6 className="font-medium text-gray-900 dark:text-white mb-2">Secuencia de Ejecución</h6>
              <div className="space-y-2">
                {exercise.timers.map((timer, index) => (
                  <div key={timer.id} className="flex items-center space-x-2 text-sm">
                    <div 
                      className="w-4 h-4 rounded text-white text-xs flex items-center justify-center font-medium"
                      style={{ backgroundColor: timer.color }}
                    >
                      {index + 1}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {timer.name}: {formatDuration(timer.duration)}
                      {timer.repetitions > 1 && (
                        <span className="text-purple-600 dark:text-purple-400"> × {timer.repetitions} veces</span>
                      )}
                      {timer.restBetween && timer.restBetween > 0 && timer.repetitions > 1 && (
                        <span className="text-gray-500"> (descanso {timer.restBetween}s entre repeticiones)</span>
                      )}
                      {timer.isSilent && (
                        <span className="text-gray-500"> (silencioso)</span>
                      )}
                    </span>
                    {index < exercise.timers.length - 1 && (
                      <span className="text-gray-400 mx-1">→</span>
                    )}
                  </div>
                ))}
                
                {exercise.rounds > 1 && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
                    Esta secuencia se repite {exercise.rounds} veces
                    {exercise.globalRestTime && exercise.globalRestTime > 0 && (
                      <span> con {exercise.globalRestTime}s de descanso entre rondas</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MultiTimerExercise;

export { MultiTimerExercise }