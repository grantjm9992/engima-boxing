import React, { useState } from 'react';
import { 
  Users, X, Calendar, Search, Check, Bell, 
  User, Clock, Target, Send, AlertCircle
} from 'lucide-react';
import { StudentProfile } from './StudentProfile';
import { Routine } from './RoutineManager';

interface Assignment {
  id: string;
  routineId: string;
  studentIds: string[];
  groupId?: string;
  assignedDate: Date;
  executionDate?: Date;
  isVisible: boolean;
  notes: string;
  status: 'pending' | 'in-progress' | 'completed';
  notificationSent: boolean;
}

interface RoutineAssignmentProps {
  routine: Routine;
  students: StudentProfile[];
  groups: Array<{ id: string; name: string; studentIds: string[] }>;
  onAssign: (assignment: Omit<Assignment, 'id' | 'assignedDate' | 'status' | 'notificationSent'>) => void;
  isOpen: boolean;
  onClose: () => void;
}

const RoutineAssignment: React.FC<RoutineAssignmentProps> = ({
  routine,
  students,
  groups,
  onAssign,
  isOpen,
  onClose
}) => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [executionDate, setExecutionDate] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [assignmentType, setAssignmentType] = useState<'individual' | 'group'>('individual');

  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroup(groupId);
    if (groupId) {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        setSelectedStudents(group.studentIds);
      }
    } else {
      setSelectedStudents([]);
    }
  };

  const handleAssign = () => {
    if (selectedStudents.length === 0) return;

    const assignment = {
      routineId: routine.id,
      studentIds: selectedStudents,
      groupId: assignmentType === 'group' ? selectedGroup : undefined,
      executionDate: executionDate ? new Date(executionDate) : undefined,
      isVisible,
      notes: notes.trim()
    };

    onAssign(assignment);
    
    // Reset form
    setSelectedStudents([]);
    setSelectedGroup('');
    setExecutionDate('');
    setIsVisible(true);
    setNotes('');
    setSearchTerm('');
    
    onClose();
  };

  const getSelectedStudentNames = () => {
    return selectedStudents
      .map(id => {
        const student = students.find(s => s.id === id);
        return student ? `${student.firstName} ${student.lastName}` : '';
      })
      .filter(Boolean)
      .join(', ');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="pr-12">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Asignar Rutina</h1>
                <p className="text-blue-100">Programar entrenamiento para estudiantes</p>
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Target className="w-4 h-4" />
                <span className="font-medium">{routine.name}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-blue-100">
                <span>{routine.totalDuration} min</span>
                <span>{routine.exercises.length} ejercicios</span>
                <span className="capitalize">{routine.difficulty}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Assignment Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Asignación</label>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setAssignmentType('individual');
                  setSelectedGroup('');
                }}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  assignmentType === 'individual'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Individual</span>
                </div>
              </button>
              <button
                onClick={() => setAssignmentType('group')}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  assignmentType === 'group'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Grupo</span>
                </div>
              </button>
            </div>
          </div>

          {/* Group Selection */}
          {assignmentType === 'group' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Grupo</label>
              <select
                value={selectedGroup}
                onChange={(e) => handleGroupSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar grupo...</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.studentIds.length} estudiantes)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Student Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                {assignmentType === 'group' ? 'Estudiantes del Grupo' : 'Seleccionar Estudiantes'}
              </label>
              <span className="text-sm text-gray-500">
                {selectedStudents.length} seleccionado(s)
              </span>
            </div>

            {assignmentType === 'individual' && (
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Buscar estudiantes..."
                />
              </div>
            )}

            <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
              {(assignmentType === 'group' && selectedGroup ? 
                students.filter(s => groups.find(g => g.id === selectedGroup)?.studentIds.includes(s.id)) :
                filteredStudents
              ).map((student) => (
                <div
                  key={student.id}
                  className={`p-3 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                    selectedStudents.includes(student.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => assignmentType === 'individual' && handleStudentToggle(student.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.level} • {student.age} años
                        </div>
                      </div>
                    </div>
                    {selectedStudents.includes(student.id) && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedStudents.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-900 mb-1">Estudiantes seleccionados:</div>
                <div className="text-sm text-blue-700">{getSelectedStudentNames()}</div>
              </div>
            )}
          </div>

          {/* Execution Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Ejecución (Opcional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={executionDate}
                onChange={(e) => setExecutionDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Si no se especifica, la rutina estará disponible inmediatamente
            </p>
          </div>

          {/* Visibility Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Opciones de Visibilidad</label>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="visible"
                  name="visibility"
                  checked={isVisible}
                  onChange={() => setIsVisible(true)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="visible" className="ml-2 text-sm text-gray-700">
                  <span className="font-medium">Visible para el estudiante</span>
                  <div className="text-xs text-gray-500">El estudiante puede ver y ejecutar la rutina</div>
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="tracking"
                  name="visibility"
                  checked={!isVisible}
                  onChange={() => setIsVisible(false)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="tracking" className="ml-2 text-sm text-gray-700">
                  <span className="font-medium">Solo seguimiento interno</span>
                  <div className="text-xs text-gray-500">Solo visible para el entrenador</div>
                </label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Específicas (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Instrucciones especiales, modificaciones, objetivos específicos..."
            />
          </div>

          {/* Notification Info */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Bell className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-yellow-800">Notificación Automática</div>
                <div className="text-xs text-yellow-700 mt-1">
                  Los estudiantes seleccionados recibirán una notificación sobre la nueva rutina asignada.
                  {executionDate && (
                    <span> También recibirán un recordatorio el día de la ejecución programada.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedStudents.length === 0 ? (
                <div className="flex items-center space-x-2 text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Selecciona al menos un estudiante para continuar</span>
                </div>
              ) : (
                <span>
                  Rutina "{routine.name}" será asignada a {selectedStudents.length} estudiante(s)
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssign}
                disabled={selectedStudents.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Asignar Rutina</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineAssignment;