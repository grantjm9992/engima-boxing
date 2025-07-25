// src/components/UserManager.tsx
import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Search, Trash2,
  RotateCcw, Power, PowerOff,
  AlertCircle, Check, X, Save, Loader
} from 'lucide-react';
import { User, UserRole, SubscriptionPlan, UserRegistrationData } from '../types/UserTypes';
import { userService } from '../services/UserService';
import { useAuth } from '../contexts/AuthContext';

interface UserManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserManager: React.FC<UserManagerProps> = ({ isOpen, onClose }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'created_at'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const perPage = 10;

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [lastEmailSentTo, setLastEmailSentTo] = useState('');
  const [createFormData, setCreateFormData] = useState<UserRegistrationData>({
    email: '',
    role: 'student',
    subscriptionPlan: 'basic',
  });
  const [createFormExtended, setCreateFormExtended] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [creatingUser, setCreatingUser] = useState(false);

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.getAllUsers({
        role: roleFilter !== 'all' ? roleFilter : undefined,
        active: activeFilter ?? undefined,
        search: searchTerm || undefined,
        sortBy,
        sortDirection,
        page: currentPage,
        perPage,
      });

      setUsers(response.users);
      setFilteredUsers(response.users);
      setTotalPages(response.pagination.last_page);
      setTotalUsers(response.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount and when filters change
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen, searchTerm, roleFilter, activeFilter, sortBy, sortDirection, currentPage]);

  // Create user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createFormData.email) {
      setError('El email es requerido');
      return;
    }

    try {
      setCreatingUser(true);
      setError(null);

      const userData: UserRegistrationData & { firstName?: string; lastName?: string; phone?: string } = {
        ...createFormData,
        firstName: createFormExtended.firstName || undefined,
        lastName: createFormExtended.lastName || undefined,
        phone: createFormExtended.phone || undefined,
      };

      const result = await userService.createUser(userData);

      // Send welcome email (simulated)
      userService.sendWelcomeEmail(result.user, result.tempPassword);

      // Show success message
      setLastEmailSentTo(result.user.email);
      setShowEmailSent(true);

      // Reset form
      setCreateFormData({ email: '', role: 'student', subscriptionPlan: 'basic' });
      setCreateFormExtended({ firstName: '', lastName: '', phone: '' });
      setShowCreateForm(false);

      // Reload users
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear usuario');
    } finally {
      setCreatingUser(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      setError(null);
      await userService.deleteUser(userId);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario');
    }
  };

  // Reset password
  const handleResetPassword = async (email: string) => {
    try {
      setError(null);
      const result = await userService.resetPassword(email);

      // Send reset email (simulated)
      userService.sendPasswordResetEmail(result.user, result.tempPassword);

      // Show success message
      setLastEmailSentTo(email);
      setShowEmailSent(true);

      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer contraseña');
    }
  };

  // Toggle user active status
  const handleToggleActive = async (userId: string) => {
    try {
      setError(null);
      await userService.toggleUserActive(userId);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado del usuario');
    }
  };

  // Role and plan labels
  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'trainer': return 'Entrenador';
      case 'student': return 'Alumno';
      default: return role;
    }
  };

  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'trainer': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'student': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

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

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Gestión de Usuarios
              </h2>
              {totalUsers > 0 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-dark-elevated text-sm text-gray-600 dark:text-gray-400 rounded">
                {totalUsers} usuarios
              </span>
              )}
            </div>
            <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {/* Error Display */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
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

            {/* Success Message */}
            {showEmailSent && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-300">Email Enviado</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Se ha enviado un email con las credenciales a {lastEmailSentTo}
                    </p>
                  </div>
                  <button
                      onClick={() => setShowEmailSent(false)}
                      className="ml-auto text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                >
                  <option value="all">Todos los roles</option>
                  <option value="admin">Administradores</option>
                  <option value="trainer">Entrenadores</option>
                  <option value="student">Alumnos</option>
                </select>

                <select
                    value={activeFilter === null ? 'all' : activeFilter.toString()}
                    onChange={(e) => setActiveFilter(e.target.value === 'all' ? null : e.target.value === 'true')}
                    className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                >
                  <option value="all">Todos</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                </select>
              </div>

              {/* Create Button */}
              {currentUser?.role === 'admin' && (
                  <button
                      onClick={() => setShowCreateForm(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Usuario</span>
                  </button>
              )}
            </div>

            {/* Users List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-red-600" />
                </div>
            ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                      <tr className="border-b border-gray-200 dark:border-dark-border">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Usuario</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Rol</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Plan</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Estado</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Último Login</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Acciones</th>
                      </tr>
                      </thead>
                      <tbody>
                      {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-elevated">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Sin nombre'}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                {user.phone && (
                                    <div className="text-sm text-gray-400 dark:text-gray-500">{user.phone}</div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                            </td>
                            <td className="py-3 px-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {getPlanLabel(user.subscriptionPlan)}
                          </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                {user.isActive ? (
                                    <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                                      <Power className="w-4 h-4" />
                                      <span className="text-sm">Activo</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                                      <PowerOff className="w-4 h-4" />
                                      <span className="text-sm">Inactivo</span>
                                    </div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-ES') : 'Nunca'}
                          </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleResetPassword(user.email)}
                                    className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                    title="Restablecer contraseña"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>

                                {currentUser?.id !== user.id && (
                                    <button
                                        onClick={() => handleToggleActive(user.id.toString())}
                                        className={`p-1 rounded transition-colors ${
                                            user.isActive
                                                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
                                                : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'
                                        }`}
                                        title={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                                    >
                                      {user.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                    </button>
                                )}

                                {currentUser?.role === 'admin' && currentUser?.id !== user.id && (
                                    <button
                                        onClick={() => handleDeleteUser(user.id.toString())}
                                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                        title="Eliminar usuario"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                              </div>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                      <div className="flex justify-between items-center mt-6">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Página {currentPage} de {totalPages} ({totalUsers} usuarios)
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

          {/* Create User Form Modal */}
          {showCreateForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-md">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Crear Nuevo Usuario</h3>
                    <button
                        onClick={() => setShowCreateForm(false)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email *
                      </label>
                      <input
                          type="email"
                          value={createFormData.email}
                          onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                          required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nombre
                        </label>
                        <input
                            type="text"
                            value={createFormExtended.firstName}
                            onChange={(e) => setCreateFormExtended({ ...createFormExtended, firstName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Apellido
                        </label>
                        <input
                            type="text"
                            value={createFormExtended.lastName}
                            onChange={(e) => setCreateFormExtended({ ...createFormExtended, lastName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Teléfono
                      </label>
                      <input
                          type="tel"
                          value={createFormExtended.phone}
                          onChange={(e) => setCreateFormExtended({ ...createFormExtended, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Rol *
                        </label>
                        <select
                            value={createFormData.role}
                            onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value as UserRole })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                            required
                        >
                          <option value="student">Alumno</option>
                          <option value="trainer">Entrenador</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Plan
                        </label>
                        <select
                            value={createFormData.subscriptionPlan || ''}
                            onChange={(e) => setCreateFormData({ ...createFormData, subscriptionPlan: e.target.value as SubscriptionPlan || undefined })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-dark-elevated dark:text-white"
                        >
                          <option value="">Sin plan</option>
                          <option value="trial">Prueba</option>
                          <option value="basic">Básico</option>
                          <option value="premium">Premium</option>
                          <option value="elite">Élite</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                          type="button"
                          onClick={() => setShowCreateForm(false)}
                          className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                          type="submit"
                          disabled={creatingUser || !createFormData.email}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {creatingUser ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              <span>Creando...</span>
                            </>
                        ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>Crear Usuario</span>
                            </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

export default UserManager;