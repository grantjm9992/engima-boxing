import React, { useState } from 'react';
import { 
  Target, Plus, X, Calendar, TrendingUp, Award, 
  CheckCircle, AlertTriangle, Clock, Zap, Brain,
  BarChart3, Users, Star, Flag, Edit3, Trash2, Save
} from 'lucide-react';

export interface WorkTypeGoal {
  id: string;
  name: string;
  color: string;
  description: string;
  category: 'physical' | 'technical' | 'mental' | 'tactical';
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'quarterly';
  workTypes: string[]; // WorkTypeGoal IDs
  targetPercentage: number; // 90% for beginners/intermediate, 95% for competitors
  studentLevel: 'principiante' | 'intermedio' | 'avanzado' | 'competidor' | 'elite';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalProgress {
  goalId: string;
  currentPercentage: number;
  completedDays: number;
  totalDays: number;
  isCompleted: boolean;
  achievements: string[];
  lastUpdated: Date;
}

interface GoalsManagerProps {
  goals: Goal[];
  workTypes: WorkTypeGoal[];
  goalProgress: GoalProgress[];
  onCreateGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
  onCreateWorkType: (workType: Omit<WorkTypeGoal, 'id'>) => void;
  onUpdateWorkType: (id: string, updates: Partial<WorkTypeGoal>) => void;
  onDeleteWorkType: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const GoalsManager: React.FC<GoalsManagerProps> = ({
  goals,
  workTypes,
  goalProgress,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
  onCreateWorkType,
  onUpdateWorkType,
  onDeleteWorkType,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'goals' | 'workTypes' | 'progress'>('goals');
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [isCreatingWorkType, setIsCreatingWorkType] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editingWorkType, setEditingWorkType] = useState<string | null>(null);

  const [goalForm, setGoalForm] = useState<Partial<Goal>>({
    name: '',
    description: '',
    type: 'weekly',
    workTypes: [],
    targetPercentage: 90,
    studentLevel: 'intermedio',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    isActive: true
  });

  const [workTypeForm, setWorkTypeForm] = useState<Partial<WorkTypeGoal>>({
    name: '',
    color: '#3B82F6',
    description: '',
    category: 'technical'
  });

  const workTypeCategories = [
    { value: 'physical', label: 'Físico', icon: Zap, color: '#EF4444' },
    { value: 'technical', label: 'Técnico', icon: Target, color: '#3B82F6' },
    { value: 'mental', label: 'Mental', icon: Brain, color: '#8B5CF6' },
    { value: 'tactical', label: 'Táctico', icon: Flag, color: '#F59E0B' }
  ];

  const goalTypes = [
    { value: 'daily', label: 'Diario', duration: 1 },
    { value: 'weekly', label: 'Semanal', duration: 7 },
    { value: 'quarterly', label: 'Trimestral', duration: 90 }
  ];

  const studentLevels = [
    { value: 'principiante', label: 'Principiante', defaultTarget: 90 },
    { value: 'intermedio', label: 'Intermedio', defaultTarget: 90 },
    { value: 'avanzado', label: 'Avanzado', defaultTarget: 95 },
    { value: 'competidor', label: 'Competidor', defaultTarget: 95 },
    { value: 'elite', label: 'Élite', defaultTarget: 95 }
  ];

  const colorPalette = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E',
    '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'
  ];

  const predefinedWorkTypes = [
    { name: 'Reacción', category: 'mental', color: '#8B5CF6', description: 'Tiempo de respuesta y reflejos' },
    { name: 'Carga Mental', category: 'mental', color: '#EC4899', description: 'Resistencia psicológica bajo presión' },
    { name: 'Explosividad', category: 'physical', color: '#EF4444', description: 'Potencia y velocidad máxima' },
    { name: 'Resistencia', category: 'physical', color: '#F97316', description: 'Capacidad aeróbica y anaeróbica' },
    { name: 'Técnica Pura', category: 'technical', color: '#3B82F6', description: 'Ejecución técnica perfecta' },
    { name: 'Combinaciones', category: 'technical', color: '#06B6D4', description: 'Secuencias de golpes fluidas' },
    { name: 'Estrategia', category: 'tactical', color: '#F59E0B', description: 'Planificación y adaptación táctica' },
    { name: 'Lectura de Oponente', category: 'tactical', color: '#84CC16', description: 'Análisis y anticipación' }
  ];

  const handleCreateGoal = () => {
    if (goalForm.name?.trim() && goalForm.workTypes && goalForm.workTypes.length > 0) {
      onCreateGoal({
        ...goalForm,
        name: goalForm.name.trim(),
        description: goalForm.description?.trim() || '',
        workTypes: goalForm.workTypes,
        targetPercentage: goalForm.targetPercentage || 90,
        studentLevel: goalForm.studentLevel || 'intermedio',
        type: goalForm.type || 'weekly',
        startDate: goalForm.startDate || new Date(),
        endDate: goalForm.endDate || new Date(),
        isActive: goalForm.isActive !== false
      });
      resetGoalForm();
    }
  };

  const handleCreateWorkType = () => {
    if (workTypeForm.name?.trim()) {
      onCreateWorkType({
        name: workTypeForm.name.trim(),
        color: workTypeForm.color || '#3B82F6',
        description: workTypeForm.description?.trim() || '',
        category: workTypeForm.category || 'technical'
      });
      resetWorkTypeForm();
    }
  };

  const resetGoalForm = () => {
    setGoalForm({
      name: '',
      description: '',
      type: 'weekly',
      workTypes: [],
      targetPercentage: 90,
      studentLevel: 'intermedio',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true
    });
    setIsCreatingGoal(false);
    setEditingGoal(null);
  };

  const resetWorkTypeForm = () => {
    setWorkTypeForm({
      name: '',
      color: '#3B82F6',
      description: '',
      category: 'technical'
    });
    setIsCreatingWorkType(false);
    setEditingWorkType(null);
  };

  const startEditingGoal = (goal: Goal) => {
    setGoalForm(goal);
    setEditingGoal(goal.id);
    setIsCreatingGoal(false);
  };

  const startEditingWorkType = (workType: WorkTypeGoal) => {
    setWorkTypeForm(workType);
    setEditingWorkType(workType.id);
    setIsCreatingWorkType(false);
  };

  const createPredefinedWorkType = (preset: typeof predefinedWorkTypes[0]) => {
    const exists = workTypes.some(wt => wt.name.toLowerCase() === preset.name.toLowerCase());
    if (!exists) {
      onCreateWorkType(preset);
    }
  };

  const getWorkTypeCategoryIcon = (category: string) => {
    const cat = workTypeCategories.find(c => c.value === category);
    return cat ? cat.icon : Target;
  };

  const getWorkTypeCategoryColor = (category: string) => {
    const cat = workTypeCategories.find(c => c.value === category);
    return cat ? cat.color : '#6B7280';
  };

  const getGoalProgress = (goalId: string): GoalProgress | null => {
    return goalProgress.find(gp => gp.goalId === goalId) || null;
  };

  const formatDateRange = (start: Date, end: Date) => {
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
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
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Gestión de Objetivos</h1>
                <p className="text-green-100">Planificación táctica y seguimiento de metas</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>{goals.filter(g => g.isActive).length} objetivos activos</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4" />
                <span>{workTypes.length} tipos de trabajo</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award className="w-4 h-4" />
                <span>{goalProgress.filter(gp => gp.isCompleted).length} completados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-dark-border">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'goals', label: 'Objetivos', icon: Target },
              { id: 'workTypes', label: 'Tipos de Trabajo', icon: Zap },
              { id: 'progress', label: 'Progreso', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {activeTab === 'goals' && (
            <div className="space-y-6">
              {/* Create Goal Button */}
              {!isCreatingGoal && !editingGoal && (
                <button
                  onClick={() => setIsCreatingGoal(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-600 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                >
                  <Plus className="w-5 h-5" />
                  <span>Crear Nuevo Objetivo</span>
                </button>
              )}

              {/* Goal Form */}
              {(isCreatingGoal || editingGoal) && (
                <div className="p-6 border-2 border-green-200 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {editingGoal ? 'Editar Objetivo' : 'Nuevo Objetivo'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre del Objetivo *
                      </label>
                      <input
                        type="text"
                        value={goalForm.name || ''}
                        onChange={(e) => setGoalForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-dark-surface dark:text-white"
                        placeholder="Ej: Mejora técnica semanal, Resistencia trimestral..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tipo de Objetivo
                      </label>
                      <select
                        value={goalForm.type || 'weekly'}
                        onChange={(e) => {
                          const type = e.target.value as Goal['type'];
                          const duration = goalTypes.find(gt => gt.value === type)?.duration || 7;
                          setGoalForm(prev => ({ 
                            ...prev, 
                            type,
                            endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-dark-surface dark:text-white"
                      >
                        {goalTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={goalForm.description || ''}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-dark-surface dark:text-white"
                      rows={2}
                      placeholder="Describe el objetivo y su propósito..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nivel de Estudiante
                      </label>
                      <select
                        value={goalForm.studentLevel || 'intermedio'}
                        onChange={(e) => {
                          const level = e.target.value as Goal['studentLevel'];
                          const defaultTarget = studentLevels.find(sl => sl.value === level)?.defaultTarget || 90;
                          setGoalForm(prev => ({ 
                            ...prev, 
                            studentLevel: level,
                            targetPercentage: defaultTarget
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-dark-surface dark:text-white"
                      >
                        {studentLevels.map(level => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Porcentaje Objetivo
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={goalForm.targetPercentage || 90}
                        onChange={(e) => setGoalForm(prev => ({ ...prev, targetPercentage: parseInt(e.target.value) || 90 }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-dark-surface dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipos de Trabajo *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-300 dark:border-dark-border rounded-lg p-3">
                      {workTypes.map((workType) => {
                        const IconComponent = getWorkTypeCategoryIcon(workType.category);
                        const isSelected = goalForm.workTypes?.includes(workType.id) || false;
                        
                        return (
                          <div
                            key={workType.id}
                            className={`p-2 rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                            }`}
                            onClick={() => {
                              const currentWorkTypes = goalForm.workTypes || [];
                              const newWorkTypes = isSelected
                                ? currentWorkTypes.filter(id => id !== workType.id)
                                : [...currentWorkTypes, workType.id];
                              setGoalForm(prev => ({ ...prev, workTypes: newWorkTypes }));
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                                style={{ backgroundColor: workType.color }}
                              >
                                <IconComponent className="w-2 h-2" />
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {workType.name}
                              </span>
                              {isSelected && (
                                <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={editingGoal ? () => {
                        if (goalForm.name?.trim() && goalForm.workTypes && goalForm.workTypes.length > 0) {
                          onUpdateGoal(editingGoal, {
                            ...goalForm,
                            name: goalForm.name.trim(),
                            description: goalForm.description?.trim() || '',
                            updatedAt: new Date()
                          });
                          resetGoalForm();
                        }
                      } : handleCreateGoal}
                      disabled={!goalForm.name?.trim() || !goalForm.workTypes || goalForm.workTypes.length === 0}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingGoal ? 'Actualizar' : 'Crear'}</span>
                    </button>
                    <button
                      onClick={resetGoalForm}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Goals List */}
              <div className="space-y-4">
                {goals.map((goal) => {
                  const progress = getGoalProgress(goal.id);
                  const daysRemaining = getDaysRemaining(goal.endDate);
                  const selectedWorkTypes = workTypes.filter(wt => goal.workTypes.includes(wt.id));
                  
                  return (
                    <div key={goal.id} className="p-4 border border-gray-200 dark:border-dark-border rounded-lg hover:shadow-md dark:hover:shadow-dark transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
                            {goal.isActive ? (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs font-medium">
                                Activo
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400 rounded-full text-xs font-medium">
                                Inactivo
                              </span>
                            )}
                            {progress?.isCompleted && (
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{goal.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <span className="capitalize">{goalTypes.find(gt => gt.value === goal.type)?.label}</span>
                            <span>{goal.targetPercentage}% objetivo</span>
                            <span>{formatDateRange(goal.startDate, goal.endDate)}</span>
                            {daysRemaining > 0 && (
                              <span className="text-orange-600 dark:text-orange-400">
                                {daysRemaining} día{daysRemaining !== 1 ? 's' : ''} restante{daysRemaining !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>

                          {/* Work Types */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {selectedWorkTypes.map((workType) => {
                              const IconComponent = getWorkTypeCategoryIcon(workType.category);
                              return (
                                <div
                                  key={workType.id}
                                  className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                                  style={{ backgroundColor: workType.color }}
                                >
                                  <IconComponent className="w-3 h-3" />
                                  <span>{workType.name}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Progress Bar */}
                          {progress && (
                            <div className="mb-2">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">Progreso</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {progress.currentPercentage.toFixed(1)}% / {goal.targetPercentage}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    progress.currentPercentage >= goal.targetPercentage
                                      ? 'bg-green-600'
                                      : progress.currentPercentage >= goal.targetPercentage * 0.8
                                      ? 'bg-yellow-600'
                                      : 'bg-red-600'
                                  }`}
                                  style={{ width: `${Math.min(100, (progress.currentPercentage / goal.targetPercentage) * 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-1 ml-4">
                          <button
                            onClick={() => startEditingGoal(goal)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Editar objetivo"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteGoal(goal.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Eliminar objetivo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {goals.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Target className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No hay objetivos creados aún</p>
                    <p className="text-sm">Crea tu primer objetivo para comenzar el seguimiento</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'workTypes' && (
            <div className="space-y-6">
              {/* Quick Creation from Presets */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tipos de Trabajo Predefinidos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {predefinedWorkTypes.map((preset, index) => {
                    const exists = workTypes.some(wt => wt.name.toLowerCase() === preset.name.toLowerCase());
                    const IconComponent = getWorkTypeCategoryIcon(preset.category);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => createPredefinedWorkType(preset)}
                        disabled={exists}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                          exists
                            ? 'border-gray-200 dark:border-dark-border bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 dark:border-dark-border hover:border-green-500 dark:hover:border-green-400 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <div 
                            className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: preset.color }}
                          >
                            <IconComponent className="w-2 h-2" />
                          </div>
                          <span>{preset.name}</span>
                          {exists && <span className="text-xs">(Creado)</span>}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{preset.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Create Work Type Button */}
              {!isCreatingWorkType && !editingWorkType && (
                <button
                  onClick={() => setIsCreatingWorkType(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-600 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Plus className="w-5 h-5" />
                  <span>Crear Tipo de Trabajo Personalizado</span>
                </button>
              )}

              {/* Work Type Form */}
              {(isCreatingWorkType || editingWorkType) && (
                <div className="p-6 border-2 border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {editingWorkType ? 'Editar Tipo de Trabajo' : 'Nuevo Tipo de Trabajo'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={workTypeForm.name || ''}
                        onChange={(e) => setWorkTypeForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                        placeholder="Ej: Coordinación avanzada, Resistencia mental..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Categoría
                      </label>
                      <select
                        value={workTypeForm.category || 'technical'}
                        onChange={(e) => setWorkTypeForm(prev => ({ ...prev, category: e.target.value as WorkTypeGoal['category'] }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                      >
                        {workTypeCategories.map(category => (
                          <option key={category.value} value={category.value}>{category.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={workTypeForm.description || ''}
                      onChange={(e) => setWorkTypeForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                      rows={2}
                      placeholder="Describe qué incluye este tipo de trabajo..."
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: workTypeForm.color }}
                      ></div>
                      <div className="flex flex-wrap gap-2">
                        {colorPalette.map(color => (
                          <button
                            key={color}
                            onClick={() => setWorkTypeForm(prev => ({ ...prev, color }))}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                              workTypeForm.color === color ? 'border-gray-800 dark:border-gray-200 scale-110' : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={editingWorkType ? () => {
                        if (workTypeForm.name?.trim()) {
                          onUpdateWorkType(editingWorkType, {
                            ...workTypeForm,
                            name: workTypeForm.name.trim(),
                            description: workTypeForm.description?.trim() || ''
                          });
                          resetWorkTypeForm();
                        }
                      } : handleCreateWorkType}
                      disabled={!workTypeForm.name?.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingWorkType ? 'Actualizar' : 'Crear'}</span>
                    </button>
                    <button
                      onClick={resetWorkTypeForm}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Work Types List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workTypes.map((workType) => {
                  const IconComponent = getWorkTypeCategoryIcon(workType.category);
                  const categoryInfo = workTypeCategories.find(c => c.value === workType.category);
                  
                  return (
                    <div key={workType.id} className="p-4 border border-gray-200 dark:border-dark-border rounded-lg hover:shadow-md dark:hover:shadow-dark transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: workType.color }}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{workType.name}</h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {categoryInfo?.label}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-1">
                          <button
                            onClick={() => startEditingWorkType(workType)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Editar tipo de trabajo"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteWorkType(workType.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Eliminar tipo de trabajo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400">{workType.description}</p>
                    </div>
                  );
                })}

                {workTypes.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                    <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No hay tipos de trabajo creados aún</p>
                    <p className="text-sm">Usa los predefinidos o crea tipos personalizados</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p>Panel de progreso en desarrollo</p>
                <p className="text-sm">Aquí se mostrarán las estadísticas de cumplimiento de objetivos</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalsManager;