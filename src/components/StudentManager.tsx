// src/components/StudentManager.tsx
import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Search, Filter, Edit3, Eye, Trash2,
  User, Calendar, Ruler, Weight, Trophy, Target,
  BarChart3, TrendingUp, X, Save, CheckSquare, Loader,
  AlertCircle
} from 'lucide-react';
import { studentService, StudentProfile, StudentFilters } from '../services/StudentService';
import { userService } from '../services/UserService';
import { useAuth } from '../contexts/AuthContext';
import StudentProfileComponent from './StudentProfile';
// import SparringAnalyzer from './SparringAnalyzer';
// import StudentTaskManager from './StudentTaskManager';

interface StudentManagerProps {
  isOpen: boolean;
  onClose: () => void;
  // Legacy props for compatibility
  sparringSessions?: any[];
  onCreateSparringSession?: (student1Id: string, student2Id: string) => void;
  tasks?: any[];
  onAddTask?: (task: any) => void;
  onCompleteTask?: (taskId: string) => void;
}

const StudentManager: React.FC<StudentManagerProps> = ({
                                                         isOpen,
                                                         onClose,
                                                         sparringSessions = [],
                                                         onCreateSparringSession,
                                                         tasks = [],
                                                         onAddTask,
                                                         onCompleteTask
                                                       }) => {
  const { user: currentUser } = useAuth();
  const [activeView, setActiveView] = useState<'list' | 'create' | 'profile' | 'analyzer' | 'tasks'>('list');
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'age' | 'updated'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const perPage = 15;

  // Create student form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    age: 0,
    height: 0,
    weight: 0,
    level: 'principiante' as const,
    strengths: [] as string[],
    weaknesses: [] as string[],
    notes: ''
  });

  const levelOptions = [
    { value: 'principiante', label: 'Principiante', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'intermedio', label: 'Intermedio', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    { value: 'avanzado', label: 'Avanzado', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    { value: 'competidor', label: 'Competidor', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
    { value: 'elite', label: 'Élite', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
  ];

  // Load students
  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: StudentFilters = {
        level: filterLevel !== 'all' ? filterLevel : undefined,
        search: searchTerm || undefined,
        sortBy,
        sortDirection,
        page: currentPage,
        perPage,
      };

      const response = await studentService.getAllStudents(filters);
      setStudents(response.students);
      setTotalPages(response.pagination.last_page);
      setTotalStudents(response.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estudiantes');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Load students when component mounts or filters change
  useEffect(() => {
    if (isOpen) {
      loadStudents();
    }
  }, [isOpen, searchTerm, filterLevel, sortBy, sortDirection, currentPage]);

  // Create student
  const handleCreateStudent = async () => {
    if (!newStudentForm.email || !newStudentForm.firstName || !newStudentForm.lastName) {
      setError('Email, nombre y apellido son requeridos');
      return;
    }

    try {
      setCreatingStudent(true);
      setError(null);

      // First create the user
      const userResult = await userService.createUser({
        email: newStudentForm.email,
        role: 'student',
        subscriptionPlan: 'basic',
        firstName: newStudentForm.firstName,
        lastName: newStudentForm.lastName,
        phone: newStudentForm.phone || undefined,
      });

      // Then update the student profile
      if (newStudentForm.age || newStudentForm.height || newStudentForm.weight ||
          newStudentForm.strengths.length || newStudentForm.weaknesses.length || newStudentForm.notes) {
        await studentService.updateStudentProfile(userResult.user.id.toString(), {
          age: newStudentForm.age || undefined,
          height: newStudentForm.height || undefined,
          weight: newStudentForm.weight || undefined,
          level: newStudentForm.level,
          strengths: newStudentForm.strengths,
          weaknesses: newStudentForm.weaknesses,
          notes: newStudentForm.notes || undefined,
        });
      }

      // Send welcome email
      userService.sendWelcomeEmail(userResult.user, userResult.tempPassword);

      // Reset form and close
      setNewStudentForm({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        age: 0,
        height: 0,
        weight: 0,
        level: 'principiante',
        strengths: [],
        weaknesses: [],
        notes: ''
      });
      setShowCreateForm(false);
      setActiveView('list');

      // Reload students
      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear estudiante');
    } finally {
      setCreatingStudent(false);
    }
  };

  const handleViewProfile = (student: StudentProfile) => {
    setSelectedStudent(student);
    setActiveView('profile');
  };

  const handleUpdateStudent = async (updates: Partial<StudentProfile>) => {
    if (!selectedStudent) return;

    try {
      setError(null);

      // Update user info if needed
      if (updates.firstName || updates.lastName || updates.phone) {
        await userService.updateUser(selectedStudent.id, {
          firstName: updates.firstName,
          lastName: updates.lastName,
          phone: updates.phone,
        });
      }

      // Update student profile if needed
      if (updates.profile) {
        await studentService.updateStudentProfile(selectedStudent.id, {
          age: updates.profile.age,
          height: updates.profile.height,
          weight: updates.profile.weight,
          level: updates.profile.level,
          strengths: updates.profile.strengths,
          weaknesses: updates.profile.weaknesses,
          notes: updates.profile.notes,
        });
      }

      // Update local state
      const updatedStudent = { ...selectedStudent, ...updates };
      setSelectedStudent(updatedStudent);

      // Reload students to get fresh data
      await loadStudents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estudiante');
    }
  };

  const getLevelColor = (level: string) => {
    return levelOptions.find(option => option.value === level)?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
  };

  const getLevelLabel = (level: string) => {
    return levelOptions.find(option => option.value === level)?.label || level;
  };

  if (!isOpen) return null;

  return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Gestión de Estudiantes
                </h2>
                {totalStudents > 0 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-dark-elevated text-sm text-gray-600 dark:text-gray-400 rounded">
                  {totalStudents} estudiantes
                </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {/* View Controls */}
                <div className="flex bg-gray-100 dark:bg-dark-elevated rounded-lg p-1">
                  <button
                      onClick={() => setActiveView('list')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          activeView === 'list'
                              ? 'bg-white dark:bg-dark-surface text-red-600 shadow-sm'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                  >
                    Lista
                  </button>
                  <button
                      onClick={() => setActiveView('analyzer')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          activeView === 'analyzer'
                              ? 'bg-white dark:bg-dark-surface text-red-600 shadow-sm'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                  >
                    Sparring
                  </button>
                  {onAddTask && onCompleteTask && (
                      <button
                          onClick={() => setActiveView('tasks')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              activeView === 'tasks'
                                  ? 'bg-white dark:bg-dark-surface text-red-600 shadow-sm'
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                      >
                        Tareas
                      </button>
                  )}
                </div>

                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-auto max-h-[calc(90vh-80px)]">
              {/* Error Display */}
              {error && (
                  <div className="m-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h4>
                      <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
              )}

              {/* List View */}
              {activeView === 'list' && (
                  <div className="p-6">
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      {/* Search */}
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar estudiantes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                        />
                      </div>

                      {/* Filters */}
                      <div className="flex gap-2">
                        <select
                            value={filterLevel}
                            onChange={(e) => setFilterLevel(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                        >
                          <option value="all">Todos los niveles</option>
                          {levelOptions.map(level => (
                              <option key={level.value} value={level.value}>{level.label}</option>
                          ))}
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                        >
                          <option value="name">Ordenar por nombre</option>
                          <option value="level">Ordenar por nivel</option>
                          <option value="age">Ordenar por edad</option>
                          <option value="updated">Ordenar por actualización</option>
                        </select>
                      </div>

                      {/* Create Button */}
                      {(currentUser?.role === 'admin' || currentUser?.role === 'trainer') && (
                          <button
                              onClick={() => setShowCreateForm(true)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Nuevo Estudiante</span>
                          </button>
                      )}
                    </div>

                    {/* Students Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                          <Loader className="w-8 h-8 animate-spin text-red-600" />
                        </div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-12">
                          <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No hay estudiantes
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {searchTerm || filterLevel !== 'all'
                                ? 'No se encontraron estudiantes con los filtros aplicados'
                                : 'Comienza agregando tu primer estudiante'
                            }
                          </p>
                          {(currentUser?.role === 'admin' || currentUser?.role === 'trainer') && (
                              <button
                                  onClick={() => setShowCreateForm(true)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <Plus className="w-4 h-4 inline mr-2" />
                                Crear Primer Estudiante
                              </button>
                          )}
                        </div>
                    ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {students.map((student) => (
                                <div
                                    key={student.id}
                                    className="bg-gray-50 dark:bg-dark-elevated rounded-lg p-6 hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-dark-border"
                                    onClick={() => handleViewProfile(student)}
                                >
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                        {student.fullName}
                                      </h3>
                                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                        {student.email}
                                      </div>
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(student.profile?.level || 'principiante')}`}>
                                {getLevelLabel(student.profile?.level || 'principiante')}
                              </span>
                                    </div>
                                  </div>

                                  {student.profile && (
                                      <div className="grid grid-cols-3 gap-4 mb-4">
                                        {student.profile.age && (
                                            <div className="text-center">
                                              <div className="text-sm text-gray-500 dark:text-gray-400">Edad</div>
                                              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {student.profile.age}
                                              </div>
                                            </div>
                                        )}
                                        {student.profile.height && (
                                            <div className="text-center">
                                              <div className="text-sm text-gray-500 dark:text-gray-400">Altura</div>
                                              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {student.profile.height}cm
                                              </div>
                                            </div>
                                        )}
                                        {student.profile.weight && (
                                            <div className="text-center">
                                              <div className="text-sm text-gray-500 dark:text-gray-400">Peso</div>
                                              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {student.profile.weight}kg
                                              </div>
                                            </div>
                                        )}
                                      </div>
                                  )}

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                      {student.profile?.strengths && student.profile.strengths.length > 0 && (
                                          <div className="flex items-center space-x-1">
                                            <Trophy className="w-4 h-4" />
                                            <span>{student.profile.strengths.length}</span>
                                          </div>
                                      )}
                                      {student.profile?.pendingNotes && student.profile.pendingNotes.length > 0 && (
                                          <div className="flex items-center space-x-1">
                                            <Target className="w-4 h-4" />
                                            <span>{student.profile.pendingNotes.length}</span>
                                          </div>
                                      )}
                                    </div>
                                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                      <Eye className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                            ))}
                          </div>

                          {/* Pagination */}
                          {totalPages > 1 && (
                              <div className="flex justify-between items-center mt-8">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Página {currentPage} de {totalPages} ({totalStudents} estudiantes)
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                      disabled={currentPage === 1}
                                      className="px-3 py-1 border border-gray-300 dark:border-dark-border rounded hover:bg-gray-50 dark:hover:bg-dark-elevated disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Anterior
                                  </button>
                                  <button
                                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                      disabled={currentPage === totalPages}
                                      className="px-3 py-1 border border-gray-300 dark:border-dark-border rounded hover:bg-gray-50 dark:hover:bg-dark-elevated disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Siguiente
                                  </button>
                                </div>
                              </div>
                          )}
                        </>
                    )}
                  </div>
              )}

              {/* Create Student Form */}
              {showCreateForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
                      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Crear Nuevo Estudiante</h3>
                        <button
                            onClick={() => setShowCreateForm(false)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Basic Info */}
                        <div>
                          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Información Básica</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email *
                              </label>
                              <input
                                  type="email"
                                  value={newStudentForm.email}
                                  onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                                  placeholder="email@ejemplo.com"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Teléfono
                              </label>
                              <input
                                  type="tel"
                                  value={newStudentForm.phone}
                                  onChange={(e) => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                                  placeholder="+34 666 777 888"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nombre *
                              </label>
                              <input
                                  type="text"
                                  value={newStudentForm.firstName}
                                  onChange={(e) => setNewStudentForm({ ...newStudentForm, firstName: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                                  placeholder="Nombre"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Apellido *
                              </label>
                              <input
                                  type="text"
                                  value={newStudentForm.lastName}
                                  onChange={(e) => setNewStudentForm({ ...newStudentForm, lastName: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                                  placeholder="Apellido"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Physical Info */}
                        <div>
                          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Información Física</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Edad
                              </label>
                              <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={newStudentForm.age || ''}
                                  onChange={(e) => setNewStudentForm({ ...newStudentForm, age: parseInt(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                                  placeholder="0"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Altura (cm)
                              </label>
                              <input
                                  type="number"
                                  min="50"
                                  max="250"
                                  value={newStudentForm.height || ''}
                                  onChange={(e) => setNewStudentForm({ ...newStudentForm, height: parseFloat(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                                  placeholder="0"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Peso (kg)
                              </label>
                              <input
                                  type="number"
                                  min="20"
                                  max="200"
                                  step="0.1"
                                  value={newStudentForm.weight || ''}
                                  onChange={(e) => setNewStudentForm({ ...newStudentForm, weight: parseFloat(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                                  placeholder="0"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nivel
                              </label>
                              <select
                                  value={newStudentForm.level}
                                  onChange={(e) => setNewStudentForm({ ...newStudentForm, level: e.target.value as any })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                              >
                                {levelOptions.map(level => (
                                    <option key={level.value} value={level.value}>{level.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notas
                          </label>
                          <textarea
                              value={newStudentForm.notes}
                              onChange={(e) => setNewStudentForm({ ...newStudentForm, notes: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                              placeholder="Notas adicionales sobre el estudiante..."
                          />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-dark-border">
                          <button
                              onClick={() => setShowCreateForm(false)}
                              className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                              onClick={handleCreateStudent}
                              disabled={creatingStudent || !newStudentForm.email || !newStudentForm.firstName || !newStudentForm.lastName}
                              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {creatingStudent ? (
                                <>
                                  <Loader className="w-4 h-4 animate-spin" />
                                  <span>Creando...</span>
                                </>
                            ) : (
                                <>
                                  <Save className="w-4 h-4" />
                                  <span>Crear Estudiante</span>
                                </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
              )}

              {/* Other views would go here */}
              {activeView === 'analyzer' && (
                  <div className="p-6">
                    <div className="text-center py-12">
                      <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Análisis de Sparring
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Esta funcionalidad estará disponible próximamente
                      </p>
                    </div>
                  </div>
              )}

              {activeView === 'tasks' && (
                  <div className="p-6">
                    <div className="text-center py-12">
                      <CheckSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Gestión de Tareas
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Esta funcionalidad estará disponible próximamente
                      </p>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Student Profile Modal */}
        {selectedStudent && activeView === 'profile' && (
            <StudentProfileComponent
                student={studentService.mapToLegacyFormat(selectedStudent)}
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
      </>
  );
};

export default StudentManager;