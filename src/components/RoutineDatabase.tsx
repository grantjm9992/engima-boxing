import React, { useState, useMemo } from 'react';
import { 
  Database, Calendar, Users, TrendingUp, BarChart3, 
  Filter, Search, Download, Eye, X, Clock, Target,
  Award, Zap, CheckCircle, AlertCircle, FileText
} from 'lucide-react';
import { 
  RoutineCompletion, 
  DailyStats, 
  StudentAttendanceStats, 
  CategoryStats,
  WorkType 
} from '../types/RoutineTypes';
import { StudentProfile } from './StudentProfile';

interface RoutineDatabaseProps {
  completions: RoutineCompletion[];
  students: StudentProfile[];
  isOpen: boolean;
  onClose: () => void;
  onExportData?: () => void;
}

const RoutineDatabase: React.FC<RoutineDatabaseProps> = ({
  completions,
  students,
  isOpen,
  onClose,
  onExportData
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'daily' | 'students' | 'categories' | 'completions'>('overview');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter completions by date range
  const filteredCompletions = useMemo(() => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999); // Include the entire end date
    
    return completions.filter(completion => {
      const completionDate = new Date(completion.completedAt);
      return completionDate >= startDate && completionDate <= endDate;
    });
  }, [completions, dateRange]);

  // Calculate daily stats
  const dailyStats = useMemo((): DailyStats[] => {
    const statsMap = new Map<string, DailyStats>();
    
    filteredCompletions.forEach(completion => {
      const dateKey = completion.completedAt.toISOString().split('T')[0];
      
      if (!statsMap.has(dateKey)) {
        statsMap.set(dateKey, {
          date: new Date(dateKey),
          totalDuration: 0,
          workTypeBreakdown: {
            strength: 0,
            coordination: 0,
            reaction: 0,
            technique: 0,
            cardio: 0,
            flexibility: 0,
            sparring: 0,
            conditioning: 0
          },
          attendanceByStudent: {},
          completedRoutines: [],
          morningCompleted: false,
          afternoonCompleted: false,
          fullDayCompleted: false
        });
      }
      
      const dayStats = statsMap.get(dateKey)!;
      dayStats.totalDuration += completion.duration;
      dayStats.completedRoutines.push(completion.routineId);
      
      if (completion.morningSession) dayStats.morningCompleted = true;
      if (completion.afternoonSession) dayStats.afternoonCompleted = true;
      dayStats.fullDayCompleted = dayStats.morningCompleted && dayStats.afternoonCompleted;
      
      // Calculate work type breakdown
      const totalExerciseTime = completion.exercises.reduce((sum, ex) => sum + ex.duration, 0);
      completion.exercises.forEach(exercise => {
        const percentage = totalExerciseTime > 0 ? (exercise.duration / totalExerciseTime) * 100 : 0;
        dayStats.workTypeBreakdown[exercise.workType] += percentage;
      });
      
      // Track attendance
      completion.attendees.forEach(studentId => {
        dayStats.attendanceByStudent[studentId] = (dayStats.attendanceByStudent[studentId] || 0) + completion.duration;
      });
    });
    
    return Array.from(statsMap.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [filteredCompletions]);

  // Calculate student attendance stats
  const studentStats = useMemo((): StudentAttendanceStats[] => {
    const statsMap = new Map<string, StudentAttendanceStats>();
    
    students.forEach(student => {
      statsMap.set(student.id, {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        totalSessions: 0,
        totalMinutes: 0,
        categoryBreakdown: {},
        workTypeBreakdown: {
          strength: 0,
          coordination: 0,
          reaction: 0,
          technique: 0,
          cardio: 0,
          flexibility: 0,
          sparring: 0,
          conditioning: 0
        },
        averageRating: 0,
        lastSession: new Date(0),
        consistency: 0
      });
    });
    
    filteredCompletions.forEach(completion => {
      completion.attendees.forEach(studentId => {
        const stats = statsMap.get(studentId);
        if (stats) {
          stats.totalSessions++;
          stats.totalMinutes += completion.duration;
          
          if (completion.categoryName) {
            stats.categoryBreakdown[completion.categoryName] = 
              (stats.categoryBreakdown[completion.categoryName] || 0) + completion.duration;
          }
          
          // Calculate work type breakdown
          const totalExerciseTime = completion.exercises.reduce((sum, ex) => sum + ex.duration, 0);
          completion.exercises.forEach(exercise => {
            const percentage = totalExerciseTime > 0 ? (exercise.duration / totalExerciseTime) : 0;
            stats.workTypeBreakdown[exercise.workType] += percentage;
          });
          
          if (completion.rating) {
            stats.averageRating = (stats.averageRating * (stats.totalSessions - 1) + completion.rating) / stats.totalSessions;
          }
          
          if (completion.completedAt > stats.lastSession) {
            stats.lastSession = completion.completedAt;
          }
        }
      });
    });
    
    // Normalize work type percentages
    statsMap.forEach(stats => {
      const totalWorkTime = Object.values(stats.workTypeBreakdown).reduce((sum, val) => sum + val, 0);
      if (totalWorkTime > 0) {
        Object.keys(stats.workTypeBreakdown).forEach(workType => {
          stats.workTypeBreakdown[workType as WorkType] = 
            (stats.workTypeBreakdown[workType as WorkType] / totalWorkTime) * 100;
        });
      }
    });
    
    return Array.from(statsMap.values())
      .filter(stats => stats.totalSessions > 0)
      .sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [filteredCompletions, students]);

  // Calculate category stats
  const categoryStats = useMemo((): CategoryStats[] => {
    const statsMap = new Map<string, CategoryStats>();
    
    filteredCompletions.forEach(completion => {
      if (!completion.categoryId || !completion.categoryName) return;
      
      if (!statsMap.has(completion.categoryId)) {
        statsMap.set(completion.categoryId, {
          categoryId: completion.categoryId,
          categoryName: completion.categoryName,
          totalSessions: 0,
          totalMinutes: 0,
          averageRating: 0,
          studentParticipation: {},
          workTypeDistribution: {
            strength: 0,
            coordination: 0,
            reaction: 0,
            technique: 0,
            cardio: 0,
            flexibility: 0,
            sparring: 0,
            conditioning: 0
          },
          trendsOverTime: []
        });
      }
      
      const stats = statsMap.get(completion.categoryId)!;
      stats.totalSessions++;
      stats.totalMinutes += completion.duration;
      
      if (completion.rating) {
        stats.averageRating = (stats.averageRating * (stats.totalSessions - 1) + completion.rating) / stats.totalSessions;
      }
      
      completion.attendees.forEach(studentId => {
        stats.studentParticipation[studentId] = (stats.studentParticipation[studentId] || 0) + completion.duration;
      });
      
      // Calculate work type distribution
      const totalExerciseTime = completion.exercises.reduce((sum, ex) => sum + ex.duration, 0);
      completion.exercises.forEach(exercise => {
        const percentage = totalExerciseTime > 0 ? (exercise.duration / totalExerciseTime) : 0;
        stats.workTypeDistribution[exercise.workType] += percentage;
      });
    });
    
    // Normalize work type percentages and build trends
    statsMap.forEach(stats => {
      const totalWorkTime = Object.values(stats.workTypeDistribution).reduce((sum, val) => sum + val, 0);
      if (totalWorkTime > 0) {
        Object.keys(stats.workTypeDistribution).forEach(workType => {
          stats.workTypeDistribution[workType as WorkType] = 
            (stats.workTypeDistribution[workType as WorkType] / totalWorkTime) * 100;
        });
      }
    });
    
    return Array.from(statsMap.values()).sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [filteredCompletions]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getWorkTypeLabel = (workType: WorkType) => {
    const labels: Record<WorkType, string> = {
      strength: 'Fuerza',
      coordination: 'Coordinación',
      reaction: 'Reacción',
      technique: 'Técnica',
      cardio: 'Cardio',
      flexibility: 'Flexibilidad',
      sparring: 'Sparring',
      conditioning: 'Acondicionamiento'
    };
    return labels[workType] || workType;
  };

  const getWorkTypeColor = (workType: WorkType) => {
    const colors: Record<WorkType, string> = {
      strength: '#EF4444',
      coordination: '#F97316',
      reaction: '#F59E0B',
      technique: '#3B82F6',
      cardio: '#DC2626',
      flexibility: '#22C55E',
      sparring: '#8B5CF6',
      conditioning: '#6B7280'
    };
    return colors[workType] || '#6B7280';
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
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Base de Datos de Rutinas</h1>
                <p className="text-purple-100">Análisis completo de entrenamientos y rendimiento</p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>{filteredCompletions.length} sesiones completadas</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(filteredCompletions.reduce((sum, c) => sum + c.duration, 0))} total</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{studentStats.length} estudiantes activos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-elevated">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-dark-surface dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Fin</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-dark-surface dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estudiante</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-dark-surface dark:text-white"
              >
                <option value="all">Todos los estudiantes</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end space-x-2">
              {onExportData && (
                <button
                  onClick={onExportData}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-dark-border">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Resumen', icon: BarChart3 },
              { id: 'daily', label: 'Estadísticas Diarias', icon: Calendar },
              { id: 'students', label: 'Por Estudiante', icon: Users },
              { id: 'categories', label: 'Por Categoría', icon: Target },
              { id: 'completions', label: 'Sesiones', icon: CheckCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">Sesiones Totales</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {filteredCompletions.length}
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-900 dark:text-green-100">Tiempo Total</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatDuration(filteredCompletions.reduce((sum, c) => sum + c.duration, 0))}
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-medium text-purple-900 dark:text-purple-100">Calificación Promedio</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {filteredCompletions.length > 0 
                      ? (filteredCompletions.reduce((sum, c) => sum + (c.rating || 0), 0) / filteredCompletions.length).toFixed(1)
                      : '0.0'
                    }
                  </div>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <span className="font-medium text-orange-900 dark:text-orange-100">Estudiantes Activos</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {studentStats.length}
                  </div>
                </div>
              </div>

              {/* Work Type Distribution */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribución por Tipo de Trabajo</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(
                    filteredCompletions.reduce((acc, completion) => {
                      completion.exercises.forEach(exercise => {
                        acc[exercise.workType] = (acc[exercise.workType] || 0) + exercise.duration;
                      });
                      return acc;
                    }, {} as Record<WorkType, number>)
                  ).map(([workType, minutes]) => (
                    <div key={workType} className="p-3 border border-gray-200 dark:border-dark-border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getWorkTypeColor(workType as WorkType) }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {getWorkTypeLabel(workType as WorkType)}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-gray-600 dark:text-gray-300">
                        {formatDuration(minutes)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actividad Reciente</h3>
                <div className="space-y-3">
                  {filteredCompletions.slice(0, 5).map((completion) => (
                    <div key={completion.id} className="p-4 border border-gray-200 dark:border-dark-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{completion.routineName}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>{completion.completedAt.toLocaleDateString()}</span>
                            <span>{formatDuration(completion.duration)}</span>
                            <span>{completion.attendees.length} participante{completion.attendees.length !== 1 ? 's' : ''}</span>
                            {completion.rating && (
                              <div className="flex items-center space-x-1">
                                <Award className="w-3 h-3" />
                                <span>{completion.rating}/5</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {completion.morningSession && (
                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded text-xs">
                              Mañana
                            </span>
                          )}
                          {completion.afternoonSession && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs">
                              Tarde
                            </span>
                          )}
                          {completion.isFullDayComplete && (
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'daily' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estadísticas Diarias</h3>
              {dailyStats.map((day) => (
                <div key={day.date.toISOString()} className="p-4 border border-gray-200 dark:border-dark-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {day.date.toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h4>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {day.morningCompleted && (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded text-xs">
                          Mañana ✓
                        </span>
                      )}
                      {day.afternoonCompleted && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs">
                          Tarde ✓
                        </span>
                      )}
                      {day.fullDayCompleted && (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Duración Total</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatDuration(day.totalDuration)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Rutinas Completadas</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {day.completedRoutines.length}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Participantes</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {Object.keys(day.attendanceByStudent).length}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estadísticas por Estudiante</h3>
              {studentStats.map((stats) => (
                <div key={stats.studentId} className="p-4 border border-gray-200 dark:border-dark-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{stats.studentName}</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Última sesión: {stats.lastSession.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {stats.averageRating.toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Sesiones Totales</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {stats.totalSessions}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Tiempo Total</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatDuration(stats.totalMinutes)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Promedio por Sesión</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatDuration(Math.round(stats.totalMinutes / stats.totalSessions))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estadísticas por Categoría</h3>
              {categoryStats.map((stats) => (
                <div key={stats.categoryId} className="p-4 border border-gray-200 dark:border-dark-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h4 className="font-medium text-gray-900 dark:text-white">{stats.categoryName}</h4>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {stats.averageRating.toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Sesiones Totales</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {stats.totalSessions}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Tiempo Total</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatDuration(stats.totalMinutes)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Estudiantes Únicos</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {Object.keys(stats.studentParticipation).length}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'completions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Historial de Sesiones</h3>
              {filteredCompletions.map((completion) => (
                <div key={completion.id} className="p-4 border border-gray-200 dark:border-dark-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{completion.routineName}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{completion.completedAt.toLocaleDateString()}</span>
                        <span>{formatDuration(completion.duration)}</span>
                        <span>{completion.attendees.length} participante{completion.attendees.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {completion.rating && (
                        <div className="flex items-center space-x-1">
                          <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          <span>{completion.rating}/5</span>
                        </div>
                      )}
                      {completion.morningSession && (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded text-xs">
                          Mañana
                        </span>
                      )}
                      {completion.afternoonSession && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs">
                          Tarde
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Bloques Completados</div>
                      <div className="space-y-1">
                        {completion.blocks.map((block, index) => (
                          <div key={index} className="text-sm text-gray-900 dark:text-white">
                            {block.blockName} ({formatDuration(block.duration)})
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tipos de Trabajo</div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(
                          completion.exercises.reduce((acc, ex) => {
                            acc[ex.workType] = (acc[ex.workType] || 0) + 1;
                            return acc;
                          }, {} as Record<WorkType, number>)
                        ).map(([workType, count]) => (
                          <span 
                            key={workType}
                            className="px-2 py-1 rounded text-xs text-white"
                            style={{ backgroundColor: getWorkTypeColor(workType as WorkType) }}
                          >
                            {getWorkTypeLabel(workType as WorkType)} ({count})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {completion.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-border">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notas</div>
                      <div className="text-sm text-gray-900 dark:text-white">{completion.notes}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutineDatabase;