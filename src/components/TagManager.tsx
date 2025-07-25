import React, { useState, useEffect } from 'react';
import { Plus, X, Edit3, Trash2, Tag, Palette, Save, Hash, Search, Filter, Loader2 } from 'lucide-react';
import { useRoutineDatabase } from '../hooks/useRoutineDatabase';

export interface TagType {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: Date;
  isActive?: boolean;
}

interface TagManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TagManager: React.FC<TagManagerProps> = ({
                                                 isOpen,
                                                 onClose
                                               }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTagForm, setNewTagForm] = useState({ name: '', color: '#3B82F6', description: '' });
  const [editForm, setEditForm] = useState({ name: '', color: '#3B82F6', description: '' });

  const {
    tags,
    isLoading,
    error,
    createTag,
    updateTag,
    deleteTag,
    setError
  } = useRoutineDatabase();

  const colorPalette = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
    '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#C026D3', '#DB2777', '#E11D48', '#DC2626'
  ];

  // Filter tags based on search term
  const filteredTags = tags.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateTag = async () => {
    if (newTagForm.name.trim()) {
      try {
        await createTag({
          name: newTagForm.name.trim(),
          color: newTagForm.color,
          description: newTagForm.description.trim() || undefined,
        });
        setNewTagForm({ name: '', color: '#3B82F6', description: '' });
        setIsCreating(false);
      } catch (error) {
        // Error is handled by the hook
        console.error('Failed to create tag:', error);
      }
    }
  };

  const handleUpdateTag = async (tagId: string, updates: Partial<TagType>) => {
    try {
      await updateTag(tagId, updates);
      setEditingTag(null);
      setEditForm({ name: '', color: '#3B82F6', description: '' });
    } catch (error) {
      // Error is handled by the hook
      console.error('Failed to update tag:', error);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta etiqueta? Esta acción no se puede deshacer.')) {
      try {
        await deleteTag(tagId);
      } catch (error) {
        // Error is handled by the hook
        console.error('Failed to delete tag:', error);
      }
    }
  };

  const startEditing = (tag: TagType) => {
    setEditingTag(tag.id);
    setEditForm({
      name: tag.name,
      color: tag.color,
      description: tag.description || '',
    });
  };

  const cancelEditing = () => {
    setEditingTag(null);
    setEditForm({ name: '', color: '#3B82F6', description: '' });
  };

  const submitEdit = async () => {
    if (editingTag && editForm.name.trim()) {
      await handleUpdateTag(editingTag, {
        name: editForm.name.trim(),
        color: editForm.color,
        description: editForm.description.trim() || undefined,
      });
    }
  };

  // Clear error when component unmounts or closes
  useEffect(() => {
    if (!isOpen && error) {
      setError(null);
    }
  }, [isOpen, error, setError]);

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
            {/* Error Display */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span>{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-700 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
            )}

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
                    disabled={isLoading}
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
                      disabled={isLoading}
                      className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Crear nueva etiqueta</span>
                  </button>
              ) : (
                  <div className="p-4 border border-gray-200 dark:border-dark-border rounded-lg bg-gray-50 dark:bg-dark-elevated">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Nueva Etiqueta</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nombre
                        </label>
                        <input
                            type="text"
                            value={newTagForm.name}
                            onChange={(e) => setNewTagForm({ ...newTagForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                            placeholder="Nombre de la etiqueta"
                            disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Descripción (opcional)
                        </label>
                        <input
                            type="text"
                            value={newTagForm.description}
                            onChange={(e) => setNewTagForm({ ...newTagForm, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                            placeholder="Descripción de la etiqueta"
                            disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Color
                        </label>
                        <div className="grid grid-cols-9 gap-2">
                          {colorPalette.map((color) => (
                              <button
                                  key={color}
                                  onClick={() => setNewTagForm({ ...newTagForm, color })}
                                  disabled={isLoading}
                                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-105 disabled:cursor-not-allowed ${
                                      newTagForm.color === color
                                          ? 'border-gray-800 dark:border-gray-200 scale-110'
                                          : 'border-gray-300 dark:border-gray-600'
                                  }`}
                                  style={{ backgroundColor: color }}
                              />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3 mt-4">
                      <button
                          onClick={handleCreateTag}
                          disabled={!newTagForm.name.trim() || isLoading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span>Crear</span>
                      </button>
                      <button
                          onClick={() => {
                            setIsCreating(false);
                            setNewTagForm({ name: '', color: '#3B82F6', description: '' });
                          }}
                          disabled={isLoading}
                          className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

              {isLoading && tags.length === 0 ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
                    <p className="text-gray-500 dark:text-gray-400">Cargando etiquetas...</p>
                  </div>
              ) : filteredTags.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No hay etiquetas que coincidan con tu búsqueda</p>
                    {searchTerm && (
                        <p className="text-sm mt-1">
                          Búsqueda: "{searchTerm}"
                        </p>
                    )}
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTags.map((tag) => (
                        <div key={tag.id} className="p-4 border border-gray-200 dark:border-dark-border rounded-lg hover:shadow-md dark:hover:shadow-dark transition-shadow">
                          {editingTag === tag.id ? (
                              <div className="space-y-3">
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-2 py-1 border border-gray-300 dark:border-dark-border rounded text-sm dark:bg-dark-surface dark:text-white"
                                    disabled={isLoading}
                                />
                                <input
                                    type="text"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full px-2 py-1 border border-gray-300 dark:border-dark-border rounded text-sm dark:bg-dark-surface dark:text-white"
                                    placeholder="Descripción (opcional)"
                                    disabled={isLoading}
                                />
                                <div className="grid grid-cols-6 gap-1">
                                  {colorPalette.slice(0, 12).map((color) => (
                                      <button
                                          key={color}
                                          onClick={() => setEditForm({ ...editForm, color })}
                                          disabled={isLoading}
                                          className={`w-6 h-6 rounded-full border transition-transform hover:scale-105 disabled:cursor-not-allowed ${
                                              editForm.color === color
                                                  ? 'border-gray-800 dark:border-gray-200 scale-110'
                                                  : 'border-gray-300 dark:border-gray-600'
                                          }`}
                                          style={{ backgroundColor: color }}
                                      />
                                  ))}
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                      onClick={submitEdit}
                                      disabled={!editForm.name.trim() || isLoading}
                                      className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                                  >
                                    {isLoading ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Save className="w-3 h-3" />
                                    )}
                                    <span>Guardar</span>
                                  </button>
                                  <button
                                      onClick={cancelEditing}
                                      disabled={isLoading}
                                      className="flex-1 px-2 py-1 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded text-sm hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                          ) : (
                              <>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: tag.color }}
                                    />
                                    <span className="font-medium text-gray-900 dark:text-white">
                              {tag.name}
                            </span>
                                  </div>
                                  <div className="flex space-x-1">
                                    <button
                                        onClick={() => startEditing(tag)}
                                        disabled={isLoading}
                                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTag(tag.id)}
                                        disabled={isLoading}
                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                                {tag.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                      {tag.description}
                                    </p>
                                )}
                                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            Creada: {tag.createdAt.toLocaleDateString()}
                          </span>
                                  <div
                                      className="px-2 py-1 rounded-full text-xs font-medium"
                                      style={{
                                        backgroundColor: tag.color + '20',
                                        color: tag.color
                                      }}
                                  >
                                    <Hash className="w-3 h-3 inline mr-1" />
                                    {tag.name}
                                  </div>
                                </div>
                              </>
                          )}
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default TagManager;