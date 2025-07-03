import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, X, Search, Filter, Edit3, Copy, 
  Trash2, Play, Tag, Clock, Target, ChevronLeft, 
  ChevronRight, Grid, List, FileText, Info, AlertTriangle
} from 'lucide-react';
import { PlannedClass } from '../types/ClassTypes';
import { TagType } from './TagManager';
import TagDisplay from './TagDisplay';
import ClassBuilder from './ClassBuilder';
import { Block } from './BlockEditor';
import { Routine } from './RoutineManager';

interface ClassPlannerProps {
  plannedClasses: PlannedClass[];
  availableTags: TagType[];
  routines: Routine[];
  onCreateClass: (classData: Omit<PlannedClass, 'id' | 'createdAt' | 'updatedAt' | 'notionPageId'>) => Promise<PlannedClass>;
  onUpdateClass: (id: string, updates: Partial<PlannedClass>) => Promise<void>;
  onDeleteClass: (id: string) => Promise<void>;
  onDuplicateClass: (id: string, newDate?: string) => Promise<PlannedClass | undefined>;
  onRunClass: (plannedClass: PlannedClass) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ClassPlanner: React.FC<ClassPlannerProps> = ({
  plannedClasses,
  availableTags,
  routines,
  onCreateClass,
  onUpdateClass,
  onDeleteClass,
  onDuplicateClass,
  onRunClass,
  isOpen,
  onClose
}) => {
  const [activeView, setActiveView] = useState<'calendar' | 'list' | 'create' | 'edit'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedClass, setSelectedClass] = useState<PlannedClass | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

  // Filtrar clases
  const filteredClasses = plannedClasses.filter(cls => {
    const matchesSearch = searchTerm === '' || 
      cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.objective.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = filterTags.length === 0 || 
      filterTags.some(tag => cls.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  // Obtener clases para el mes actual
  const getClassesForMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    return plannedClasses.filter(cls => {
      const classDate = new Date(cls.date);
      return classDate.getFullYear() === year && classDate.getMonth() === month;
    });
  };

  // Obtener clases para un día específico
  const getClassesForDay = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return plannedClasses.filter(cls => cls.date.startsWith(dateString));
  };

  // Generar calendario del mes
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);
    
    // Día de la semana del primer día (0 = Domingo, 1 = Lunes, etc.)
    let firstDayOfWeek = firstDay.getDay();
    // Ajustar para que la semana comience en lunes (0 = Lunes, 6 = Domingo)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const days = [];
    
    // Días del mes anterior
    for (let i = 0; i < firstDayOfWeek; i++) {
      const day = new Date(year, month, 1 - (firstDayOfWeek - i));
      days.push({ date: day, isCurrentMonth: false });
    }
    
    // Días del mes actual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const day = new Date(year, month, i);
      days.push({ date: day, isCurrentMonth: true });
    }
    
    // Días del mes siguiente (para completar la cuadrícula)
    const remainingDays = 42 - days.length; // 6 filas x 7 días
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    return days;
  };

  // Navegar entre meses
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  // Formatear fecha
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Formatear duración
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  // Crear nueva clase
  const handleCreateClass = () => {
    setSelectedClass(null);
    setSelectedRoutine(null);
    setActiveView('create');
  };

  // Editar clase existente
  const handleEditClass = (plannedClass: PlannedClass) => {
    setSelectedClass(plannedClass);
    setActiveView('edit');
  };

  // Duplicar clase
  const handleDuplicateClass = async (id: string) => {
    await onDuplicateClass(id);
  };

  // Crear clase a partir de rutina
  const handleCreateFromRoutine = (routine: Routine) => {
    setSelectedRoutine(routine);
    setActiveView('create');
  };

  // Volver a la vista principal
  const handleBackToMain = () => {
    setSelectedClass(null);
    setSelectedRoutine(null);
    setActiveView('calendar');
  };

  // Manejar clic en día del calendario
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  // Verificar si una fecha es hoy
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="pr-12">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Planificador de Clases</h1>
                <p className="text-green-100">Organiza y programa tus clases con facilidad</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveView('calendar')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'calendar' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                Vista Calendario
              </button>
              <button
                onClick={() => setActiveView('list')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'list' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                Lista de Clases
              </button>
              <button
                onClick={handleCreateClass}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Clase</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeView === 'calendar' && (
            <div className="p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </h2>
                  
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentMonth(new Date())}
                    className="px-3 py-1 text-sm text-green-600 dark:text-green-400 border border-green-300 dark:border-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                  >
                    Hoy
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="mb-6">
                {/* Days of Week */}
                <div className="grid grid-cols-7 mb-2">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => (
                    <div key={index} className="text-center font-medium text-gray-600 dark:text-gray-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays().map((day, index) => {
                    const dayClasses = getClassesForDay(day.date);
                    const isSelected = selectedDate && 
                      day.date.getDate() === selectedDate.getDate() &&
                      day.date.getMonth() === selectedDate.getMonth() &&
                      day.date.getFullYear() === selectedDate.getFullYear();
                    
                    return (
                      <div 
                        key={index}
                        onClick={() => handleDayClick(day.date)}
                        className={`min-h-24 p-2 border rounded-lg transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                            : day.isCurrentMonth
                            ? 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                            : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600'
                        } ${isToday(day.date) ? 'ring-2 ring-green-500 dark:ring-green-600' : ''}`}
                      >
                        <div className="flex justify-between mb-1">
                          <span className={`text-sm font-medium ${
                            isToday(day.date) 
                              ? 'text-green-600 dark:text-green-400' 
                              : day.isCurrentMonth
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-400 dark:text-gray-600'
                          }`}>
                            {day.date.getDate()}
                          </span>
                          {dayClasses.length > 0 && (
                            <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full">
                              {dayClasses.length}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          {dayClasses.slice(0, 2).map((cls) => (
                            <div 
                              key={cls.id}
                              className="text-xs p-1 bg-white dark:bg-dark-elevated border border-gray-200 dark:border-gray-700 rounded truncate"
                            >
                              {cls.title}
                            </div>
                          ))}
                          {dayClasses.length > 2 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                              +{dayClasses.length - 2} más
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Day Details */}
              {selectedDate && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatDate(selectedDate)}
                    </h3>
                    <button
                      onClick={() => {
                        const newDate = selectedDate.toISOString().split('T')[0];
                        handleCreateClass();
                      }}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Añadir Clase</span>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {getClassesForDay(selectedDate).length > 0 ? (
                      getClassesForDay(selectedDate).map((cls) => (
                        <div 
                          key={cls.id}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md dark:hover:shadow-dark transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{cls.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{cls.objective}</p>
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDuration(cls.totalDuration)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Target className="w-3 h-3" />
                                  <span>{cls.blocks.length} bloque(s)</span>
                                </div>
                              </div>
                              
                              {cls.tags.length > 0 && (
                                <div className="mt-2">
                                  <TagDisplay 
                                    tags={availableTags} 
                                    selectedTagIds={cls.tags} 
                                    size="sm" 
                                  />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex space-x-1 ml-4">
                              <button
                                onClick={() => onRunClass(cls)}
                                className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                title="Ejecutar clase"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditClass(cls)}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Editar clase"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDuplicateClass(cls.id)}
                                className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                                title="Duplicar clase"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteClass(cls.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Eliminar clase"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p>No hay clases programadas para este día</p>
                        <button
                          onClick={() => {
                            const newDate = selectedDate.toISOString().split('T')[0];
                            handleCreateClass();
                          }}
                          className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Programar Clase</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'list' && (
            <div className="p-6">
              {/* Search and Filters */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-dark-surface dark:text-white"
                    placeholder="Buscar clases..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredClasses.length} clase(s)
                  </span>
                </div>

                <div className="flex justify-end">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Classes List/Grid */}
              {filteredClasses.length > 0 ? (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }>
                  {filteredClasses.map((cls) => (
                    <div 
                      key={cls.id}
                      className={`bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border rounded-lg hover:shadow-md dark:hover:shadow-dark transition-shadow ${
                        viewMode === 'grid' ? 'p-4' : 'p-4 flex items-start'
                      }`}
                    >
                      {viewMode === 'grid' ? (
                        // Grid View
                        <>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{cls.title}</h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(cls.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            {cls.notionPageId && (
                              <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded text-xs">
                                Notion
                              </div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{cls.objective}</p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDuration(cls.totalDuration)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Target className="w-3 h-3" />
                              <span>{cls.blocks.length} bloque(s)</span>
                            </div>
                          </div>
                          
                          {cls.tags.length > 0 && (
                            <div className="mb-3">
                              <TagDisplay 
                                tags={availableTags} 
                                selectedTagIds={cls.tags} 
                                size="sm" 
                                maxDisplay={3}
                              />
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-dark-border">
                            <div className="flex space-x-1">
                              <button
                                onClick={() => onRunClass(cls)}
                                className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                title="Ejecutar clase"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditClass(cls)}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Editar clase"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDuplicateClass(cls.id)}
                                className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                                title="Duplicar clase"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteClass(cls.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Eliminar clase"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(cls.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </>
                      ) : (
                        // List View
                        <>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{cls.title}</h3>
                              {cls.notionPageId && (
                                <div className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded text-xs">
                                  Notion
                                </div>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{cls.objective}</p>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(cls.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDuration(cls.totalDuration)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Target className="w-3 h-3" />
                                <span>{cls.blocks.length} bloque(s)</span>
                              </div>
                            </div>
                            
                            {cls.tags.length > 0 && (
                              <div className="mt-2">
                                <TagDisplay 
                                  tags={availableTags} 
                                  selectedTagIds={cls.tags} 
                                  size="sm" 
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-1 ml-4">
                            <button
                              onClick={() => onRunClass(cls)}
                              className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                              title="Ejecutar clase"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditClass(cls)}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="Editar clase"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicateClass(cls.id)}
                              className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                              title="Duplicar clase"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteClass(cls.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Eliminar clase"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay clases programadas</h3>
                  <p className="mb-4">Programa tu primera clase para comenzar</p>
                  <button
                    onClick={handleCreateClass}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Clase</span>
                  </button>
                </div>
              )}

              {/* Create from Routine Section */}
              {filteredClasses.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Crear a partir de Rutina Existente
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {routines.slice(0, 3).map((routine) => (
                      <button
                        key={routine.id}
                        onClick={() => handleCreateFromRoutine(routine)}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all text-left"
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">{routine.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{routine.description}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(routine.totalDuration)}</span>
                        </div>
                      </button>
                    ))}
                    
                    {routines.length > 3 && (
                      <button
                        onClick={() => {/* Mostrar más rutinas */}}
                        className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-300 dark:hover:border-green-700 transition-all flex items-center justify-center text-gray-500 dark:text-gray-400"
                      >
                        Ver más rutinas...
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {(activeView === 'create' || activeView === 'edit') && (
            <ClassBuilder
              initialClass={selectedClass}
              initialRoutine={selectedRoutine}
              availableTags={availableTags}
              onSave={async (classData) => {
                if (activeView === 'edit' && selectedClass) {
                  await onUpdateClass(selectedClass.id, classData);
                } else {
                  await onCreateClass(classData);
                }
                handleBackToMain();
              }}
              onCancel={handleBackToMain}
              initialDate={selectedDate ? selectedDate.toISOString().split('T')[0] : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassPlanner;