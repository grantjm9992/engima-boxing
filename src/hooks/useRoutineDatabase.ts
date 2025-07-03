import { useState, useEffect } from 'react';
import { 
  RoutineCompletion, 
  DailyStats, 
  StudentAttendanceStats, 
  CategoryStats 
} from '../types/RoutineTypes';
import { Category } from '../components/CategoryManager';
import { PlannedClass } from '../types/ClassTypes';
import { notionService } from '../services/NotionService';

interface RoutineDatabaseState {
  categories: Category[];
  completions: RoutineCompletion[];
  plannedClasses: PlannedClass[];
  categoryUsageData: {
    categoryId: string;
    timestamp: Date;
    duration: number;
    level: string;
  }[];
  isLoading: boolean;
  error: string | null;
}

export const useRoutineDatabase = () => {
  const [state, setState] = useState<RoutineDatabaseState>({
    categories: [],
    completions: [],
    plannedClasses: [],
    categoryUsageData: [],
    isLoading: false,
    error: null
  });

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedCategories = localStorage.getItem('enigma-categories');
      const savedCompletions = localStorage.getItem('enigma-routine-completions');
      const savedCategoryUsage = localStorage.getItem('enigma-category-usage');
      const savedPlannedClasses = localStorage.getItem('enigma-planned-classes');

      setState(prev => ({
        ...prev,
        categories: savedCategories ? JSON.parse(savedCategories).map((cat: any) => ({
          ...cat,
          createdAt: new Date(cat.createdAt)
        })) : [],
        completions: savedCompletions ? JSON.parse(savedCompletions).map((comp: any) => ({
          ...comp,
          completedAt: new Date(comp.completedAt),
          blocks: comp.blocks.map((block: any) => ({
            ...block,
            startTime: new Date(block.startTime),
            endTime: new Date(block.endTime),
            exercises: block.exercises.map((ex: any) => ({
              ...ex,
              startTime: new Date(ex.startTime),
              endTime: new Date(ex.endTime)
            }))
          })),
          exercises: comp.exercises.map((ex: any) => ({
            ...ex,
            startTime: new Date(ex.startTime),
            endTime: new Date(ex.endTime)
          }))
        })) : [],
        plannedClasses: savedPlannedClasses ? JSON.parse(savedPlannedClasses).map((cls: any) => ({
          ...cls,
          createdAt: new Date(cls.createdAt),
          updatedAt: new Date(cls.updatedAt)
        })) : [],
        categoryUsageData: savedCategoryUsage ? JSON.parse(savedCategoryUsage).map((usage: any) => ({
          ...usage,
          timestamp: new Date(usage.timestamp)
        })) : []
      }));
    } catch (error) {
      console.error('Error loading routine database:', error);
      setState(prev => ({ ...prev, error: 'Error loading data' }));
    }
  }, []);

  // Save categories to localStorage
  const saveCategories = (categories: Category[]) => {
    try {
      localStorage.setItem('enigma-categories', JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  };

  // Save completions to localStorage
  const saveCompletions = (completions: RoutineCompletion[]) => {
    try {
      localStorage.setItem('enigma-routine-completions', JSON.stringify(completions));
    } catch (error) {
      console.error('Error saving completions:', error);
    }
  };

  // Save planned classes to localStorage
  const savePlannedClasses = (classes: PlannedClass[]) => {
    try {
      localStorage.setItem('enigma-planned-classes', JSON.stringify(classes));
    } catch (error) {
      console.error('Error saving planned classes:', error);
    }
  };

  // Save category usage data to localStorage
  const saveCategoryUsageData = (data: any[]) => {
    try {
      localStorage.setItem('enigma-category-usage', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving category usage data:', error);
    }
  };

  // Category management
  const createCategory = (categoryData: Omit<Category, 'id' | 'createdAt'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: `category_${Date.now()}`,
      createdAt: new Date()
    };

    const updatedCategories = [...state.categories, newCategory];
    setState(prev => ({ ...prev, categories: updatedCategories }));
    saveCategories(updatedCategories);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const updatedCategories = state.categories.map(category =>
      category.id === id 
        ? { ...category, ...updates }
        : category
    );
    setState(prev => ({ ...prev, categories: updatedCategories }));
    saveCategories(updatedCategories);
  };

  const deleteCategory = (id: string) => {
    const updatedCategories = state.categories.filter(category => category.id !== id);
    setState(prev => ({ ...prev, categories: updatedCategories }));
    saveCategories(updatedCategories);
  };

  // Planned Classes management
  const createPlannedClass = async (classData: Omit<PlannedClass, 'id' | 'createdAt' | 'updatedAt' | 'notionPageId'>) => {
    const now = new Date();
    let notionPageId: string | undefined = undefined;
    
    // Sincronizar con Notion si está configurado
    if (notionService.isConfigured()) {
      const pageId = await notionService.createClassEntry({
        title: classData.title,
        date: classData.date,
        tags: classData.tags,
        totalDuration: classData.totalDuration,
        objective: classData.objective,
        notes: classData.notes,
        blocks: classData.blocks
      });
      
      if (pageId) {
        notionPageId = pageId;
      }
    }
    
    const newClass: PlannedClass = {
      ...classData,
      id: `class_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      notionPageId
    };

    const updatedClasses = [...state.plannedClasses, newClass];
    setState(prev => ({ ...prev, plannedClasses: updatedClasses }));
    savePlannedClasses(updatedClasses);
    
    return newClass;
  };

  const updatePlannedClass = async (id: string, updates: Partial<PlannedClass>) => {
    const classToUpdate = state.plannedClasses.find(cls => cls.id === id);
    if (!classToUpdate) return;
    
    const updatedClass = {
      ...classToUpdate,
      ...updates,
      updatedAt: new Date()
    };
    
    // Sincronizar con Notion si está configurado y ya existe en Notion
    if (notionService.isConfigured() && updatedClass.notionPageId) {
      await notionService.updateClassEntry(
        updatedClass.notionPageId,
        {
          title: updatedClass.title,
          date: updatedClass.date,
          tags: updatedClass.tags,
          totalDuration: updatedClass.totalDuration,
          objective: updatedClass.objective,
          notes: updatedClass.notes,
          blocks: updatedClass.blocks
        }
      );
    }
    
    const updatedClasses = state.plannedClasses.map(cls =>
      cls.id === id ? updatedClass : cls
    );
    
    setState(prev => ({ ...prev, plannedClasses: updatedClasses }));
    savePlannedClasses(updatedClasses);
  };

  const deletePlannedClass = async (id: string) => {
    const classToDelete = state.plannedClasses.find(cls => cls.id === id);
    
    // Eliminar de Notion si está configurado y existe en Notion
    if (classToDelete?.notionPageId && notionService.isConfigured()) {
      await notionService.deleteClassEntry(classToDelete.notionPageId);
    }
    
    const updatedClasses = state.plannedClasses.filter(cls => cls.id !== id);
    setState(prev => ({ ...prev, plannedClasses: updatedClasses }));
    savePlannedClasses(updatedClasses);
  };

  const duplicatePlannedClass = async (id: string, newDate?: string) => {
    const classToDuplicate = state.plannedClasses.find(cls => cls.id === id);
    if (!classToDuplicate) return;
    
    const now = new Date();
    const newClass: Omit<PlannedClass, 'id' | 'createdAt' | 'updatedAt' | 'notionPageId'> = {
      title: `${classToDuplicate.title} (Copia)`,
      date: newDate || classToDuplicate.date,
      tags: [...classToDuplicate.tags],
      totalDuration: classToDuplicate.totalDuration,
      blocks: JSON.parse(JSON.stringify(classToDuplicate.blocks)), // Deep copy
      objective: classToDuplicate.objective,
      notes: classToDuplicate.notes
    };
    
    return await createPlannedClass(newClass);
  };

  // Track category usage
  const trackCategoryUsage = (categoryId: string, duration: number, level: string = 'intermediate') => {
    const newUsageData = [
      ...state.categoryUsageData,
      {
        categoryId,
        timestamp: new Date(),
        duration,
        level
      }
    ];
    
    setState(prev => ({ ...prev, categoryUsageData: newUsageData }));
    saveCategoryUsageData(newUsageData);
  };

  // Completion management
  const addCompletion = (completionData: Omit<RoutineCompletion, 'id'>) => {
    const newCompletion: RoutineCompletion = {
      ...completionData,
      id: `completion_${Date.now()}`
    };

    // Check if this completes a full day (both morning and afternoon)
    const sameDay = state.completions.filter(comp => {
      const compDate = comp.completedAt.toDateString();
      const newDate = newCompletion.completedAt.toDateString();
      return compDate === newDate;
    });

    const hasMorning = sameDay.some(comp => comp.morningSession) || newCompletion.morningSession;
    const hasAfternoon = sameDay.some(comp => comp.afternoonSession) || newCompletion.afternoonSession;
    
    if (hasMorning && hasAfternoon) {
      newCompletion.isFullDayComplete = true;
      // Update existing completions for the same day
      const updatedCompletions = state.completions.map(comp => {
        const compDate = comp.completedAt.toDateString();
        const newDate = newCompletion.completedAt.toDateString();
        return compDate === newDate ? { ...comp, isFullDayComplete: true } : comp;
      });
      setState(prev => ({ ...prev, completions: [...updatedCompletions, newCompletion] }));
      saveCompletions([...updatedCompletions, newCompletion]);
    } else {
      const updatedCompletions = [...state.completions, newCompletion];
      setState(prev => ({ ...prev, completions: updatedCompletions }));
      saveCompletions(updatedCompletions);
    }

    // Track category usage for each exercise
    newCompletion.exercises.forEach(exercise => {
      if (exercise.tags && exercise.tags.length > 0) {
        exercise.tags.forEach(tag => {
          trackCategoryUsage(tag, exercise.duration, 'intermediate');
        });
      }
    });
  };

  const deleteCompletion = (id: string) => {
    const updatedCompletions = state.completions.filter(completion => completion.id !== id);
    setState(prev => ({ ...prev, completions: updatedCompletions }));
    saveCompletions(updatedCompletions);
  };

  // Analytics functions
  const getDailyStats = (startDate: Date, endDate: Date): DailyStats[] => {
    const filteredCompletions = state.completions.filter(completion => {
      const completionDate = new Date(completion.completedAt);
      return completionDate >= startDate && completionDate <= endDate;
    });

    const statsMap = new Map<string, DailyStats>();
    
    filteredCompletions.forEach(completion => {
      const dateKey = completion.completedAt.toISOString().split('T')[0];
      
      if (!statsMap.has(dateKey)) {
        statsMap.set(dateKey, {
          date: new Date(dateKey),
          totalDuration: 0,
          workTypeBreakdown: {
            strength: 0,
            coordination: 0,
            reaction: 0,
            technique: 0,
            cardio: 0,
            flexibility: 0,
            sparring: 0,
            conditioning: 0
          },
          attendanceByStudent: {},
          completedRoutines: [],
          morningCompleted: false,
          afternoonCompleted: false,
          fullDayCompleted: false
        });
      }
      
      const dayStats = statsMap.get(dateKey)!;
      dayStats.totalDuration += completion.duration;
      dayStats.completedRoutines.push(completion.routineId);
      
      if (completion.morningSession) dayStats.morningCompleted = true;
      if (completion.afternoonSession) dayStats.afternoonCompleted = true;
      dayStats.fullDayCompleted = dayStats.morningCompleted && dayStats.afternoonCompleted;
      
      // Calculate work type breakdown
      const totalExerciseTime = completion.exercises.reduce((sum, ex) => sum + ex.duration, 0);
      completion.exercises.forEach(exercise => {
        const percentage = totalExerciseTime > 0 ? (exercise.duration / totalExerciseTime) * 100 : 0;
        dayStats.workTypeBreakdown[exercise.workType] += percentage;
      });
      
      // Track attendance
      completion.attendees.forEach(studentId => {
        dayStats.attendanceByStudent[studentId] = (dayStats.attendanceByStudent[studentId] || 0) + completion.duration;
      });
    });
    
    return Array.from(statsMap.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const getStudentStats = (studentIds: string[]): StudentAttendanceStats[] => {
    const statsMap = new Map<string, StudentAttendanceStats>();
    
    studentIds.forEach(studentId => {
      statsMap.set(studentId, {
        studentId,
        studentName: '', // Will be filled by the component
        totalSessions: 0,
        totalMinutes: 0,
        categoryBreakdown: {},
        workTypeBreakdown: {
          strength: 0,
          coordination: 0,
          reaction: 0,
          technique: 0,
          cardio: 0,
          flexibility: 0,
          sparring: 0,
          conditioning: 0
        },
        averageRating: 0,
        lastSession: new Date(0),
        consistency: 0
      });
    });
    
    state.completions.forEach(completion => {
      completion.attendees.forEach(studentId => {
        const stats = statsMap.get(studentId);
        if (stats) {
          stats.totalSessions++;
          stats.totalMinutes += completion.duration;
          
          // Calculate work type breakdown
          const totalExerciseTime = completion.exercises.reduce((sum, ex) => sum + ex.duration, 0);
          completion.exercises.forEach(exercise => {
            const percentage = totalExerciseTime > 0 ? (exercise.duration / totalExerciseTime) : 0;
            stats.workTypeBreakdown[exercise.workType] += percentage;
          });
          
          if (completion.rating) {
            stats.averageRating = (stats.averageRating * (stats.totalSessions - 1) + completion.rating) / stats.totalSessions;
          }
          
          if (completion.completedAt > stats.lastSession) {
            stats.lastSession = completion.completedAt;
          }
        }
      });
    });
    
    return Array.from(statsMap.values()).filter(stats => stats.totalSessions > 0);
  };

  const getCategoryStats = (): CategoryStats[] => {
    const statsMap = new Map<string, CategoryStats>();
    
    state.completions.forEach(completion => {
      completion.exercises.forEach(exercise => {
        if (exercise.tags && exercise.tags.length > 0) {
          exercise.tags.forEach(tag => {
            if (!statsMap.has(tag)) {
              statsMap.set(tag, {
                categoryId: tag,
                categoryName: state.categories.find(c => c.id === tag)?.name || 'Desconocida',
                totalSessions: 0,
                totalMinutes: 0,
                averageRating: 0,
                studentParticipation: {},
                workTypeDistribution: {
                  strength: 0,
                  coordination: 0,
                  reaction: 0,
                  technique: 0,
                  cardio: 0,
                  flexibility: 0,
                  sparring: 0,
                  conditioning: 0
                },
                trendsOverTime: []
              });
            }
            
            const stats = statsMap.get(tag)!;
            stats.totalSessions++;
            stats.totalMinutes += exercise.duration;
            
            if (completion.rating) {
              stats.averageRating = (stats.averageRating * (stats.totalSessions - 1) + completion.rating) / stats.totalSessions;
            }
            
            completion.attendees.forEach(studentId => {
              stats.studentParticipation[studentId] = (stats.studentParticipation[studentId] || 0) + exercise.duration;
            });
            
            stats.workTypeDistribution[exercise.workType] += exercise.duration;
          });
        }
      });
    });
    
    return Array.from(statsMap.values());
  };

  // Export functionality
  const exportData = () => {
    const data = {
      categories: state.categories,
      completions: state.completions,
      plannedClasses: state.plannedClasses,
      categoryUsageData: state.categoryUsageData,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enigma-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    // State
    categories: state.categories,
    completions: state.completions,
    plannedClasses: state.plannedClasses,
    categoryUsageData: state.categoryUsageData,
    isLoading: state.isLoading,
    error: state.error,

    // Category management
    createCategory,
    updateCategory,
    deleteCategory,
    trackCategoryUsage,

    // Planned Classes management
    createPlannedClass,
    updatePlannedClass,
    deletePlannedClass,
    duplicatePlannedClass,

    // Completion management
    addCompletion,
    deleteCompletion,

    // Analytics
    getDailyStats,
    getStudentStats,
    getCategoryStats,

    // Export
    exportData
  };
};