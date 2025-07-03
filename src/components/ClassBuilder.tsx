import React, { useState, useEffect } from 'react';
import { 
  Save, X, Calendar, Clock, Target, Tag, 
  Plus, Trash2, FileText, AlertTriangle, 
  Package, Info, Copy
} from 'lucide-react';
import { PlannedClass } from '../types/ClassTypes';
import { TagType } from './TagManager';
import TagSelector from './TagSelector';
import { Block } from './BlockEditor';
import { Routine } from './RoutineManager';
import BlockLibrary from './BlockLibrary';
import BlockEditor from './BlockEditor';

interface ClassBuilderProps {
  initialClass?: PlannedClass | null;
  initialRoutine?: Routine | null;
  availableTags: TagType[];
  onSave: (classData: Omit<PlannedClass, 'id' | 'createdAt' | 'updatedAt' | 'notionPageId'>) => Promise<void>;
  onCancel: () => void;
  initialDate?: string;
}

const ClassBuilder: React.FC<ClassBuilderProps> = ({
  initialClass,
  initialRoutine,
  availableTags,
  onSave,
  onCancel,
  initialDate
}) => {
  const [formData, setFormData] = useState<Omit<PlannedClass, 'id' | 'createdAt' | 'updatedAt' | 'notionPageId'>>({
    title: '',
    date: initialDate || new Date().toISOString().split('T')[0],
    tags: [],
    totalDuration: 0,
    blocks: [],
    objective: '',
    notes: ''
  });
  
  const [activeTab, setActiveTab] = useState<'details' | 'structure'>('details');
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [showBlockLibrary, setShowBlockLibrary] = useState(false);
  const [isEditingExercise, setIsEditingExercise] = useState(false);
  const [editingExercise, setEditingExercise] = useState<any | null>(null);

  // Inicializar con datos existentes si los hay
  useEffect(() => {
    if (initialClass) {
      setFormData({
        title: initialClass.title,
        date: initialClass.date,
        tags: [...initialClass.tags],
        totalDuration: initialClass.totalDuration,
        blocks: JSON.parse(JSON.stringify(initialClass.blocks)), // Deep copy
        objective: initialClass.objective,
        notes: initialClass.notes || ''
      });
    } else if (initialRoutine) {
      // Crear a partir de una rutina existente
      setFormData({
        title: `${initialRoutine.name} - Clase`,
        date: initialDate || new Date().toISOString().split('T')[0],
        tags: [...initialRoutine.tags],
        totalDuration: initialRoutine.totalDuration,
        blocks: initialRoutine.blockStructure?.blocks || [],
        objective: initialRoutine.objective || '',
        notes: ''
      });
    }
  }, [initialClass, initialRoutine, initialDate]);

  // Calcular duración total
  useEffect(() => {
    const totalDuration = formData.blocks.reduce((total, block) => {
      const blockDuration = block.exercises.reduce((sum, exercise) => {
        if ('timers' in exercise) {
          // Multi-timer exercise
          const multiTimerExercise = exercise as any;
          const timersDuration = multiTimerExercise.timers.reduce((timerSum: number, timer: any) => {
            const timerTime = timer.duration * timer.repetitions;
            const restTime = timer.restBetween ? timer.restBetween * (timer.repetitions - 1) : 0;
            return timerSum + timerTime + restTime;
          }, 0);
          
          const globalRest = multiTimerExercise.globalRestTime || 0;
          const exerciseDuration = (timersDuration + globalRest) * multiTimerExercise.rounds / 60; // convert to minutes
          return sum + exerciseDuration;
        } else {
          // Standard exercise
          const standardExercise = exercise as any;
          const exerciseDuration = (standardExercise.duration * standardExercise.rounds) / 60; // convert to minutes
          const restDuration = (standardExercise.restTime * (standardExercise.rounds - 1)) / 60; // rest between rounds
          return sum + exerciseDuration + restDuration;
        }
      }, 0);
      return total + blockDuration;
    }, 0);
    
    setFormData(prev => ({
      ...prev,
      totalDuration: Math.round(totalDuration)
    }));
  }, [formData.blocks]);

  const handleAddBlock = () => {
    setShowBlockLibrary(true);
  };

  const handleInsertBlock = (blockTemplate: any) => {
    const newBlock: Block = {
      ...blockTemplate,
      id: `block_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setFormData(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
    
    setShowBlockLibrary(false);
    setSelectedBlockIndex(formData.blocks.length);
  };

  const handleUpdateBlock = (index: number, updates: Partial<Block>) => {
    const updatedBlocks = [...formData.blocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      ...updates,
      updatedAt: new Date()
    };
    
    setFormData(prev => ({
      ...prev,
      blocks: updatedBlocks
    }));
  };

  const handleRemoveBlock = (index: number) => {
    const updatedBlocks = [...formData.blocks];
    updatedBlocks.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      blocks: updatedBlocks
    }));
    
    if (selectedBlockIndex === index) {
      setSelectedBlockIndex(null);
    } else if (selectedBlockIndex !== null && selectedBlockIndex > index) {
      setSelectedBlockIndex(selectedBlockIndex - 1);
    }
  };

  const handleAddExerciseToBlock = (blockIndex: number, isMultiTimer: boolean = false) => {
    // Implementar lógica para añadir ejercicio
    console.log("Añadir ejercicio al bloque", blockIndex, isMultiTimer);
  };

  const handleEditExercise = (exercise: any) => {
    setEditingExercise(exercise);
    setIsEditingExercise(true);
  };

  const handleSaveExercise = (exercise: any) => {
    if (selectedBlockIndex === null) return;
    
    const updatedBlocks = [...formData.blocks];
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
      blocks: updatedBlocks
    }));
    
    setIsEditingExercise(false);
    setEditingExercise(null);
  };

  const handleDuplicateExercise = (exercise: any) => {
    if (selectedBlockIndex === null) return;
    
    const duplicatedExercise = {
      ...exercise,
      id: `exercise_${Date.now()}`,
      name: `${exercise.name} (Copia)`,
      tags: [...(exercise.tags || [])]
    };
    
    const updatedBlocks = [...formData.blocks];
    updatedBlocks[selectedBlockIndex] = {
      ...updatedBlocks[selectedBlockIndex],
      exercises: [...updatedBlocks[selectedBlockIndex].exercises, duplicatedExercise],
      updatedAt: new Date()
    };
    
    setFormData(prev => ({
      ...prev,
      blocks: updatedBlocks
    }));
  };

  const handleRemoveExercise = (blockIndex: number, exerciseId: string) => {
    const updatedBlocks = [...formData.blocks];
    updatedBlocks[blockIndex] = {
      ...updatedBlocks[blockIndex],
      exercises: updatedBlocks[blockIndex].exercises.filter(ex => ex.id !== exerciseId),
      updatedAt: new Date()
    };
    
    setFormData(prev => ({
      ...prev,
      blocks: updatedBlocks
    }));
  };

  const handleSaveClass = async () => {
    if (formData.title.trim() && formData.date) {
      await onSave(formData);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {initialClass ? 'Editar Clase' : 'Nueva Clase'}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'details' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Detalles
            </button>
            <button
              onClick={() => setActiveTab('structure')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'structure' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Estructura
            </button>
          </div>
        </div>

        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Información Básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título de la Clase *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-dark-surface dark:text-white"
                    placeholder="Ej: Técnica de Jab - Nivel Intermedio"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-dark-surface dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Objetivo de la Clase
                </label>
                <textarea
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-dark-surface dark:text-white"
                  rows={3}
                  placeholder="Describe el objetivo principal de esta clase..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Etiquetas
                </label>
                <TagSelector
                  availableTags={availableTags}
                  selectedTags={formData.tags}
                  onTagsChange={(tags) => setFormData({ ...formData, tags })}
                  placeholder="Seleccionar etiquetas..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-dark-surface dark:text-white"
                  rows={3}
                  placeholder="Notas adicionales, recordatorios, material necesario..."
                />
              </div>
            </div>

            {/* Notion Integration Info */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">Integración con Notion</h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    Esta clase se sincronizará automáticamente con tu base de datos de Notion cuando la guardes.
                    {!import.meta.env.VITE_NOTION_API_KEY && (
                      <span className="block mt-1 text-red-600 dark:text-red-400">
                        ⚠️ API Key de Notion no configurada. La sincronización no estará disponible.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 dark:bg-dark-elevated rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Resumen
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Duración Total</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatDuration(formData.totalDuration)}
                  </div>
                </div>
                
                <div className="p-4 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Bloques</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formData.blocks.length}
                  </div>
                </div>
                
                <div className="p-4 bg-white dark:bg-dark-surface rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Ejercicios</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formData.blocks.reduce((sum, block) => sum + block.exercises.length, 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'structure' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Blocks List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Bloques
                </h3>
                <button
                  onClick={handleAddBlock}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  title="Añadir bloque"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {formData.blocks.map((block, index) => (
                <div 
                  key={block.id} 
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedBlockIndex === index
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-dark-border hover:border-green-300 dark:hover:border-green-600'
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
                      title="Eliminar bloque"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {formData.blocks.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p>No hay bloques creados</p>
                  <p className="text-sm">Añade bloques para organizar los ejercicios</p>
                </div>
              )}
            </div>

            {/* Block Editor */}
            <div className="lg:col-span-2">
              {selectedBlockIndex !== null && formData.blocks[selectedBlockIndex] ? (
                <BlockEditor
                  block={formData.blocks[selectedBlockIndex]}
                  availableTags={availableTags}
                  onUpdateBlock={(updates) => handleUpdateBlock(selectedBlockIndex, updates)}
                  onAddExercise={() => handleAddExerciseToBlock(selectedBlockIndex, false)}
                  onEditExercise={handleEditExercise}
                  onDuplicateExercise={handleDuplicateExercise}
                  onRemoveExercise={(exerciseId) => handleRemoveExercise(selectedBlockIndex, exerciseId)}
                />
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <Target className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Selecciona un bloque
                  </h3>
                  <p>Selecciona un bloque para editarlo o crea uno nuevo</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-dark-border">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveClass}
            disabled={!formData.title.trim() || !formData.date || formData.blocks.length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Clase</span>
          </button>
        </div>
      </div>

      {/* Block Library Modal */}
      {showBlockLibrary && (
        <BlockLibrary
          blockTemplates={[]} // Aquí deberías pasar tus plantillas de bloques
          availableTags={availableTags}
          onCreateTemplate={() => {}}
          onUpdateTemplate={() => {}}
          onDeleteTemplate={() => {}}
          onInsertBlock={handleInsertBlock}
          onDuplicateAndEdit={() => {}}
          isOpen={showBlockLibrary}
          onClose={() => setShowBlockLibrary(false)}
        />
      )}
    </div>
  );
};

export default ClassBuilder;