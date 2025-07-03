import React, { useState } from 'react';
import { 
  Award, Star, Target, Calendar, Users, CheckCircle, 
  TrendingUp, X, Filter, Search, Eye, Download, 
  Zap, Clock, BarChart3, Flag
} from 'lucide-react';
import { WorkTypeGoal } from './GoalsManager';
import { StudentProfile } from './StudentProfile';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'completion' | 'streak' | 'workType' | 'milestone';
  icon: string;
  color: string;
  studentId: string;
  date: Date;
  relatedGoalId?: string;
  relatedWorkTypeId?: string;
  value?: number; // For percentage or count achievements
}

interface AchievementsManagerProps {
  achievements: Achievement[];
  students: StudentProfile[];
  workTypes: WorkTypeGoal[];
  isOpen: boolean;
  onClose: () => void;
  onExportAchievements?: () => void;
}

const AchievementsManager: React.FC<AchievementsManagerProps> = ({
  achievements,
  students,
  workTypes,
  isOpen,
  onClose,
  onExportAchievements
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStudent, setFilterStudent] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date');

  const achievementIcons = {
    'award': Award,
    'star': Star,
    'target': Target,
    'calendar': Calendar,
    'users': Users,
    'check': CheckCircle,
    'trending': TrendingUp,
    'zap': Zap
  };

  // Filter and sort achievements
  const filteredAchievements = achievements
    .filter(achievement => {
      const matchesSearch = searchTerm === '' || 
        achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStudent = filterStudent === 'all' || achievement.studentId === filterStudent;
      const matchesType = filterType === 'all' || achievement.type === filterType;
      
      return matchesSearch && matchesStudent && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.date.getTime() - a.date.getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Estudiante desconocido';
  };

  const getWorkTypeName = (workTypeId?: string) => {
    if (!workTypeId) return '';
    const workType = workTypes.find(wt => wt.id === workTypeId);
    return workType ? workType.name : '';
  };

  const getAchievementIcon = (iconName: string) => {
    return achievementIcons[iconName as keyof typeof achievementIcons] || Award;
  };

  const getAchievementTypeLabel = (type: string) => {
    switch (type) {
      case 'completion': return 'Completación';
      case 'streak': return 'Racha';
      case 'workType': return 'Tipo de Trabajo';
      case 'milestone': return 'Hito';
      default: return type;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="pr-12">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Logros y Reconocimientos</h1>
                <p className="text-yellow-100">Seguimiento de éxitos y progreso</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Award className="w-4 h-4" />
                <span>{achievements.length} logros totales</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{new Set(achievements.map(a => a.studentId)).size} estudiantes con logros</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-elevated">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-dark-surface dark:text-white"
                placeholder="Buscar logros..."
              />
            </div>

            <select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-dark-surface dark:text-white"
            >
              <option value="all">Todos los estudiantes</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-dark-surface dark:text-white"
            >
              <option value="all">Todos los tipos</option>
              <option value="completion">Completación</option>
              <option value="streak">Racha</option>
              <option value="workType">Tipo de Trabajo</option>
              <option value="milestone">Hito</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-dark-surface dark:text-white"
            >
              <option value="date">Más recientes primero</option>
              <option value="name">Ordenar por nombre</option>
              <option value="type">Ordenar por tipo</option>
            </select>
          </div>
        </div>

        {/* Achievements List */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Award className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No se encontraron logros</h3>
              <p>Ajusta los filtros o espera a que los estudiantes completen objetivos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement) => {
                const IconComponent = getAchievementIcon(achievement.icon);
                
                return (
                  <div key={achievement.id} className="bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border rounded-lg p-4 hover:shadow-md dark:hover:shadow-dark transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: achievement.color }}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {achievement.name}
                        </h3>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {achievement.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>{getStudentName(achievement.studentId)}</span>
                          <span>{achievement.date.toLocaleDateString()}</span>
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                            {getAchievementTypeLabel(achievement.type)}
                          </span>
                        </div>
                        
                        {achievement.relatedWorkTypeId && (
                          <div className="mt-2 text-xs">
                            <span className="text-blue-600 dark:text-blue-400">
                              Tipo de trabajo: {getWorkTypeName(achievement.relatedWorkTypeId)}
                            </span>
                          </div>
                        )}
                        
                        {achievement.value !== undefined && (
                          <div className="mt-2 text-xs">
                            <span className="text-green-600 dark:text-green-400">
                              {achievement.value}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-dark-elevated border-t border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando {filteredAchievements.length} de {achievements.length} logros
            </div>
            
            {onExportAchievements && (
              <button
                onClick={onExportAchievements}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Logros</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsManager;