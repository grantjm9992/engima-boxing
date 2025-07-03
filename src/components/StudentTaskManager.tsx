import React, { useState } from 'react';
import { 
  CheckSquare, Plus, X, Edit3, Trash2, Save, 
  Calendar, Clock, Target, AlertCircle, CheckCircle,
  FileText, User, Filter, Search, Tag, Flag
} from 'lucide-react';
import { StudentProfile } from './StudentProfile';

export interface StudentTask {
  id: string;
  studentId: string;
  title: string;
  description: string;
  type: 'technical' | 'tactical' | 'attitudinal';
  dueDate?: Date;
  isCompleted: boolean;
  completedAt?: Date;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

interface StudentTaskManagerProps {
  tasks: StudentTask[];
  students: StudentProfile[];
  onCreateTask: (task: Omit<StudentTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask: (id: string, updates: Partial<StudentTask>) => void;
  onDeleteTask: (id: string) => void;
  onCompleteTask: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  selectedStudentId?: string;
}

const StudentTaskManager: React.FC<StudentTaskManagerProps> = ({
  tasks,
  students,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onCompleteTask,
  isOpen,
  onClose,
  selectedStudentId
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [filterStudent, setFilterStudent] = useState<string>(selectedStudentId || 'all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [taskForm, setTaskForm] = useState<Partial<StudentTask>>({
    studentId: selectedStudentId || '',
    title: '',
    description: '',
    type: 'technical',
    isCompleted: false,
    priority: 'medium'
  });

  const taskTypes = [
    { value: 'technical', label: 'Técnico', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'tactical', label: 'Táctico', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    { value: 'attitudinal', label: 'Actitudinal', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Baja', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'medium', label: 'Media', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { value: 'high', label: 'Alta', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
  ];

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStudent = filterStudent === 'all' || task.studentId === filterStudent;
    const matchesType = filterType === 'all' || task.type === filterType;
    const matchesTab = activeTab === 'pending' ? !task.isCompleted : task.isCompleted;
    
    return matchesSearch && matchesStudent && matchesType && matchesTab;
  }).sort((a, b) => {
    // Sort by priority first (high to low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then by due date (if exists)
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    } else if (a.dueDate) {
      return -1;
    } else if (b.dueDate) {
      return 1;
    }
    
    // Finally by creation date
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const handleCreateTask = () => {
    if (taskForm.title?.trim() && taskForm.studentId) {
      onCreateTask({
        studentId: taskForm.studentId,
        title: taskForm.title.trim(),
        description: taskForm.description?.trim() || '',
        type: taskForm.type as 'technical' | 'tactical' | 'attitudinal',
        dueDate: taskForm.dueDate,
        isCompleted: false,
        priority: taskForm.priority as 'low' | 'medium' | 'high'
      });
      resetTaskForm();
    }
  };

  const handleUpdateTask = () => {
    if (editingTaskId && taskForm.title?.trim()) {
      onUpdateTask(editingTaskId, {
        title: taskForm.title.trim(),
        description: taskForm.description?.trim() || '',
        type: taskForm.type as 'technical' | 'tactical' | 'attitudinal',
        dueDate: taskForm.dueDate,
        priority: taskForm.priority as 'low' | 'medium' | 'high'
      });
      resetTaskForm();
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      studentId: filterStudent !== 'all' ? filterStudent : '',
      title: '',
      description: '',
      type: 'technical',
      isCompleted: false,
      priority: 'medium'
    });
    setIsCreatingTask(false);
    setEditingTaskId(null);
  };

  const startEditingTask = (task: StudentTask) => {
    setTaskForm({
      studentId: task.studentId,
      title: task.title,
      description: task.description,
      type: task.type,
      dueDate: task.dueDate,
      isCompleted: task.isCompleted,
      priority: task.priority
    });
    setEditingTaskId(task.id);
    setIsCreatingTask(false);
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Estudiante desconocido';
  };

  const getTaskTypeLabel = (type: string) => {
    return taskTypes.find(t => t.value === type)?.label || type;
  };

  const getTaskTypeColor = (type: string) => {
    return taskTypes.find(t => t.value === type)?.color || '';
  };

  const getPriorityLabel = (priority: string) => {
    return priorityOptions.find(p => p.value === priority)?.label || priority;
  };

  const getPriorityColor = (priority: string) => {
    return priorityOptions.find(p => p.value === priority)?.color || '';
  };

  const formatDueDate = (date?: Date) => {
    if (!date) return 'Sin fecha límite';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Vencida (${date.toLocaleDateString()})`;
    } else if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Mañana';
    } else if (diffDays < 7) {
      return `En ${diffDays} días`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getDueDateColor = (date?: Date) => {
    if (!date) return 'text-gray-500 dark:text-gray-400';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'text-red-600 dark:text-red-400';
    } else if (diffDays === 0) {
      return 'text-orange-600 dark:text-orange-400';
    } else if (diffDays <= 2) {
      return 'text-yellow-600 dark:text-yellow-400';
    } else {
      return 'text-green-600 dark:text-green-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
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
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Tareas de Estudiantes</h1>
                <p className="text-indigo-100">Asignación y seguimiento de tareas personalizadas</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'pending' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'completed' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                Completadas
              </button>
              <button
                onClick={() => {
                  setIsCreatingTask(true);
                  setEditingTaskId(null);
                }}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Tarea</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-surface dark:text-white"
                placeholder="Buscar tareas..."
              />
            </div>

            <select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-surface dark:text-white"
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
              className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-surface dark:text-white"
            >
              <option value="all">Todos los tipos</option>
              {taskTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Task Form */}
          {(isCreatingTask || editingTaskId) && (
            <div className="mb-6 p-6 border-2 border-indigo-200 dark:border-indigo-700 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingTaskId ? 'Editar Tarea' : 'Nueva Tarea'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estudiante *
                  </label>
                  <select
                    value={taskForm.studentId || ''}
                    onChange={(e) => setTaskForm({ ...taskForm, studentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-surface dark:text-white"
                    required
                    disabled={!!editingTaskId}
                  >
                    <option value="" disabled>Seleccionar estudiante</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Tarea
                  </label>
                  <select
                    value={taskForm.type || 'technical'}
                    onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-surface dark:text-white"
                  >
                    {taskTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={taskForm.title || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-surface dark:text-white"
                  placeholder="Ej: Practicar combinación jab-cross-hook"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={taskForm.description || ''}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-surface dark:text-white"
                  rows={3}
                  placeholder="Instrucciones detalladas, consejos, puntos clave..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha Límite (opcional)
                  </label>
                  <input
                    type="date"
                    value={taskForm.dueDate ? new Date(taskForm.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setTaskForm({ 
                      ...taskForm, 
                      dueDate: e.target.value ? new Date(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-surface dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={taskForm.priority || 'medium'}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-surface dark:text-white"
                  >
                    {priorityOptions.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={editingTaskId ? handleUpdateTask : handleCreateTask}
                  disabled={!taskForm.title?.trim() || !taskForm.studentId}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingTaskId ? 'Actualizar' : 'Crear'}</span>
                </button>
                <button
                  onClick={resetTaskForm}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p>No hay tareas {activeTab === 'pending' ? 'pendientes' : 'completadas'}</p>
                <p className="text-sm">
                  {activeTab === 'pending' 
                    ? 'Crea una nueva tarea para asignarla a un estudiante' 
                    : 'Las tareas completadas aparecerán aquí'}
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`p-4 border rounded-lg transition-shadow ${
                    task.isCompleted
                      ? 'border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-elevated'
                      : 'border-indigo-200 dark:border-indigo-800 hover:shadow-md dark:hover:shadow-dark'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className={`font-semibold ${
                          task.isCompleted 
                            ? 'text-gray-600 dark:text-gray-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(task.type)}`}>
                          {getTaskTypeLabel(task.type)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className={`text-sm mb-3 ${
                          task.isCompleted 
                            ? 'text-gray-500 dark:text-gray-500' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {getStudentName(task.studentId)}
                          </span>
                        </div>
                        
                        {task.dueDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className={getDueDateColor(task.dueDate)}>
                              {formatDueDate(task.dueDate)}
                            </span>
                          </div>
                        )}
                        
                        {task.isCompleted && task.completedAt && (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-green-600 dark:text-green-400">
                              Completada el {task.completedAt.toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-1 ml-4">
                      {!task.isCompleted && (
                        <>
                          <button
                            onClick={() => onCompleteTask(task.id)}
                            className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                            title="Marcar como completada"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => startEditingTask(task)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Editar tarea"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Eliminar tarea"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTaskManager;