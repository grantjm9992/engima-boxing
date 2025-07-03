import React, { useState } from 'react';
import { 
  FileText, Edit3, Save, X, Plus, Trash2, 
  CheckCircle, AlertTriangle, Calendar, Clock,
  User, Flag, CheckSquare, Eye
} from 'lucide-react';
import { StudentProfile } from './StudentProfile';
import { StudentTask } from './StudentTaskManager';

interface Note {
  id: string;
  content: string;
  timestamp: Date;
  isPending: boolean;
}

interface StudentNotesProps {
  student: StudentProfile;
  tasks: StudentTask[];
  onUpdateNotes: (updates: { tacticalNotes: string, pendingNotes: string[] }) => void;
  onAddTask: (task: Omit<StudentTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCompleteTask: (taskId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const StudentNotes: React.FC<StudentNotesProps> = ({
  student,
  tasks,
  onUpdateNotes,
  onAddTask,
  onCompleteTask,
  isOpen,
  onClose
}) => {
  const [isEditingTactical, setIsEditingTactical] = useState(false);
  const [newTacticalNote, setNewTacticalNote] = useState('');
  const [newPendingNote, setNewPendingNote] = useState('');
  const [activeTab, setActiveTab] = useState<'tactical' | 'pending' | 'tasks'>('tactical');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskForm, setTaskForm] = useState<Partial<StudentTask>>({
    studentId: student.id,
    title: '',
    description: '',
    type: 'technical',
    isCompleted: false,
    priority: 'medium'
  });

  const studentTasks = tasks.filter(task => task.studentId === student.id);
  const pendingTasks = studentTasks.filter(task => !task.isCompleted);
  const completedTasks = studentTasks.filter(task => task.isCompleted);

  const handleAddTacticalNote = () => {
    if (newTacticalNote.trim()) {
      const timestamp = `[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}]`;
      const noteWithTimestamp = `${timestamp}\n${newTacticalNote.trim()}`;
      
      const updatedNotes = student.tacticalNotes 
        ? `${student.tacticalNotes}\n\n${noteWithTimestamp}`
        : noteWithTimestamp;
      
      onUpdateNotes({
        tacticalNotes: updatedNotes,
        pendingNotes: student.pendingNotes || []
      });
      
      setNewTacticalNote('');
      setIsEditingTactical(false);
    }
  };

  const handleAddPendingNote = () => {
    if (newPendingNote.trim()) {
      const updatedPendingNotes = [...(student.pendingNotes || []), newPendingNote.trim()];
      
      onUpdateNotes({
        tacticalNotes: student.tacticalNotes || '',
        pendingNotes: updatedPendingNotes
      });
      
      setNewPendingNote('');
    }
  };

  const handleRemovePendingNote = (index: number) => {
    const updatedPendingNotes = [...(student.pendingNotes || [])];
    updatedPendingNotes.splice(index, 1);
    
    onUpdateNotes({
      tacticalNotes: student.tacticalNotes || '',
      pendingNotes: updatedPendingNotes
    });
  };

  const handleCreateTask = () => {
    if (taskForm.title?.trim()) {
      onAddTask({
        studentId: student.id,
        title: taskForm.title.trim(),
        description: taskForm.description?.trim() || '',
        type: taskForm.type as 'technical' | 'tactical' | 'attitudinal',
        dueDate: taskForm.dueDate,
        isCompleted: false,
        priority: taskForm.priority as 'low' | 'medium' | 'high'
      });
      
      setTaskForm({
        studentId: student.id,
        title: '',
        description: '',
        type: 'technical',
        isCompleted: false,
        priority: 'medium'
      });
      setIsCreatingTask(false);
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'technical': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'tactical': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'attitudinal': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="pr-12">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Notas y Tareas</h1>
                <p className="text-orange-100">
                  {student.firstName} {student.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('tactical')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'tactical' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                Notas Tácticas
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'pending' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                Notas Pendientes
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'tasks' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                Tareas Asignadas
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'tactical' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span>Notas Tácticas Privadas</span>
                </h3>
                <button
                  onClick={() => setIsEditingTactical(!isEditingTactical)}
                  className="px-3 py-1 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {isEditingTactical ? 'Cancelar' : 'Añadir Nota'}
                </button>
              </div>

              {isEditingTactical ? (
                <div className="space-y-3">
                  <textarea
                    value={newTacticalNote}
                    onChange={(e) => setNewTacticalNote(e.target.value)}
                    className="w-full px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-dark-elevated dark:text-white"
                    rows={4}
                    placeholder="Nueva observación táctica..."
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddTacticalNote}
                      disabled={!newTacticalNote.trim()}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Nota</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingTactical(false);
                        setNewTacticalNote('');
                      }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                student.tacticalNotes ? (
                  <div className="bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {student.tacticalNotes}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay notas tácticas registradas</p>
                    <p>Añade observaciones estratégicas específicas para este estudiante</p>
                  </div>
                )
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Flag className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span>Notas Pendientes</span>
                </h3>
              </div>

              <div className="mb-6">
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={newPendingNote}
                    onChange={(e) => setNewPendingNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPendingNote()}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-dark-surface dark:text-white"
                    placeholder="Añadir nota pendiente..."
                  />
                  <button
                    onClick={handleAddPendingNote}
                    disabled={!newPendingNote.trim()}
                    className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {student.pendingNotes && student.pendingNotes.length > 0 ? (
                  <div className="space-y-2">
                    {student.pendingNotes.map((note, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <button
                          onClick={() => handleRemovePendingNote(index)}
                          className="mt-0.5 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <span className="flex-1 text-yellow-900 dark:text-yellow-100">{note}</span>
                        <button
                          onClick={() => handleRemovePendingNote(index)}
                          className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Flag className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No hay notas pendientes</p>
                    <p className="text-sm">Añade notas para seguimiento rápido</p>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Sobre las Notas Pendientes</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Las notas pendientes son recordatorios rápidos para seguimiento. Para tareas más estructuradas con fechas límite y seguimiento detallado, utiliza la sección de "Tareas Asignadas".
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Tareas Asignadas</span>
                </h3>
                <button
                  onClick={() => setIsCreatingTask(!isCreatingTask)}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {isCreatingTask ? 'Cancelar' : 'Añadir Tarea'}
                </button>
              </div>

              {/* Task Form */}
              {isCreatingTask && (
                <div className="mb-6 p-4 border-2 border-indigo-200 dark:border-indigo-700 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Nueva Tarea
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tipo de Tarea
                      </label>
                      <select
                        value={taskForm.type || 'technical'}
                        onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-dark-surface dark:text-white"
                      >
                        <option value="technical">Técnico</option>
                        <option value="tactical">Táctico</option>
                        <option value="attitudinal">Actitudinal</option>
                      </select>
                    </div>
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
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleCreateTask}
                      disabled={!taskForm.title?.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Crear Tarea</span>
                    </button>
                    <button
                      onClick={() => setIsCreatingTask(false)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Pending Tasks */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                  <Flag className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>Tareas Pendientes ({pendingTasks.length})</span>
                </h4>
                
                {pendingTasks.length > 0 ? (
                  <div className="space-y-3 mb-6">
                    {pendingTasks.map((task) => (
                      <div 
                        key={task.id} 
                        className="p-3 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:shadow-sm dark:hover:shadow-dark transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="font-medium text-gray-900 dark:text-white">
                                {task.title}
                              </h5>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTaskTypeColor(task.type)}`}>
                                {task.type === 'technical' ? 'Técnico' : task.type === 'tactical' ? 'Táctico' : 'Actitudinal'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                              </span>
                            </div>
                            
                            {task.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {task.description}
                              </p>
                            )}
                            
                            {task.dueDate && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDueDate(task.dueDate)}</span>
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => onCompleteTask(task.id)}
                            className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                            title="Marcar como completada"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400 mb-6">
                    <p>No hay tareas pendientes</p>
                  </div>
                )}
              </div>

              {/* Completed Tasks */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span>Tareas Completadas ({completedTasks.length})</span>
                </h4>
                
                {completedTasks.length > 0 ? (
                  <div className="space-y-3">
                    {completedTasks.slice(0, 5).map((task) => (
                      <div 
                        key={task.id} 
                        className="p-3 border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-elevated rounded-lg"
                      >
                        <div className="flex items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="font-medium text-gray-600 dark:text-gray-400">
                                {task.title}
                              </h5>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTaskTypeColor(task.type)}`}>
                                {task.type === 'technical' ? 'Técnico' : task.type === 'tactical' ? 'Táctico' : 'Actitudinal'}
                              </span>
                            </div>
                            
                            {task.completedAt && (
                              <div className="text-xs text-green-600 dark:text-green-400 flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>Completada el {task.completedAt.toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {completedTasks.length > 5 && (
                      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                        + {completedTasks.length - 5} tareas completadas más
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <p>No hay tareas completadas</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentNotes;