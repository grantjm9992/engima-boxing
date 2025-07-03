import React, { useState } from 'react';
import { 
  User, Edit3, Save, X, Calendar, Ruler, Weight, Trophy, 
  Target, AlertTriangle, Plus, Trash2, Users, TrendingUp,
  Shield, Zap, Eye, Brain, Heart, Clock, FileText,
  Flag, CheckCircle, Circle, Star, CheckSquare
} from 'lucide-react';
import StudentNotes from './StudentNotes';
import { StudentTask } from './StudentTaskManager';

export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  lastWeightUpdate: Date;
  level: 'principiante' | 'intermedio' | 'avanzado' | 'competidor' | 'elite';
  customLevel?: string;
  strengths: string[];
  weaknesses: string[];
  notes: string;
  tacticalNotes: string; // New field for tactical notes
  lastTacticalNotesUpdate: Date; // New field for tracking notes updates
  pendingNotes: string[]; // New field for pending tactical notes
  createdAt: Date;
  updatedAt: Date;
}

export interface SparringSession {
  id: string;
  student1Id: string;
  student2Id: string;
  date: Date;
  duration: number; // minutes
  notes: string;
  rating: 1 | 2 | 3 | 4 | 5; // compatibility rating
  entrenadorNotes: string;
}

interface StudentProfileProps {
  student: StudentProfile;
  onUpdateStudent: (updates: Partial<StudentProfile>) => void;
  onClose: () => void;
  isOpen: boolean;
  isEditing?: boolean;
  tasks?: StudentTask[];
  onAddTask?: (task: Omit<StudentTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCompleteTask?: (taskId: string) => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({
  student,
  onUpdateStudent,
  onClose,
  isOpen,
  isEditing = false,
  tasks = [],
  onAddTask,
  onCompleteTask
}) => {
  const [editMode, setEditMode] = useState(isEditing);
  const [formData, setFormData] = useState<Partial<StudentProfile>>(student);
  const [newStrength, setNewStrength] = useState('');
  const [newWeakness, setNewWeakness] = useState('');
  const [newTacticalNote, setNewTacticalNote] = useState('');
  const [editingTacticalNotes, setEditingTacticalNotes] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'tactical' | 'tasks'>('profile');
  const [showNotesModal, setShowNotesModal] = useState(false);

  const levelOptions = [
    { value: 'principiante', label: 'Principiante', color: 'bg-green-100 text-green-800' },
    { value: 'intermedio', label: 'Intermedio', color: 'bg-blue-100 text-blue-800' },
    { value: 'avanzado', label: 'Avanzado', color: 'bg-purple-100 text-purple-800' },
    { value: 'competidor', label: 'Competidor', color: 'bg-orange-100 text-orange-800' },
    { value: 'elite', label: 'Élite', color: 'bg-red-100 text-red-800' }
  ];

  const handleSave = () => {
    onUpdateStudent({
      ...formData,
      updatedAt: new Date()
    });
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData(student);
    setEditMode(false);
  };

  const addStrength = () => {
    if (newStrength.trim()) {
      setFormData(prev => ({
        ...prev,
        strengths: [...(prev.strengths || []), newStrength.trim()]
      }));
      setNewStrength('');
    }
  };

  const removeStrength = (index: number) => {
    setFormData(prev => ({
      ...prev,
      strengths: prev.strengths?.filter((_, i) => i !== index) || []
    }));
  };

  const addWeakness = () => {
    if (newWeakness.trim()) {
      setFormData(prev => ({
        ...prev,
        weaknesses: [...(prev.weaknesses || []), newWeakness.trim()]
      }));
      setNewWeakness('');
    }
  };

  const removeWeakness = (index: number) => {
    setFormData(prev => ({
      ...prev,
      weaknesses: prev.weaknesses?.filter((_, i) => i !== index) || []
    }));
  };

  const addTacticalNote = () => {
    if (newTacticalNote.trim()) {
      const timestamp = `[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}]`;
      const noteWithTimestamp = `${timestamp}\n${newTacticalNote.trim()}`;
      
      const updatedNotes = formData.tacticalNotes 
        ? `${formData.tacticalNotes}\n\n${noteWithTimestamp}`
        : noteWithTimestamp;
      
      setFormData(prev => ({
        ...prev,
        tacticalNotes: updatedNotes,
        lastTacticalNotesUpdate: new Date()
      }));
      
      onUpdateStudent({
        tacticalNotes: updatedNotes,
        lastTacticalNotesUpdate: new Date()
      });
      
      setNewTacticalNote('');
      setEditingTacticalNotes(false);
    }
  };

  const togglePendingNote = (note: string) => {
    const pendingNotes = formData.pendingNotes || [];
    const updatedPending = pendingNotes.includes(note)
      ? pendingNotes.filter(n => n !== note)
      : [...pendingNotes, note];
    
    setFormData(prev => ({
      ...prev,
      pendingNotes: updatedPending
    }));
    
    onUpdateStudent({
      pendingNotes: updatedPending
    });
  };

  const calculateBMI = () => {
    const heightInM = (formData.height || 0) / 100;
    const bmi = (formData.weight || 0) / (heightInM * heightInM);
    return isNaN(bmi) ? 0 : bmi;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Bajo peso', color: 'text-blue-600' };
    if (bmi < 25) return { label: 'Peso normal', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Sobrepeso', color: 'text-yellow-600' };
    return { label: 'Obesidad', color: 'text-red-600' };
  };

  const getCurrentLevel = () => {
    return levelOptions.find(level => level.value === formData.level) || levelOptions[0];
  };

  const handleUpdateNotes = (updates: { tacticalNotes: string, pendingNotes: string[] }) => {
    onUpdateStudent({
      ...updates,
      lastTacticalNotesUpdate: new Date()
    });
    
    setFormData(prev => ({
      ...prev,
      ...updates,
      lastTacticalNotesUpdate: new Date()
    }));
  };

  const pendingTasks = tasks.filter(task => task.studentId === student.id && !task.isCompleted);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-red-600 to-red-700 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="pr-12">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {editMode ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={formData.firstName || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder-white/60"
                          placeholder="Nombre"
                        />
                        <input
                          type="text"
                          value={formData.lastName || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder-white/60"
                          placeholder="Apellido"
                        />
                      </div>
                    ) : (
                      `${student.firstName} ${student.lastName}`
                    )}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-red-100">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCurrentLevel().color}`}>
                      {getCurrentLevel().label}
                    </span>
                    <span>ID: {student.id.slice(0, 8)}</span>
                    {(student.pendingNotes && student.pendingNotes.length > 0) && (
                      <span className="flex items-center space-x-1 bg-yellow-500 px-2 py-1 rounded-full text-xs font-medium">
                        <Flag className="w-3 h-3" />
                        <span>{student.pendingNotes.length} pendiente(s)</span>
                      </span>
                    )}
                    {pendingTasks.length > 0 && (
                      <span className="flex items-center space-x-1 bg-indigo-500 px-2 py-1 rounded-full text-xs font-medium">
                        <CheckSquare className="w-3 h-3" />
                        <span>{pendingTasks.length} tarea(s)</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Editar Perfil</span>
                  </button>
                )}
                
                <button
                  onClick={() => setShowNotesModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Notas y Tareas</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-dark-border">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'profile', label: 'Perfil General', icon: User },
                { id: 'tactical', label: 'Notas Tácticas', icon: FileText },
                { id: 'tasks', label: 'Tareas', icon: CheckSquare }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'tactical' && student.tacticalNotes && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                  {tab.id === 'tasks' && pendingTasks.length > 0 && (
                    <div className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs flex items-center justify-center">
                      {pendingTasks.length}
                    </div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-dark-elevated rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span>Información Básica</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Edad</label>
                        {editMode ? (
                          <input
                            type="number"
                            value={formData.age || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                            min="1"
                            max="100"
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-900 dark:text-white">{student.age} años</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nivel</label>
                        {editMode ? (
                          <select
                            value={formData.level || 'principiante'}
                            onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                          >
                            {levelOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getCurrentLevel().color}`}>
                            {getCurrentLevel().label}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estatura (cm)</label>
                        {editMode ? (
                          <input
                            type="number"
                            value={formData.height || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                            min="100"
                            max="250"
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Ruler className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-900 dark:text-white">{student.height} cm</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Peso (kg)</label>
                        {editMode ? (
                          <input
                            type="number"
                            value={formData.weight || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              weight: parseFloat(e.target.value) || 0,
                              lastWeightUpdate: new Date()
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                            min="30"
                            max="200"
                            step="0.1"
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Weight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-gray-900 dark:text-white">{student.weight} kg</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* BMI Calculation */}
                    {(formData.height && formData.weight) && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">IMC (Índice de Masa Corporal)</span>
                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{calculateBMI().toFixed(1)}</span>
                            <div className={`text-xs font-medium ${getBMICategory(calculateBMI()).color}`}>
                              {getBMICategory(calculateBMI()).label}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Última actualización de peso: {student.lastWeightUpdate.toLocaleDateString()}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="bg-gray-50 dark:bg-dark-elevated rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span>Notas Generales</span>
                    </h3>
                    
                    {editMode ? (
                      <textarea
                        value={formData.notes || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                        rows={4}
                        placeholder="Observaciones generales, historial médico relevante, preferencias de entrenamiento..."
                      />
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {student.notes || 'Sin notas adicionales'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Strengths and Weaknesses */}
                <div className="space-y-6">
                  {/* Strengths */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span>Fortalezas</span>
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      {(formData.strengths || []).map((strength, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <span className="text-green-900 dark:text-green-100">{strength}</span>
                          {editMode && (
                            <button
                              onClick={() => removeStrength(index)}
                              className="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/30 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {editMode && (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newStrength}
                          onChange={(e) => setNewStrength(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addStrength()}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-dark-surface dark:text-white"
                          placeholder="Ej: Rápida lectura defensiva, potente en corta..."
                        />
                        <button
                          onClick={addStrength}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {(formData.strengths || []).length === 0 && !editMode && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No se han registrado fortalezas aún</p>
                    )}
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <span>Áreas de Mejora</span>
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      {(formData.weaknesses || []).map((weakness, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <span className="text-orange-900 dark:text-orange-100">{weakness}</span>
                          {editMode && (
                            <button
                              onClick={() => removeWeakness(index)}
                              className="p-1 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800/30 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {editMode && (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newWeakness}
                          onChange={(e) => setNewWeakness(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addWeakness()}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-dark-surface dark:text-white"
                          placeholder="Ej: Tiempo de reacción bajo, pierde compostura ante presión..."
                        />
                        <button
                          onClick={addWeakness}
                          className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {(formData.weaknesses || []).length === 0 && !editMode && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No se han registrado áreas de mejora aún</p>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span>Estadísticas Rápidas</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{(formData.strengths || []).length}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Fortalezas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{(formData.weaknesses || []).length}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Áreas de mejora</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{pendingTasks.length}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Tareas pendientes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{(student.pendingNotes || []).length}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Notas pendientes</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tactical' && (
              <div className="max-w-4xl mx-auto">
                {/* Tactical Notes Header */}
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                      <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      <span>Notas Tácticas Privadas</span>
                    </h3>
                    <button
                      onClick={() => setEditingTacticalNotes(!editingTacticalNotes)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{editingTacticalNotes ? 'Cancelar' : 'Añadir Nota'}</span>
                    </button>
                  </div>

                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                    ⚠️ Estas notas son privadas y solo visibles para el entrenador. Úsalas para registrar observaciones tácticas, estrategias específicas y recordatorios importantes.
                  </p>

                  {student.lastTacticalNotesUpdate && (
                    <div className="text-xs text-orange-600 dark:text-orange-400">
                      Última actualización: {student.lastTacticalNotesUpdate.toLocaleDateString()} a las {student.lastTacticalNotesUpdate.toLocaleTimeString()}
                    </div>
                  )}
                </div>

                {/* Add New Note */}
                {editingTacticalNotes && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Nueva Observación Táctica</h4>
                    <textarea
                      value={newTacticalNote}
                      onChange={(e) => setNewTacticalNote(e.target.value)}
                      className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-dark-surface dark:text-white"
                      rows={4}
                      placeholder="Ej: 'Muy reactivo con la derecha, pero se sobreexpone al salir'&#10;'No olvidar que viene de una semana de sobrecarga'&#10;'Próximo sparring: no emparejar con agresivos puros'"
                      autoFocus
                    />
                    <div className="flex space-x-3 mt-3">
                      <button
                        onClick={addTacticalNote}
                        disabled={!newTacticalNote.trim()}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar Nota</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingTacticalNotes(false);
                          setNewTacticalNote('');
                        }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Existing Tactical Notes */}
                <div className="bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border rounded-lg p-6 mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Historial de Notas Tácticas</h4>
                  
                  {student.tacticalNotes ? (
                    <div className="bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4">
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
                  )}
                </div>

                {/* Pending Notes */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <Flag className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span>Notas Pendientes</span>
                  </h4>
                  
                  {student.pendingNotes && student.pendingNotes.length > 0 ? (
                    <div className="space-y-2">
                      {student.pendingNotes.map((note, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                          <button
                            onClick={() => togglePendingNote(note)}
                            className="mt-0.5 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <span className="flex-1 text-yellow-900 dark:text-yellow-100">{note}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      <Flag className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p>No hay notas pendientes</p>
                      <p className="text-sm">Las notas marcadas como pendientes aparecerán aquí</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <CheckSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    <span>Tareas Asignadas</span>
                  </h3>
                  <button
                    onClick={() => setShowNotesModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Gestionar Tareas</span>
                  </button>
                </div>

                {/* Pending Tasks */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                    <Flag className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span>Tareas Pendientes ({pendingTasks.length})</span>
                  </h4>
                  
                  {pendingTasks.length > 0 ? (
                    <div className="space-y-3">
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
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  task.type === 'technical' 
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                                    : task.type === 'tactical'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                }`}>
                                  {task.type === 'technical' ? 'Técnico' : task.type === 'tactical' ? 'Táctico' : 'Actitudinal'}
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
                                  <span>{task.dueDate.toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                            
                            {onCompleteTask && (
                              <button
                                onClick={() => onCompleteTask(task.id)}
                                className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                title="Marcar como completada"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      <p>No hay tareas pendientes</p>
                    </div>
                  )}
                </div>

                {/* Completed Tasks */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span>Tareas Completadas</span>
                  </h4>
                  
                  {tasks.filter(t => t.studentId === student.id && t.isCompleted).length > 0 ? (
                    <div className="space-y-3">
                      {tasks.filter(t => t.studentId === student.id && t.isCompleted)
                        .slice(0, 5)
                        .map((task) => (
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
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    task.type === 'technical' 
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                                      : task.type === 'tactical'
                                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                  }`}>
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
                      
                      {tasks.filter(t => t.studentId === student.id && t.isCompleted).length > 5 && (
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                          + {tasks.filter(t => t.studentId === student.id && t.isCompleted).length - 5} tareas completadas más
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

          {/* Footer Actions */}
          {editMode && activeTab === 'profile' && (
            <div className="p-6 bg-gray-50 dark:bg-dark-elevated border-t border-gray-200 dark:border-dark-border">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes and Tasks Modal */}
      {showNotesModal && onAddTask && onCompleteTask && (
        <StudentNotes
          student={student}
          tasks={tasks}
          onUpdateNotes={handleUpdateNotes}
          onAddTask={onAddTask}
          onCompleteTask={onCompleteTask}
          isOpen={showNotesModal}
          onClose={() => setShowNotesModal(false)}
        />
      )}
    </>
  );
};

export default StudentProfile;

export { StudentProfile }