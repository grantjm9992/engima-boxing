export interface RoutineCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  type: 'phase' | 'period' | 'load-type' | 'custom';
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutineCompletion {
  id: string;
  routineId: string;
  routineName: string;
  categoryId?: string;
  categoryName?: string;
  completedAt: Date;
  duration: number; // actual duration in minutes
  attendees: string[]; // student IDs
  blocks: BlockCompletion[];
  exercises: ExerciseCompletion[];
  notes?: string;
  rating?: 1 | 2 | 3 | 4 | 5; // session rating
  morningSession?: boolean;
  afternoonSession?: boolean;
  isFullDayComplete?: boolean;
}

export interface BlockCompletion {
  blockId: string;
  blockName: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  exercises: ExerciseCompletion[];
}

export interface ExerciseCompletion {
  exerciseId: string;
  exerciseName: string;
  category: string;
  tags: string[];
  workType: WorkType;
  startTime: Date;
  endTime: Date;
  duration: number; // actual execution time in minutes
  intensity: 'low' | 'medium' | 'high';
  completed: boolean;
  notes?: string;
}

export type WorkType = 
  | 'strength' 
  | 'coordination' 
  | 'reaction' 
  | 'technique' 
  | 'cardio' 
  | 'flexibility' 
  | 'sparring' 
  | 'conditioning';

export interface DailyStats {
  date: Date;
  totalDuration: number;
  workTypeBreakdown: Record<WorkType, number>; // percentage
  attendanceByStudent: Record<string, number>; // minutes trained
  completedRoutines: string[];
  morningCompleted: boolean;
  afternoonCompleted: boolean;
  fullDayCompleted: boolean;
}

export interface StudentAttendanceStats {
  studentId: string;
  studentName: string;
  totalSessions: number;
  totalMinutes: number;
  categoryBreakdown: Record<string, number>; // minutes per category
  workTypeBreakdown: Record<WorkType, number>; // percentage
  averageRating: number;
  lastSession: Date;
  consistency: number; // percentage based on expected sessions
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  totalSessions: number;
  totalMinutes: number;
  averageRating: number;
  studentParticipation: Record<string, number>; // minutes per student
  workTypeDistribution: Record<WorkType, number>; // percentage
  trendsOverTime: Array<{
    date: Date;
    sessions: number;
    minutes: number;
  }>;
}