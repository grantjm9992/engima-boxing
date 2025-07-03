import React from 'react';
import { TagType } from './TagManager';

interface TagDisplayProps {
  tags: TagType[];
  selectedTagIds: string[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
  showCount?: boolean;
  className?: string;
}

const TagDisplay: React.FC<TagDisplayProps> = ({
  tags,
  selectedTagIds,
  size = 'md',
  maxDisplay,
  showCount = false,
  className = ""
}) => {
  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));
  
  if (selectedTags.length === 0) return null;

  const displayTags = maxDisplay ? selectedTags.slice(0, maxDisplay) : selectedTags;
  const remainingCount = selectedTags.length - displayTags.length;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayTags.map((tag) => (
        <span
          key={tag.id}
          className={`inline-flex items-center rounded-full font-medium text-white ${sizeClasses[size]}`}
          style={{ backgroundColor: tag.color }}
          title={tag.name}
        >
          {tag.name}
        </span>
      ))}
      
      {remainingCount > 0 && (
        <span
          className={`inline-flex items-center rounded-full font-medium bg-gray-500 text-white ${sizeClasses[size]}`}
          title={`${remainingCount} etiqueta${remainingCount > 1 ? 's' : ''} más`}
        >
          +{remainingCount}
        </span>
      )}
      
      {showCount && (
        <span className="text-xs text-gray-500 ml-1">
          ({selectedTags.length})
        </span>
      )}
    </div>
  );
};

export default TagDisplay;