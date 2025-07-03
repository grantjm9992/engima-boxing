import React from 'react';
import { Play, Edit3, Copy, Trash2, Clock, Zap, Target, Tag, Star } from 'lucide-react';
import { Exercise } from './RoutineManager';
import { TagType } from './TagManager';
import TagDisplay from './TagDisplay';

interface ExerciseCardProps {
  exercise: Exercise;
  exerciseIndex: number;
  availableTags?: TagType[];
  onPlay?: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDuplicate?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  showControls?: boolean;
  variant?: 'default' | 'compact' | 'preview';
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  exerciseIndex,
  availableTags = [],
  onPlay,
  onEdit,
  onDuplicate,
  onDelete,
  showControls = true,
  variant = 'default'
}) => {
  const intensityColors = {
    low: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
    high: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
  };

  const intensityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta'
  };

  const levelColors = {
    principiante: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    intermedio: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
    avanzado: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
    competidor: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
    elite: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
  };

  const levelLabels = {
    principiante: 'Principiante',
    intermedio: 'Intermedio',
    avanzado: 'Avanzado',
    competidor: 'Competidor',
    elite: 'Élite'
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${minutes}:00`;
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          container: 'p-3 border border-gray-200 dark:border-dark-border rounded-lg',
          header: 'text-sm font-medium',
          description: 'text-xs text-gray-600 dark:text-gray-400',
          stats: 'text-xs'
        };
      case 'preview':
        return {
          container: 'p-4 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-sm',
          header: 'text-base font-semibold',
          description: 'text-sm text-gray-600 dark:text-gray-400',
          stats: 'text-sm'
        };
      default:
        return {
          container: 'p-4 border border-gray-200 dark:border-dark-border rounded-lg hover:shadow-md dark:hover:shadow-dark transition-shadow',
          header: 'text-base font-medium',
          description: 'text-sm text-gray-600 dark:text-gray-400',
          stats: 'text-sm'
        };
    }
  };

  const styles = getVariantStyles();

  const hasVariants = exercise.variants && Object.keys(exercise.variants).length > 0;

  return (
    <div className={styles.container}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Exercise Header */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="w-6 h-6 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
              {exerciseIndex + 1}
            </span>
            <h5 className={`${styles.header} text-gray-900 dark:text-white`}>{exercise.name}</h5>
            {exercise.isFavorite && (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            )}
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${intensityColors[exercise.intensity]}`}>
              {intensityLabels[exercise.intensity]}
            </span>
            {exercise.level && (
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${levelColors[exercise.level as keyof typeof levelColors] || 'bg-gray-100 text-gray-800'}`}>
                {levelLabels[exercise.level as keyof typeof levelLabels] || exercise.level}
              </span>
            )}
            {hasVariants && (
              <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                {Object.keys(exercise.variants!).length} variante(s)
              </span>
            )}
          </div>
          
          {/* Exercise Description */}
          {exercise.description && (
            <p className={`${styles.description} mb-2`}>{exercise.description}</p>
          )}

          {/* Tags */}
          {exercise.tags && exercise.tags.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Categoría:</div>
              <TagDisplay 
                tags={availableTags} 
                selectedTagIds={exercise.tags} 
                size="sm"
                maxDisplay={variant === 'compact' ? 2 : 4}
              />
            </div>
          )}

          {/* Exercise Stats */}
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <div className={`font-medium text-blue-900 dark:text-blue-400 ${styles.stats}`}>Duración</div>
              </div>
              <div className={`text-blue-600 dark:text-blue-300 ${styles.stats}`}>{formatDuration(exercise.duration)}</div>
            </div>
            <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Target className="w-3 h-3 text-green-600 dark:text-green-400" />
                <div className={`font-medium text-green-900 dark:text-green-400 ${styles.stats}`}>Descanso</div>
              </div>
              <div className={`text-green-600 dark:text-green-300 ${styles.stats}`}>{formatDuration(exercise.restTime)}</div>
            </div>
            <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Zap className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <div className={`font-medium text-purple-900 dark:text-purple-400 ${styles.stats}`}>Rondas</div>
              </div>
              <div className={`text-purple-600 dark:text-purple-300 ${styles.stats}`}>{exercise.rounds}</div>
            </div>
          </div>

          {/* Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && variant !== 'compact' && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-border">
              <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm">Instrucciones</h6>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {exercise.instructions.slice(0, variant === 'preview' ? 3 : exercise.instructions.length).map((instruction, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{instruction}</span>
                  </li>
                ))}
                {variant === 'preview' && exercise.instructions.length > 3 && (
                  <li className="text-xs text-gray-500 dark:text-gray-400 italic">
                    +{exercise.instructions.length - 3} instrucción(es) más...
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Materials and Protection */}
          {((exercise.materials && exercise.materials.length > 0) || 
            (exercise.protection && exercise.protection.length > 0)) && 
            variant !== 'compact' && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-border">
              <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm">Material Necesario</h6>
              <div className="grid grid-cols-2 gap-2">
                {exercise.materials && exercise.materials.length > 0 && (
                  <div>
                    <h6 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Material:</h6>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {exercise.materials.slice(0, 3).map((material, idx) => (
                        <li key={idx} className="flex items-start space-x-1">
                          <span className="w-1 h-1 bg-blue-400 rounded-full mt-1 flex-shrink-0"></span>
                          <span>{material}</span>
                        </li>
                      ))}
                      {exercise.materials.length > 3 && (
                        <li className="text-xs text-gray-500 dark:text-gray-400 italic">
                          +{exercise.materials.length - 3} más...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                
                {exercise.protection && exercise.protection.length > 0 && (
                  <div>
                    <h6 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Protección:</h6>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {exercise.protection.slice(0, 3).map((protection, idx) => (
                        <li key={idx} className="flex items-start space-x-1">
                          <span className="w-1 h-1 bg-red-400 rounded-full mt-1 flex-shrink-0"></span>
                          <span>{protection}</span>
                        </li>
                      ))}
                      {exercise.protection.length > 3 && (
                        <li className="text-xs text-gray-500 dark:text-gray-400 italic">
                          +{exercise.protection.length - 3} más...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        {showControls && (
          <div className="flex space-x-1 ml-4">
            {onPlay && (
              <button
                onClick={() => onPlay(exercise)}
                className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                title="Reproducir ejercicio"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(exercise)}
                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                title="Editar ejercicio"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onDuplicate && (
              <button
                onClick={() => onDuplicate(exercise)}
                className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                title="Duplicar ejercicio"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(exercise)}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Eliminar ejercicio"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseCard;