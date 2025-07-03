import React, { useState } from 'react';
import { 
  Users, Plus, Search, Filter, Edit3, Eye, Trash2, 
  User, Calendar, Ruler, Weight, Trophy, Target,
  BarChart3, TrendingUp, X, Save, CheckSquare
} from 'lucide-react';
import { StudentProfile } from './StudentProfile';
import StudentProfileComponent from './StudentProfile';
import SparringAnalyzer from './SparringAnalyzer';
import { StudentTask } from './StudentTaskManager';
import StudentTaskManager from './StudentTaskManager';

interface StudentManagerProps {
  students: StudentProfile[];
  onCreateStudent: (student: Omit<StudentProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateStudent: (id: string, updates: Partial<StudentProfile>) => void;
  onDeleteStudent: (id: string) => void;
  sparringSessions: any[];
  onCreateSparringSession: (student1Id: string, student2Id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  tasks?: StudentTask[];
  onAddTask?: (task: Omit<StudentTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCompleteTask?: (taskId: string) => void;
}

const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  onCreateStudent,
  onUpdateStudent,
  onDeleteStudent,
  sparringSessions,
  onCreateSparringSession,
  isOpen,
  onClose,
  tasks = [],
  onAddTask,
  onCompleteTask
}) => {
  const [activeView, setActiveView] = useState<'list' | 'create' | 'profile' | 'analyzer' | 'tasks'>('list');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'age' | 'updated'>('name');
  
  const [newStudentForm, setNewStudentForm] = useState<Partial<StudentProfile>>({
    firstName: '',
    lastName: '',
    age: 0,
    height: 0,
    weight: 0,
    level: 'principiante',
    strengths: [],
    weaknesses: [],
    notes: ''
  });

  const levelOptions = [
    { value: 'principiante', label: 'Principiante', color: 'bg-green-100 text-green-800' },
    { value: 'intermedio', label: 'Intermedio', color: 'bg-blue-100 text-blue-800' },
    { value: 'avanzado', label: 'Avanzado', color: 'bg-purple-100 text-purple-800' },
    { value: 'competidor', label: 'Competidor', color: 'bg-orange-100 text-orange-800' },
    { value: 'elite', label: 'Élite', color: 'bg-red-100 text-red-800' }
  ];

  // Filter and sort students
  const filteredStudents = students
    .filter(student => {
      const matchesSearch = searchTerm === '' || 
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = filterLevel === 'all' || student.level === filterLevel;
      
      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'level':
          const levelOrder = { principiante: 1, intermedio: 2, avanzado: 3, competidor: 4, elite: 5 };
          return levelOrder[a.level] - levelOrder[b.level];
        case 'age':
          return a.age - b.age;
        case 'updated':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        default:
          return 0;
      }
    });

  const handleCreateStudent = () => {
    if (newStudentForm.firstName && newStudentForm.lastName) {
      onCreateStudent({
        ...newStudentForm,
        lastWeightUpdate: new Date(),
        tacticalNotes: '',
        lastTacticalNotesUpdate: new Date(),
        pendingNotes: []
      } as Omit<StudentProfile, 'id' | 'createdAt' | 'updatedAt'>);
      
      setNewStudentForm({
        firstName: '',
        lastName: '',
        age: 0,
        height: 0,
        weight: 0,
        level: 'principiante',
        strengths: [],
        weaknesses: [],
        notes: ''
      });
      setActiveView('list');
    }
  };

  const handleViewProfile = (student: StudentProfile) => {
    setSelectedStudent(student);
    setActiveView('profile');
  };

  const handleUpdateStudent = (updates: Partial<StudentProfile>) => {
    if (selectedStudent) {
      onUpdateStudent(selectedStudent.id, updates);
      setSelectedStudent({ ...selectedStudent, ...updates });
    }
  };

  const getLevelColor = (level: string) => {
    return levelOptions.find(option => option.value === level)?.color || 'bg-gray-100 text-gray-800';
  };

  const getLevelLabel = (level: string) => {
    return levelOptions.find(option => option.value === level)?.label || level;
  };

  const getPendingTasksCount = (studentId: string) => {
    return tasks.filter(task => task.studentId === studentId && !task.isCompleted).length;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-red-600 to-red-700 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="pr-12">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Gestión de Estudiantes</h1>
                  <p className="text-red-100">Perfiles completos y análisis de sparring inteligente</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setActiveView('list')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeView === 'list' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  Lista de Estudiantes
                </button>
                <button
                  onClick={() => setActiveView('create')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeView === 'create' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  Nuevo Estudiante
                </button>
                <button
                  onClick={() => setActiveView('analyzer')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeView === 'analyzer' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  Análisis de Sparring
                </button>
                <button
                  onClick={() => setActiveView('tasks')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeView === 'tasks' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  Tareas
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            {activeView === 'list' && (
              <div className="p-6">
                {/* Filters and Search */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white dark:border-dark-border"
                      placeholder="Buscar estudiante..."
                    />
                  </div>

                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white dark:border-dark-border"
                  >
                    <option value="all">Todos los niveles</option>
                    {levelOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white dark:border-dark-border"
                  >
                    <option value="name">Ordenar por nombre</option>
                    <option value="level">Ordenar por nivel</option>
                    <option value="age">Ordenar por edad</option>
                    <option value="updated">Última actualización</option>
                  </select>

                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {filteredStudents.length} estudiante(s)
                  </div>
                </div>

                {/* Students Grid */}
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No se encontraron estudiantes</h3>
                    <p>Crea tu primer estudiante o ajusta los filtros</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map((student) => (
                      <div key={student.id} className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4 hover:shadow-md dark:hover:shadow-dark transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {student.firstName} {student.lastName}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(student.level)}`}>
                                  {getLevelLabel(student.level)}
                                </span>
                                {student.pendingNotes && student.pendingNotes.length > 0 && (
                                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                    {student.pendingNotes.length} nota(s)
                                  </span>
                                )}
                                {getPendingTasksCount(student.id) > 0 && (
                                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                                    {getPendingTasksCount(student.id)} tarea(s)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleViewProfile(student)}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="Ver perfil"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteStudent(student.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{student.age} años</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Ruler className="w-4 h-4" />
                            <span>{student.height} cm</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Weight className="w-4 h-4" />
                            <span>{student.weight} kg</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-border">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <Trophy className="w-3 h-3 text-green-600 dark:text-green-400" />
                                <span>{(student.strengths || []).length}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Target className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                                <span>{(student.weaknesses || []).length}</span>
                              </div>
                            </div>
                            <span>Act: {student.updatedAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeView === 'create' && (
              <div className="p-6">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Crear Nuevo Estudiante</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre *</label>
                        <input
                          type="text"
                          value={newStudentForm.firstName || ''}
                          onChange={(e) => setNewStudentForm(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                          placeholder="Nombre del estudiante"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Apellido *</label>
                        <input
                          type="text"
                          value={newStudentForm.lastName || ''}
                          onChange={(e) => setNewStudentForm(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                          placeholder="Apellido del estudiante"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Edad</label>
                        <input
                          type="number"
                          value={newStudentForm.age || ''}
                          onChange={(e) => setNewStudentForm(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                          min="1"
                          max="100"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estatura (cm)</label>
                        <input
                          type="number"
                          value={newStudentForm.height || ''}
                          onChange={(e) => setNewStudentForm(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                          min="100"
                          max="250"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Peso (kg)</label>
                        <input
                          type="number"
                          value={newStudentForm.weight || ''}
                          onChange={(e) => setNewStudentForm(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                          min="30"
                          max="200"
                          step="0.1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nivel Técnico</label>
                      <select
                        value={newStudentForm.level || 'principiante'}
                        onChange={(e) => setNewStudentForm(prev => ({ ...prev, level: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                      >
                        {levelOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notas del Entrenador</label>
                      <textarea
                        value={newStudentForm.notes || ''}
                        onChange={(e) => setNewStudentForm(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-surface dark:text-white"
                        rows={4}
                        placeholder="Observaciones generales, historial médico relevante, preferencias de entrenamiento..."
                      />
                    </div>

                    <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-dark-border">
                      <button
                        onClick={handleCreateStudent}
                        disabled={!newStudentForm.firstName || !newStudentForm.lastName}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Crear Estudiante</span>
                      </button>
                      <button
                        onClick={() => setActiveView('list')}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'tasks' && onAddTask && onCompleteTask && (
              <div className="p-6">
                <StudentTaskManager
                  tasks={tasks}
                  students={students}
                  onCreateTask={onAddTask}
                  onUpdateTask={() => {}}
                  onDeleteTask={() => {}}
                  onCompleteTask={onCompleteTask}
                  isOpen={true}
                  onClose={() => setActiveView('list')}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Profile Modal */}
      {selectedStudent && activeView === 'profile' && onAddTask && onCompleteTask && (
        <StudentProfileComponent
          student={selectedStudent}
          onUpdateStudent={handleUpdateStudent}
          onClose={() => {
            setSelectedStudent(null);
            setActiveView('list');
          }}
          isOpen={true}
          tasks={tasks}
          onAddTask={onAddTask}
          onCompleteTask={onCompleteTask}
        />
      )}

      {/* Sparring Analyzer Modal */}
      {activeView === 'analyzer' && (
        <SparringAnalyzer
          students={students}
          sparringSessions={sparringSessions}
          onCreateSession={onCreateSparringSession}
          isOpen={true}
          onClose={() => setActiveView('list')}
        />
      )}
    </>
  );
};

export default StudentManager;