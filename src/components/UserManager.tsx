import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Search, Filter, Edit3, Trash2,
  Mail, X, Save, Shield, Key, CheckCircle,
  AlertCircle, User, UserPlus, UserMinus, MoreHorizontal,
  Eye, EyeOff, RefreshCw, Info, Loader2
} from 'lucide-react';
import { UserRegistrationData, UserRole, SubscriptionPlan } from '../types/UserTypes';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

interface UserManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApiUser {
  id: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  subscription_plan: SubscriptionPlan;
  is_active: boolean;
  is_email_verified: boolean;
  last_login?: string;
  temp_password?: string;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const UserManager: React.FC<UserManagerProps> = ({ isOpen, onClose }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [lastEmailSentTo, setLastEmailSentTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [newUserForm, setNewUserForm] = useState<UserRegistrationData>({
    email: '',
    role: 'student',
    subscriptionPlan: 'basic',
    firstName: '',
    lastName: '',
    phone: ''
  });

  // Load users when component opens or filters change
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen, searchTerm, filterRole, filterActive, currentPage]);

  const loadUsers = async () => {
    if (!currentUser || (!currentUser.role.includes('admin') && !currentUser.role.includes('trainer'))) {
      setError('Insufficient permissions to view users');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params: any = {
        page: currentPage,
        per_page: 15
      };

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (filterRole !== 'all') {
        params.role = filterRole;
      }

      if (filterActive !== 'all') {
        params.active = filterActive === 'active';
      }

      const response = await apiService.users.getAll(params);

      if (response.users && Array.isArray(response.users)) {
        setUsers(response.users);
        setPagination(response.pagination || null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
      setUsers([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      if (isOpen) {
        loadUsers();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCreateUser = async () => {
    if (!newUserForm.email.trim()) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.users.create({
        email: newUserForm.email.trim(),
        role: newUserForm.role,
        subscription_plan: newUserForm.subscriptionPlan,
        first_name: newUserForm.firstName?.trim(),
        last_name: newUserForm.lastName?.trim(),
        phone: newUserForm.phone?.trim()
      });

      setLastEmailSentTo(newUserForm.email);
      setShowEmailSent(true);
      setIsCreatingUser(false);
      setNewUserForm({
        email: '',
        role: 'student',
        subscriptionPlan: 'basic',
        firstName: '',
        lastName: '',
        phone: ''
      });

      // Reload users to show the new one
      await loadUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? err.message : 'Error al crear usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiService.users.delete(userId);
      setShowConfirmDelete(false);
      setUserToDelete(null);
      await loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiService.users.toggleActive(userId);
      await loadUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError(err instanceof Error ? err.message : 'Error al cambiar estado del usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const formatRole = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: 'Administrador',
      trainer: 'Entrenador',
      student: 'Estudiante'
    };
    return roleMap[role] || role;
  };

  const formatSubscription = (plan: string) => {
    const planMap: Record<string, string> = {
      basic: 'Básico',
      premium: 'Premium',
      elite: 'Elite',
      trial: 'Prueba'
    };
    return planMap[plan] || plan;
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Administra usuarios del sistema
                    {pagination && ` (${pagination.total} usuarios)`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                    onClick={() => setIsCreatingUser(true)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Nuevo Usuario</span>
                </button>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
              <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
                <button
                    onClick={() => setError(null)}
                    className="text-red-700 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
          )}

          {/* Filters */}
          <div className="p-6 border-b border-gray-200 dark:border-dark-border">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                    placeholder="Buscar por nombre o email..."
                    disabled={isLoading}
                />
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-3">
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white text-sm"
                    disabled={isLoading}
                >
                  <option value="all">Todos los roles</option>
                  <option value="admin">Administrador</option>
                  <option value="trainer">Entrenador</option>
                  <option value="student">Estudiante</option>
                </select>

                <select
                    value={filterActive}
                    onChange={(e) => setFilterActive(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white text-sm"
                    disabled={isLoading}
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>

                <button
                    onClick={loadUsers}
                    disabled={isLoading}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && users.length === 0 ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                  <p className="text-gray-500 dark:text-gray-400">Cargando usuarios...</p>
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-semibold mb-2">No se encontraron usuarios</h3>
                  <p>
                    {searchTerm
                        ? `No hay usuarios que coincidan con "${searchTerm}"`
                        : 'No hay usuarios registrados en el sistema'
                    }
                  </p>
                </div>
            ) : (
                <div className="divide-y divide-gray-200 dark:divide-dark-border">
                  {users.map((user) => (
                      <div key={user.id} className="p-6 hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-dark-border rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {user.full_name || user.email}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    user.is_active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                            {user.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{user.email}</span>
                          </span>
                                <span className="flex items-center space-x-1">
                            <Shield className="w-4 h-4" />
                            <span>{formatRole(user.role)}</span>
                          </span>
                                <span>{formatSubscription(user.subscription_plan)}</span>
                              </div>
                              {user.last_login && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Último acceso: {new Date(user.last_login).toLocaleDateString()}
                                  </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleToggleActive(user.id)}
                                disabled={isLoading}
                                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                                    user.is_active
                                        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
                                        : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                                }`}
                            >
                              {user.is_active ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                            </button>

                            {currentUser?.role === 'admin' && (
                                <button
                                    onClick={() => {
                                      setUserToDelete(user.id);
                                      setShowConfirmDelete(true);
                                    }}
                                    disabled={isLoading}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
              <div className="p-6 border-t border-gray-200 dark:border-dark-border">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando {((pagination.current_page - 1) * pagination.per_page) + 1} a {Math.min(pagination.current_page * pagination.per_page, pagination.total)} de {pagination.total} usuarios
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1 || isLoading}
                        className="px-3 py-1 border border-gray-300 dark:border-dark-border rounded text-sm hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                  Página {pagination.current_page} de {pagination.last_page}
                </span>
                    <button
                        onClick={() => setCurrentPage(Math.min(pagination.last_page, currentPage + 1))}
                        disabled={currentPage === pagination.last_page || isLoading}
                        className="px-3 py-1 border border-gray-300 dark:border-dark-border rounded text-sm hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
          )}
        </div>

        {/* Create User Modal */}
        {isCreatingUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Crear Nuevo Usuario
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                        type="email"
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                        disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nombre
                      </label>
                      <input
                          type="text"
                          value={newUserForm.firstName}
                          onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                          disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Apellido
                      </label>
                      <input
                          type="text"
                          value={newUserForm.lastName}
                          onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                          disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Teléfono
                    </label>
                    <input
                        type="tel"
                        value={newUserForm.phone}
                        onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                        disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rol
                      </label>
                      <select
                          value={newUserForm.role}
                          onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                          disabled={isLoading}
                      >
                        <option value="student">Estudiante</option>
                        <option value="trainer">Entrenador</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Plan
                      </label>
                      <select
                          value={newUserForm.subscriptionPlan}
                          onChange={(e) => setNewUserForm({ ...newUserForm, subscriptionPlan: e.target.value as SubscriptionPlan })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                          disabled={isLoading}
                      >
                        <option value="basic">Básico</option>
                        <option value="premium">Premium</option>
                        <option value="elite">Elite</option>
                        <option value="trial">Prueba</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                      onClick={handleCreateUser}
                      disabled={isLoading || !newUserForm.email.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <UserPlus className="w-4 h-4" />
                    )}
                    <span>{isLoading ? 'Creando...' : 'Crear Usuario'}</span>
                  </button>
                  <button
                      onClick={() => {
                        setIsCreatingUser(false);
                        setNewUserForm({
                          email: '',
                          role: 'student',
                          subscriptionPlan: 'basic',
                          firstName: '',
                          lastName: '',
                          phone: ''
                        });
                      }}
                      disabled={isLoading}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Delete Confirmation Modal */}
        {showConfirmDelete && userToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Confirmar Eliminación
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  ¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.
                </p>
                <div className="flex space-x-3">
                  <button
                      onClick={() => handleDeleteUser(userToDelete)}
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Eliminando...' : 'Eliminar'}
                  </button>
                  <button
                      onClick={() => {
                        setShowConfirmDelete(false);
                        setUserToDelete(null);
                      }}
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Email Sent Confirmation */}
        {showEmailSent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-md w-full mx-4">
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Usuario Creado
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Se ha enviado un email con las credenciales de acceso a {lastEmailSentTo}
                  </p>
                  <button
                      onClick={() => setShowEmailSent(false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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