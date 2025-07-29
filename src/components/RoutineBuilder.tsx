import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Clock, Target, Tag } from 'lucide-react';

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
  exercises: any[];
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
    return formData.blocks.reduce((total, block) => total + block.duration, 0);
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
                      <div className="space-y-4">
                        {formData.blocks.map((block, index) => (
                            <div key={block.id} className="p-4 border border-gray-200 dark:border-dark-border rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <input
                                    type="text"
                                    value={block.name}
                                    onChange={(e) => updateBlock(index, { name: e.target.value })}
                                    className="font-medium text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                                />
                                <button
                                    onClick={() => removeBlock(index)}
                                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <input
                                      type="number"
                                      value={block.duration}
                                      onChange={(e) => updateBlock(index, { duration: parseInt(e.target.value) || 0 })}
                                      className="w-16 px-2 py-1 border border-gray-300 dark:border-dark-border rounded text-center dark:bg-dark-surface dark:text-white"
                                      min="0"
                                  />
                                  <span>min</span>
                                </div>
                                <span>{block.exercises.length} ejercicio(s)</span>
                              </div>
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
      </div>
  );
};

export default RoutineBuilder;