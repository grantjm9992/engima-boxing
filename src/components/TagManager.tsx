import React, { useState } from 'react';
import { Plus, X, Edit3, Trash2, Tag, Palette, Save, Hash, Search, Filter } from 'lucide-react';

export interface TagType {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

interface TagManagerProps {
  tags: TagType[];
  onCreateTag: (tag: Omit<TagType, 'id' | 'createdAt'>) => void;
  onUpdateTag: (id: string, updates: Partial<TagType>) => void;
  onDeleteTag: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const TagManager: React.FC<TagManagerProps> = ({
  tags,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  isOpen,
  onClose
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTagForm, setNewTagForm] = useState({ name: '', color: '#3B82F6' });

  const colorPalette = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
    '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#C026D3', '#DB2777', '#E11D48', '#DC2626'
  ];

  // Filter tags based on search term
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTag = () => {
    if (newTagForm.name.trim()) {
      onCreateTag({
        name: newTagForm.name.trim(),
        color: newTagForm.color
      });
      setNewTagForm({ name: '', color: '#3B82F6' });
      setIsCreating(false);
    }
  };

  const handleUpdateTag = (tagId: string, updates: Partial<TagType>) => {
    onUpdateTag(tagId, updates);
    setEditingTag(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Etiquetas</h2>
                <p className="text-gray-600 dark:text-gray-400">Crea y administra etiquetas para rutinas y ejercicios</p>
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
          {/* Search and Filters */}
          <div className="mb-6 flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                placeholder="Buscar etiquetas..."
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              {filteredTags.length} etiqueta(s)
            </div>
          </div>

          {/* Create New Tag Section */}
          <div className="mb-6">
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-600 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Plus className="w-5 h-5" />
                <span>Crear Nueva Etiqueta</span>
              </button>
            ) : (
              <div className="p-4 border-2 border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center space-x-3 mb-3">
                  <Hash className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Nueva Etiqueta</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre</label>
                    <input
                      type="text"
                      value={newTagForm.name}
                      onChange={(e) => setNewTagForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Técnica, Sparring, Cardio..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: newTagForm.color }}
                      ></div>
                      <div className="flex flex-wrap gap-2">
                        {colorPalette.slice(0, 8).map(color => (
                          <button
                            key={color}
                            onClick={() => setNewTagForm(prev => ({ ...prev, color }))}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                              newTagForm.color === color ? 'border-gray-800 dark:border-gray-200 scale-110' : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={handleCreateTag}
                    disabled={!newTagForm.name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Crear</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewTagForm({ name: '', color: '#3B82F6' });
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Existing Tags */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Etiquetas Existentes ({filteredTags.length})
            </h3>
            
            {filteredTags.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p>No hay etiquetas creadas aún</p>
                <p className="text-sm">Crea tu primera etiqueta para comenzar</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTags.map((tag) => (
                  <div key={tag.id} className="p-4 border border-gray-200 dark:border-dark-border rounded-lg hover:shadow-md dark:hover:shadow-dark transition-shadow">
                    {editingTag === tag.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          defaultValue={tag.name}
                          onBlur={(e) => {
                            if (e.target.value.trim() && e.target.value !== tag.name) {
                              handleUpdateTag(tag.id, { name: e.target.value.trim() });
                            } else {
                              setEditingTag(null);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            } else if (e.key === 'Escape') {
                              setEditingTag(null);
                            }
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-dark-border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                          autoFocus
                        />
                        <div className="flex flex-wrap gap-1">
                          {colorPalette.slice(0, 6).map(color => (
                            <button
                              key={color}
                              onClick={() => handleUpdateTag(tag.id, { color })}
                              className={`w-4 h-4 rounded-full border transition-all ${
                                tag.color === color ? 'border-gray-800 dark:border-gray-200 scale-110' : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            ></div>
                            <span className="font-medium text-gray-900 dark:text-white">{tag.name}</span>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setEditingTag(tag.id)}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="Editar etiqueta"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteTag(tag.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Eliminar etiqueta"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Creada: {tag.createdAt.toLocaleDateString()}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-dark-elevated border-t border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Las etiquetas te ayudan a organizar y filtrar tu contenido
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagManager;