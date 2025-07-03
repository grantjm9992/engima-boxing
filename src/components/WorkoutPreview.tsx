import React, { useState } from 'react';
import { 
  Play, X, Clock, Users, Shield, AlertTriangle, CheckCircle, 
  Package, Info, Target, Zap, Eye, Settings, Tag, FileText
} from 'lucide-react';
import { TagType } from './TagManager';
import TagDisplay from './TagDisplay';
import BlockNotesDisplay from './BlockNotesDisplay';

export interface MaterialItem {
  id: string;
  name: string;
  required: boolean;
  category: 'protection' | 'equipment' | 'clothing' | 'accessories';
}

export interface WorkoutPreviewData {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  materials: MaterialItem[];
  warnings: string[];
  notes: string[];
  tags: string[];
  blockStructure?: {
    blocks: Array<{
      id: string;
      name: string;
      description: string;
      color: string;
      notes: string;
      exercises: any[];
    }>;
  };
}

interface WorkoutPreviewProps {
  workout: WorkoutPreviewData;
  availableTags: TagType[];
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  onEdit?: () => void;
}

const WorkoutPreview: React.FC<WorkoutPreviewProps> = ({
  workout,
  availableTags,
  isOpen,
  onClose,
  onStart,
  onEdit
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'blocks' | 'materials' | 'notes'>('overview');

  if (!isOpen) return null;

  const requiredMaterials = workout.materials.filter(m => m.required);
  const optionalMaterials = workout.materials.filter(m => !m.required);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return 'No definido';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'protection': return <Shield className="w-4 h-4" />;
      case 'equipment': return <Target className="w-4 h-4" />;
      case 'clothing': return <Users className="w-4 h-4" />;
      case 'accessories': return <Package className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'protection': return 'Protección';
      case 'equipment': return 'Equipamiento';
      case 'clothing': return 'Vestimenta';
      case 'accessories': return 'Accesorios';
      default: return 'Otros';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const hasBlockStructure = workout.blockStructure && workout.blockStructure.blocks.length > 0;
  const blocksWithNotes = hasBlockStructure ? workout.blockStructure.blocks.filter(block => block.notes.trim()) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-red-600 to-red-700 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="pr-12">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{workout.name}</h1>
                <p className="text-red-100">Vista previa de rutina</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(workout.estimatedDuration)}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(workout.difficulty)}`}>
                {getDifficultyLabel(workout.difficulty)}
              </span>
              {workout.tags.length > 0 && (
                <TagDisplay 
                  tags={availableTags} 
                  selectedTagIds={workout.tags} 
                  size="sm" 
                  maxDisplay={3}
                />
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-dark-border">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Resumen', icon: Info },
              ...(hasBlockStructure ? [{ id: 'blocks', label: 'Bloques', icon: FileText }] : []),
              { id: 'materials', label: 'Material', icon: Package },
              { id: 'notes', label: 'Notas', icon: AlertTriangle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'blocks' && blocksWithNotes.length > 0 && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Descripción del Entrenamiento</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{workout.description}</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">Duración</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatDuration(workout.estimatedDuration)}</p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-900 dark:text-green-100">Material</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{workout.materials.length}</p>
                  <p className="text-sm text-green-700 dark:text-green-300">{requiredMaterials.length} obligatorio(s)</p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-medium text-purple-900 dark:text-purple-100">Intensidad</span>
                  </div>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{getDifficultyLabel(workout.difficulty)}</p>
                </div>
              </div>

              {/* Tags */}
              {workout.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Etiquetas</h3>
                  <TagDisplay 
                    tags={availableTags} 
                    selectedTagIds={workout.tags} 
                    size="md"
                  />
                </div>
              )}

              {/* Block Structure Overview */}
              {hasBlockStructure && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Estructura de Bloques</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {workout.blockStructure.blocks.map((block, index) => (
                      <div key={block.id} className="p-3 rounded-lg border border-gray-200 dark:border-dark-border">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                            style={{ backgroundColor: block.color }}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{block.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {block.exercises.length} ejercicio{block.exercises.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          {block.notes && (
                            <FileText className="w-4 h-4 text-blue-500" title="Tiene notas para el estudiante" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'blocks' && hasBlockStructure && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Instrucciones por Bloque</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Estas instrucciones te ayudarán a prepararte para cada sección del entrenamiento.
                </p>
              </div>

              {blocksWithNotes.length > 0 ? (
                <div className="space-y-4">
                  {blocksWithNotes.map((block) => (
                    <BlockNotesDisplay
                      key={block.id}
                      blockName={block.name}
                      notes={block.notes}
                      blockColor={block.color}
                      variant="preview"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p>No hay instrucciones específicas por bloque</p>
                  <p className="text-sm">Los bloques no tienen notas adicionales para el estudiante</p>
                </div>
              )}

              {/* All Blocks Overview */}
              <div className="mt-8">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Todos los Bloques</h4>
                <div className="space-y-3">
                  {workout.blockStructure.blocks.map((block, index) => (
                    <div key={block.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-dark-elevated rounded-lg">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: block.color }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 dark:text-white">{block.name}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{block.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {block.exercises.length} ejercicio{block.exercises.length !== 1 ? 's' : ''}
                        </div>
                        {block.notes && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center space-x-1">
                            <FileText className="w-3 h-3" />
                            <span>Con instrucciones</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-6">
              {/* Required Materials */}
              {requiredMaterials.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Shield className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Material Obligatorio</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {requiredMaterials.map((material) => (
                      <div key={material.id} className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="text-red-600 dark:text-red-400">
                          {getCategoryIcon(material.category)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-red-900 dark:text-red-100">{material.name}</p>
                          <p className="text-xs text-red-700 dark:text-red-300">{getCategoryLabel(material.category)}</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Materials */}
              {optionalMaterials.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Package className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Material Opcional</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {optionalMaterials.map((material) => (
                      <div key={material.id} className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="text-blue-600 dark:text-blue-400">
                          {getCategoryIcon(material.category)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-blue-900 dark:text-blue-100">{material.name}</p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">{getCategoryLabel(material.category)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {workout.materials.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p>No se requiere material específico</p>
                  <p className="text-sm">Esta rutina se puede realizar sin equipamiento adicional</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              {/* Warnings */}
              {workout.warnings.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advertencias Importantes</h3>
                  </div>
                  <div className="space-y-3">
                    {workout.warnings.map((warning, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                        <p className="text-orange-900 dark:text-orange-100">{warning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {workout.notes.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Info className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notas Adicionales</h3>
                  </div>
                  <div className="space-y-3">
                    {workout.notes.map((note, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-blue-900 dark:text-blue-100">{note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {workout.warnings.length === 0 && workout.notes.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Info className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p>No hay notas adicionales</p>
                  <p className="text-sm">Esta rutina no tiene advertencias o notas especiales</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 dark:bg-dark-elevated border-t border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>¿Todo listo? Asegúrate de tener el material necesario antes de comenzar.</p>
              {blocksWithNotes.length > 0 && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  💡 Revisa las instrucciones de cada bloque en la pestaña "Bloques"
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onStart}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Iniciar Rutina</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPreview;