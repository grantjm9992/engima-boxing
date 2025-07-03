import React, { useState, useEffect } from 'react';
import { 
  BarChart3, PieChart, Calendar, Filter, Download, 
  ChevronDown, ChevronUp, Tag, Clock, Target, 
  Zap, Users, FileText, X, BarChart, TrendingUp
} from 'lucide-react';
import { TagType } from './TagManager';
import { MultiTimerExercise } from './MultiTimerExercise';
import { Routine } from './RoutineManager';

interface CategoryUsage {
  name: string;
  color: string;
  count: number;
  percentage: number;
  totalDuration: number; // in minutes
}

interface TimeRange {
  label: string;
  value: 'day' | 'week' | 'month' | 'quarter' | 'year';
  days: number;
}

interface DashboardProps {
  routines: Routine[];
  tags: TagType[];
  isOpen: boolean;
  onClose: () => void;
  onExportData?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  routines,
  tags,
  isOpen,
  onClose,
  onExportData
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    label: 'Último mes',
    value: 'month',
    days: 30
  });
  
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>(['categories', 'timers', 'trends']);
  
  const timeRanges: TimeRange[] = [
    { label: 'Hoy', value: 'day', days: 1 },
    { label: 'Última semana', value: 'week', days: 7 },
    { label: 'Último mes', value: 'month', days: 30 },
    { label: 'Último trimestre', value: 'quarter', days: 90 },
    { label: 'Último año', value: 'year', days: 365 }
  ];
  
  // Filter routines by date range
  const getFilteredRoutines = () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange.days);
    
    return routines.filter(routine => routine.updatedAt >= cutoffDate);
  };
  
  // Calculate tag usage statistics
  const getTagUsageStats = (): CategoryUsage[] => {
    const filteredRoutines = getFilteredRoutines();
    const tagStats: Record<string, CategoryUsage> = {};
    
    // Initialize with all available tags
    tags.forEach(tag => {
      tagStats[tag.id] = {
        name: tag.name,
        color: tag.color,
        count: 0,
        percentage: 0,
        totalDuration: 0
      };
    });
    
    // Count occurrences and durations
    filteredRoutines.forEach(routine => {
      routine.tags.forEach(tagId => {
        if (tagStats[tagId]) {
          tagStats[tagId].count += 1;
          tagStats[tagId].totalDuration += routine.totalDuration;
        }
      });
    });
    
    // Calculate percentages
    const totalRoutines = filteredRoutines.length;
    Object.keys(tagStats).forEach(tagId => {
      tagStats[tagId].percentage = totalRoutines > 0 
        ? (tagStats[tagId].count / totalRoutines) * 100 
        : 0;
    });
    
    // Convert to array and sort by count
    return Object.values(tagStats)
      .filter(stat => stat.count > 0)
      .sort((a, b) => b.count - a.count);
  };
  
  // Get timer usage statistics
  const getTimerUsageStats = () => {
    const filteredRoutines = getFilteredRoutines();
    const timerStats: Record<string, { name: string; color: string; count: number; totalDuration: number }> = {};
    
    // Count timer occurrences
    filteredRoutines.forEach(routine => {
      if (routine.blockStructure?.blocks) {
        routine.blockStructure.blocks.forEach(block => {
          block.exercises.forEach(exercise => {
            if ('timers' in exercise) {
              const multiTimerExercise = exercise as unknown as MultiTimerExercise;
              multiTimerExercise.timers.forEach(timer => {
                const key = timer.name.toLowerCase();
                if (!timerStats[key]) {
                  timerStats[key] = {
                    name: timer.name,
                    color: timer.color,
                    count: 0,
                    totalDuration: 0
                  };
                }
                timerStats[key].count += 1;
                timerStats[key].totalDuration += timer.duration * timer.repetitions / 60; // convert to minutes
              });
            }
          });
        });
      }
    });
    
    // Convert to array and sort by count
    return Object.values(timerStats)
      .sort((a, b) => b.count - a.count);
  };
  
  // Get usage trends over time
  const getUsageTrends = () => {
    const filteredRoutines = getFilteredRoutines();
    const trendData: Record<string, number[]> = {};
    
    // Initialize with all available tags
    tags.forEach(tag => {
      trendData[tag.id] = Array(timeRange.value === 'day' ? 24 : timeRange.value === 'week' ? 7 : 12).fill(0);
    });
    
    // Count occurrences by time period
    filteredRoutines.forEach(routine => {
      routine.tags.forEach(tagId => {
        if (trendData[tagId]) {
          const date = new Date(routine.updatedAt);
          let index = 0;
          
          if (timeRange.value === 'day') {
            // Group by hour
            index = date.getHours();
          } else if (timeRange.value === 'week') {
            // Group by day of week
            index = date.getDay();
          } else {
            // Group by month
            index = date.getMonth();
          }
          
          trendData[tagId][index] += 1;
        }
      });
    });
    
    // Filter to only include tags with data
    const tagsWithData = tags.filter(tag => 
      trendData[tag.id] && trendData[tag.id].some(count => count > 0)
    );
    
    return {
      labels: timeRange.value === 'day' 
        ? Array.from({ length: 24 }, (_, i) => `${i}:00`)
        : timeRange.value === 'week'
        ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
        : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: tagsWithData.map(tag => ({
        name: tag.name,
        color: tag.color,
        data: trendData[tag.id]
      }))
    };
  };
  
  const toggleSectionExpand = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };
  
  const toggleTagFilter = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };
  
  const tagUsageStats = getTagUsageStats();
  const timerUsageStats = getTimerUsageStats();
  const usageTrends = getUsageTrends();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="pr-12">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dashboard Analítico</h1>
                <p className="text-indigo-100">Análisis visual por categorías y timers</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={timeRange.value}
                onChange={(e) => {
                  const selected = timeRanges.find(r => r.value === e.target.value);
                  if (selected) setTimeRange(selected);
                }}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm text-white"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
              
              {onExportData && (
                <button
                  onClick={onExportData}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center space-x-1 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-900 dark:text-blue-100">Etiquetas Activas</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {tagUsageStats.length}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                de {tags.length} etiquetas totales
              </div>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-900 dark:text-green-100">Timers Utilizados</span>
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {timerUsageStats.length}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                tipos de timer diferentes
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-purple-900 dark:text-purple-100">Rutinas Analizadas</span>
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {getFilteredRoutines().length}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                en {timeRange.label.toLowerCase()}
              </div>
            </div>
            
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="font-medium text-orange-900 dark:text-orange-100">Tiempo Total</span>
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatDuration(getFilteredRoutines().reduce((sum, routine) => sum + routine.totalDuration, 0))}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                de entrenamiento
              </div>
            </div>
          </div>

          {/* Category Usage Section */}
          <div className="mb-6 border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
            <div 
              className="p-4 bg-gray-50 dark:bg-dark-elevated flex items-center justify-between cursor-pointer"
              onClick={() => toggleSectionExpand('categories')}
            >
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Uso de Etiquetas</h3>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                {expandedSections.includes('categories') ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {expandedSections.includes('categories') && (
              <div className="p-4">
                {tagUsageStats.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Distribución por Etiqueta
                      </h4>
                      <div className="space-y-3">
                        {tagUsageStats.slice(0, 10).map(stat => (
                          <div key={stat.name} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: stat.color }}
                                ></div>
                                <span className="text-gray-700 dark:text-gray-300">{stat.name}</span>
                              </div>
                              <span className="text-gray-600 dark:text-gray-400">
                                {stat.count} ({stat.percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full"
                                style={{ 
                                  width: `${stat.percentage}%`,
                                  backgroundColor: stat.color
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Pie Chart Visualization */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Tiempo Total por Etiqueta
                      </h4>
                      <div className="flex items-center justify-center">
                        <div className="relative w-48 h-48">
                          <PieChart className="w-full h-full text-gray-300 dark:text-gray-600" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Total
                              </div>
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatDuration(tagUsageStats.reduce((sum, stat) => sum + stat.totalDuration, 0))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {tagUsageStats.slice(0, 6).map(stat => (
                          <div 
                            key={stat.name}
                            className="flex items-center space-x-2 p-2 rounded-lg"
                            style={{ backgroundColor: `${stat.color}20` }}
                          >
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: stat.color }}
                            ></div>
                            <div className="text-xs">
                              <div className="font-medium text-gray-900 dark:text-white">{stat.name}</div>
                              <div className="text-gray-600 dark:text-gray-400">{formatDuration(stat.totalDuration)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No hay datos de etiquetas para el período seleccionado</p>
                    <p className="text-sm">Prueba con un rango de tiempo diferente</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timer Usage Section */}
          <div className="mb-6 border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
            <div 
              className="p-4 bg-gray-50 dark:bg-dark-elevated flex items-center justify-between cursor-pointer"
              onClick={() => toggleSectionExpand('timers')}
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Análisis de Timers</h3>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                {expandedSections.includes('timers') ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {expandedSections.includes('timers') && (
              <div className="p-4">
                {timerUsageStats.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {timerUsageStats.slice(0, 6).map(timer => (
                        <div 
                          key={timer.name}
                          className="p-4 border border-gray-200 dark:border-dark-border rounded-lg"
                          style={{ borderLeftColor: timer.color, borderLeftWidth: '4px' }}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: timer.color }}
                            ></div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{timer.name}</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="p-2 bg-gray-50 dark:bg-dark-elevated rounded">
                              <div className="text-gray-500 dark:text-gray-400">Usos</div>
                              <div className="font-bold text-gray-900 dark:text-white">{timer.count}</div>
                            </div>
                            <div className="p-2 bg-gray-50 dark:bg-dark-elevated rounded">
                              <div className="text-gray-500 dark:text-gray-400">Tiempo</div>
                              <div className="font-bold text-gray-900 dark:text-white">{formatDuration(timer.totalDuration)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {timerUsageStats.length > 6 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Otros Timers Utilizados
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {timerUsageStats.slice(6).map(timer => (
                            <div 
                              key={timer.name}
                              className="p-2 border border-gray-200 dark:border-dark-border rounded flex items-center space-x-2"
                            >
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: timer.color }}
                              ></div>
                              <div className="text-xs">
                                <div className="font-medium text-gray-900 dark:text-white">{timer.name}</div>
                                <div className="text-gray-500 dark:text-gray-400">{timer.count} usos</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No hay datos de timers para el período seleccionado</p>
                    <p className="text-sm">Prueba con un rango de tiempo diferente</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Trends Over Time Section */}
          <div className="mb-6 border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
            <div 
              className="p-4 bg-gray-50 dark:bg-dark-elevated flex items-center justify-between cursor-pointer"
              onClick={() => toggleSectionExpand('trends')}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Tendencias Temporales</h3>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                {expandedSections.includes('trends') ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {expandedSections.includes('trends') && (
              <div className="p-4">
                {usageTrends.datasets.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {usageTrends.datasets.map(dataset => (
                        <button
                          key={dataset.name}
                          onClick={() => toggleTagFilter(dataset.name)}
                          className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            selectedTags.includes(dataset.name) || selectedTags.length === 0
                              ? 'text-white'
                              : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700'
                          }`}
                          style={{ 
                            backgroundColor: selectedTags.includes(dataset.name) || selectedTags.length === 0 
                              ? dataset.color 
                              : undefined 
                          }}
                        >
                          {dataset.name}
                        </button>
                      ))}
                    </div>
                    
                    {/* Chart Visualization */}
                    <div className="relative h-64 border border-gray-200 dark:border-dark-border rounded-lg p-4">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BarChart className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                        <div className="absolute text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Visualización de gráfico
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            (Representación visual)
                          </p>
                        </div>
                      </div>
                      
                      {/* X-axis labels */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-gray-500 dark:text-gray-400">
                        {usageTrends.labels.filter((_, i) => i % Math.ceil(usageTrends.labels.length / 6) === 0).map((label, i) => (
                          <div key={i}>{label}</div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {usageTrends.datasets
                        .filter(dataset => selectedTags.includes(dataset.name) || selectedTags.length === 0)
                        .map(dataset => {
                          const totalUsage = dataset.data.reduce((sum, count) => sum + count, 0);
                          return (
                            <div 
                              key={dataset.name}
                              className="p-2 border border-gray-200 dark:border-dark-border rounded flex items-center space-x-2"
                            >
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: dataset.color }}
                              ></div>
                              <div className="text-xs">
                                <div className="font-medium text-gray-900 dark:text-white">{dataset.name}</div>
                                <div className="text-gray-500 dark:text-gray-400">{totalUsage} usos totales</div>
                              </div>
                            </div>
                          );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No hay datos de tendencias para el período seleccionado</p>
                    <p className="text-sm">Prueba con un rango de tiempo diferente</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Insights Section */}
          <div className="mb-6 border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
            <div 
              className="p-4 bg-gray-50 dark:bg-dark-elevated flex items-center justify-between cursor-pointer"
              onClick={() => toggleSectionExpand('insights')}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Insights y Recomendaciones</h3>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                {expandedSections.includes('insights') ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {expandedSections.includes('insights') && (
              <div className="p-4">
                <div className="space-y-4">
                  {tagUsageStats.length > 0 ? (
                    <>
                      {/* Most Used Categories */}
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Categorías Más Utilizadas</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Las etiquetas más frecuentes en tus rutinas son <strong style={{ color: tagUsageStats[0]?.color }}>{tagUsageStats[0]?.name}</strong>
                          {tagUsageStats.length > 1 && <> y <strong style={{ color: tagUsageStats[1]?.color }}>{tagUsageStats[1]?.name}</strong></>}, 
                          representando el {(tagUsageStats.slice(0, 2).reduce((sum, stat) => sum + stat.percentage, 0)).toFixed(1)}% 
                          de tus entrenamientos.
                        </p>
                      </div>
                      
                      {/* Underutilized Categories */}
                      {tags.length > tagUsageStats.length && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Categorías Infrautilizadas</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Hay {tags.length - tagUsageStats.length} etiquetas que no has utilizado en el período actual.
                            Considera incorporar más variedad en tus rutinas.
                          </p>
                        </div>
                      )}
                      
                      {/* Timer Insights */}
                      {timerUsageStats.length > 0 && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Análisis de Timers</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            El timer <strong style={{ color: timerUsageStats[0]?.color }}>{timerUsageStats[0]?.name}</strong> es 
                            el más utilizado con {timerUsageStats[0]?.count} usos y un tiempo total de {formatDuration(timerUsageStats[0]?.totalDuration)}.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p>No hay suficientes datos para generar insights</p>
                      <p className="text-sm">Añade más rutinas con etiquetas para obtener recomendaciones</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;