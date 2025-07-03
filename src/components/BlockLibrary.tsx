import React, { useState } from 'react';
import { 
  Plus, X, Search, Eye, Copy, Edit3, Trash2, Save, 
  Package, Tag, Clock, Target, FileText, Filter,
  BookOpen, Play, Star, Grid, List
} from 'lucide-react';
import { TagType } from './TagManager';
import TagDisplay from './TagDisplay';

export interface BlockTemplate {
  id: string;
  name: string;
  description: string;
  color: string;
  exercises: any[];
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
  category?: 'warmup' | 'technique' | 'conditioning' | 'cooldown' | 'custom';
  estimatedDuration: number; // in minutes
}

interface BlockLibraryProps {
  blockTemplates: BlockTemplate[];
  availableTags: TagType[];
  onCreateTemplate: (template: Omit<BlockTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTemplate: (id: string, updates: Partial<BlockTemplate>) => void;
  onDeleteTemplate: (id: string) => void;
  onInsertBlock: (template: BlockTemplate) => void;
  onDuplicateAndEdit: (template: BlockTemplate) => void;
  isOpen: boolean;
  onClose: () => void;
}

const BlockLibrary: React.FC<BlockLibraryProps> = ({
  blockTemplates,
  availableTags,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onInsertBlock,
  onDuplicateAndEdit,
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'duration'>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState<BlockTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    { value: 'warmup', label: 'Calentamiento', color: '#22C55E' },
    { value: 'technique', label: 'Técnica', color: '#3B82F6' },
    { value: 'conditioning', label: 'Acondicionamiento', color: '#EF4444' },
    { value: 'cooldown', label: 'Enfriamiento', color: '#8B5CF6' },
    { value: 'custom', label: 'Personalizado', color: '#6B7280' }
  ];

  // Filter and sort templates
  const filteredTemplates = blockTemplates
    .filter(template => {
      const matchesSearch = searchTerm === '' || 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
      
      const matchesTags = filterTags.length === 0 || 
        filterTags.some(tagId => template.tags.includes(tagId));
      
      return matchesSearch && matchesCategory && matchesTags;
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
          return a.estimatedDuration - b.estimatedDuration;
        default:
          return 0;
      }
    });

