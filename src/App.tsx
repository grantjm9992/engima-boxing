import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Home, Users, Calendar, Dumbbell, 
  Settings, BarChart3, Target, BookOpen, 
  Sun, Moon, Monitor, Palette, CheckSquare, Video,
  Timer, UserPlus
} from 'lucide-react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ThemeSelector from './components/ThemeSelector';
import RoutineManager from './components/RoutineManager';
import { Category } from './components/CategoryManager';
import { StudentProfile } from './components/StudentProfile';
import { BlockTemplate } from './components/BlockLibrary';
import GoalsManager from './components/GoalsManager';
import WeeklyPlanner from './components/WeeklyPlanner';
import AchievementsManager from './components/AchievementsManager';
import { WorkTypeGoal } from './components/GoalsManager';
import { Goal } from './components/GoalsManager';
import { WeekPlan, DayPlan } from './components/WeeklyPlanner';
import { Achievement } from './components/AchievementsManager';
import StudentManager from './components/StudentManager';
import StudentTaskManager from './components/StudentTaskManager';
import { StudentTask } from './components/StudentTaskManager';
import VideoLibrary, { VideoItem, VideoNote } from './components/VideoLibrary';
import { MultiTimerExercise } from './components/MultiTimerExercise';
import ClassPlanner from './components/ClassPlanner';
import { PlannedClass } from './types/ClassTypes';
import UserManager from './components/UserManager';
import LoginForm from './components/LoginForm';
import FirstLoginSetup from './components/FirstLoginSetup';

// Sample data
const sampleCategories: Category[] = [
  { id: '1', name: 'Técnica', color: '#3B82F6', createdAt: new Date() },
  { id: '2', name: 'Cardio', color: '#EF4444', createdAt: new Date() },
  { id: '3', name: 'Fuerza', color: '#8B5CF6', createdAt: new Date() },
  { id: '4', name: 'Principiante', color: '#22C55E', createdAt: new Date() },
  { id: '5', name: 'Avanzado', color: '#F59E0B', createdAt: new Date() }
];

