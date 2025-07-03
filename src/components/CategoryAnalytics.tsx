import React, { useState, useEffect } from 'react';
import { 
  BarChart3, PieChart, Calendar, Filter, Download, 
  ChevronDown, ChevronUp, Tag, Clock, Target, 
  Zap, Users, FileText, X, BarChart, TrendingUp
} from 'lucide-react';
import { Category } from './CategoryManager';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface CategoryUsage {
  categoryId: string;
  count: number;
  percentage: number;
  totalDuration: number; // in minutes
}

interface TimeRange {
  label: string;
  value: 'day' | 'week' | 'month' | 'quarter' | 'year';
  days: number;
}

interface CategoryAnalyticsProps {
  categories: Category[];
  usageData: {
    categoryId: string;
    timestamp: Date;
    duration: number;
    level: string;
  }[];
  isOpen: boolean;
  onClose: () => void;
  onExportData?: () => void;
}

const CategoryAnalytics: React.FC<CategoryAnalyticsProps> = ({
  categories,
  usageData,
  isOpen,
  onClose,
  onExportData
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    label: 'Último mes',
    value: 'month',
    days: 30
  });
  
  const [expandedSections, setExpandedSections] = useState<string[]>(['distribution', 'trends', 'insights']);
  
  const timeRanges: TimeRange[] = [
    { label: 'Hoy', value: 'day', days: 1 },
    { label: 'Última semana', value: 'week', days: 7 },
    { label: 'Último mes', value: 'month', days: 30 },
    { label: 'Último trimestre', value: 'quarter', days: 90 },
    { label: 'Último año', value: 'year', days: 365 }
  ];
  
  // Filter data by date range
  const getFilteredData = () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange.days);
    
    return usageData.filter(item => item.timestamp >= cutoffDate);
  };
  
  // Calculate category usage statistics
  const getCategoryUsageStats = (): CategoryUsage[] => {
    const filteredData = getFilteredData();
    const categoryStats: Record<string, CategoryUsage> = {};
    
    // Initialize with all available categories
    categories.forEach(category => {
      categoryStats[category.id] = {
        categoryId: category.id,
        count: 0,
        percentage: 0,
        totalDuration: 0
      };
    });
    
    // Count occurrences and durations
    filteredData.forEach(item => {
      if (categoryStats[item.categoryId]) {
        categoryStats[item.categoryId].count += 1;
        categoryStats[item.categoryId].totalDuration += item.duration;
      }
    });
    
    // Calculate percentages
    const totalItems = filteredData.length;
    Object.keys(categoryStats).forEach(categoryId => {
      categoryStats[categoryId].percentage = totalItems > 0 
        ? (categoryStats[categoryId].count / totalItems) * 100 
        : 0;
    });
    
    // Convert to array and sort by count
    return Object.values(categoryStats)
      .filter(stat => stat.count > 0)
      .sort((a, b) => b.count - a.count);
  };
  
  // Get usage trends over time
  const getUsageTrends = () => {
    const filteredData = getFilteredData();
    const trendData: Record<string, number[]> = {};
    
    // Initialize with all available categories
    categories.forEach(category => {
      trendData[category.id] = Array(timeRange.value === 'day' ? 24 : timeRange.value === 'week' ? 7 : 12).fill(0);
    });
    
    // Count occurrences by time period
    filteredData.forEach(item => {
      if (trendData[item.categoryId]) {
        const date = new Date(item.timestamp);
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
        
        trendData[item.categoryId][index] += 1;
      }
    });
    
    // Filter to only include categories with data
    const categoriesWithData = categories.filter(category => 
      trendData[category.id] && trendData[category.id].some(count => count > 0)
    );
    
    return {
      labels: timeRange.value === 'day' 
        ? Array.from({ length: 24 }, (_, i) => `${i}:00`)
        : timeRange.value === 'week'
        ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
        : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: categoriesWithData.map(category => ({
        name: category.name,
        color: category.color,
        data: trendData[category.id]
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
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };
  
  const usageStats = getCategoryUsageStats();
  const usageTrends = getUsageTrends();
  
  // Prepare chart data
  const pieChartData = {
    labels: usageStats.map(stat => {
      const category = categories.find(c => c.id === stat.categoryId);
      return category ? category.name : 'Desconocido';
    }),
    datasets: [
      {
        data: usageStats.map(stat => stat.percentage),
        backgroundColor: usageStats.map(stat => {
          const category = categories.find(c => c.id === stat.categoryId);
          return category ? category.color : '#6B7280';
        }),
        borderWidth: 1,
      },
    ],
  };
  
  const barChartData = {
    labels: usageTrends.labels,
    datasets: usageTrends.datasets.map(dataset => ({
      label: dataset.name,
      data: dataset.data,
      backgroundColor: dataset.color,
      borderColor: dataset.color,
      borderWidth: 1,
    })),
  };
  
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
                <h1 className="text-2xl font-bold">Análisis de Categorías</h1>
                <p className="text-indigo-100">Estadísticas y tendencias de uso por categoría</p>
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
                <span className="font-medium text-blue-900 dark:text-blue-100">Categorías Activas</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {usageStats.length}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                de {categories.length} categorías totales
              </div>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-900 dark:text-green-100">Tiempo Total</span>
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatDuration(usageStats.reduce((sum, stat) => sum + stat.totalDuration, 0))}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                en {timeRange.label.toLowerCase()}
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-purple-900 dark:text-purple-100">Categoría Principal</span>
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {usageStats.length > 0 ? (
                  <span style={{ color: categories.find(c => c.id === usageStats[0].categoryId)?.color }}>
                    {categories.find(c => c.id === usageStats[0].categoryId)?.name || 'N/A'}
                  </span>
                ) : 'N/A'}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                {usageStats.length > 0 ? `${usageStats[0].percentage.toFixed(1)}% del total` : 'Sin datos'}
              </div>
            </div>
            
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="font-medium text-orange-900 dark:text-orange-100">Registros Totales</span>
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {getFilteredData().length}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                entradas analizadas
              </div>
            </div>
          </div>

          {/* Category Distribution Section */}
          <div className="mb-6 border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
            <div 
              className="p-4 bg-gray-50 dark:bg-dark-elevated flex items-center justify-between cursor-pointer"
              onClick={() => toggleSectionExpand('distribution')}
            >
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Distribución de Categorías</h3>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                {expandedSections.includes('distribution') ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {expandedSections.includes('distribution') && (
              <div className="p-4">
                {usageStats.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Distribución por Categoría
                      </h4>
                      <div className="space-y-3">
                        {usageStats.slice(0, 10).map(stat => {
                          const category = categories.find(c => c.id === stat.categoryId);
                          if (!category) return null;
                          
                          return (
                            <div key={stat.categoryId} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                  ></div>
                                  <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
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
                                    backgroundColor: category.color
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Pie Chart Visualization */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Tiempo Total por Categoría
                      </h4>
                      <div className="flex items-center justify-center">
                        <div className="w-64 h-64">
                          <Pie 
                            data={pieChartData} 
                            options={{
                              responsive: true,
                              plugins: {
                                legend: {
                                  position: 'bottom',
                                  labels: {
                                    color: document.documentElement.classList.contains('dark') ? '#E5E5E5' : '#1F2937'
                                  }
                                }
                              }
                            }} 
                          />
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {usageStats.slice(0, 6).map(stat => {
                          const category = categories.find(c => c.id === stat.categoryId);
                          if (!category) return null;
                          
                          return (
                            <div 
                              key={stat.categoryId}
                              className="flex items-center space-x-2 p-2 rounded-lg"
                              style={{ backgroundColor: `${category.color}20` }}
                            >
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <div className="text-xs">
                                <div className="font-medium text-gray-900 dark:text-white">{category.name}</div>
                                <div className="text-gray-600 dark:text-gray-400">{formatDuration(stat.totalDuration)}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No hay datos de categorías para el período seleccionado</p>
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
                    {/* Chart Visualization */}
                    <div className="h-80">
                      <Bar 
                        data={barChartData} 
                        options={{
                          responsive: true,
                          scales: {
                            x: {
                              grid: {
                                color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                              },
                              ticks: {
                                color: document.documentElement.classList.contains('dark') ? '#E5E5E5' : '#1F2937'
                              }
                            },
                            y: {
                              grid: {
                                color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                              },
                              ticks: {
                                color: document.documentElement.classList.contains('dark') ? '#E5E5E5' : '#1F2937'
                              }
                            }
                          },
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                color: document.documentElement.classList.contains('dark') ? '#E5E5E5' : '#1F2937'
                              }
                            }
                          }
                        }} 
                      />
                    </div>
                    
                    {/* Legend */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {usageTrends.datasets.map(dataset => {
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
                  {usageStats.length > 0 ? (
                    <>
                      {/* Most Used Categories */}
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Categorías Más Utilizadas</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Las categorías más frecuentes en el período seleccionado son <strong style={{ color: categories.find(c => c.id === usageStats[0]?.categoryId)?.color }}>
                            {categories.find(c => c.id === usageStats[0]?.categoryId)?.name}
                          </strong>
                          {usageStats.length > 1 && <> y <strong style={{ color: categories.find(c => c.id === usageStats[1]?.categoryId)?.color }}>
                            {categories.find(c => c.id === usageStats[1]?.categoryId)?.name}
                          </strong></>}, 
                          representando el {(usageStats.slice(0, 2).reduce((sum, stat) => sum + stat.percentage, 0)).toFixed(1)}% 
                          del total.
                        </p>
                      </div>
                      
                      {/* Underutilized Categories */}
                      {categories.length > usageStats.length && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Categorías Infrautilizadas</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Hay {categories.length - usageStats.length} categorías que no has utilizado en el período actual.
                            Considera incorporar más variedad en tu contenido.
                          </p>
                        </div>
                      )}
                      
                      {/* Time Distribution */}
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Distribución de Tiempo</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Has dedicado más tiempo a <strong style={{ color: categories.find(c => c.id === usageStats[0]?.categoryId)?.color }}>
                            {categories.find(c => c.id === usageStats[0]?.categoryId)?.name}
                          </strong> con un total de {formatDuration(usageStats[0]?.totalDuration || 0)}.
                          {usageStats.length > 1 && <> La segunda categoría con más tiempo es <strong style={{ color: categories.find(c => c.id === usageStats[1]?.categoryId)?.color }}>
                            {categories.find(c => c.id === usageStats[1]?.categoryId)?.name}
                          </strong> con {formatDuration(usageStats[1]?.totalDuration || 0)}.</>}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p>No hay suficientes datos para generar insights</p>
                      <p className="text-sm">Añade más contenido con categorías para obtener recomendaciones</p>
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

export default CategoryAnalytics;