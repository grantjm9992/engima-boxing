import React, { useState } from 'react';
import { 
  Calendar, Plus, X, Target, Zap, Users, Save, 
  Copy, Trash2, AlertTriangle, CheckCircle, Eye,
  ChevronLeft, ChevronRight, Grid, List, Filter
} from 'lucide-react';
import { WorkTypeGoal } from './GoalsManager';

export interface DayPlan {
  date: Date;
  workTypes: string[]; // WorkTypeGoal IDs
  notes: string;
  isCompleted: boolean;
  completionPercentage: number;
}

export interface WeekPlan {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  days: DayPlan[];
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface WeeklyPlannerProps {
  weekPlans: WeekPlan[];
  workTypes: WorkTypeGoal[];
  onCreateWeekPlan: (plan: Omit<WeekPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateWeekPlan: (id: string, updates: Partial<WeekPlan>) => void;
  onDeleteWeekPlan: (id: string) => void;
  onDuplicateWeekPlan: (plan: WeekPlan) => void;
  isOpen: boolean;
  onClose: () => void;
}

const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  weekPlans,
  workTypes,
  onCreateWeekPlan,
  onUpdateWeekPlan,
  onDeleteWeekPlan,
  onDuplicateWeekPlan,
  isOpen,
  onClose
}) => {
  const [activeView, setActiveView] = useState<'calendar' | 'templates' | 'create'>('calendar');
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [draggedWorkType, setDraggedWorkType] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Partial<WeekPlan> | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const getWeekDates = (startDate: Date): Date[] => {
    const dates: Date[] = [];
    const start = new Date(startDate);
    // Get Monday of the week
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getCurrentWeekPlan = (): WeekPlan | null => {
    const weekDates = getWeekDates(selectedWeek);
    return weekPlans.find(plan => 
      plan.startDate.toDateString() === weekDates[0].toDateString()
    ) || null;
  };

  const createNewWeekPlan = () => {
    const weekDates = getWeekDates(selectedWeek);
    const newPlan: Partial<WeekPlan> = {
      name: `Semana del ${weekDates[0].toLocaleDateString()}`,
      description: '',
      startDate: weekDates[0],
      endDate: weekDates[6],
      days: weekDates.map(date => ({
        date,
        workTypes: [],
        notes: '',
        isCompleted: false,
        completionPercentage: 0
      })),
      isTemplate: false
    };
    setCurrentPlan(newPlan);
    setActiveView('create');
  };

  const saveWeekPlan = () => {
    if (currentPlan && currentPlan.name && currentPlan.days) {
      onCreateWeekPlan({
        name: currentPlan.name,
        description: currentPlan.description || '',
        startDate: currentPlan.startDate!,
        endDate: currentPlan.endDate!,
        days: currentPlan.days,
        isTemplate: currentPlan.isTemplate || false
      });
      setCurrentPlan(null);
      setActiveView('calendar');
    }
  };

  const handleDragStart = (workTypeId: string) => {
    setDraggedWorkType(workTypeId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dayIndex: number) => {
    e.preventDefault();
    if (draggedWorkType && currentPlan) {
      const updatedDays = [...(currentPlan.days || [])];
      if (updatedDays[dayIndex]) {
        const currentWorkTypes = updatedDays[dayIndex].workTypes;
        if (!currentWorkTypes.includes(draggedWorkType)) {
          updatedDays[dayIndex] = {
            ...updatedDays[dayIndex],
            workTypes: [...currentWorkTypes, draggedWorkType]
          };
          setCurrentPlan({ ...currentPlan, days: updatedDays });
        }
      }
    }
    setDraggedWorkType(null);
  };

  const removeWorkTypeFromDay = (dayIndex: number, workTypeId: string) => {
    if (currentPlan) {
      const updatedDays = [...(currentPlan.days || [])];
      if (updatedDays[dayIndex]) {
        updatedDays[dayIndex] = {
          ...updatedDays[dayIndex],
          workTypes: updatedDays[dayIndex].workTypes.filter(id => id !== workTypeId)
        };
        setCurrentPlan({ ...currentPlan, days: updatedDays });
      }
    }
  };

  const getWorkTypeBalance = (): { workType: WorkTypeGoal; count: number; percentage: number }[] => {
    if (!currentPlan?.days) return [];
    
    const workTypeCounts: Record<string, number> = {};
    const totalDays = currentPlan.days.length;
    
    currentPlan.days.forEach(day => {
      day.workTypes.forEach(workTypeId => {
        workTypeCounts[workTypeId] = (workTypeCounts[workTypeId] || 0) + 1;
      });
    });

    return workTypes.map(workType => ({
      workType,
      count: workTypeCounts[workType.id] || 0,
      percentage: totalDays > 0 ? ((workTypeCounts[workType.id] || 0) / totalDays) * 100 : 0
    })).sort((a, b) => b.count - a.count);
  };

  const detectImbalances = (): string[] => {
    const balance = getWorkTypeBalance();
    const warnings: string[] = [];
    
    // Check for overused work types (>50% of days)
    balance.forEach(({ workType, percentage }) => {
      if (percentage > 50) {
        warnings.push(`${workType.name} aparece en más del 50% de los días`);
      }
    });

    // Check for unused categories
    const usedCategories = new Set(
      balance.filter(b => b.count > 0).map(b => b.workType.category)
    );
    const allCategories = new Set(workTypes.map(wt => wt.category));
    
    allCategories.forEach(category => {
      if (!usedCategories.has(category)) {
        warnings.push(`No hay trabajo de categoría "${category}" programado`);
      }
    });

    return warnings;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeek(newDate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
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
                <h1 className="text-2xl font-bold">Planificador Semanal</h1>
                <p className="text-purple-100">Asignación táctica con Drag & Drop</p>
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
                onClick={() => setActiveView('templates')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'templates' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                Plantillas
              </button>
              <button
                onClick={createNewWeekPlan}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Semana</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeView === 'calendar' && (
            <div className="p-6">
              {/* Week Navigation */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateWeek('prev')}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Semana del {getWeekDates(selectedWeek)[0].toLocaleDateString()}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getWeekDates(selectedWeek)[0].toLocaleDateString()} - {getWeekDates(selectedWeek)[6].toLocaleDateString()}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => navigateWeek('next')}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Current Week Plan Display */}
              {(() => {
                const currentWeekPlan = getCurrentWeekPlan();
                const weekDates = getWeekDates(selectedWeek);
                
                if (!currentWeekPlan) {
                  return (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No hay plan para esta semana
                      </h3>
                      <p className="mb-4">Crea un nuevo plan semanal para comenzar la planificación</p>
                      <button
                        onClick={createNewWeekPlan}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Crear Plan Semanal</span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {/* Plan Info */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                        {currentWeekPlan.name}
                      </h3>
                      {currentWeekPlan.description && (
                        <p className="text-purple-700 dark:text-purple-300 text-sm">
                          {currentWeekPlan.description}
                        </p>
                      )}
                    </div>

                    {/* Days Grid */}
                    <div className={
                      viewMode === 'grid' 
                        ? 'grid grid-cols-1 md:grid-cols-7 gap-4'
                        : 'space-y-4'
                    }>
                      {currentWeekPlan.days.map((day, index) => (
                        <div 
                          key={index} 
                          className={`border border-gray-200 dark:border-dark-border rounded-lg p-4 ${
                            viewMode === 'grid' ? '' : 'flex items-center space-x-4'
                          }`}
                        >
                          <div className={viewMode === 'grid' ? 'mb-3' : ''}>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {daysOfWeek[index]}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {day.date.toLocaleDateString()}
                            </p>
                            {day.isCompleted && (
                              <div className="flex items-center space-x-1 mt-1">
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  {day.completionPercentage}% completado
                                </span>
                              </div>
                            )}
                          </div>

                          <div className={`space-y-2 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                            {day.workTypes.map(workTypeId => {
                              const workType = workTypes.find(wt => wt.id === workTypeId);
                              if (!workType) return null;

                              return (
                                <div
                                  key={workTypeId}
                                  className="flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium text-white"
                                  style={{ backgroundColor: workType.color }}
                                >
                                  <span>{workType.name}</span>
                                </div>
                              );
                            })}
                            
                            {day.workTypes.length === 0 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                                Sin trabajo asignado
                              </div>
                            )}
                          </div>

                          {day.notes && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                              {day.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Plan Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-border">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => onDuplicateWeekPlan(currentWeekPlan)}
                          className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors flex items-center space-x-2"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Duplicar Semana</span>
                        </button>
                        <button
                          onClick={() => onDeleteWeekPlan(currentWeekPlan.id)}
                          className="px-4 py-2 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Eliminar Plan</span>
                        </button>
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Última actualización: {currentWeekPlan.updatedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeView === 'templates' && (
            <div className="p-6">
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Copy className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p>Plantillas semanales en desarrollo</p>
                <p className="text-sm">Aquí podrás guardar y reutilizar plantillas de semanas</p>
              </div>
            </div>
          )}

          {activeView === 'create' && currentPlan && (
            <div className="p-6">
              <div className="max-w-6xl mx-auto space-y-6">
                {/* Plan Details */}
                <div className="bg-gray-50 dark:bg-dark-elevated rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Detalles del Plan
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre del Plan *
                      </label>
                      <input
                        type="text"
                        value={currentPlan.name || ''}
                        onChange={(e) => setCurrentPlan({ ...currentPlan, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-dark-surface dark:text-white"
                        placeholder="Ej: Semana de técnica intensiva"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Descripción
                      </label>
                      <input
                        type="text"
                        value={currentPlan.description || ''}
                        onChange={(e) => setCurrentPlan({ ...currentPlan, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-dark-surface dark:text-white"
                        placeholder="Descripción opcional del plan"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center">
                    <input
                      type="checkbox"
                      id="isTemplate"
                      checked={currentPlan.isTemplate || false}
                      onChange={(e) => setCurrentPlan({ ...currentPlan, isTemplate: e.target.checked })}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="isTemplate" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Guardar como plantilla reutilizable
                    </label>
                  </div>
                </div>

                {/* Work Types Palette */}
                <div className="bg-gray-50 dark:bg-dark-elevated rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Tipos de Trabajo Disponibles
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {workTypes.map((workType) => (
                      <div
                        key={workType.id}
                        draggable
                        onDragStart={() => handleDragStart(workType.id)}
                        className="p-3 rounded-lg cursor-move transition-all hover:scale-105 text-white font-medium text-sm"
                        style={{ backgroundColor: workType.color }}
                      >
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4" />
                          <span>{workType.name}</span>
                        </div>
                        <div className="text-xs opacity-80 mt-1">
                          {workType.description}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                    💡 Arrastra los tipos de trabajo a los días de la semana para asignarlos
                  </p>
                </div>

                {/* Weekly Calendar */}
                <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Planificación Semanal
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {currentPlan.days?.map((day, index) => (
                      <div
                        key={index}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 min-h-[200px] hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
                      >
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {daysOfWeek[index]}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {day.date.toLocaleDateString()}
                          </p>
                        </div>

                        <div className="space-y-2">
                          {day.workTypes.map(workTypeId => {
                            const workType = workTypes.find(wt => wt.id === workTypeId);
                            if (!workType) return null;

                            return (
                              <div
                                key={workTypeId}
                                className="flex items-center justify-between px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: workType.color }}
                              >
                                <span>{workType.name}</span>
                                <button
                                  onClick={() => removeWorkTypeFromDay(index, workTypeId)}
                                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {day.workTypes.length === 0 && (
                          <div className="text-center text-gray-400 dark:text-gray-500 text-sm mt-8">
                            Arrastra tipos de trabajo aquí
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Balance Analysis */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <Target className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span>Análisis de Balance</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Work Type Distribution */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Distribución de Tipos de Trabajo
                      </h4>
                      <div className="space-y-2">
                        {getWorkTypeBalance().map(({ workType, count, percentage }) => (
                          <div key={workType.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: workType.color }}
                              ></div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {workType.name}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {count} día{count !== 1 ? 's' : ''} ({percentage.toFixed(0)}%)
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Warnings */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Desequilibrios Detectados
                      </h4>
                      <div className="space-y-2">
                        {detectImbalances().map((warning, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                            <span className="text-sm text-orange-700 dark:text-orange-300">
                              {warning}
                            </span>
                          </div>
                        ))}
                        
                        {detectImbalances().length === 0 && (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm text-green-700 dark:text-green-300">
                              No se detectaron desequilibrios
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-dark-border">
                  <button
                    onClick={() => {
                      setCurrentPlan(null);
                      setActiveView('calendar');
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveWeekPlan}
                    disabled={!currentPlan.name?.trim()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Plan Semanal</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyPlanner;