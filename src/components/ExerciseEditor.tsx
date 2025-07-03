import React, { useState } from 'react';
import { 
  Save, X, Clock, Target, Zap, Shield, 
  Package, Plus, Trash2, FileText, Video,
  Link, Image, Edit3, Eye, Tag, ChevronDown,
  ChevronUp, Copy
} from 'lucide-react';
import { Exercise } from './RoutineManager';
import TimeInput from './TimeInput';
import AdvancedNotes, { AdvancedNote } from './AdvancedNotes';
import { TagType } from './TagManager';
import TagSelector from './TagSelector';

interface ExerciseEditorProps {
  exercise: Exercise;
  availableTags?: TagType[];
  onSave: (exercise: Exercise) => void;
  onCancel: () => void;
  isOpen: boolean;
  onOpenTagManager?: () => void;
}

const ExerciseEditor: React.FC<ExerciseEditorProps> = ({
  exercise,
  availableTags = [],
  onSave,
  onCancel,
  isOpen,
  onOpenTagManager
}) => {
  const [formData, setFormData] = useState<Exercise>({ ...exercise, tags: exercise.tags || [] });
  const [newInstruction, setNewInstruction] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newProtection, setNewProtection] = useState('');
  const [isEditingAdvancedNotes, setIsEditingAdvancedNotes] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [activeVariant, setActiveVariant] = useState<'principiante' | 'intermedio' | 'avanzado' | null>(null);

  const intensityOptions = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' }
  ];

  const categoryOptions = [
    { value: 'technique', label: 'Técnica' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'strength', label: 'Fuerza' },
    { value: 'flexibility', label: 'Flexibilidad' },
    { value: 'sparring', label: 'Sparring' }
  ];

  const levelOptions = [
    { value: 'principiante', label: 'Principiante', color: 'bg-green-100 text-green-800' },
    { value: 'intermedio', label: 'Intermedio', color: 'bg-blue-100 text-blue-800' },
    { value: 'avanzado', label: 'Avanzado', color: 'bg-purple-100 text-purple-800' },
    { value: 'competidor', label: 'Competidor', color: 'bg-orange-100 text-orange-800' },
    { value: 'elite', label: 'Élite', color: 'bg-red-100 text-red-800' }
  ];

  const handleAddInstruction = () => {
    if (newInstruction.trim()) {
      setFormData({
        ...formData,
        instructions: [...formData.instructions, newInstruction.trim()]
      });
      setNewInstruction('');
    }
  };

  const handleRemoveInstruction = (index: number) => {
    setFormData({
      ...formData,
      instructions: formData.instructions.filter((_, i) => i !== index)
    });
  };

  const handleAddMaterial = () => {
    if (newMaterial.trim()) {
      setFormData({
        ...formData,
        materials: [...formData.materials, newMaterial.trim()]
      });
      setNewMaterial('');
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter((_, i) => i !== index)
    });
  };

  const handleAddProtection = () => {
    if (newProtection.trim()) {
      setFormData({
        ...formData,
        protection: [...formData.protection, newProtection.trim()]
      });
      setNewProtection('');
    }
  };

  const handleRemoveProtection = (index: number) => {
    setFormData({
      ...formData,
      protection: formData.protection.filter((_, i) => i !== index)
    });
  };

  const handleUpdateAdvancedNotes = (id: string, updates: Partial<AdvancedNote>) => {
    setFormData({
      ...formData,
      advancedNotes: {
        ...formData.advancedNotes!,
        ...updates,
        updatedAt: new Date()
      }
    });
  };

  const handleSaveAdvancedNotes = (note: Omit<AdvancedNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    setFormData({
      ...formData,
      advancedNotes: {
        id: `note_${Date.now()}`,
        ...note,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  };

  const handleCreateVariant = (level: 'principiante' | 'intermedio' | 'avanzado') => {
    // Crear una variante basada en el ejercicio principal pero sin ID ni variantes
    const { id, variants, ...baseExercise } = formData;
    
    const newVariants = { ...(formData.variants || {}) };
    newVariants[level] = { ...baseExercise };
    
    setFormData({
      ...formData,
      variants: newVariants
    });
    
    setActiveVariant(level);
  };

  const handleUpdateVariant = (level: 'principiante' | 'intermedio' | 'avanzado', updates: Partial<Omit<Exercise, 'id' | 'variants'>>) => {
    if (!formData.variants) return;
    
    const updatedVariants = { ...formData.variants };
    updatedVariants[level] = { ...(updatedVariants[level] || {}), ...updates };
    
    setFormData({
      ...formData,
      variants: updatedVariants
    });
  };

  const handleRemoveVariant = (level: 'principiante' | 'intermedio' | 'avanzado') => {
    if (!formData.variants) return;
    
    const updatedVariants = { ...formData.variants };
    delete updatedVariants[level];
    
    setFormData({
      ...formData,
      variants: updatedVariants
    });
    
    setActiveVariant(null);
  };

  const hasVariant = (level: 'principiante' | 'intermedio' | 'avanzado'): boolean => {
    return !!formData.variants && !!formData.variants[level];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {exercise.id ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Ejercicio *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                  placeholder="Ej: Combinación de jab-cross-hook"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Ejercicio
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción Técnica
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                rows={3}
                placeholder="Descripción detallada del ejercicio, aspectos técnicos importantes..."
              />
            </div>

            {/* Timing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duración (MM:SS)
                </label>
                <TimeInput
                  value={formData.duration}
                  onChange={(seconds) => setFormData({ ...formData, duration: seconds })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descanso (MM:SS)
                </label>
                <TimeInput
                  value={formData.restTime}
                  onChange={(seconds) => setFormData({ ...formData, restTime: seconds })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rondas
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.rounds}
                  onChange={(e) => setFormData({ ...formData, rounds: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Intensidad
                </label>
                <select
                  value={formData.intensity}
                  onChange={(e) => setFormData({ ...formData, intensity: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                >
                  {intensityOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              {/* Level Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nivel
                </label>
                <select
                  value={formData.level || 'intermedio'}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                >
                  {levelOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tags Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Categoría
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
                  placeholder="Seleccionar categoría..."
                />
              </div>
            </div>

            {/* Variants Section */}
            <div className="border border-gray-200 dark:border-dark-border rounded-lg p-4">
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
                  {activeVariant && formData.variants && formData.variants[activeVariant] && (
                    <div className="mt-4 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                        <span className={levelOptions.find(l => l.value === activeVariant)?.color}>
                          Variante para {levelOptions.find(l => l.value === activeVariant)?.label}
                        </span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Duración (MM:SS)
                          </label>
                          <TimeInput
                            value={formData.variants[activeVariant].duration}
                            onChange={(seconds) => handleUpdateVariant(activeVariant, { duration: seconds })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descanso (MM:SS)
                          </label>
                          <TimeInput
                            value={formData.variants[activeVariant].restTime}
                            onChange={(seconds) => handleUpdateVariant(activeVariant, { restTime: seconds })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Rondas
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={formData.variants[activeVariant].rounds}
                            onChange={(e) => handleUpdateVariant(activeVariant, { rounds: parseInt(e.target.value) || 1 })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Intensidad
                          </label>
                          <select
                            value={formData.variants[activeVariant].intensity}
                            onChange={(e) => handleUpdateVariant(activeVariant, { intensity: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                          >
                            {intensityOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Descripción Adaptada
                        </label>
                        <textarea
                          value={formData.variants[activeVariant].description}
                          onChange={(e) => handleUpdateVariant(activeVariant, { description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                          rows={2}
                          placeholder="Descripción adaptada para este nivel..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Instrucciones
              </h3>
              
              <div className="space-y-2 mb-3">
                {formData.instructions.map((instruction, index) => (
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

            {/* Materials and Protection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                  <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span>Material</span>
                </h3>
                
                <div className="space-y-2 mb-3">
                  {formData.materials.map((material, index) => (
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
                  {formData.protection.map((protection, index) => (
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

            {/* Advanced Notes with Media */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span>Material Audiovisual y Notas Técnicas</span>
              </h3>
              
              <AdvancedNotes
                note={formData.advancedNotes}
                onSaveNote={handleSaveAdvancedNotes}
                onUpdateNote={handleUpdateAdvancedNotes}
                isEditing={isEditingAdvancedNotes}
                onToggleEdit={() => setIsEditingAdvancedNotes(!isEditingAdvancedNotes)}
                placeholder="Añade notas técnicas detalladas, enlaces a videos demostrativos, imágenes de referencia..."
                title="Material Técnico y Audiovisual"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-dark-elevated border-t border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(formData)}
              disabled={!formData.name.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseEditor;