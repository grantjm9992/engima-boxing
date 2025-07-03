import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Filter, Edit3, Trash2, 
  Mail, X, Save, Shield, Key, CheckCircle,
  AlertCircle, User, UserPlus, UserMinus, MoreHorizontal,
  Eye, EyeOff, RefreshCw
} from 'lucide-react';
import { UserRegistrationData, UserRole, SubscriptionPlan } from '../types/UserTypes';
import { userService } from '../services/UserService';
import ConfirmDialog from './ConfirmDialog';

interface UserManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [lastEmailSentTo, setLastEmailSentTo] = useState('');
  
  const [newUserForm, setNewUserForm] = useState<UserRegistrationData>({
    email: '',
    role: 'student',
    subscriptionPlan: 'basic'
  });

  // Cargar usuarios
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = () => {
    try {
      const allUsers = userService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesActive = filterActive === null || user.isActive === filterActive;
    
    return matchesSearch && matchesRole && matchesActive;
  });

  // Crear nuevo usuario
  const handleCreateUser = () => {
    try {
      if (!newUserForm.email) {
        alert('El correo electrónico es obligatorio');
        return;
      }

      const { user, tempPassword } = userService.registerUser(newUserForm);
      
      // Enviar correo de bienvenida
      userService.sendWelcomeEmail(user, tempPassword);
      
      // Actualizar lista de usuarios
      loadUsers();
      
      // Mostrar confirmación de correo enviado
      setLastEmailSentTo(user.email);
      setShowEmailSent(true);
      
      // Resetear formulario
      setNewUserForm({
        email: '',
        role: 'student',
        subscriptionPlan: 'basic'
      });
      setIsCreatingUser(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al crear usuario');
    }
  };

  // Activar/desactivar usuario
  const toggleUserActive = (userId: string, isActive: boolean) => {
    try {
      userService.toggleUserActive(userId, isActive);
      loadUsers();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al actualizar usuario');
    }
  };

  // Eliminar usuario
  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setShowConfirmDelete(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      try {
        userService.deleteUser(userToDelete);
        loadUsers();
        setShowConfirmDelete(false);
        setUserToDelete(null);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Error al eliminar usuario');
      }
    }
  };

  // Restablecer contraseña
  const handleResetPassword = (email: string) => {
    try {
      const { user, tempPassword } = userService.resetPassword(email);
      
      // Enviar correo con nueva contraseña temporal
      userService.sendWelcomeEmail(user, tempPassword);
      
      // Mostrar confirmación de correo enviado
      setLastEmailSentTo(user.email);
      setShowEmailSent(true);
      
      loadUsers();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al restablecer contraseña');
    }
  };

  // Obtener etiqueta de rol
  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'trainer': return 'Entrenador';
      case 'student': return 'Alumno';
      default: return role;
    }
  };

  // Obtener color de rol
  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'trainer': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'student': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  // Obtener etiqueta de plan
  const getPlanLabel = (plan?: SubscriptionPlan): string => {
    if (!plan) return 'Sin plan';
    
    switch (plan) {
      case 'basic': return 'Básico';
      case 'premium': return 'Premium';
      case 'elite': return 'Élite';
      case 'trial': return 'Prueba';
      default: return plan;
    }
  };

  // Obtener color de plan
  const getPlanColor = (plan?: SubscriptionPlan): string => {
    if (!plan) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    
    switch (plan) {
      case 'basic': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      case 'premium': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'elite': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'trial': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
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
                <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
                <p className="text-blue-100">Administra cuentas de alumnos y entrenadores</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{users.length} usuario(s) registrado(s)</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>{users.filter(u => u.role === 'admin').length} administrador(es)</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{users.filter(u => u.role === 'trainer').length} entrenador(es)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Search and Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                placeholder="Buscar por nombre o email..."
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="trainer">Entrenadores</option>
              <option value="student">Alumnos</option>
            </select>

            <select
              value={filterActive === null ? 'all' : filterActive ? 'active' : 'inactive'}
              onChange={(e) => {
                const value = e.target.value;
                setFilterActive(value === 'all' ? null : value === 'active');
              }}
              className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>

            <button
              onClick={() => setIsCreatingUser(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
          </div>

          {/* Create User Form */}
          {isCreatingUser && (
            <div className="mb-6 p-6 border-2 border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Registrar Nuevo Usuario</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rol *
                  </label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                  >
                    <option value="student">Alumno</option>
                    <option value="trainer">Entrenador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plan de Suscripción
                  </label>
                  <select
                    value={newUserForm.subscriptionPlan || 'basic'}
                    onChange={(e) => setNewUserForm({ ...newUserForm, subscriptionPlan: e.target.value as SubscriptionPlan })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                  >
                    <option value="basic">Básico</option>
                    <option value="premium">Premium</option>
                    <option value="elite">Élite</option>
                    <option value="trial">Prueba</option>
                  </select>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <Mail className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Información Importante</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Al crear el usuario, se enviará automáticamente un correo electrónico con las credenciales temporales de acceso. El usuario deberá cambiar su contraseña al iniciar sesión por primera vez.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCreateUser}
                  disabled={!newUserForm.email}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Crear Usuario</span>
                </button>
                <button
                  onClick={() => setIsCreatingUser(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-dark-border">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-dark-elevated">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rol
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Plan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Registro
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-dark-border">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            {user.profilePicture ? (
                              <img src={user.profilePicture} alt={user.email} className="h-10 w-10 rounded-full" />
                            ) : (
                              <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}`
                                : 'Sin nombre'
                              }
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                            {user.phone && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">{user.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPlanColor(user.subscriptionPlan)}`}>
                          {getPlanLabel(user.subscriptionPlan)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`inline-flex items-center text-xs ${
                            user.isActive 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {user.isActive 
                              ? <CheckCircle className="w-3 h-3 mr-1" /> 
                              : <AlertCircle className="w-3 h-3 mr-1" />
                            }
                            {user.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                          <span className={`inline-flex items-center text-xs mt-1 ${
                            user.isEmailVerified 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-yellow-600 dark:text-yellow-400'
                          }`}>
                            {user.isEmailVerified 
                              ? <CheckCircle className="w-3 h-3 mr-1" /> 
                              : <AlertCircle className="w-3 h-3 mr-1" />
                            }
                            {user.isEmailVerified ? 'Verificado' : 'No verificado'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => toggleUserActive(user.id, !user.isActive)}
                            className={`p-1 rounded transition-colors ${
                              user.isActive
                                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                            title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                          >
                            {user.isActive ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleResetPassword(user.email)}
                            className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="Restablecer contraseña"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No se encontraron usuarios</p>
                      <p className="text-sm">Ajusta los filtros o crea un nuevo usuario</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Eliminar Usuario"
        message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmDeleteUser}
        onCancel={() => {
          setShowConfirmDelete(false);
          setUserToDelete(null);
        }}
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />

      {/* Email Sent Confirmation */}
      {showEmailSent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-dark-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Correo Enviado</h2>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Se ha enviado un correo electrónico a <strong>{lastEmailSentTo}</strong> con las credenciales de acceso.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                El usuario deberá cambiar su contraseña temporal al iniciar sesión por primera vez.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Enlaces de Acceso</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      El correo incluye enlaces para acceder a la aplicación desde diferentes plataformas:
                    </p>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 mt-1 space-y-1 list-disc pl-5">
                      <li>iOS</li>
                      <li>Android</li>
                      <li>Windows/Mac</li>
                      <li>Versión web</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-dark-elevated border-t border-gray-200 dark:border-dark-border">
              <button
                onClick={() => setShowEmailSent(false)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;