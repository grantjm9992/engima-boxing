import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Tag, ChevronDown, Search } from 'lucide-react';
import { TagType } from './TagManager';

interface TagSelectorProps {
  availableTags: TagType[];
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
  onCreateTag?: () => void;
  placeholder?: string;
  className?: string;
  multiple?: boolean;
  required?: boolean;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  availableTags,
  selectedTags,
  onTagsChange,
  onCreateTag,
  placeholder = "Seleccionar etiquetas...",
  className = "",
  multiple = true,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!multiple ? true : !selectedTags.includes(tag.id))
  );

  const selectedTagObjects = availableTags.filter(tag => 
    selectedTags.includes(tag.id)
  );

  const handleTagSelect = (tagId: string) => {
    if (multiple) {
      onTagsChange([...selectedTags, tagId]);
    } else {
      onTagsChange([tagId]);
    }
    setSearchTerm('');
    if (!multiple) setIsOpen(false);
  };

  const handleTagRemove = (tagId: string) => {
    onTagsChange(selectedTags.filter(id => id !== tagId));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Tags Display (for multiple selection) */}
      {multiple && selectedTagObjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTagObjects.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: tag.color }}
            >
              <span>{tag.name}</span>
              <button
                onClick={() => handleTagRemove(tag.id)}
                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown Trigger */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 text-left border border-gray-300 dark:border-dark-border rounded-lg hover:border-gray-400 dark:hover:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors flex items-center justify-between ${
            required && selectedTags.length === 0 ? 'border-red-300 dark:border-red-700' : ''
          }`}
        >
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-gray-400" />
            {!multiple && selectedTagObjects.length > 0 ? (
              <span 
                className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: selectedTagObjects[0].color }}
              >
                {selectedTagObjects[0].name}
              </span>
            ) : (
              <span className={selectedTags.length > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                {selectedTags.length > 0 
                  ? `${selectedTags.length} etiqueta${selectedTags.length > 1 ? 's' : ''} seleccionada${selectedTags.length > 1 ? 's' : ''}`
                  : placeholder
                }
              </span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-lg shadow-lg z-50 max-h-60 overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200 dark:border-dark-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar etiquetas..."
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                  autoFocus
                />
              </div>
            </div>

            {/* Tags List */}
            <div className="max-h-40 overflow-y-auto">
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagSelect(tag.id)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors flex items-center space-x-2"
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    ></div>
                    <span className="text-sm text-gray-900 dark:text-white">{tag.name}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                  <Tag className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm">
                    {searchTerm ? 'No se encontraron etiquetas' : 'No hay etiquetas disponibles'}
                  </p>
                </div>
              )}
            </div>

            {/* Create New Tag Button */}
            {onCreateTag && (
              <div className="p-3 border-t border-gray-200 dark:border-dark-border">
                <button
                  onClick={() => {
                    onCreateTag();
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear nueva etiqueta</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Required indicator */}
      {required && selectedTags.length === 0 && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          Selecciona al menos una etiqueta
        </p>
      )}
    </div>
  );
};

export default TagSelector;