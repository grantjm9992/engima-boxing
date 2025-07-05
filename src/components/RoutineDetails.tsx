import React from 'react';
import { 
  X, Clock, Target, Users, Shield, Package, 
  Play, Edit3, Copy, Send, Star, Eye,
  Zap, Calendar, BookOpen, AlertTriangle, Tag
} from 'lucide-react';
import { Routine } from './RoutineManager';
import { Category } from './CategoryManager';
import CategoryDisplay from './CategoryDisplay';

interface RoutineDetailsProps {
  routine: Routine;
  availableCategories: Category[];
  onClose: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onApply: () => void;
  onAssign: () => void;
  onToggleFavorite: () => void;
  isOpen: boolean;
}

const RoutineDetails: React.FC<RoutineDetailsProps> = ({
  routine,
  availableCategories,
  onClose,
  onEdit,
  onDuplicate,
  onApply,
  onAssign,
  onToggleFavorite,
  isOpen
}) => {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  const difficultyLabels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado'
  };

  const categoryColors = {
    technique: 'bg-blue-100 text-blue-800',
    cardio: 'bg-red-100 text-red-800',
    strength: 'bg-purple-100 text-purple-800',
    flexibility: 'bg-green-100 text-green-800',
    sparring: 'bg-orange-100 text-orange-800'
  };

  const categoryLabels = {
    technique: 'Técnica',
    cardio: 'Cardio',
    strength: 'Fuerza',
    flexibility: 'Flexibilidad',
    sparring: 'Sparring'
  };

  const intensityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const intensityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta'
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${minutes}:00`;
  };

  const formatTotalDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
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
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold">{routine.name}</h1>
                  {routine.isFavorite && (
                    <Star className="w-6 h-6 text-yellow-300 fill-current" />
                  )}
                </div>
                <p className="text-red-100">Detalles completos de la rutina</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              {routine.isTemplate && (
                <span className="px-2 py-1 bg-purple-500 text-white rounded-full text-xs font-medium">
                  Plantilla
                </span>
              )}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[routine.difficulty]}`}>
                {difficultyLabels[routine.difficulty]}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                routine.visibility === 'shared' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-500 text-white'
              }`}>
                {routine.visibility === 'shared' ? 'Compartida' : 'Privada'}
              </span>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatTotalDuration(routine.totalDuration)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
                
                {routine.description && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Descripción</h4>
                    <p className="text-gray-600">{routine.description}</p>
                  </div>
                )}

                {routine.objective && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Objetivo de la Sesión</h4>
                    <p className="text-gray-600">{routine.objective}</p>
                  </div>
                )}

              </div>

              {/* Exercises */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Ejercicios ({routine.exercises.length})
                </h3>
                
                <div className="space-y-4">
                  {routine.exercises.map((exercise, index) => (
                    <div key={exercise.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${categoryColors[exercise.category]}`}>
                              {categoryLabels[exercise.category]}
                            </span>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${intensityColors[exercise.intensity]}`}>
                              {intensityLabels[exercise.intensity]}
                            </span>
                          </div>

                          {exercise.description && (
                            <p className="text-sm text-gray-600 mb-3">{exercise.description}</p>
                          )}
                          
                          {/* Exercise Categories */}
                          {exercise.categories && exercise.categories.length > 0 && (
                            <div className="mb-3">
                              <CategoryDisplay 
                                categories={availableCategories} 
                                selectedCategoryIds={exercise.categories} 
                                size="sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-medium text-blue-900">Duración</div>
                          <div className="text-blue-600">{formatDuration(exercise.duration)}</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-medium text-green-900">Descanso</div>
                          <div className="text-green-600">{formatDuration(exercise.restTime)}</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="font-medium text-purple-900">Rondas</div>
                          <div className="text-purple-600">{exercise.rounds}</div>
                        </div>
                      </div>

                      {exercise.instructions && exercise.instructions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <h5 className="font-medium text-gray-700 mb-2">Instrucciones</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {exercise.instructions.map((instruction, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                <span>{instruction}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Trainer Notes */}
              {routine.trainerNotes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Notas del Entrenador</h3>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{routine.trainerNotes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Duración Total</span>
                    </div>
                    <span className="font-medium text-gray-900">{formatTotalDuration(routine.totalDuration)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Ejercicios</span>
                    </div>
                    <span className="font-medium text-gray-900">{routine.exercises.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-600">Rondas Totales</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {routine.exercises.reduce((total, ex) => total + ex.rounds, 0)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-gray-600">Creada</span>
                    </div>
                    <span className="font-medium text-gray-900">{routine.createdAt.toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Actualizada</span>
                    </div>
                    <span className="font-medium text-gray-900">{routine.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Material and Protection */}
              {(routine.materials.length > 0 || routine.protection.length > 0) && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Material y Protección</h3>
                  
                  {routine.materials.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-700">Material</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {routine.materials.map((material, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                            <span>{material.name}</span>
                            {material.required && (
                              <span className="text-xs bg-red-100 text-red-800 px-1 rounded">Obligatorio</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {routine.protection.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-700">Protección</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {routine.protection.map((protection, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                            <span>{protection}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={onApply}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Aplicar Rutina</span>
                  </button>
                  
                  <button
                    onClick={onAssign}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Asignar a Estudiantes</span>
                  </button>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={onToggleFavorite}
                      className={`p-2 rounded-lg transition-colors ${
                        routine.isFavorite 
                          ? 'bg-yellow-100 text-yellow-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'
                      }`}
                      title="Favorita"
                    >
                      <Star className={`w-4 h-4 mx-auto ${routine.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={onEdit}
                      className="p-2 bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4 mx-auto" />
                    </button>
                    
                    <button
                      onClick={onDuplicate}
                      className="p-2 bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600 rounded-lg transition-colors"
                      title="Duplicar"
                    >
                      <Copy className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineDetails;