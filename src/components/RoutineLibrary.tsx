import React, { useState } from 'react';
import { 
  Search, Filter, Star, Eye, Play, Copy, Edit3, 
  Trash2, Send, Clock, Target, Tag, Users, Calendar,
  BookOpen, Zap, Heart, Grid, List, SortAsc
} from 'lucide-react';
import { Routine } from './RoutineManager';
import { TagType } from './TagManager';
import { StudentProfile } from './StudentProfile';
import TagDisplay from './TagDisplay';
import RoutineAssignment from './RoutineAssignment';

interface RoutineLibraryProps {
  routines: Routine[];
  availableTags: TagType[];
  students: StudentProfile[];
  groups: Array<{ id: string; name: string; studentIds: string[] }>;
  onEditRoutine: (routine: Routine) => void;
  onDuplicateRoutine: (routine: Routine) => void;
  onDeleteRoutine: (id: string) => void;
  onToggleFavorite: (routine: Routine) => void;
  onApplyRoutine: (routine: Routine) => void;
  onAssignRoutine: (assignment: any) => void;
  onViewDetails: (routine: Routine) => void;
}

const RoutineLibrary: React.FC<RoutineLibraryProps> = ({
  routines,
  availableTags,
  students,
  groups,
  onEditRoutine,
  onDuplicateRoutine,
  onDeleteRoutine,
  onToggleFavorite,
  onApplyRoutine,
  onAssignRoutine,
  onViewDetails
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all'); // all, routines, templates
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'duration' | 'favorites'>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  
  // Assignment modal
  const [assignmentRoutine, setAssignmentRoutine] = useState<Routine | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const difficultyOptions = [
    { value: 'beginner', label: 'Principiante', color: 'bg-green-100 text-green-800' },
    { value: 'intermediate', label: 'Intermedio', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'advanced', label: 'Avanzado', color: 'bg-red-100 text-red-800' }
  ];

  // Filter and sort routines
  const filteredRoutines = routines
    .filter(routine => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        routine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        routine.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        routine.objective.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Tags filter
      const matchesTags = filterTags.length === 0 || 
        filterTags.some(tagId => routine.tags.includes(tagId));
      
      // Difficulty filter
      const matchesDifficulty = filterDifficulty === 'all' || routine.difficulty === filterDifficulty;
      
      // Type filter
      const matchesType = filterType === 'all' || 
        (filterType === 'templates' && routine.isTemplate) ||
        (filterType === 'routines' && !routine.isTemplate);
      
      // Favorites filter
      const matchesFavorites = !showFavoritesOnly || routine.isFavorite;
      
      // Active filter (for trainer view)
      const matchesActive = !showActiveOnly || routine.visibility === 'shared';
      
      return matchesSearch && matchesTags && matchesDifficulty && matchesType && matchesFavorites && matchesActive;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'updated':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'duration':
          return a.totalDuration - b.totalDuration;
        case 'favorites':
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        default:
          return 0;
      }
    });

  const handleAssignRoutine = (routine: Routine) => {
    setAssignmentRoutine(routine);
    setShowAssignmentModal(true);
  };

  const handleAssignmentSubmit = (assignment: any) => {
    onAssignRoutine(assignment);
    setShowAssignmentModal(false);
    setAssignmentRoutine(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    return difficultyOptions.find(d => d.value === difficulty)?.color || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyLabel = (difficulty: string) => {
    return difficultyOptions.find(d => d.value === difficulty)?.label || difficulty;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Buscar por nombre, descripción o objetivo..."
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="routines">Solo rutinas</option>
              <option value="templates">Solo plantillas</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">Todas las dificultades</option>
              {difficultyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Additional Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="favorites-only"
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="favorites-only" className="text-sm text-gray-700">
                Solo favoritas
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active-only"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="active-only" className="text-sm text-gray-700">
                Solo activas
              </label>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <SortAsc className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="updated">Última actualización</option>
                <option value="created">Fecha de creación</option>
                <option value="name">Nombre A-Z</option>
                <option value="duration">Duración</option>
                <option value="favorites">Favoritas primero</option>
              </select>
            </div>
          </div>

          {/* View Mode */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-red-100 text-red-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-red-100 text-red-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {filteredRoutines.length} rutina{filteredRoutines.length !== 1 ? 's' : ''} encontrada{filteredRoutines.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-4">
              <span>{filteredRoutines.filter(r => r.isFavorite).length} favoritas</span>
              <span>{filteredRoutines.filter(r => r.isTemplate).length} plantillas</span>
              <span>{filteredRoutines.filter(r => r.visibility === 'shared').length} compartidas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Routines Display */}
      {filteredRoutines.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron rutinas</h3>
          <p>Ajusta los filtros o crea una nueva rutina</p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredRoutines.map((routine) => (
            <div 
              key={routine.id} 
              className={`bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all ${
                viewMode === 'grid' ? 'p-6' : 'p-4'
              }`}
            >
              {viewMode === 'grid' ? (
                // Grid View
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">{routine.name}</h3>
                        {routine.isFavorite && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        {routine.isTemplate && (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Plantilla
                          </span>
                        )}
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(routine.difficulty)}`}>
                          {getDifficultyLabel(routine.difficulty)}
                        </span>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          routine.visibility === 'shared' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {routine.visibility === 'shared' ? 'Compartida' : 'Privada'}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{routine.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(routine.totalDuration)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4" />
                          <span>{routine.exercises.length} ejercicios</span>
                        </div>
                      </div>

                      {routine.tags.length > 0 && (
                        <div className="mb-4">
                          <TagDisplay 
                            tags={availableTags} 
                            selectedTagIds={routine.tags} 
                            size="sm" 
                            maxDisplay={3}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onViewDetails(routine)}
                      className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Detalle</span>
                    </button>
                    
                    <button
                      onClick={() => onApplyRoutine(routine)}
                      className="px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Play className="w-4 h-4" />
                      <span>Aplicar</span>
                    </button>
                    
                    <button
                      onClick={() => handleAssignRoutine(routine)}
                      className="px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Send className="w-4 h-4" />
                      <span>Asignar</span>
                    </button>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => onToggleFavorite(routine)}
                        className={`flex-1 p-2 rounded-lg transition-colors ${
                          routine.isFavorite 
                            ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
                            : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                        }`}
                        title="Favorita"
                      >
                        <Star className={`w-4 h-4 mx-auto ${routine.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      
                      <button
                        onClick={() => onEditRoutine(routine)}
                        className="flex-1 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4 mx-auto" />
                      </button>
                      
                      <button
                        onClick={() => onDuplicateRoutine(routine)}
                        className="flex-1 p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Duplicar"
                      >
                        <Copy className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    Actualizada: {routine.updatedAt.toLocaleDateString()}
                  </div>
                </>
              ) : (
                // List View
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{routine.name}</h3>
                      {routine.isFavorite && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                      {routine.isTemplate && (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Plantilla
                        </span>
                      )}
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(routine.difficulty)}`}>
                        {getDifficultyLabel(routine.difficulty)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{routine.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{formatDuration(routine.totalDuration)}</span>
                      <span>{routine.exercises.length} ejercicios</span>
                      <span>Actualizada: {routine.updatedAt.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => onViewDetails(routine)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver detalle"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onApplyRoutine(routine)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Aplicar rutina"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleAssignRoutine(routine)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Asignar rutina"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onToggleFavorite(routine)}
                      className={`p-2 rounded-lg transition-colors ${
                        routine.isFavorite 
                          ? 'text-yellow-600 bg-yellow-50' 
                          : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                      }`}
                      title="Favorita"
                    >
                      <Star className={`w-4 h-4 ${routine.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      onClick={() => onEditRoutine(routine)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onDuplicateRoutine(routine)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Duplicar"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onDeleteRoutine(routine.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {assignmentRoutine && (
        <RoutineAssignment
          routine={assignmentRoutine}
          students={students}
          groups={groups}
          onAssign={handleAssignmentSubmit}
          isOpen={showAssignmentModal}
          onClose={() => {
            setShowAssignmentModal(false);
            setAssignmentRoutine(null);
          }}
        />
      )}
    </div>
  );
};

export default RoutineLibrary;