import React, { useState } from 'react';
import { 
  Plus, X, Edit3, Trash2, Save, Copy, 
  Package, Tag, Clock, Target, FileText, 
  Zap, Play, Pause, Eye, Settings, Palette
} from 'lucide-react';
import { Exercise } from './RoutineManager';
import ExerciseCard from './ExerciseCard';
import AdvancedNotes from './AdvancedNotes';
import { AdvancedNote } from './AdvancedNotes';
import { TagType } from './TagManager';
import TagSelector from './TagSelector';
import TagDisplay from './TagDisplay';

export interface Block {
  id: string;
  name: string;
  description: string;
  color: string;
  exercises: Exercise[];
  notes: string;
  advancedNotes: AdvancedNote | null;
  estimatedDuration: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
  tags?: string[]; // Tag IDs
}

interface BlockEditorProps {
  block: Block;
  availableTags?: TagType[];
  onUpdateBlock: (updates: Partial<Block>) => void;
  onAddExercise: () => void;
  onEditExercise: (exercise: Exercise) => void;
  onDuplicateExercise: (exercise: Exercise) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onPlayExercise?: (exercise: Exercise) => void;
  onPlayBlock?: (block: Block) => void;
  onOpenTagManager?: () => void;
  className?: string;
}

const BlockEditor: React.FC<BlockEditorProps> = ({
  block,
  availableTags = [],
  onUpdateBlock,
  onAddExercise,
  onEditExercise,
  onDuplicateExercise,
  onRemoveExercise,
  onPlayExercise,
  onPlayBlock,
  onOpenTagManager,
  className = ""
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingAdvancedNotes, setIsEditingAdvancedNotes] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const colorOptions = [
    '#EF4444', // red
    '#F97316', // orange
    '#F59E0B', // amber
    '#EAB308', // yellow
    '#84CC16', // lime
    '#22C55E', // green
    '#10B981', // emerald
    '#14B8A6', // teal
    '#06B6D4', // cyan
    '#0EA5E9', // sky
    '#3B82F6', // blue
    '#6366F1', // indigo
    '#8B5CF6', // violet
    '#A855F7', // purple
    '#D946EF', // fuchsia
    '#EC4899', // pink
    '#F43F5E', // rose
    '#6B7280'  // gray
  ];

  const calculateTotalDuration = () => {
    return block.exercises.reduce((total, exercise) => {
      const exerciseDuration = (exercise.duration * exercise.rounds) / 60; // convert to minutes
      const restDuration = (exercise.restTime * (exercise.rounds - 1)) / 60; // rest between rounds
      return total + exerciseDuration + restDuration;
    }, 0);
  };

  const handleUpdateAdvancedNotes = (id: string, updates: Partial<AdvancedNote>) => {
    onUpdateBlock({
      advancedNotes: {
        ...block.advancedNotes!,
        ...updates,
        updatedAt: new Date()
      }
    });
  };

  const handleSaveAdvancedNotes = (note: Omit<AdvancedNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    onUpdateBlock({
      advancedNotes: {
        id: `note_${Date.now()}`,
        ...note,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  };

  return (
    <div className={`border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden ${className}`}>
      {/* Block Header */}
      <div 
        className="p-4 text-white"
        style={{ backgroundColor: block.color }}
      >
        {isEditingDetails ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">
                Nombre del Módulo
              </label>
              <input
                type="text"
                value={block.name}
                onChange={(e) => onUpdateBlock({ name: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50"
                placeholder="Nombre del módulo"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={block.description}
                onChange={(e) => onUpdateBlock({ description: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50"
                placeholder="Descripción breve"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    onClick={() => onUpdateBlock({ color })}
                    className={`w-6 h-6 rounded-full transition-all ${
                      block.color === color ? 'ring-2 ring-white scale-125' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">
                Categoría
              </label>
              <TagSelector
                availableTags={availableTags}
                selectedTags={block.tags || []}
                onTagsChange={(tags) => onUpdateBlock({ tags })}
                onCreateTag={onOpenTagManager}
                placeholder="Seleccionar categoría..."
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setIsEditingDetails(false)}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
              >
                Listo
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold">{block.name}</h3>
                <button
                  onClick={() => setIsEditingDetails(true)}
                  className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                  title="Editar detalles del módulo"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
              
              <p className="text-sm text-white/80">{block.description}</p>
              
              <div className="flex items-center space-x-4 mt-2 text-sm text-white/70">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{Math.round(calculateTotalDuration())} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>{block.exercises.length} ejercicio{block.exercises.length !== 1 ? 's' : ''}</span>
                </div>
                {block.advancedNotes && (
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>Con material audiovisual</span>
                  </div>
                )}
              </div>
            </div>
            
            {onPlayBlock && (
              <button
                onClick={() => onPlayBlock(block)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Reproducir módulo completo"
              >
                <Play className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Block Content */}
      <div className="p-4">
        {/* Tags */}
        {block.tags && block.tags.length > 0 && !isEditingDetails && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Tag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</span>
            </div>
            <TagDisplay 
              tags={availableTags} 
              selectedTagIds={block.tags} 
              size="sm"
            />
          </div>
        )}

        {/* Exercises */}
        <div className="space-y-3 mb-4">
          {block.exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              exerciseIndex={index}
              availableTags={availableTags}
              onPlay={onPlayExercise ? () => onPlayExercise(exercise) : undefined}
              onEdit={() => onEditExercise(exercise)}
              onDuplicate={() => onDuplicateExercise(exercise)}
              onDelete={() => onRemoveExercise(exercise.id)}
            />
          ))}
        </div>

        {/* Add Exercise Button */}
        <button
          onClick={onAddExercise}
          className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-600 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Ejercicio</span>
        </button>

        {/* Block Notes */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span>Notas para Estudiantes</span>
            </h4>
            <button
              onClick={() => setIsEditingNotes(!isEditingNotes)}
              className={`p-1 rounded transition-colors ${
                isEditingNotes 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
              title={isEditingNotes ? "Ver" : "Editar"}
            >
              {isEditingNotes ? <Eye className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
            </button>
          </div>
          
          {isEditingNotes ? (
            <textarea
              value={block.notes}
              onChange={(e) => onUpdateBlock({ notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-elevated dark:text-white"
              rows={4}
              placeholder="Instrucciones para los estudiantes, consejos, puntos clave..."
            />
          ) : (
            <div className="p-3 bg-gray-50 dark:bg-dark-elevated rounded-lg">
              {block.notes ? (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {block.notes}
                </p>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic">
                  No hay notas para los estudiantes
                </p>
              )}
            </div>
          )}
        </div>

        {/* Advanced Notes with Media */}
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2 mb-3">
            <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span>Material Audiovisual y Notas Técnicas</span>
          </h4>
          
          <AdvancedNotes
            note={block.advancedNotes}
            onSaveNote={handleSaveAdvancedNotes}
            onUpdateNote={handleUpdateAdvancedNotes}
            isEditing={isEditingAdvancedNotes}
            onToggleEdit={() => setIsEditingAdvancedNotes(!isEditingAdvancedNotes)}
            placeholder="Añade notas técnicas detalladas, enlaces a videos demostrativos, imágenes de referencia..."
            title="Material Técnico y Audiovisual"
          />
        </div>
      </div>
    </div>
  );
};

export default BlockEditor;