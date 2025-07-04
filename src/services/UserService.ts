import { v4 as uuidv4 } from 'uuid';
import { User, UserRegistrationData, UserProfileUpdateData, PasswordChangeData, PasswordResetData, LoginCredentials } from '../types/UserTypes';

class UserService {
  private users: User[] = [];
  private currentUser: User | null = null;
  private readonly storageKey = 'enigma-users';
  private readonly currentUserKey = 'enigma-current-user';

  constructor() {
    this.loadUsers();
    this.loadCurrentUser();

    // Create test user if no users exist
    this.createTestUserIfNeeded();
    this.createAdditionalTestUsers();
  }

  private createTestUserIfNeeded(): void {
    if (this.users.length === 0) {
      const testUser: User = {
        id: uuidv4(),
        email: 'test@enigmaboxing.com',
        role: 'admin',
        subscriptionPlan: 'premium',
        tempPassword: 'test123',
        tempPasswordExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: undefined
      };

      this.users.push(testUser);
      this.saveUsers();

      console.log('🎯 Test user created!');
      console.log('📧 Email: test@enigmaboxing.com');
      console.log('🔑 Password: test123');
      console.log('👤 Role: admin');
      console.log('⭐ Plan: premium');
    }
  }

  // Method to manually create additional test users
  public createAdditionalTestUsers(): void {
    const additionalTestUsers: User[] = [
      {
        id: uuidv4(),
        email: 'trainer@enigmaboxing.com',
        role: 'trainer',
        subscriptionPlan: 'premium',
        tempPassword: 'trainer123',
        tempPasswordExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        email: 'member@enigmaboxing.com',
        role: 'student',
        subscriptionPlan: 'basic',
        tempPassword: 'member123',
        tempPasswordExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Check if these users already exist before adding
    additionalTestUsers.forEach(testUser => {
      if (!this.users.some(user => user.email === testUser.email)) {
        this.users.push(testUser);
      }
    });

    this.saveUsers();
    console.log('Additional test users created:');
    console.log('👨‍💼 Trainer: trainer@enigmaboxing.com / trainer123');
    console.log('👤 Member: member@enigmaboxing.com / member123');
  }

  private loadUsers(): void {
    try {
      const savedUsers = localStorage.getItem(this.storageKey);
      if (savedUsers) {
        this.users = JSON.parse(savedUsers).map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
          tempPasswordExpiry: user.tempPasswordExpiry ? new Date(user.tempPasswordExpiry) : undefined,
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
        }));
      }
    } catch (error) {
      console.error('Error loading users:', error);
      this.users = [];
    }
  }

  private saveUsers(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  private loadCurrentUser(): void {
    try {
      const savedUser = localStorage.getItem(this.currentUserKey);
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        this.currentUser = {
          ...parsedUser,
          createdAt: new Date(parsedUser.createdAt),
          updatedAt: new Date(parsedUser.updatedAt),
          tempPasswordExpiry: parsedUser.tempPasswordExpiry ? new Date(parsedUser.tempPasswordExpiry) : undefined,
          lastLogin: parsedUser.lastLogin ? new Date(parsedUser.lastLogin) : undefined
        };
      }
    } catch (error) {
      console.error('Error loading current user:', error);
      this.currentUser = null;
    }
  }

  private saveCurrentUser(): void {
    try {
      if (this.currentUser) {
        localStorage.setItem(this.currentUserKey, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(this.currentUserKey);
      }
    } catch (error) {
      console.error('Error saving current user:', error);
    }
  }

  // Generar contraseña temporal aleatoria
  private generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Registrar un nuevo usuario
  public registerUser(userData: UserRegistrationData): { user: User; tempPassword: string } {
    // Verificar si el email ya existe
    if (this.users.some(user => user.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('El correo electrónico ya está registrado');
    }

    const tempPassword = this.generateTempPassword();
    const tempPasswordExpiry = new Date();
    tempPasswordExpiry.setDate(tempPasswordExpiry.getDate() + 7); // Expira en 7 días

    const newUser: User = {
      id: uuidv4(),
      email: userData.email.toLowerCase(),
      role: userData.role,
      subscriptionPlan: userData.subscriptionPlan || 'basic',
      tempPassword: tempPassword,
      tempPasswordExpiry: tempPasswordExpiry,
      isActive: true,
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.push(newUser);
    this.saveUsers();

    return { user: newUser, tempPassword };
  }

  // Iniciar sesión
  public login(credentials: LoginCredentials): User {
    const user = this.users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (!user.isActive) {
      throw new Error('La cuenta está desactivada');
    }

    // Verificar si es la primera vez que inicia sesión (con contraseña temporal)
    if (user.tempPassword) {
      if (user.tempPassword !== credentials.password) {
        throw new Error('Contraseña incorrecta');
      }

      // Verificar si la contraseña temporal ha expirado
      if (user.tempPasswordExpiry && user.tempPasswordExpiry < new Date()) {
        throw new Error('La contraseña temporal ha expirado');
      }
    } else {
      // Aquí normalmente verificaríamos la contraseña hasheada
      // Por simplicidad, asumimos que la contraseña es correcta
      // En una implementación real, usaríamos bcrypt o similar
    }

    // Actualizar último inicio de sesión
    const updatedUser = {
      ...user,
      lastLogin: new Date(),
      updatedAt: new Date()
    };

    this.users = this.users.map(u => u.id === user.id ? updatedUser : u);
    this.saveUsers();

    this.currentUser = updatedUser;
    this.saveCurrentUser();

    return updatedUser;
  }

  // Cerrar sesión
  public logout(): void {
    this.currentUser = null;
    this.saveCurrentUser();
  }

  // Obtener usuario actual
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Actualizar perfil de usuario
  public updateUserProfile(userId: string, profileData: UserProfileUpdateData): User {
    const userIndex = this.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...profileData,
      updatedAt: new Date()
    };

    this.users[userIndex] = updatedUser;
    this.saveUsers();

    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = updatedUser;
      this.saveCurrentUser();
    }

    return updatedUser;
  }

  // Cambiar contraseña (primera vez o cambio regular)
  public changePassword(userId: string, passwordData: PasswordChangeData): User {
    const userIndex = this.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    const user = this.users[userIndex];

    // Verificar contraseña actual
    if (user.tempPassword) {
      if (user.tempPassword !== passwordData.oldPassword) {
        throw new Error('Contraseña temporal incorrecta');
      }

      // Verificar si la contraseña temporal ha expirado
      if (user.tempPasswordExpiry && user.tempPasswordExpiry < new Date()) {
        throw new Error('La contraseña temporal ha expirado');
      }
    } else {
      // Aquí normalmente verificaríamos la contraseña hasheada
      // Por simplicidad, asumimos que la contraseña es correcta
    }

    // Actualizar usuario
    const updatedUser = {
      ...user,
      tempPassword: undefined,
      tempPasswordExpiry: undefined,
      isEmailVerified: true, // Al cambiar la contraseña temporal, consideramos que el email está verificado
      updatedAt: new Date()
    };

    this.users[userIndex] = updatedUser;
    this.saveUsers();

    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = updatedUser;
      this.saveCurrentUser();
    }

    return updatedUser;
  }

  // Restablecer contraseña
  public resetPassword(email: string): { user: User; tempPassword: string } {
    const userIndex = this.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    const tempPassword = this.generateTempPassword();
    const tempPasswordExpiry = new Date();
    tempPasswordExpiry.setDate(tempPasswordExpiry.getDate() + 1); // Expira en 1 día

    const updatedUser = {
      ...this.users[userIndex],
      tempPassword,
      tempPasswordExpiry,
      updatedAt: new Date()
    };

    this.users[userIndex] = updatedUser;
    this.saveUsers();

    return { user: updatedUser, tempPassword };
  }

  // Obtener todos los usuarios (solo para administradores)
  public getAllUsers(): User[] {
    return [...this.users];
  }

  // Activar/desactivar usuario
  public toggleUserActive(userId: string, isActive: boolean): User {
    const userIndex = this.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    const updatedUser = {
      ...this.users[userIndex],
      isActive,
      updatedAt: new Date()
    };

    this.users[userIndex] = updatedUser;
    this.saveUsers();

    return updatedUser;
  }

  // Eliminar usuario
  public deleteUser(userId: string): void {
    this.users = this.users.filter(u => u.id !== userId);
    this.saveUsers();

    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = null;
      this.saveCurrentUser();
    }
  }

  public clearAllData(): void {
    this.users = [];
    this.currentUser = null;
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.currentUserKey);
    console.log('All user data cleared!');
  }

  // Enviar correo de bienvenida con credenciales temporales
  public sendWelcomeEmail(user: User, tempPassword: string): boolean {
    // En una implementación real, aquí enviaríamos un correo electrónico
    // Para esta demo, simplemente simulamos que el correo se envió correctamente
    console.log(`
      Correo enviado a: ${user.email}
      Asunto: Bienvenido a Enigma Boxing Club
      Contenido:
      Hola,
      
      Te damos la bienvenida a Enigma Boxing Club. Tu cuenta ha sido creada con éxito.
      
      Tus credenciales de acceso son:
      Usuario: ${user.email}
      Contraseña temporal: ${tempPassword}
      
      Esta contraseña expirará en 7 días. Por favor, inicia sesión y cámbiala lo antes posible.
      
      Accede a la aplicación:
      - iOS: [Enlace App Store]
      - Android: [Enlace Play Store]
      - Windows/Mac: [Enlace de descarga]
      - Web: [Enlace a la versión web]
      
      Saludos,
      Equipo de Enigma Boxing Club
    `);

    return true;
  }
}

export const userService = new UserService();