const sampleStudents: StudentProfile[] = [
  {
    id: '1',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    age: 25,
    height: 175,
    weight: 70,
    lastWeightUpdate: new Date(),
    level: 'intermedio',
    strengths: ['Velocidad', 'Técnica de jab'],
    weaknesses: ['Resistencia', 'Defensa'],
    notes: 'Estudiante dedicado con buen potencial técnico',
    tacticalNotes: '',
    lastTacticalNotesUpdate: new Date(),
    pendingNotes: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const sampleBlockTemplates: BlockTemplate[] = [
  {
    id: '1',
    name: 'Calentamiento Estándar',
    description: 'Rutina básica de calentamiento para cualquier sesión',
    color: '#22C55E',
    exercises: [
      {
        id: 'ex1',
        name: 'Movilidad articular',
        description: 'Rotaciones de brazos, cuello y cadera',
        duration: 300,
        restTime: 30,
        rounds: 1,
        intensity: 'low',
        category: 'flexibility',
        instructions: ['Movimientos suaves y controlados'],
        materials: [],
        protection: [],
        categories: ['4']
      }
    ],
    notes: 'Enfócate en preparar todas las articulaciones para el entrenamiento',
    categories: ['1', '4'],
    category: 'warmup',
    estimatedDuration: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDefault: true
  }
];

// Sample multi-timer exercise
const sampleMultiTimerExercise: MultiTimerExercise = {
  id: 'multi1',
  name: 'Sombra con Roles',
  description: 'Ejercicio de sombra con cambios de rol y fases específicas',
  timers: [
    {
      id: 'timer1',
      name: 'Preparación',
      color: '#F59E0B',
      duration: 5,
      repetitions: 1
    },
    {
      id: 'timer2',
      name: 'Ataque A',
      color: '#EF4444',
      duration: 120,
      repetitions: 2,
      restBetween: 10
    },
    {
      id: 'timer3',
      name: 'Cambio de rol',
      color: '#3B82F6',
      duration: 10,
      repetitions: 1
    },
    {
      id: 'timer4',
      name: 'Ataque B',
      color: '#EF4444',
      duration: 120,
      repetitions: 2,
      restBetween: 10
    }
  ],
  globalRestTime: 60,
  rounds: 3
};

// Sample work types
const sampleWorkTypes: WorkTypeGoal[] = [
  {
    id: 'wt1',
    name: 'Técnica de Jab',
    color: '#3B82F6',
    description: 'Perfeccionamiento de la técnica de jab',
    category: 'technical'
  },
  {
    id: 'wt2',
    name: 'Resistencia Cardiovascular',
    color: '#EF4444',
    description: 'Mejora de la capacidad aeróbica',
    category: 'physical'
  },
  {
    id: 'wt3',
    name: 'Reacción y Reflejos',
    color: '#8B5CF6',
    description: 'Mejora del tiempo de reacción',
    category: 'mental'
  },
  {
    id: 'wt4',
    name: 'Estrategia de Combate',
    color: '#F59E0B',
    description: 'Planificación táctica y adaptación',
    category: 'tactical'
  }
];

// Sample goals
const sampleGoals: Goal[] = [
  {
    id: 'g1',
    name: 'Mejora Técnica Semanal',
    description: 'Enfoque en perfeccionamiento técnico para intermedios',
    type: 'weekly',
    workTypes: ['wt1', 'wt3'],
    targetPercentage: 90,
    studentLevel: 'intermedio',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample goal progress
const sampleGoalProgress = [
  {
    goalId: 'g1',
    currentPercentage: 65,
    completedDays: 3,
    totalDays: 7,
    isCompleted: false,
    achievements: [],
    lastUpdated: new Date()
  }
];

// Sample week plans
const sampleWeekPlans: WeekPlan[] = [
  {
    id: 'wp1',
    name: 'Semana de Preparación',
    description: 'Enfoque en técnica y resistencia',
    startDate: new Date(),
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    days: Array(7).fill(0).map((_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      workTypes: i % 2 === 0 ? ['wt1'] : ['wt2'],
      notes: '',
      isCompleted: i < 3,
      completionPercentage: i < 3 ? 100 : 0
    })),
    isTemplate: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample achievements
const sampleAchievements: Achievement[] = [
  {
    id: 'a1',
    name: 'Semana Completada',
    description: 'Completó todos los entrenamientos de la semana',
    type: 'completion',
    icon: 'calendar',
    color: '#22C55E',
    studentId: '1',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    value: 100
  },
  {
    id: 'a2',
    name: 'Maestría Técnica',
    description: 'Alcanzó 95% en trabajo técnico',
    type: 'workType',
    icon: 'target',
    color: '#3B82F6',
    studentId: '1',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    relatedWorkTypeId: 'wt1',
    value: 95
  }
];

// Sample student tasks
const sampleTasks: StudentTask[] = [
  {
    id: 'task1',
    studentId: '1',
    title: 'Practicar combinación jab-cross-hook',
    description: 'Enfocarse en la rotación de cadera y el equilibrio',
    type: 'technical',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    isCompleted: false,
    priority: 'high',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'task2',
    studentId: '1',
    title: 'Analizar video de sparring',
    description: 'Identificar patrones defensivos y oportunidades de contraataque',
    type: 'tactical',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    isCompleted: false,
    priority: 'medium',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'task3',
    studentId: '1',
    title: 'Mejorar puntualidad en entrenamientos',
    description: 'Llegar 15 minutos antes para preparación mental',
    type: 'attitudinal',
    isCompleted: true,
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
];

// Sample videos with working URLs
const sampleVideos: VideoItem[] = [
  {
    id: 'video1',
    title: 'Técnica de Jab - Fundamentos',
    description: 'Explicación detallada de la técnica correcta del jab, posición, equilibrio y ejecución.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/4761663/pexels-photo-4761663.jpeg?auto=compress&cs=tinysrgb&w=400',
    uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    uploadedBy: 'trainer1',
    duration: 325, // 5:25
    tags: ['Jab', 'Técnica', 'Fundamentos'],
    category: 'technique',
    level: 'principiante',
    visibleTo: [],
    allowDownload: true,
    notes: []
  },
  {
    id: 'video2',
    title: 'Sparring - Carlos vs Miguel',
    description: 'Sesión de sparring técnico con enfoque en distancia y timing.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/4761352/pexels-photo-4761352.jpeg?auto=compress&cs=tinysrgb&w=400',
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    uploadedBy: 'trainer1',
    duration: 540, // 9:00
    tags: ['Sparring', 'Distancia', 'Timing'],
    category: 'sparring',
    level: 'intermedio',
    visibleTo: ['1'],
    allowDownload: false,
    notes: [
      {
        id: 'note1',
        videoId: 'video2',
        content: 'Buena defensa en [01:23], pero necesitas mejorar la salida después del bloqueo.',
        timestamp: 83, // 1:23
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        createdBy: 'trainer1',
        mentions: ['1']
      }
    ]
  },
  {
    id: 'video3',
    title: 'Análisis Competición - Campeonato Regional',
    description: 'Análisis táctico del combate de semifinales del Campeonato Regional.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/4761668/pexels-photo-4761668.jpeg?auto=compress&cs=tinysrgb&w=400',
    uploadedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    uploadedBy: 'trainer1',
    duration: 1200, // 20:00
    tags: ['Competición', 'Análisis', 'Táctica'],
    category: 'analysis',
    level: 'avanzado',
    visibleTo: [],
    allowDownload: false,
    notes: []
  }
];

// Sample planned classes
const samplePlannedClasses: PlannedClass[] = [
  {
    id: 'class1',
    title: 'Clase de Técnica - Nivel Intermedio',
    date: new Date().toISOString().split('T')[0],
    tags: ['1', '4'],
    totalDuration: 60,
    blocks: [
      {
        id: 'block1',
        name: 'Calentamiento',
        description: 'Preparación física general',
        color: '#22C55E',
        exercises: [
          {
            id: 'ex1',
            name: 'Movilidad articular',
            description: 'Rotaciones de brazos, cuello y cadera',
            duration: 300,
            restTime: 30,
            rounds: 1,
            intensity: 'low',
            category: 'flexibility',
            instructions: ['Movimientos suaves y controlados'],
            materials: [],
            protection: [],
            categories: ['4']
          }
        ],
        notes: 'Asegúrate de calentar bien todas las articulaciones',
        advancedNotes: null,
        estimatedDuration: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'block2',
        name: 'Técnica de Jab',
        description: 'Trabajo específico de jab',
        color: '#3B82F6',
        exercises: [
          {
            id: 'ex2',
            name: 'Jab en espejo',
            description: 'Práctica de jab frente al espejo',
            duration: 180,
            restTime: 60,
            rounds: 3,
            intensity: 'medium',
            category: 'technique',
            instructions: ['Mantén la guardia alta', 'Extiende completamente el brazo'],
            materials: [],
            protection: [],
            categories: ['1']
          }
        ],
        notes: 'Enfócate en la técnica correcta, no en la velocidad',
        advancedNotes: null,
        estimatedDuration: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    objective: 'Mejorar la técnica de jab y su aplicación en diferentes situaciones',
    notes: 'Traer guantes y vendas',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

function AppContent() {
  const { theme, actualTheme } = useTheme();
  const { user, isFirstLogin, isAuthenticated, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [routines, setRoutines] = useState<any[]>([]);
  const [blockTemplates, setBlockTemplates] = useState<BlockTemplate[]>(sampleBlockTemplates);
  const [showRoutineManager, setShowRoutineManager] = useState(false);
  const [showGoalsManager, setShowGoalsManager] = useState(false);
  const [showWeeklyPlanner, setShowWeeklyPlanner] = useState(false);
  const [showAchievementsManager, setShowAchievementsManager] = useState(false);
  const [showStudentManager, setShowStudentManager] = useState(false);
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [showVideoLibrary, setShowVideoLibrary] = useState(false);
  const [showClassPlanner, setShowClassPlanner] = useState(false);
  const [showUserManager, setShowUserManager] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(!isAuthenticated);
  const [showFirstLoginSetup, setShowFirstLoginSetup] = useState(isAuthenticated && isFirstLogin);
  
  // State for goals and work types
  const [workTypes, setWorkTypes] = useState<WorkTypeGoal[]>(sampleWorkTypes);
  const [goals, setGoals] = useState<Goal[]>(sampleGoals);
  const [goalProgress, setGoalProgress] = useState(sampleGoalProgress);
  const [weekPlans, setWeekPlans] = useState<WeekPlan[]>(sampleWeekPlans);
  const [achievements, setAchievements] = useState<Achievement[]>(sampleAchievements);
  const [completedWorkTypes, setCompletedWorkTypes] = useState<string[]>(['wt2']);
  const [students, setStudents] = useState<StudentProfile[]>(sampleStudents);
  const [tasks, setTasks] = useState<StudentTask[]>(sampleTasks);
  const [videos, setVideos] = useState<VideoItem[]>(sampleVideos);
  const [categories, setCategories] = useState<Category[]>(sampleCategories);
  const [plannedClasses, setPlannedClasses] = useState<PlannedClass[]>(samplePlannedClasses);

  // Actualizar estado de autenticación
  useEffect(() => {
    setShowLoginForm(!isAuthenticated);
    setShowFirstLoginSetup(isAuthenticated && isFirstLogin);
  }, [isAuthenticated, isFirstLogin]);

  const menuItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'routines', label: 'Rutinas', icon: Dumbbell },
    { id: 'classes', label: 'Clases', icon: Calendar },
    { id: 'students', label: 'Estudiantes', icon: Users },
    { id: 'goals', label: 'Objetivos', icon: Target },
    { id: 'library', label: 'Biblioteca', icon: BookOpen },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'users', label: 'Usuarios', icon: UserPlus, adminOnly: true }
  ];

  const handleCreateRoutine = (routine: any) => {
    const newRoutine = {
      ...routine,
      id: `routine_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setRoutines(prev => [...prev, newRoutine]);
  };

  const handleUpdateRoutine = (id: string, updates: any) => {
    setRoutines(prev => prev.map(routine => 
      routine.id === id ? { ...routine, ...updates, updatedAt: new Date() } : routine
    ));
  };

  const handleDeleteRoutine = (id: string) => {
    setRoutines(prev => prev.filter(routine => routine.id !== id));
  };

  const handleDuplicateRoutine = (routine: any) => {
    const duplicated = {
      ...routine,
      id: `routine_${Date.now()}`,
      name: `${routine.name} (Copia)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setRoutines(prev => [...prev, duplicated]);
  };

  // Category handlers
  const handleCreateCategory = (category: Omit<Category, 'id' | 'createdAt'>) => {
    const newCategory: Category = {
      ...category,
      id: `category_${Date.now()}`,
      createdAt: new Date()
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const handleUpdateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(category => 
      category.id === id ? { ...category, ...updates } : category
    ));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(category => category.id !== id));
  };

  // Student handlers
  const handleCreateStudent = (student: Omit<StudentProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newStudent: StudentProfile = {
      ...student,
      id: `student_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const handleUpdateStudent = (id: string, updates: Partial<StudentProfile>) => {
    setStudents(prev => prev.map(student => 
      student.id === id ? { ...student, ...updates, updatedAt: new Date() } : student
    ));
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(student => student.id !== id));
    // Also delete related tasks
    setTasks(prev => prev.filter(task => task.studentId !== id));
  };

  // Task handlers
  const handleCreateTask = (task: Omit<StudentTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: StudentTask = {
      ...task,
      id: `task_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleUpdateTask = (id: string, updates: Partial<StudentTask>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleCompleteTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { 
        ...task, 
        isCompleted: true, 
        completedAt: new Date(),
        updatedAt: new Date() 
      } : task
    ));
  };

  // Goals handlers
  const handleCreateGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setGoals(prev => [...prev, newGoal]);
    
    // Initialize progress tracking
    setGoalProgress(prev => [...prev, {
      goalId: newGoal.id,
      currentPercentage: 0,
      completedDays: 0,
      totalDays: 
        newGoal.type === 'daily' ? 1 : 
        newGoal.type === 'weekly' ? 7 : 90,
      isCompleted: false,
      achievements: [],
      lastUpdated: new Date()
    }]);
  };

  const handleUpdateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updates, updatedAt: new Date() } : goal
    ));
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    setGoalProgress(prev => prev.filter(progress => progress.goalId !== id));
  };

  // Work type handlers
  const handleCreateWorkType = (workType: Omit<WorkTypeGoal, 'id'>) => {
    const newWorkType: WorkTypeGoal = {
      ...workType,
      id: `wt_${Date.now()}`
    };
    setWorkTypes(prev => [...prev, newWorkType]);
  };

  const handleUpdateWorkType = (id: string, updates: Partial<WorkTypeGoal>) => {
    setWorkTypes(prev => prev.map(wt => 
      wt.id === id ? { ...wt, ...updates } : wt
    ));
  };

  const handleDeleteWorkType = (id: string) => {
    setWorkTypes(prev => prev.filter(wt => wt.id !== id));
    
    // Remove from goals
    setGoals(prev => prev.map(goal => ({
      ...goal,
      workTypes: goal.workTypes.filter(wtId => wtId !== id)
    })));
    
    // Remove from completed work types
    setCompletedWorkTypes(prev => prev.filter(wtId => wtId !== id));
    
    // Remove from week plans
    setWeekPlans(prev => prev.map(plan => ({
      ...plan,
      days: plan.days.map(day => ({
        ...day,
        workTypes: day.workTypes.filter(wtId => wtId !== id)
      }))
    })));
  };

  // Week plan handlers
  const handleCreateWeekPlan = (plan: Omit<WeekPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPlan: WeekPlan = {
      ...plan,
      id: `wp_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setWeekPlans(prev => [...prev, newPlan]);
  };

  const handleUpdateWeekPlan = (id: string, updates: Partial<WeekPlan>) => {
    setWeekPlans(prev => prev.map(plan => 
      plan.id === id ? { ...plan, ...updates, updatedAt: new Date() } : plan
    ));
  };

  const handleDeleteWeekPlan = (id: string) => {
    setWeekPlans(prev => prev.filter(plan => plan.id !== id));
  };

  const handleDuplicateWeekPlan = (plan: WeekPlan) => {
    const newStartDate = new Date();
    const daysDiff = Math.floor((newStartDate.getTime() - plan.startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const newPlan: WeekPlan = {
      ...plan,
      id: `wp_${Date.now()}`,
      name: `${plan.name} (Copia)`,
      startDate: newStartDate,
      endDate: new Date(plan.endDate.getTime() + daysDiff * 24 * 60 * 60 * 1000),
      days: plan.days.map(day => ({
        ...day,
        date: new Date(day.date.getTime() + daysDiff * 24 * 60 * 60 * 1000),
        isCompleted: false,
        completionPercentage: 0
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setWeekPlans(prev => [...prev, newPlan]);
  };

  const handleSaveBlockTemplate = (template: Omit<BlockTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: BlockTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setBlockTemplates(prev => [...prev, newTemplate]);
  };

  // Video handlers
  const handleAddVideo = (video: Omit<VideoItem, 'id' | 'uploadedAt' | 'notes'>) => {
    const newVideo: VideoItem = {
      ...video,
      id: `video_${Date.now()}`,
      uploadedAt: new Date(),
      notes: []
    };
    setVideos(prev => [...prev, newVideo]);
  };

  const handleUpdateVideo = (id: string, updates: Partial<VideoItem>) => {
    setVideos(prev => prev.map(video => 
      video.id === id ? { ...video, ...updates } : video
    ));
  };

  const handleDeleteVideo = (id: string) => {
    setVideos(prev => prev.filter(video => video.id !== id));
  };

  const handleAddVideoNote = (note: Omit<VideoNote, 'id' | 'createdAt'>) => {
    const newNote: VideoNote = {
      ...note,
      id: `note_${Date.now()}`,
      createdAt: new Date()
    };
    
    setVideos(prev => prev.map(video => 
      video.id === note.videoId 
        ? { ...video, notes: [...video.notes, newNote] } 
        : video
    ));
  };

  const handleDeleteVideoNote = (videoId: string, noteId: string) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { ...video, notes: video.notes.filter(note => note.id !== noteId) } 
        : video
    ));
  };

  // Planned Classes handlers
  const handleCreateClass = async (classData: Omit<PlannedClass, 'id' | 'createdAt' | 'updatedAt' | 'notionPageId'>) => {
    const newClass: PlannedClass = {
      ...classData,
      id: `class_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setPlannedClasses(prev => [...prev, newClass]);
    return newClass;
  };

  const handleUpdateClass = async (id: string, updates: Partial<PlannedClass>) => {
    setPlannedClasses(prev => prev.map(cls => 
      cls.id === id ? { ...cls, ...updates, updatedAt: new Date() } : cls
    ));
  };

  const handleDeleteClass = async (id: string) => {
    setPlannedClasses(prev => prev.filter(cls => cls.id !== id));
  };

  const handleDuplicateClass = async (id: string, newDate?: string) => {
    const classToDuplicate = plannedClasses.find(cls => cls.id === id);
    if (!classToDuplicate) return;
    
    const newClass: PlannedClass = {
      ...classToDuplicate,
      id: `class_${Date.now()}`,
      title: `${classToDuplicate.title} (Copia)`,
      date: newDate || classToDuplicate.date,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setPlannedClasses(prev => [...prev, newClass]);
    return newClass;
  };

  const handleRunClass = (plannedClass: PlannedClass) => {
    // Implementar la lógica para ejecutar la clase
    console.log("Ejecutando clase:", plannedClass);
  };

  // Add sample multi-timer exercise to routines
  useEffect(() => {
    if (routines.length === 0) {
      const sampleRoutine = {
        id: 'routine_sample',
        name: 'Rutina con Ejercicio Multifase',
        description: 'Ejemplo de rutina con ejercicio de timers múltiples',
        objective: 'Demostrar el sistema de timers multifase',
        exercises: [sampleMultiTimerExercise],
        categories: ['1', '3'],
        materials: [],
        protection: [],
        totalDuration: 30,
        difficulty: 'intermediate',
        visibility: 'private',
        isTemplate: false,
        isFavorite: true,
        trainerNotes: 'Esta rutina muestra el nuevo sistema de timers multifase',
        createdAt: new Date(),
        updatedAt: new Date(),
        blockStructure: {
          blocks: [
            {
              id: 'block_sample',
              name: 'Bloque de Ejemplo',
              description: 'Bloque con ejercicio multifase',
              color: '#3B82F6',
              exercises: [sampleMultiTimerExercise],
              notes: 'Este bloque contiene un ejercicio con timers personalizados',
              advancedNotes: null,
              categories: ['1', '3'],
              estimatedDuration: 30,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]
        },
        tags: ['1', '3']
      };
      
      setRoutines([sampleRoutine]);
    }
  }, []);

  // Si el usuario no está autenticado, mostrar formulario de login
  if (showLoginForm) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-enigma-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center mb-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enigma Boxing Club</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Sistema de Gestión</p>
          </div>
          <LoginForm onLoginSuccess={() => setShowLoginForm(false)} />
        </div>
      </div>
    );
  }

  // Si es el primer inicio de sesión, mostrar configuración inicial
  if (showFirstLoginSetup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-enigma-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center mb-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enigma Boxing Club</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Completa tu configuración</p>
          </div>
          <FirstLoginSetup onSetupComplete={() => setShowFirstLoginSetup(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-enigma-dark transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-dark-surface shadow-sm border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <img 
                src="/Logo-Enigma-Full-Color-Icono-Redes-Fondo-Negro.jpg" 
                alt="Enigma Boxing Club" 
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Enigma Boxing Club
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sistema de Gestión
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.email
                    }
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.role === 'admin' ? 'Administrador' : 
                     user.role === 'trainer' ? 'Entrenador' : 'Alumno'}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Perfil" className="h-8 w-8 rounded-full" />
                  ) : (
                    <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
              </div>
            )}
            <button
              onClick={() => setShowThemeSelector(true)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-lg transition-colors"
              title="Cambiar tema"
            >
              {actualTheme === 'dark' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Bienvenido al Sistema de Gestión
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona rutinas, estudiantes y entrenamientos de forma profesional
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <button
              onClick={() => setShowRoutineManager(true)}
              className="p-6 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md dark:hover:shadow-dark transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                  <Dumbbell className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Rutinas
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gestionar rutinas
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowClassPlanner(true)}
              className="p-6 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md dark:hover:shadow-dark transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                  <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Clases
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Planificar clases
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowStudentManager(true)}
              className="p-6 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md dark:hover:shadow-dark transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Estudiantes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gestionar estudiantes
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowGoalsManager(true)}
              className="p-6 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md dark:hover:shadow-dark transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Objetivos
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gestionar objetivos
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Second Row of Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <button
              onClick={() => setShowAchievementsManager(true)}
              className="p-6 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md dark:hover:shadow-dark transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition-colors">
                  <BarChart3 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Logros
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ver logros y progreso
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowTaskManager(true)}
              className="p-6 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md dark:hover:shadow-dark transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                  <CheckSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Tareas
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gestionar tareas
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowVideoLibrary(true)}
              className="p-6 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md dark:hover:shadow-dark transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center group-hover:bg-pink-200 dark:group-hover:bg-pink-900/50 transition-colors">
                  <Video className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Videos
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Biblioteca audiovisual
                  </p>
                </div>
              </div>
            </button>

            {user && user.role === 'admin' && (
              <button
                onClick={() => setShowUserManager(true)}
                className="p-6 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border hover:shadow-md dark:hover:shadow-dark transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                    <UserPlus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Usuarios
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Gestionar usuarios
                    </p>
                  </div>
                </div>
              </button>
            )}

            {/* New Multi-Timer Feature Highlight */}
            {!user || user.role !== 'admin' ? (
              <div className="p-6 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-sm border border-red-400 text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Timer className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white">
                      ¡Nuevo! Timers Multifase
                    </h3>
                    <p className="text-sm text-white/80">
                      Crea ejercicios con secuencias de timers personalizados
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-white/90">
                  Ahora disponible en el editor de rutinas
                </div>
              </div>
            ) : null}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Rutinas Creadas
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {routines.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Clases Programadas
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {plannedClasses.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Videos Disponibles
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {videos.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                  <Video className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative w-64 bg-white dark:bg-dark-surface shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-dark-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/Logo-Enigma-Full-Color-Icono-Redes-Fondo-Negro.jpg" 
                    alt="Enigma Boxing Club" 
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">Enigma</h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Boxing Club</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-2">
                {menuItems
                  .filter(item => !item.adminOnly || (user && user.role === 'admin'))
                  .map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => {
                            setActiveSection(item.id);
                            setIsSidebarOpen(false);
                            
                            // Open corresponding managers
                            if (item.id === 'routines') setShowRoutineManager(true);
                            if (item.id === 'goals') setShowGoalsManager(true);
                            if (item.id === 'classes') setShowClassPlanner(true);
                            if (item.id === 'students') setShowStudentManager(true);
                            if (item.id === 'videos') setShowVideoLibrary(true);
                            if (item.id === 'users') setShowUserManager(true);
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                            activeSection === item.id
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-elevated'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span>{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                
                {/* Logout Button */}
                <li className="pt-4 mt-4 border-t border-gray-200 dark:border-dark-border">
                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-elevated"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Cerrar Sesión</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Routine Manager */}
      <RoutineManager
        routines={routines}
        availableCategories={categories}
        students={students}
        onCreateRoutine={handleCreateRoutine}
        onUpdateRoutine={handleUpdateRoutine}
        onDeleteRoutine={handleDeleteRoutine}
        onDuplicateRoutine={handleDuplicateRoutine}
        isOpen={showRoutineManager}
        onClose={() => setShowRoutineManager(false)}
      />

      {/* Class Planner */}
      <ClassPlanner
        plannedClasses={plannedClasses}
        availableTags={categories}
        routines={routines}
        onCreateClass={handleCreateClass}
        onUpdateClass={handleUpdateClass}
        onDeleteClass={handleDeleteClass}
        onDuplicateClass={handleDuplicateClass}
        onRunClass={handleRunClass}
        isOpen={showClassPlanner}
        onClose={() => setShowClassPlanner(false)}
      />

      {/* Student Manager */}
      <StudentManager
        students={students}
        onCreateStudent={handleCreateStudent}
        onUpdateStudent={handleUpdateStudent}
        onDeleteStudent={handleDeleteStudent}
        sparringSessions={[]}
        onCreateSparringSession={() => {}}
        isOpen={showStudentManager}
        onClose={() => setShowStudentManager(false)}
        tasks={tasks}
        onAddTask={handleCreateTask}
        onCompleteTask={handleCompleteTask}
      />

      {/* Task Manager */}
      <StudentTaskManager
        tasks={tasks}
        students={students}
        onCreateTask={handleCreateTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onCompleteTask={handleCompleteTask}
        isOpen={showTaskManager}
        onClose={() => setShowTaskManager(false)}
      />

      {/* Goals Manager */}
      <GoalsManager
        goals={goals}
        workTypes={workTypes}
        goalProgress={goalProgress}
        onCreateGoal={handleCreateGoal}
        onUpdateGoal={handleUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
        onCreateWorkType={handleCreateWorkType}
        onUpdateWorkType={handleUpdateWorkType}
        onDeleteWorkType={handleDeleteWorkType}
        isOpen={showGoalsManager}
        onClose={() => setShowGoalsManager(false)}
      />

      {/* Weekly Planner */}
      <WeeklyPlanner
        weekPlans={weekPlans}
        workTypes={workTypes}
        onCreateWeekPlan={handleCreateWeekPlan}
        onUpdateWeekPlan={handleUpdateWeekPlan}
        onDeleteWeekPlan={handleDeleteWeekPlan}
        onDuplicateWeekPlan={handleDuplicateWeekPlan}
        isOpen={showWeeklyPlanner}
        onClose={() => setShowWeeklyPlanner(false)}
      />

      {/* Achievements Manager */}
      <AchievementsManager
        achievements={achievements}
        students={students}
        workTypes={workTypes}
        isOpen={showAchievementsManager}
        onClose={() => setShowAchievementsManager(false)}
        onExportAchievements={() => console.log('Exporting achievements...')}
      />

      {/* Video Library */}
      <VideoLibrary
        videos={videos}
        students={students}
        currentUserId="trainer1" // In a real app, this would come from auth
        isTrainer={true} // In a real app, this would be determined by user role
        onAddVideo={handleAddVideo}
        onUpdateVideo={handleUpdateVideo}
        onDeleteVideo={handleDeleteVideo}
        onAddNote={handleAddVideoNote}
        onDeleteNote={handleDeleteVideoNote}
        isOpen={showVideoLibrary}
        onClose={() => setShowVideoLibrary(false)}
      />

      {/* User Manager */}
      <UserManager
        isOpen={showUserManager}
        onClose={() => setShowUserManager(false)}
      />

      {/* Theme Selector Modal */}
      <ThemeSelector
        isOpen={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;