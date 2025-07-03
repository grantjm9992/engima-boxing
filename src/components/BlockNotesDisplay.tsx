import React from 'react';
import { FileText, Info, AlertTriangle, Target } from 'lucide-react';

interface BlockNotesDisplayProps {
  blockName: string;
  notes: string;
  blockColor: string;
  className?: string;
  variant?: 'preview' | 'execution' | 'compact';
}

const BlockNotesDisplay: React.FC<BlockNotesDisplayProps> = ({
  blockName,
  notes,
  blockColor,
  className = "",
  variant = 'preview'
}) => {
  if (!notes.trim()) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'execution':
        return {
          container: 'p-4 rounded-lg border-l-4 bg-white dark:bg-dark-surface shadow-md',
          header: 'text-lg font-semibold mb-2',
          content: 'text-base leading-relaxed'
        };
      case 'compact':
        return {
          container: 'p-3 rounded-lg border-l-4 bg-gray-50 dark:bg-dark-elevated',
          header: 'text-sm font-medium mb-1',
          content: 'text-sm leading-relaxed'
        };
      default: // preview
        return {
          container: 'p-4 rounded-lg border-l-4 bg-blue-50 dark:bg-blue-900/20',
          header: 'text-base font-semibold mb-2',
          content: 'text-sm leading-relaxed'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div 
      className={`${styles.container} ${className}`}
      style={{ borderLeftColor: blockColor }}
    >
      <div className="flex items-start space-x-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 mt-1"
          style={{ backgroundColor: blockColor }}
        >
          <FileText className="w-4 h-4" />
        </div>
        
        <div className="flex-1">
          <div className={`${styles.header} text-gray-900 dark:text-white flex items-center space-x-2`}>
            <span>Instrucciones para: {blockName}</span>
            {variant === 'execution' && (
              <Target className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          
          <div className={`${styles.content} text-gray-700 dark:text-gray-300 whitespace-pre-wrap`}>
            {notes}
          </div>
          
          {variant === 'preview' && (
            <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <Info className="w-3 h-3" />
              <span>Visible para el estudiante durante la ejecución</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockNotesDisplay;