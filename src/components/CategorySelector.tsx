import React, { useState, useEffect, useRef } from 'react';
import { Tag, ChevronDown, Plus, X, Search } from 'lucide-react';
import { Category } from './CategoryManager';

interface CategorySelectorProps {
  availableCategories: Category[];
  selectedCategories: string[];
  onCategoriesChange: (categoryIds: string[]) => void;
  onCreateCategory?: () => void;
  placeholder?: string;
  className?: string;
  multiple?: boolean;
  required?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  availableCategories,
  selectedCategories,
  onCategoriesChange,
  onCreateCategory,
  placeholder = "Seleccionar categorías...",
  className = "",
  multiple = true,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategory, setNewCategory] = useState({ name: '', color: '#3B82F6' });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const colorOptions = [
    '#EF4444', // red
    '#F97316', // orange
    '#F59E0B', // amber
    '#22C55E', // green
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#6B7280'  // gray
  ];

  const filteredCategories = availableCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!multiple ? true : !selectedCategories.includes(category.id))
  );

  const selectedCategoryObjects = availableCategories.filter(category => 
    selectedCategories.includes(category.id)
  );

  const handleCategorySelect = (categoryId: string) => {
    if (multiple) {
      onCategoriesChange([...selectedCategories, categoryId]);
    } else {
      onCategoriesChange([categoryId]);
    }
    setSearchTerm('');
    if (!multiple) setIsOpen(false);
  };

  const handleCategoryRemove = (categoryId: string) => {
    onCategoriesChange(selectedCategories.filter(id => id !== categoryId));
  };

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      // Create a new category
      const newCategoryObj: Category = {
        id: `category_${Date.now()}`,
        name: newCategory.name.trim(),
        color: newCategory.color,
        createdAt: new Date()
      };
      
      // Add to available categories if onCreateCategory is provided
      if (onCreateCategory) {
        // This would typically call a function to add the category to the database
        // For now, we'll simulate this by adding it directly to the selected categories
        onCategoriesChange([...selectedCategories, newCategoryObj.id]);
      }
      
      // Reset form and close the add category UI
      setNewCategory({ name: '', color: '#3B82F6' });
      setIsAddingCategory(false);
      
      // Focus back on the search input
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  };

  // Handle Enter key in the new category input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCategory();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsAddingCategory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Categories Display (for multiple selection) */}
      {multiple && selectedCategoryObjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedCategoryObjects.map((category) => (
            <span
              key={category.id}
              className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: category.color }}
            >
              <span>{category.name}</span>
              <button
                onClick={() => handleCategoryRemove(category.id)}
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
            required && selectedCategories.length === 0 ? 'border-red-300 dark:border-red-700' : ''
          }`}
        >
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-gray-400" />
            {!multiple && selectedCategoryObjects.length > 0 ? (
              <span 
                className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: selectedCategoryObjects[0].color }}
              >
                {selectedCategoryObjects[0].name}
              </span>
            ) : (
              <span className={selectedCategories.length > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                {selectedCategories.length > 0 
                  ? `${selectedCategories.length} categoría${selectedCategories.length > 1 ? 's' : ''} seleccionada${selectedCategories.length > 1 ? 's' : ''}`
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
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar categorías..."
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                  autoFocus
                />
              </div>
            </div>

            {/* Categories List */}
            <div className="max-h-40 overflow-y-auto">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors flex items-center space-x-2"
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-sm text-gray-900 dark:text-white">{category.name}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                  <Tag className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm">
                    {searchTerm ? 'No se encontraron categorías' : 'No hay categorías disponibles'}
                  </p>
                </div>
              )}
            </div>

            {/* Add New Category */}
            {isAddingCategory ? (
              <div className="p-3 border-t border-gray-200 dark:border-dark-border">
                <div className="mb-2">
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      onKeyDown={handleKeyDown}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                      placeholder="Nombre de categoría"
                      autoFocus
                    />
                    <div className="flex items-center space-x-1">
                      {colorOptions.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewCategory({ ...newCategory, color })}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            newCategory.color === color ? 'border-gray-800 dark:border-gray-200 scale-110' : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddCategory}
                      disabled={!newCategory.name.trim()}
                      className="flex-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategory({ name: '', color: '#3B82F6' });
                      }}
                      className="px-3 py-1 border border-gray-300 dark:border-dark-border text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 border-t border-gray-200 dark:border-dark-border">
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className="w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear nueva categoría</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Required indicator */}
      {required && selectedCategories.length === 0 && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          Selecciona al menos una categoría
        </p>
      )}
    </div>
  );
};

export default CategorySelector;