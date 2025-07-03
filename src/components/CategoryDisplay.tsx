import React from 'react';
import { Category } from './CategoryManager';

interface CategoryDisplayProps {
  categories: Category[];
  selectedCategoryIds: string[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
  showCount?: boolean;
  className?: string;
}

const CategoryDisplay: React.FC<CategoryDisplayProps> = ({
  categories,
  selectedCategoryIds,
  size = 'md',
  maxDisplay,
  showCount = false,
  className = ""
}) => {
  const selectedCategories = categories.filter(category => selectedCategoryIds.includes(category.id));
  
  if (selectedCategories.length === 0) return null;

  const displayCategories = maxDisplay ? selectedCategories.slice(0, maxDisplay) : selectedCategories;
  const remainingCount = selectedCategories.length - displayCategories.length;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayCategories.map((category) => (
        <span
          key={category.id}
          className={`inline-flex items-center rounded-full font-medium text-white ${sizeClasses[size]}`}
          style={{ backgroundColor: category.color }}
          title={category.name}
        >
          {category.name}
        </span>
      ))}
      
      {remainingCount > 0 && (
        <span
          className={`inline-flex items-center rounded-full font-medium bg-gray-500 text-white ${sizeClasses[size]}`}
          title={`${remainingCount} categoría${remainingCount > 1 ? 's' : ''} más`}
        >
          +{remainingCount}
        </span>
      )}
      
      {showCount && (
        <span className="text-xs text-gray-500 ml-1">
          ({selectedCategories.length})
        </span>
      )}
    </div>
  );
};

export default CategoryDisplay;