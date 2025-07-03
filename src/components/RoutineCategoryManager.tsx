import React, { useState } from 'react';
import { 
  Plus, X, Edit3, Trash2, Save, Folder, Tag, 
  Calendar, Zap, Target, Palette, Hash
} from 'lucide-react';
import { RoutineCategory } from '../types/RoutineTypes';

interface RoutineCategoryManagerProps {
  categories: RoutineCategory[];
  onCreateCategory: (category: Omit<RoutineCategory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateCategory: (id: string, updates: Partial<RoutineCategory>) => void;
  onDeleteCategory: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const RoutineCategoryManager: React.FC<RoutineCategoryManagerProps> = ({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  isOpen,
  onClose
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<{
    name: string;
    description: string;
    color: string;
    type: 'phase' | 'period' | 'load-type' | 'custom';
  }>({
    name: '',
    description: '',
    color: '#3B82F6',
    type: 'custom'
  });

  const categoryTypes = [
    { value: 'phase', label: 'Fase', icon: Target, description: 'Ej: Build-up, Taper, Testing' },
    { value: 'period', label: 'Período', icon: Calendar, description: 'Ej: Semana 3, Mes 1, Pretemporada' },
    { value: 'load-type', label: 'Tipo de Carga', icon: Zap, description: 'Ej: Volumen Técnico, Fatiga Explosiva' },
    { value: 'custom', label: 'Personalizado', icon: Hash, description: 'Categoría personalizada' }
  ];

  const colorPalette = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
    '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#C026D3', '#DB2777', '#E11D48', '#DC2626'
  ];

  const predefinedCategories = {
    phase: [
      { name: 'Build-up', description: 'Fase de construcción y desarrollo', color: '#22C55E' },
      { name: 'Taper', description: 'Fase de reducción y afinamiento', color: '#F59E0B' },
      { name: 'Testing', description: 'Fase de evaluación y pruebas', color: '#EF4444' },
      { name: 'Recovery', description: 'Fase de recuperación activa', color: '#8B5CF6' }
    ],
    period: [
      { name: 'Semana 1', description: 'Primera semana del ciclo', color: '#3B82F6' },
      { name: 'Semana 2', description: 'Segunda semana del ciclo', color: '#06B6D4' },
      { name: 'Semana 3', description: 'Tercera semana del ciclo', color: '#10B981' },
      { name: 'Mes 1', description: 'Primer mes del programa', color: '#8B5CF6' }
    ],
    'load-type': [
      { name: 'Volumen Técnico', description: 'Alto volumen de trabajo técnico', color: '#3B82F6' },
      { name: 'Intensidad Explosiva', description: 'Trabajo de alta intensidad', color: '#EF4444' },
      { name: 'Fatiga Controlada', description: 'Entrenamiento bajo fatiga', color: '#F97316' },
      { name: 'Recuperación Activa', description: 'Trabajo de baja intensidad', color: '#22C55E' }
    ]
  };

  const handleCreateCategory = () => {
    if (categoryForm.name.trim()) {
      onCreateCategory({
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        color: categoryForm.color,
        type: categoryForm.type
      });
      resetForm();
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory && categoryForm.name.trim()) {
      onUpdateCategory(editingCategory, {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        color: categoryForm.color,
        type: categoryForm.type
      });
      resetForm();
    }
  };

  const resetForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      color: '#3B82F6',
      type: 'custom'
    });
    setIsCreating(false);
    setEditingCategory(null);
  };

  const startEditing = (category: RoutineCategory) => {
    setCategoryForm({
      name: category.name,
      description: category.description,
      color: category.color,
      type: category.type
    });
    setEditingCategory(category.id);
    setIsCreating(false);
  };

  const createPredefinedCategory = (preset: any, type: string) => {
    onCreateCategory({
      name: preset.name,
      description: preset.description,
      color: preset.color,
      type: type as any
    });
  };

  const getCategoryTypeIcon = (type: string) => {
    const categoryType = categoryTypes.find(t => t.value === type);
    return categoryType ? categoryType.icon : Hash;
  };

  const getCategoryTypeLabel = (type: string) => {
    const categoryType = categoryTypes.find(t => t.value === type);
    return categoryType ? categoryType.label : 'Personalizado';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categorías de Rutinas</h2>
                <p className="text-gray-600 dark:text-gray-400">Organiza rutinas por fases, períodos y tipos de carga</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Quick Category Creation */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categorías Predefinidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categoryTypes.slice(0, 3).map((type) => {
                const IconComponent = type.icon;
                const presets = predefinedCategories[type.value as keyof typeof predefinedCategories] || [];
                
                return (
                  <div key={type.value} className="border border-gray-200 dark:border-dark-border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-medium text-gray-900 dark:text-white">{type.label}</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{type.description}</p>
                    
                    <div className="space-y-2">
                      {presets.map((preset, index) => {
                        const exists = categories.some(cat => cat.name.toLowerCase() === preset.name.toLowerCase());
                        return (
                          <button
                            key={index}
                            onClick={() => createPredefinedCategory(preset, type.value)}
                            disabled={exists}
                            className={`w-full p-2 text-left rounded-lg border text-sm transition-all ${
                              exists
                                ? 'border-gray-200 dark:border-dark-border bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'border-gray-300 dark:border-dark-border hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: preset.color }}
                              ></div>
                              <span className="font-medium">{preset.name}</span>
                              {exists && <span className="text-xs">(Creada)</span>}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{preset.description}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Create Custom Category */}
          <div className="mb-6">
            {!isCreating && !editingCategory ? (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-600 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Plus className="w-5 h-5" />
                <span>Crear Categoría Personalizada</span>
              </button>
            ) : (
              <div className="p-4 border-2 border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-elevated dark:text-white"
                      placeholder="Ej: Pretemporada, Competición..."
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo</label>
                    <select
                      value={categoryForm.type}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-elevated dark:text-white"
                    >
                      {categoryTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-elevated dark:text-white"
                    rows={2}
                    placeholder="Describe el propósito de esta categoría..."
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: categoryForm.color }}
                    ></div>
                    <div className="flex flex-wrap gap-2">
                      {colorPalette.slice(0, 12).map(color => (
                        <button
                          key={color}
                          onClick={() => setCategoryForm(prev => ({ ...prev, color }))}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            categoryForm.color === color ? 'border-gray-800 dark:border-gray-200 scale-110' : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                    disabled={!categoryForm.name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingCategory ? 'Actualizar' : 'Crear'}</span>
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Existing Categories */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Categorías Existentes ({categories.length})
            </h3>
            
            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p>No hay categorías creadas aún</p>
                <p className="text-sm">Crea categorías para organizar mejor tus rutinas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const IconComponent = getCategoryTypeIcon(category.type);
                  
                  return (
                    <div key={category.id} className="p-4 border border-gray-200 dark:border-dark-border rounded-lg hover:shadow-md dark:hover:shadow-dark transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: category.color }}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {getCategoryTypeLabel(category.type)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-1">
                          <button
                            onClick={() => startEditing(category)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Editar categoría"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteCategory(category.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Eliminar categoría"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{category.description}</p>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Creada: {category.createdAt.toLocaleDateString()}
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

export default RoutineCategoryManager;