  const getCategoryColor = (category: string) => {
    return categories.find(c => c.value === category)?.color || '#6B7280';
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || 'Personalizado';
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const handlePreview = (template: BlockTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="pr-12">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Biblioteca de Bloques</h1>
                  <p className="text-purple-100">Plantillas reutilizables para construcción rápida de rutinas</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Package className="w-4 h-4" />
                  <span>{filteredTemplates.length} plantilla{filteredTemplates.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>{filteredTemplates.filter(t => !t.isDefault).length} personalizada{filteredTemplates.filter(t => !t.isDefault).length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-elevated">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-dark-surface dark:text-white"
                  placeholder="Buscar bloques..."
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-dark-surface dark:text-white"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-dark-surface dark:text-white"
              >
                <option value="updated">Última actualización</option>
                <option value="created">Fecha de creación</option>
                <option value="name">Nombre A-Z</option>
                <option value="duration">Duración</option>
              </select>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                {filteredTemplates.length} resultado{filteredTemplates.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No se encontraron bloques</h3>
                <p>Ajusta los filtros o crea tu primer bloque personalizado</p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredTemplates.map((template) => (
                  <div 
                    key={template.id} 
                    className={`bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border rounded-lg hover:shadow-md dark:hover:shadow-dark transition-all ${
                      viewMode === 'grid' ? 'p-6' : 'p-4'
                    }`}
                  >
                    {viewMode === 'grid' ? (
                      // Grid View
                      <>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                              style={{ backgroundColor: template.color }}
                            >
                              <Package className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                            </div>
                          </div>
                          
                          {template.isDefault && (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                              Por defecto
                            </span>
                          )}
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Categoría:</span>
                            <span 
                              className="px-2 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: getCategoryColor(template.category || 'custom') }}
                            >
                              {getCategoryLabel(template.category || 'custom')}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Ejercicios:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{template.exercises.length}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Duración:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{formatDuration(template.estimatedDuration)}</span>
                          </div>

                          {template.notes && (
                            <div className="flex items-center space-x-2 text-sm">
                              <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                              <span className="text-orange-600 dark:text-orange-400">Incluye notas para estudiantes</span>
                            </div>
                          )}
                        </div>

                        {template.tags.length > 0 && (
                          <div className="mb-4">
                            <TagDisplay 
                              tags={availableTags} 
                              selectedTagIds={template.tags} 
                              size="sm" 
                              maxDisplay={3}
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => onInsertBlock(template)}
                            className="px-3 py-2 text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors flex items-center justify-center space-x-1"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Insertar</span>
                          </button>
                          
                          <button
                            onClick={() => handlePreview(template)}
                            className="px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Vista Previa</span>
                          </button>
                          
                          <button
                            onClick={() => onDuplicateAndEdit(template)}
                            className="px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center space-x-1"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Duplicar</span>
                          </button>
                          
                          {!template.isDefault && (
                            <button
                              onClick={() => onDeleteTemplate(template.id)}
                              className="px-3 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center space-x-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Eliminar</span>
                            </button>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border text-xs text-gray-500 dark:text-gray-400">
                          Actualizada: {template.updatedAt.toLocaleDateString()}
                        </div>
                      </>
                    ) : (
                      // List View
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: template.color }}
                          >
                            <Package className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                              {template.isDefault && (
                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                                  Por defecto
                                </span>
                              )}
                              <span 
                                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: getCategoryColor(template.category || 'custom') }}
                              >
                                {getCategoryLabel(template.category || 'custom')}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{template.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>{template.exercises.length} ejercicios</span>
                              <span>{formatDuration(template.estimatedDuration)}</span>
                              <span>Actualizada: {template.updatedAt.toLocaleDateString()}</span>
                              {template.notes && (
                                <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400">
                                  <FileText className="w-3 h-3" />
                                  <span>Con notas</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => onInsertBlock(template)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                            title="Insertar bloque"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handlePreview(template)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Vista previa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => onDuplicateAndEdit(template)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Duplicar y editar"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          
                          {!template.isDefault && (
                            <button
                              onClick={() => onDeleteTemplate(template.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="relative p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <button
                onClick={() => setShowPreview(false)}
                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="pr-12">
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: selectedTemplate.color }}
                  >
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{selectedTemplate.name}</h1>
                    <p className="text-blue-100">Vista previa del bloque</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-6">
                {/* Block Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="font-medium text-blue-900 dark:text-blue-400">Categoría</div>
                    <div className="text-blue-600 dark:text-blue-300">{getCategoryLabel(selectedTemplate.category || 'custom')}</div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="font-medium text-green-900 dark:text-green-400">Ejercicios</div>
                    <div className="text-green-600 dark:text-green-300">{selectedTemplate.exercises.length}</div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="font-medium text-purple-900 dark:text-purple-400">Duración</div>
                    <div className="text-purple-600 dark:text-purple-300">{formatDuration(selectedTemplate.estimatedDuration)}</div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Descripción</h3>
                  <p className="text-gray-700 dark:text-gray-300">{selectedTemplate.description}</p>
                </div>

                {/* Notes */}
                {selectedTemplate.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Notas para Estudiantes</h3>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <p className="text-orange-900 dark:text-orange-100">{selectedTemplate.notes}</p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedTemplate.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Etiquetas</h3>
                    <TagDisplay 
                      tags={availableTags} 
                      selectedTagIds={selectedTemplate.tags} 
                      size="md"
                    />
                  </div>
                )}

                {/* Exercises */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ejercicios ({selectedTemplate.exercises.length})</h3>
                  <div className="space-y-3">
                    {selectedTemplate.exercises.map((exercise, index) => (
                      <div key={exercise.id} className="p-4 border border-gray-200 dark:border-dark-border rounded-lg">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="w-6 h-6 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <h4 className="font-medium text-gray-900 dark:text-white">{exercise.name}</h4>
                        </div>
                        {exercise.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{exercise.description}</p>
                        )}
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <div className="font-medium text-blue-900 dark:text-blue-400">Duración</div>
                            <div className="text-blue-600 dark:text-blue-300">{Math.floor(exercise.duration / 60)}:{(exercise.duration % 60).toString().padStart(2, '0')}</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                            <div className="font-medium text-green-900 dark:text-green-400">Descanso</div>
                            <div className="text-green-600 dark:text-green-300">{Math.floor(exercise.restTime / 60)}:{(exercise.restTime % 60).toString().padStart(2, '0')}</div>
                          </div>
                          <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                            <div className="font-medium text-purple-900 dark:text-purple-400">Rondas</div>
                            <div className="text-purple-600 dark:text-purple-300">{exercise.rounds}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-dark-elevated border-t border-gray-200 dark:border-dark-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  ¿Te gusta este bloque? Insértalo en tu rutina o duplícalo para personalizarlo.
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      onDuplicateAndEdit(selectedTemplate);
                      setShowPreview(false);
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Duplicar y Editar</span>
                  </button>
                  <button
                    onClick={() => {
                      onInsertBlock(selectedTemplate);
                      setShowPreview(false);
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Insertar en Rutina</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BlockLibrary;