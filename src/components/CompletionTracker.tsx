import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Clock, Users, Target, Calendar, 
  TrendingUp, BarChart3, Award, AlertCircle,
  Play, Pause, Square, Save, X
} from 'lucide-react';
import { RoutineCompletion, BlockCompletion, ExerciseCompletion, WorkType } from '../types/RoutineTypes';
import { StudentProfile } from './StudentProfile';

interface CompletionTrackerProps {
  routine: any;
  attendees: StudentProfile[];
  onComplete: (completion: Omit<RoutineCompletion, 'id'>) => void;
  isOpen: boolean;
  onClose: () => void;
  isMorningSession?: boolean;
  isAfternoonSession?: boolean;
}

interface TrackingState {
  startTime: Date;
  currentBlockIndex: number;
  currentExerciseIndex: number;
  isTracking: boolean;
  isPaused: boolean;
  pausedTime: number; // accumulated paused time in ms
  blockCompletions: BlockCompletion[];
  exerciseCompletions: ExerciseCompletion[];
  sessionNotes: string;
  sessionRating: 1 | 2 | 3 | 4 | 5;
}

const CompletionTracker: React.FC<CompletionTrackerProps> = ({
  routine,
  attendees,
  onComplete,
  isOpen,
  onClose,
  isMorningSession = false,
  isAfternoonSession = false
}) => {
  const [trackingState, setTrackingState] = useState<TrackingState>({
    startTime: new Date(),
    currentBlockIndex: 0,
    currentExerciseIndex: 0,
    isTracking: false,
    isPaused: false,
    pausedTime: 0,
    blockCompletions: [],
    exerciseCompletions: [],
    sessionNotes: '',
    sessionRating: 3
  });

  const [currentBlockStartTime, setCurrentBlockStartTime] = useState<Date | null>(null);
  const [currentExerciseStartTime, setCurrentExerciseStartTime] = useState<Date | null>(null);

  const blocks = routine.blockStructure?.blocks || [];
  const currentBlock = blocks[trackingState.currentBlockIndex];
  const currentExercise = currentBlock?.exercises[trackingState.currentExerciseIndex];

  const getWorkType = (exercise: any): WorkType => {
    // Determine work type based on exercise category and tags
    if (exercise.category === 'sparring') return 'sparring';
    if (exercise.category === 'cardio') return 'cardio';
    if (exercise.category === 'strength') return 'strength';
    if (exercise.category === 'flexibility') return 'flexibility';
    if (exercise.category === 'technique') return 'technique';
    
    // Check tags for more specific classification
    const tags = exercise.tags || [];
    if (tags.some((tag: string) => tag.toLowerCase().includes('coordinación'))) return 'coordination';
    if (tags.some((tag: string) => tag.toLowerCase().includes('reacción'))) return 'reaction';
    if (tags.some((tag: string) => tag.toLowerCase().includes('acondicionamiento'))) return 'conditioning';
    
    return 'technique'; // default
  };

  const handleStartTracking = () => {
    const now = new Date();
    setTrackingState(prev => ({
      ...prev,
      isTracking: true,
      isPaused: false,
      startTime: now
    }));
    setCurrentBlockStartTime(now);
    setCurrentExerciseStartTime(now);
  };

  const handlePauseTracking = () => {
    setTrackingState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  };

  const handleCompleteExercise = () => {
    if (!currentExercise || !currentExerciseStartTime) return;

    const now = new Date();
    const duration = Math.round((now.getTime() - currentExerciseStartTime.getTime()) / 1000 / 60); // minutes

    const exerciseCompletion: ExerciseCompletion = {
      exerciseId: currentExercise.id,
      exerciseName: currentExercise.name,
      category: currentExercise.category || 'technique',
      tags: currentExercise.tags || [],
      workType: getWorkType(currentExercise),
      startTime: currentExerciseStartTime,
      endTime: now,
      duration,
      intensity: currentExercise.intensity || 'medium',
      completed: true,
      notes: ''
    };

    setTrackingState(prev => ({
      ...prev,
      exerciseCompletions: [...prev.exerciseCompletions, exerciseCompletion]
    }));

    // Move to next exercise or block
    if (trackingState.currentExerciseIndex < currentBlock.exercises.length - 1) {
      setTrackingState(prev => ({
        ...prev,
        currentExerciseIndex: prev.currentExerciseIndex + 1
      }));
      setCurrentExerciseStartTime(now);
    } else {
      handleCompleteBlock();
    }
  };

  const handleCompleteBlock = () => {
    if (!currentBlock || !currentBlockStartTime) return;

    const now = new Date();
    const blockExercises = trackingState.exerciseCompletions.filter(ex => 
      currentBlock.exercises.some((blockEx: any) => blockEx.id === ex.exerciseId)
    );

    const blockCompletion: BlockCompletion = {
      blockId: currentBlock.id,
      blockName: currentBlock.name,
      startTime: currentBlockStartTime,
      endTime: now,
      duration: Math.round((now.getTime() - currentBlockStartTime.getTime()) / 1000 / 60),
      exercises: blockExercises
    };

    setTrackingState(prev => ({
      ...prev,
      blockCompletions: [...prev.blockCompletions, blockCompletion]
    }));

    // Move to next block
    if (trackingState.currentBlockIndex < blocks.length - 1) {
      setTrackingState(prev => ({
        ...prev,
        currentBlockIndex: prev.currentBlockIndex + 1,
        currentExerciseIndex: 0
      }));
      setCurrentBlockStartTime(now);
      setCurrentExerciseStartTime(now);
    } else {
      handleCompleteSession();
    }
  };

  const handleCompleteSession = () => {
    const now = new Date();
    const totalDuration = Math.round((now.getTime() - trackingState.startTime.getTime() - trackingState.pausedTime) / 1000 / 60);

    const completion: Omit<RoutineCompletion, 'id'> = {
      routineId: routine.id,
      routineName: routine.name,
      categoryId: routine.categoryId,
      categoryName: routine.categoryName,
      completedAt: now,
      duration: totalDuration,
      attendees: attendees.map(student => student.id),
      blocks: trackingState.blockCompletions,
      exercises: trackingState.exerciseCompletions,
      notes: trackingState.sessionNotes,
      rating: trackingState.sessionRating,
      morningSession: isMorningSession,
      afternoonSession: isAfternoonSession,
      isFullDayComplete: false // Will be calculated by the parent component
    };

    onComplete(completion);
    onClose();
  };

  const getSessionProgress = () => {
    const totalExercises = blocks.reduce((total: number, block: any) => total + block.exercises.length, 0);
    const completedExercises = trackingState.exerciseCompletions.length;
    return totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
  };

  const getElapsedTime = () => {
    if (!trackingState.isTracking) return 0;
    const now = new Date();
    return Math.round((now.getTime() - trackingState.startTime.getTime() - trackingState.pausedTime) / 1000 / 60);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="pr-12">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Seguimiento de Sesión</h1>
                <p className="text-green-100">Registra el progreso y completación de la rutina</p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>{routine.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{attendees.length} participante{attendees.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(getElapsedTime())}</span>
              </div>
              {(isMorningSession || isAfternoonSession) && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{isMorningSession ? 'Sesión Matutina' : 'Sesión Vespertina'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Progress Overview */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Progreso de la Sesión</h3>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(getSessionProgress())}% completado
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getSessionProgress()}%` }}
              />
            </div>
          </div>

          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-900 dark:text-blue-100">Bloque Actual</span>
              </div>
              <div className="text-blue-600 dark:text-blue-300">
                {currentBlock ? `${trackingState.currentBlockIndex + 1}. ${currentBlock.name}` : 'Completado'}
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-900 dark:text-green-100">Ejercicio Actual</span>
              </div>
              <div className="text-green-600 dark:text-green-300">
                {currentExercise ? `${trackingState.currentExerciseIndex + 1}. ${currentExercise.name}` : 'Completado'}
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-purple-900 dark:text-purple-100">Tiempo Transcurrido</span>
              </div>
              <div className="text-purple-600 dark:text-purple-300">
                {formatDuration(getElapsedTime())}
              </div>
            </div>
          </div>

          {/* Attendees */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Participantes de la Sesión</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {attendees.map((student) => (
                <div key={student.id} className="p-3 bg-gray-50 dark:bg-dark-elevated rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {student.firstName} {student.lastName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {student.level}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            {!trackingState.isTracking ? (
              <button
                onClick={handleStartTracking}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Iniciar Seguimiento</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handlePauseTracking}
                  className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 ${
                    trackingState.isPaused 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  {trackingState.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  <span>{trackingState.isPaused ? 'Reanudar' : 'Pausar'}</span>
                </button>

                {currentExercise && (
                  <button
                    onClick={handleCompleteExercise}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Completar Ejercicio</span>
                  </button>
                )}

                <button
                  onClick={handleCompleteSession}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Square className="w-4 h-4" />
                  <span>Finalizar Sesión</span>
                </button>
              </>
            )}
          </div>

          {/* Session Notes and Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notas de la Sesión
              </label>
              <textarea
                value={trackingState.sessionNotes}
                onChange={(e) => setTrackingState(prev => ({ ...prev, sessionNotes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-dark-elevated dark:text-white"
                rows={4}
                placeholder="Observaciones sobre la sesión, rendimiento de los estudiantes, ajustes realizados..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Calificación de la Sesión
              </label>
              <div className="flex space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setTrackingState(prev => ({ ...prev, sessionRating: rating as any }))}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      trackingState.sessionRating >= rating
                        ? 'border-yellow-500 bg-yellow-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-400 hover:border-yellow-400'
                    }`}
                  >
                    <Award className="w-5 h-5 mx-auto" />
                  </button>
                ))}
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {trackingState.sessionRating === 1 && 'Muy deficiente - Muchos problemas'}
                {trackingState.sessionRating === 2 && 'Deficiente - Algunos problemas importantes'}
                {trackingState.sessionRating === 3 && 'Regular - Sesión estándar'}
                {trackingState.sessionRating === 4 && 'Buena - Sesión exitosa'}
                {trackingState.sessionRating === 5 && 'Excelente - Sesión excepcional'}
              </div>
            </div>
          </div>

          {/* Completed Exercises Summary */}
          {trackingState.exerciseCompletions.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Ejercicios Completados ({trackingState.exerciseCompletions.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {trackingState.exerciseCompletions.map((exercise, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{exercise.exerciseName}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">({exercise.workType})</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDuration(exercise.duration)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletionTracker;