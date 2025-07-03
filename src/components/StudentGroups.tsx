import React, { useState } from 'react';
import { 
  Users, Plus, Search, Edit3, Trash2, Eye, Save, X, 
  User, Calendar, Target, AlertCircle, BookOpen, 
  Palette, Tag, Clock, ChevronRight, FileText,
  Star, Flag, CheckCircle, Circle
} from 'lucide-react';
import { StudentProfile } from './StudentProfile';

export interface StudentGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  studentIds: string[];
  tacticalNotes: string;
  lastNotesUpdate: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface StudentGroupsProps {
  groups: StudentGroup[];
  students: StudentProfile[];
  onCreateGroup: (group: Omit<StudentGroup, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateGroup: (id: string, updates: Partial<StudentGroup>) => void;
  onDeleteGroup: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onViewStudent: (student: StudentProfile) => void;
}

const StudentGroups: React.FC<StudentGroupsProps> = ({
  groups,
  students,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  isOpen,
  onClose,
  onViewStudent
}) => {
  const [activeView, setActiveView] = useState<'list' | 'create' | 'edit' | 'view'>('list');
  const [selectedGroup, setSelectedGroup] = useState<StudentGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  const [groupForm, setGroupForm] = useState<Partial<StudentGroup>>({
    name: '',
    description: '',
    color: '#EF4444',
    icon: 'users',
    studentIds: [],
    tacticalNotes: '',
    isActive: true
  });

  const [newTacticalNote, setNewTacticalNote] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);

  const colorOptions = [
    { value: '#EF4444', label: 'Rojo' },
    { value: '#F97316', label: 'Naranja' },
    { value: '#F59E0B', label: 'Amarillo' },
    { value: '#22C55E', label: 'Verde' },
    { value: '#06B6D4', label: 'Cian' },
    { value: '#3B82F6', label: 'Azul' },
    { value: '#8B5CF6', label: 'Púrpura' },
    { value: '#EC4899', label: 'Rosa' },
    { value: '#6B7280', label: 'Gris' }
  ];

  const iconOptions = [
    { value: 'users', label: 'Grupo', icon: Users },
    { value: 'target', label: 'Objetivo', icon: Target },
    { value: 'star', label: 'Estrella', icon: Star },
    { value: 'flag', label: 'Bandera', icon: Flag },
    { value: 'book', label: 'Libro', icon: BookOpen },
    { value: 'tag', label: 'Etiqueta', icon: Tag }
  ];

  // Filter groups
  const filteredGroups = groups.filter(group => {
    const matchesSearch = searchTerm === '' || 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesActive = filterActive === null || group.isActive === filterActive;
    
    return matchesSearch && matchesActive;
  });

  const handleCreateGroup = () => {
    if (groupForm.name && groupForm.name.trim()) {
      onCreateGroup({
        ...groupForm,
        name: groupForm.name.trim(),
        lastNotesUpdate: new Date()
      } as Omit<StudentGroup, 'id' | 'createdAt' | 'updatedAt'>);
      
      resetForm();
      setActiveView('list');
    }
  };

  const handleUpdateGroup = () => {
    if (selectedGroup && groupForm.name && groupForm.name.trim()) {
      onUpdateGroup(selectedGroup.id, {
        ...groupForm,
        name: groupForm.name.trim(),
        lastNotesUpdate: new Date()
      });
      
      resetForm();
      setActiveView('list');
    }
  };

  const handleUpdateTacticalNotes = () => {
    if (selectedGroup && newTacticalNote.trim()) {
      const updatedNotes = selectedGroup.tacticalNotes 
        ? `${selectedGroup.tacticalNotes}\n\n[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}]\n${newTacticalNote.trim()}`
        : `[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}]\n${newTacticalNote.trim()}`;
      
      onUpdateGroup(selectedGroup.id, {
        tacticalNotes: updatedNotes,
        lastNotesUpdate: new Date()
      });
      
      setSelectedGroup({
        ...selectedGroup,
        tacticalNotes: updatedNotes,
        lastNotesUpdate: new Date()
      });
      
      setNewTacticalNote('');
      setEditingNotes(false);
    }
  };

  const resetForm = () => {
    setGroupForm({
      name: '',
      description: '',
      color: '#EF4444',
      icon: 'users',
      studentIds: [],
      tacticalNotes: '',
      isActive: true
    });
    setSelectedGroup(null);
    setNewTacticalNote('');
    setEditingNotes(false);
  };

  const startEditing = (group: StudentGroup) => {
    setGroupForm(group);
    setSelectedGroup(group);
    setActiveView('edit');
  };

  const viewGroup = (group: StudentGroup) => {
    setSelectedGroup(group);
    setActiveView('view');
  };

  const getStudentsInGroup = (studentIds: string[]) => {
    return students.filter(student => studentIds.includes(student.id));
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(option => option.value === iconName);
    return iconOption ? iconOption.icon : Users;
  };

  const toggleStudentInGroup = (studentId: string) => {
    setGroupForm(prev => ({
      ...prev,
      studentIds: prev.studentIds?.includes(studentId)
        ? prev.studentIds.filter(id => id !== studentId)
        : [...(prev.studentIds || []), studentId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
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
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Agrupaciones de Alumnos</h1>
                <p className="text-blue-100">Gestión estratégica con notas tácticas privadas</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveView('list')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'list' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                Lista de Grupos
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setActiveView('create');
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'create' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                Crear Nuevo Grupo
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeView === 'list' && (
            <div className="p-6">
              {/* Search and Filters */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Buscar grupos..."
                  />
                </div>

                <select
                  value={filterActive === null ? 'all' : filterActive ? 'active' : 'inactive'}
                  onChange={(e) => setFilterActive(
                    e.target.value === 'all' ? null : e.target.value === 'active'
                  )}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todos los grupos</option>
                  <option value="active">Solo activos</option>
                  <option value="inactive">Solo inactivos</option>
                </select>

                <div className="text-sm text-gray-600 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  {filteredGroups.length} grupo(s)
                </div>
              </div>

              {/* Groups Grid */}
              {filteredGroups.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron grupos</h3>
                  <p>Crea tu primer grupo o ajusta los filtros</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGroups.map((group) => {
                    const IconComponent = getIconComponent(group.icon);
                    const groupStudents = getStudentsInGroup(group.studentIds);
                    
                    return (
                      <div key={group.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                              style={{ backgroundColor: group.color }}
                            >
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{group.name}</h3>
                              <p className="text-sm text-gray-600">{group.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-1">
                            <button
                              onClick={() => viewGroup(group)}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Ver grupo"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => startEditing(group)}
                              className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteGroup(group.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{groupStudents.length} estudiante(s)</span>
                          </div>
                          
                          {group.tacticalNotes && (
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-orange-600" />
                              <span className="text-orange-600">Tiene notas tácticas</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <Circle className={`w-3 h-3 ${group.isActive ? 'text-green-600 fill-current' : 'text-gray-400'}`} />
                            <span>{group.isActive ? 'Activo' : 'Inactivo'}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                          <div className="flex items-center justify-between">
                            <span>Creado: {group.createdAt.toLocaleDateString()}</span>
                            {group.lastNotesUpdate && (
                              <span>Notas: {group.lastNotesUpdate.toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {(activeView === 'create' || activeView === 'edit') && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {activeView === 'create' ? 'Crear Nuevo Grupo' : 'Editar Grupo'}
                </h2>
                
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Grupo *</label>
                      <input
                        type="text"
                        value={groupForm.name || ''}
                        onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Competidores ligeros, Avanzados en sombra..."
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                      <select
                        value={groupForm.isActive ? 'active' : 'inactive'}
                        onChange={(e) => setGroupForm(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <textarea
                      value={groupForm.description || ''}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="Descripción opcional del grupo..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setGroupForm(prev => ({ ...prev, color: color.value }))}
                            className={`w-8 h-8 rounded-lg border-2 transition-all ${
                              groupForm.color === color.value ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ícono</label>
                      <div className="flex flex-wrap gap-2">
                        {iconOptions.map((icon) => {
                          const IconComponent = icon.icon;
                          return (
                            <button
                              key={icon.value}
                              onClick={() => setGroupForm(prev => ({ ...prev, icon: icon.value }))}
                              className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                                groupForm.icon === icon.value 
                                  ? 'border-blue-500 bg-blue-50 text-blue-600' 
                                  : 'border-gray-300 hover:border-blue-300 text-gray-600'
                              }`}
                              title={icon.label}
                            >
                              <IconComponent className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student Selection */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Selección de Estudiantes</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          groupForm.studentIds?.includes(student.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleStudentInGroup(student.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            groupForm.studentIds?.includes(student.id)
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {groupForm.studentIds?.includes(student.id) && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
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
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    {groupForm.studentIds?.length || 0} estudiante(s) seleccionado(s)
                  </div>
                </div>

                {/* Tactical Notes */}
                <div className="bg-orange-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-orange-600" />
                    <span>Notas Tácticas Privadas</span>
                  </h3>
                  
                  <textarea
                    value={groupForm.tacticalNotes || ''}
                    onChange={(e) => setGroupForm(prev => ({ ...prev, tacticalNotes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows={4}
                    placeholder="Observaciones tácticas, estrategias grupales, recordatorios...&#10;Ej: 'Este grupo tiende a perder compostura en asaltos largos'&#10;'Enfocar sesiones en control de distancia esta semana'"
                  />
                  
                  <p className="text-xs text-orange-700 mt-2">
                    ⚠️ Estas notas son privadas y solo visibles para el entrenador
                  </p>
                </div>

                <div className="flex space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={activeView === 'create' ? handleCreateGroup : handleUpdateGroup}
                    disabled={!groupForm.name || !groupForm.name.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{activeView === 'create' ? 'Crear Grupo' : 'Guardar Cambios'}</span>
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setActiveView('list');
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeView === 'view' && selectedGroup && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                {/* Group Header */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: selectedGroup.color }}
                      >
                        {React.createElement(getIconComponent(selectedGroup.icon), { className: "w-6 h-6" })}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedGroup.name}</h2>
                        <p className="text-gray-600">{selectedGroup.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditing(selectedGroup)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-100 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedGroup.studentIds.length}</div>
                      <div className="text-sm text-blue-800">Estudiantes</div>
                    </div>
                    <div className="text-center p-3 bg-green-100 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedGroup.isActive ? 'Activo' : 'Inactivo'}
                      </div>
                      <div className="text-sm text-green-800">Estado</div>
                    </div>
                    <div className="text-center p-3 bg-purple-100 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedGroup.lastNotesUpdate ? selectedGroup.lastNotesUpdate.toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-sm text-purple-800">Últ. notas</div>
                    </div>
                  </div>
                </div>

                {/* Students in Group */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Estudiantes del Grupo</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getStudentsInGroup(selectedGroup.studentIds).map((student) => (
                      <div key={student.id} className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.level} • {student.age} años
                            </div>
                          </div>
                          <button
                            onClick={() => onViewStudent(student)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Ver perfil"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tactical Notes */}
                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-orange-600" />
                      <span>Notas Tácticas Privadas</span>
                    </h3>
                    <button
                      onClick={() => setEditingNotes(!editingNotes)}
                      className="px-3 py-1 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      {editingNotes ? 'Cancelar' : 'Añadir Nota'}
                    </button>
                  </div>

                  {selectedGroup.tacticalNotes ? (
                    <div className="bg-white border border-orange-200 rounded-lg p-4 mb-4">
                      <pre className="whitespace-pre-wrap text-gray-700 text-sm">
                        {selectedGroup.tacticalNotes}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No hay notas tácticas registradas</p>
                      <p className="text-sm">Añade observaciones estratégicas para este grupo</p>
                    </div>
                  )}

                  {editingNotes && (
                    <div className="space-y-3">
                      <textarea
                        value={newTacticalNote}
                        onChange={(e) => setNewTacticalNote(e.target.value)}
                        className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        rows={3}
                        placeholder="Nueva observación táctica..."
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleUpdateTacticalNotes}
                          disabled={!newTacticalNote.trim()}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>Guardar Nota</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingNotes(false);
                            setNewTacticalNote('');
                          }}
                          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentGroups;