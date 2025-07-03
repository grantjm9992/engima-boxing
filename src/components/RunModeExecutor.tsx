import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Square, SkipForward, X, Lock, 
  Clock, Target, Users, AlertTriangle, CheckCircle,
  Eye, Settings, ArrowLeft, Timer, Zap, ChevronRight,
  FileText, Info
} from 'lucide-react';
import { Routine } from './RoutineManager';
import { MultiTimerExercise, CustomTimer } from './MultiTimerExercise';
import TimerPlayback from './TimerPlayback';
import BlockNotesDisplay from './BlockNotesDisplay';

interface Block {
  id: string;
  name: string;
  description: string;
  color: string;
  exercises: (any | MultiTimerExercise)[];
  notes: string;
  isCollapsed: boolean;
}

interface RunModeExecutorProps {
  routine: Routine;
  isOpen: boolean;
  onClose: () => void;
  onExitRunMode: () => void;
}

interface ExecutionState {
  currentBlockIndex: number;
  currentExerciseIndex: number;
  isExecuting: boolean;
  isPaused: boolean;
  executingExercise: any | MultiTimerExercise | null;
  completedBlocks: string[];
  completedExercises: string[];
  currentTimer?: string; // Current timer name for multi-timer exercises
  currentTimerColor?: string; // Current timer color
  currentRepetition?: number; // Current repetition number
}

const RunModeExecutor: React.FC<RunModeExecutorProps> = ({
  routine,
  isOpen,
  onClose,
  onExitRunMode
}) => {
  const [executionState, setExecutionState] = useState<ExecutionState>({
    currentBlockIndex: 0,
    currentExerciseIndex: 0,
    isExecuting: false,
    isPaused: false,
    executingExercise: null,
    completedBlocks: [],
    completedExercises: []
  });

  const [showBlockNotes, setShowBlockNotes] = useState<string | null>(null);
  const [showTimerPlayback, setShowTimerPlayback] = useState(false);

  // Get blocks from routine structure
  const blocks: Block[] = routine.blockStructure?.blocks || [];

  const getCurrentBlock = () => blocks[executionState.currentBlockIndex] || null;
  const getCurrentExercise = () => {
    const currentBlock = getCurrentBlock();
    return currentBlock?.exercises[executionState.currentExerciseIndex] || null;
  };

  const getTotalExercises = () => blocks.reduce((total, block) => total + block.exercises.length, 0);
  const getCompletedExercises = () => executionState.completedExercises.length;
  const getProgressPercentage = () => {
    const total = getTotalExercises();
    const completed = getCompletedExercises();
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${minutes}:00`;
  };

  const handlePlayExercise = (exercise: any | MultiTimerExercise) => {
    setExecutionState(prev => ({
      ...prev,
      isExecuting: true,
      isPaused: false,
      executingExercise: exercise
    }));

    if ('timers' in exercise) {
      setShowTimerPlayback(true);
    }
  };

  const handlePauseExercise = () => {
    setExecutionState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  };

  const handleStopExercise = () => {
    setExecutionState(prev => ({
      ...prev,
      isExecuting: false,
      isPaused: false,
      executingExercise: null,
      currentTimer: undefined,
      currentTimerColor: undefined,
      currentRepetition: undefined
    }));
    setShowTimerPlayback(false);
  };

  const handleExerciseComplete = (exercise: any | MultiTimerExercise) => {
    setExecutionState(prev => ({
      ...prev,
      isExecuting: false,
      isPaused: false,
      executingExercise: null,
      completedExercises: [...prev.completedExercises, exercise.id],
      currentTimer: undefined,
      currentTimerColor: undefined,
      currentRepetition: undefined
    }));
    setShowTimerPlayback(false);
  };

  const handleSkipToNext = () => {
    if (executionState.isExecuting) {
      // Skip current exercise
      if (executionState.executingExercise) {
        handleExerciseComplete(executionState.executingExercise);
      }
    }
    handleNextExercise();
  };

  const handleNextExercise = () => {
    const currentBlock = getCurrentBlock();
    if (!currentBlock) return;

    if (executionState.currentExerciseIndex < currentBlock.exercises.length - 1) {
      setExecutionState(prev => ({
        ...prev,
        currentExerciseIndex: prev.currentExerciseIndex + 1
      }));
    } else if (executionState.currentBlockIndex < blocks.length - 1) {
      setExecutionState(prev => ({
        ...prev,
        currentBlockIndex: prev.currentBlockIndex + 1,
        currentExerciseIndex: 0,
        completedBlocks: [...prev.completedBlocks, currentBlock.id]
      }));
    }
  };

  const handlePreviousExercise = () => {
    if (executionState.currentExerciseIndex > 0) {
      setExecutionState(prev => ({
        ...prev,
        currentExerciseIndex: prev.currentExerciseIndex - 1
      }));
    } else if (executionState.currentBlockIndex > 0) {
      const previousBlock = blocks[executionState.currentBlockIndex - 1];
      setExecutionState(prev => ({
        ...prev,
        currentBlockIndex: prev.currentBlockIndex - 1,
        currentExerciseIndex: previousBlock.exercises.length - 1,
        completedBlocks: prev.completedBlocks.filter(id => id !== previousBlock.id)
      }));
    }
  };

  const isExerciseCompleted = (exerciseId: string) => executionState.completedExercises.includes(exerciseId);
  const isBlockCompleted = (blockId: string) => executionState.completedBlocks.includes(blockId);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          if (executionState.isExecuting) {
            handleStopExercise();
          } else {
            onClose();
          }
          break;
        case ' ':
          e.preventDefault();
          if (executionState.isExecuting) {
            handlePauseExercise();
          } else {
            const currentExercise = getCurrentExercise();
            if (currentExercise) {
              handlePlayExercise(currentExercise);
            }
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSkipToNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePreviousExercise();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, executionState, getCurrentExercise]);

  if (!isOpen) return null;

  const currentBlock = getCurrentBlock();
  const currentExercise = getCurrentExercise();

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="w-full h-full max-w-7xl mx-auto p-4 flex flex-col">
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="pr-12">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <Play className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold">{routine.name}</h1>
                    <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-full">
                      <Lock className="w-4 h-4" />
                      <span className="text-sm font-medium">MODO EJECUCIÓN</span>
                    </div>
                  </div>
                  <p className="text-green-100">Estructura bloqueada para ejecución segura</p>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>{getCompletedExercises()} / {getTotalExercises()} ejercicios</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Módulo {executionState.currentBlockIndex + 1} de {blocks.length}</span>
                </div>
                <div className="w-32 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white dark:bg-dark-surface rounded-b-xl overflow-hidden flex">
            {/* Focus Mode - Current Exercise */}
            <div className="flex-1 p-8 flex flex-col justify-center">
              {currentExercise ? (
                <div className="max-w-2xl mx-auto w-full">
                  {/* Current Block Indicator */}
                  <div 
                    className="p-4 rounded-lg mb-6 text-white"
                    style={{ backgroundColor: currentBlock?.color }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-medium">
                        {executionState.currentBlockIndex + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold">{currentBlock?.name}</h3>
                        <p className="text-sm text-white/80">{currentBlock?.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Current Exercise Display */}
                  <div className="text-center mb-8">
                    <div className="mb-4">
                      <span className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                        <span>Ejercicio {executionState.currentExerciseIndex + 1} de {currentBlock?.exercises.length}</span>
                      </span>
                    </div>
                    
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                      {currentExercise.name}
                    </h2>
                    
                    {currentExercise.description && (
                      <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                        {currentExercise.description}
                      </p>
                    )}

                    {/* Exercise Status */}
                    {executionState.isExecuting && (
                      <div className="mb-6">
                        <div 
                          className="inline-flex items-center space-x-2 px-6 py-3 rounded-full text-white font-medium"
                          style={{ 
                            backgroundColor: executionState.currentTimerColor || '#22C55E',
                            boxShadow: `0 0 20px ${executionState.currentTimerColor || '#22C55E'}40`
                          }}
                        >
                          {executionState.isPaused ? (
                            <>
                              <Pause className="w-5 h-5" />
                              <span>PAUSADO</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-5 h-5" />
                              <span>
                                {executionState.currentTimer || 'EJECUTANDO'}
                                {executionState.currentRepetition && (
                                  <span className="ml-2">({executionState.currentRepetition})</span>
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Exercise Details */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                      {'timers' in currentExercise ? (
                        <>
                          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Timer className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {(currentExercise as MultiTimerExercise).timers.length}
                            </div>
                            <div className="text-sm text-blue-800 dark:text-blue-300">Timers</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {currentExercise.rounds}
                            </div>
                            <div className="text-sm text-purple-800 dark:text-purple-300">Rondas</div>
                          </div>
                          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <Clock className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {formatDuration((currentExercise as MultiTimerExercise).timers.reduce((total, timer) => 
                                total + timer.duration * timer.repetitions, 0
                              ))}
                            </div>
                            <div className="text-sm text-green-800 dark:text-green-300">Duración</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {formatDuration(currentExercise.duration)}
                            </div>
                            <div className="text-sm text-blue-800 dark:text-blue-300">Duración</div>
                          </div>
                          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <Target className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {formatDuration(currentExercise.restTime)}
                            </div>
                            <div className="text-sm text-green-800 dark:text-green-300">Descanso</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {currentExercise.rounds}
                            </div>
                            <div className="text-sm text-purple-800 dark:text-purple-300">Rondas</div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-center space-x-4 mb-6">
                      {!executionState.isExecuting ? (
                        <button
                          onClick={() => handlePlayExercise(currentExercise)}
                          className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg flex items-center space-x-3 text-lg font-medium"
                        >
                          <Play className="w-6 h-6" />
                          <span>Iniciar Ejercicio</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handlePauseExercise}
                            className={`px-6 py-3 text-white rounded-xl transition-colors shadow-lg flex items-center space-x-2 ${
                              executionState.isPaused 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-yellow-600 hover:bg-yellow-700'
                            }`}
                          >
                            {executionState.isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                            <span>{executionState.isPaused ? 'Reanudar' : 'Pausar'}</span>
                          </button>
                          
                          <button
                            onClick={handleStopExercise}
                            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg flex items-center space-x-2"
                          >
                            <Square className="w-5 h-5" />
                            <span>Detener</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={handleSkipToNext}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg flex items-center space-x-2"
                      >
                        <SkipForward className="w-5 h-5" />
                        <span>Siguiente</span>
                      </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={handlePreviousExercise}
                        disabled={executionState.currentBlockIndex === 0 && executionState.currentExerciseIndex === 0}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Anterior</span>
                      </button>
                      
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Ejercicio {executionState.currentExerciseIndex + 1} de {currentBlock?.exercises.length}
                      </span>
                      
                      <button
                        onClick={handleNextExercise}
                        disabled={executionState.currentBlockIndex === blocks.length - 1 && 
                                 executionState.currentExerciseIndex === (currentBlock?.exercises.length || 1) - 1}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <span>Siguiente</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Completion Status */}
                    {isExerciseCompleted(currentExercise.id) && (
                      <div className="mt-6 flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Ejercicio Completado</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Target className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No hay ejercicios</h3>
                  <p>Este módulo no contiene ejercicios</p>
                </div>
              )}
            </div>

            {/* Sidebar - Blocks Overview */}
            <div className="w-80 border-l border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-elevated overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Estructura</h3>
                  <button
                    onClick={onExitRunMode}
                    className="px-3 py-1 text-xs text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-1"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Salir</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {blocks.map((block, blockIndex) => (
                    <div 
                      key={block.id} 
                      className={`border rounded-lg overflow-hidden transition-all ${
                        blockIndex === executionState.currentBlockIndex
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : isBlockCompleted(block.id)
                          ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800'
                          : 'border-gray-200 dark:border-dark-border'
                      }`}
                    >
                      {/* Block Header */}
                      <div 
                        className="p-3 text-white text-sm"
                        style={{ backgroundColor: block.color }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 bg-white/20 rounded text-xs flex items-center justify-center font-medium">
                              {blockIndex + 1}
                            </span>
                            <span className="font-medium">{block.name}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {isBlockCompleted(block.id) && (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            {blockIndex === executionState.currentBlockIndex && (
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </div>

                        {block.notes && (
                          <button
                            onClick={() => setShowBlockNotes(block.id)}
                            className="mt-2 flex items-center space-x-1 text-xs text-white/80 hover:text-white transition-colors"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Ver instrucciones</span>
                          </button>
                        )}
                      </div>

                      {/* Exercises */}
                      <div className="p-2">
                        {block.exercises.map((exercise, exerciseIndex) => (
                          <div 
                            key={exercise.id}
                            className={`p-2 mb-1 rounded text-xs transition-all ${
                              blockIndex === executionState.currentBlockIndex && 
                              exerciseIndex === executionState.currentExerciseIndex
                                ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                                : isExerciseCompleted(exercise.id)
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="w-4 h-4 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs flex items-center justify-center">
                                  {exerciseIndex + 1}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white truncate">
                                  {exercise.name}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                {isExerciseCompleted(exercise.id) && (
                                  <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                                )}
                                {blockIndex === executionState.currentBlockIndex && 
                                 exerciseIndex === executionState.currentExerciseIndex && (
                                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-100 dark:bg-dark-elevated rounded-b-xl border-t border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Lock className="w-4 h-4" />
                  <span>Estructura bloqueada</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Info className="w-4 h-4" />
                  <span>Usa ESPACIO para play/pausa, flechas para navegar</span>
                </div>
              </div>
              
              <div className="text-gray-600 dark:text-gray-400">
                Progreso: {Math.round(getProgressPercentage())}% completado
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Block Notes Modal */}
      {showBlockNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Instrucciones del Módulo
                </h3>
                <button
                  onClick={() => setShowBlockNotes(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {(() => {
                const block = blocks.find(b => b.id === showBlockNotes);
                return block ? (
                  <BlockNotesDisplay
                    blockName={block.name}
                    notes={block.notes}
                    blockColor={block.color}
                    variant="execution"
                  />
                ) : null;
              })()}

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowBlockNotes(null)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timer Playback */}
      {showTimerPlayback && executionState.executingExercise && 'timers' in executionState.executingExercise && (
        <TimerPlayback
          exercise={executionState.executingExercise as MultiTimerExercise}
          isOpen={showTimerPlayback}
          onClose={() => {
            setShowTimerPlayback(false);
            setExecutionState(prev => ({
              ...prev,
              isExecuting: false,
              isPaused: false,
              executingExercise: null
            }));
          }}
          onComplete={() => handleExerciseComplete(executionState.executingExercise!)}
        />
      )}
    </>
  );
};

export default RunModeExecutor;