import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, SkipForward, RotateCcw, Volume2, Repeat } from 'lucide-react';
import { MultiTimerExercise, CustomTimer } from './MultiTimerExercise';

interface TimerPlaybackProps {
  exercise: MultiTimerExercise;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

interface PlaybackState {
  currentRound: number;
  currentTimerIndex: number;
  currentRepetition: number; // Current repetition of the timer
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  isResting: boolean;
  phase: 'timer' | 'rest' | 'global-rest' | 'complete';
}

const TimerPlayback: React.FC<TimerPlaybackProps> = ({
  exercise,
  isOpen,
  onClose,
  onComplete
}) => {
  const [state, setState] = useState<PlaybackState>({
    currentRound: 1,
    currentTimerIndex: 0,
    currentRepetition: 1,
    timeRemaining: 0,
    isRunning: false,
    isPaused: false,
    isResting: false,
    phase: 'timer'
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize timer
  useEffect(() => {
    if (isOpen && exercise.timers.length > 0) {
      setState({
        currentRound: 1,
        currentTimerIndex: 0,
        currentRepetition: 1,
        timeRemaining: exercise.timers[0].duration,
        isRunning: false,
        isPaused: false,
        isResting: false,
        phase: 'timer'
      });
    }
  }, [isOpen, exercise]);

  // Timer logic
  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      intervalRef.current = setInterval(() => {
        setState(prevState => {
          if (prevState.timeRemaining <= 1) {
            // Timer finished, determine next phase
            return getNextPhase(prevState);
          } else {
            return {
              ...prevState,
              timeRemaining: prevState.timeRemaining - 1
            };
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, state.isPaused]);

  // Audio notifications
  useEffect(() => {
    if (state.timeRemaining <= 3 && state.timeRemaining > 0 && state.isRunning) {
      const currentTimer = exercise.timers[state.currentTimerIndex];
      if (!currentTimer?.isSilent) {
        playBeep();
      }
    }
  }, [state.timeRemaining, state.isRunning, state.currentTimerIndex, exercise.timers]);

  const getNextPhase = (currentState: PlaybackState): PlaybackState => {
    const currentTimer = exercise.timers[currentState.currentTimerIndex];
    
    if (currentState.phase === 'timer') {
      // Check if we need rest between repetitions
      if (currentState.currentRepetition < currentTimer.repetitions && currentTimer.restBetween && currentTimer.restBetween > 0) {
        return {
          ...currentState,
          phase: 'rest',
          timeRemaining: currentTimer.restBetween,
          isResting: true
        };
      } else if (currentState.currentRepetition < currentTimer.repetitions) {
        // Next repetition without rest
        return {
          ...currentState,
          currentRepetition: currentState.currentRepetition + 1,
          timeRemaining: currentTimer.duration
        };
      } else {
        // Move to next timer or next round
        return moveToNextTimer(currentState);
      }
    } else if (currentState.phase === 'rest') {
      // Rest finished, next repetition
      return {
        ...currentState,
        phase: 'timer',
        currentRepetition: currentState.currentRepetition + 1,
        timeRemaining: currentTimer.duration,
        isResting: false
      };
    } else if (currentState.phase === 'global-rest') {
      // Global rest finished, next round
      return {
        ...currentState,
        phase: 'timer',
        currentRound: currentState.currentRound + 1,
        currentTimerIndex: 0,
        currentRepetition: 1,
        timeRemaining: exercise.timers[0].duration,
        isResting: false
      };
    }

    return currentState;
  };

  const moveToNextTimer = (currentState: PlaybackState): PlaybackState => {
    if (currentState.currentTimerIndex < exercise.timers.length - 1) {
      // Next timer in sequence
      const nextTimer = exercise.timers[currentState.currentTimerIndex + 1];
      return {
        ...currentState,
        currentTimerIndex: currentState.currentTimerIndex + 1,
        currentRepetition: 1,
        timeRemaining: nextTimer.duration,
        phase: 'timer'
      };
    } else {
      // End of timer sequence
      if (currentState.currentRound < exercise.rounds) {
        // Check for global rest
        if (exercise.globalRestTime && exercise.globalRestTime > 0) {
          return {
            ...currentState,
            phase: 'global-rest',
            timeRemaining: exercise.globalRestTime,
            isResting: true
          };
        } else {
          // Next round without global rest
          return {
            ...currentState,
            currentRound: currentState.currentRound + 1,
            currentTimerIndex: 0,
            currentRepetition: 1,
            timeRemaining: exercise.timers[0].duration,
            phase: 'timer'
          };
        }
      } else {
        // Exercise complete
        if (onComplete) onComplete();
        return {
          ...currentState,
          phase: 'complete',
          isRunning: false,
          timeRemaining: 0
        };
      }
    }
  };

  const playBeep = () => {
    // Create audio context for beep sound
    if (typeof window !== 'undefined' && window.AudioContext) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  const handleStart = () => {
    setState(prev => ({ ...prev, isRunning: true, isPaused: false }));
  };

  const handlePause = () => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleStop = () => {
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      currentRound: 1,
      currentTimerIndex: 0,
      currentRepetition: 1,
      timeRemaining: exercise.timers[0]?.duration || 0,
      phase: 'timer',
      isResting: false
    }));
  };

  const handleSkip = () => {
    setState(prevState => getNextPhase({ ...prevState, timeRemaining: 0 }));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentTimer = (): CustomTimer | null => {
    return exercise.timers[state.currentTimerIndex] || null;
  };

  const getPhaseDisplay = (): string => {
    switch (state.phase) {
      case 'timer':
        const timer = getCurrentTimer();
        return timer ? `${timer.name}${timer.repetitions > 1 ? ` (${state.currentRepetition}/${timer.repetitions})` : ''}` : 'Timer';
      case 'rest':
        return 'Descanso entre Repeticiones';
      case 'global-rest':
        return 'Descanso entre Rondas';
      case 'complete':
        return 'Completado';
      default:
        return 'Timer';
    }
  };

  const getPhaseColor = (): string => {
    switch (state.phase) {
      case 'timer':
        return getCurrentTimer()?.color || '#EF4444';
      case 'rest':
        return '#22C55E';
      case 'global-rest':
        return '#8B5CF6';
      case 'complete':
        return '#6B7280';
      default:
        return '#EF4444';
    }
  };

  const getTotalProgress = (): number => {
    const totalTimers = exercise.timers.length * exercise.rounds;
    const completedTimers = (state.currentRound - 1) * exercise.timers.length + state.currentTimerIndex;
    return totalTimers > 0 ? (completedTimers / totalTimers) * 100 : 0;
  };

  const getCurrentTimerProgress = (): number => {
    const currentTimer = getCurrentTimer();
    if (!currentTimer || state.phase !== 'timer') return 0;
    
    return ((currentTimer.duration - state.timeRemaining) / currentTimer.duration) * 100;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="text-center p-8 max-w-3xl w-full mx-4">
        {/* Exercise Name */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{exercise.name}</h2>
          <div className="flex items-center justify-center space-x-4 text-gray-300 text-sm">
            <span>Ronda {state.currentRound} de {exercise.rounds}</span>
            <span>•</span>
            <span>Timer {state.currentTimerIndex + 1} de {exercise.timers.length}</span>
            {getCurrentTimer() && getCurrentTimer()!.repetitions > 1 && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Repeat className="w-3 h-3" />
                  <span>Rep {state.currentRepetition} de {getCurrentTimer()!.repetitions}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Timer Display */}
        <div 
          className="relative mb-8 p-8 rounded-3xl shadow-2xl transition-all duration-300"
          style={{ 
            backgroundColor: getPhaseColor(),
            boxShadow: `0 0 50px ${getPhaseColor()}40`
          }}
        >
          {/* Phase Name */}
          <div className="text-xl md:text-2xl font-bold text-white mb-4">
            {getPhaseDisplay()}
          </div>

          {/* Countdown Time */}
          <div className="text-7xl md:text-8xl font-mono font-bold text-white mb-4">
            {formatTime(state.timeRemaining)}
          </div>

          {/* Current Timer Progress */}
          <div className="w-full bg-white/20 rounded-full h-3 mb-4 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-1000 ease-linear rounded-full"
              style={{ 
                width: state.phase === 'timer' 
                  ? `${getCurrentTimerProgress()}%`
                  : state.phase === 'rest' && getCurrentTimer()?.restBetween
                  ? `${((getCurrentTimer()!.restBetween! - state.timeRemaining) / getCurrentTimer()!.restBetween!) * 100}%`
                  : state.phase === 'global-rest' && exercise.globalRestTime
                  ? `${((exercise.globalRestTime - state.timeRemaining) / exercise.globalRestTime) * 100}%`
                  : '0%'
              }}
            />
          </div>

          {/* Overall Progress */}
          <div className="text-white/80 text-sm mb-2">Progreso General</div>
          <div className="w-full bg-white/10 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="h-full bg-white/60 transition-all duration-300 rounded-full"
              style={{ width: `${getTotalProgress()}%` }}
            />
          </div>

          {/* Warning Indicators */}
          {state.timeRemaining <= 10 && state.timeRemaining > 0 && state.isRunning && !getCurrentTimer()?.isSilent && (
            <div className="absolute -top-4 -right-4">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-white font-bold text-sm">!</span>
              </div>
            </div>
          )}
        </div>

        {/* Timer Sequence Preview */}
        <div className="mb-6 p-4 bg-white/10 rounded-lg">
          <h3 className="text-white font-medium mb-3">Secuencia de Timers</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {exercise.timers.map((timer, index) => (
              <div 
                key={timer.id} 
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  index === state.currentTimerIndex 
                    ? 'bg-white text-gray-900 scale-110 shadow-lg' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                style={index === state.currentTimerIndex ? {} : { backgroundColor: timer.color + '40' }}
              >
                <div className="flex items-center space-x-1">
                  <span>{timer.name}</span>
                  {timer.repetitions > 1 && (
                    <>
                      <Repeat className="w-3 h-3" />
                      <span>
                        {index === state.currentTimerIndex 
                          ? `${state.currentRepetition}/${timer.repetitions}`
                          : `${timer.repetitions}x`
                        }
                      </span>
                    </>
                  )}
                  {timer.isSilent && (
                    <span className="text-xs opacity-70">🔇</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {!state.isRunning ? (
            <button
              onClick={handleStart}
              className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors shadow-lg"
              title="Iniciar"
            >
              <Play className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              className={`p-4 text-white rounded-full transition-colors shadow-lg ${
                state.isPaused 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
              title={state.isPaused ? 'Reanudar' : 'Pausar'}
            >
              {state.isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
            </button>
          )}

          <button
            onClick={handleSkip}
            disabled={state.phase === 'complete'}
            className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
            title="Saltar fase actual"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          <button
            onClick={handleStop}
            className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-lg"
            title="Detener y reiniciar"
          >
            <Square className="w-6 h-6" />
          </button>

          <button
            onClick={onClose}
            className="p-4 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors shadow-lg"
            title="Cerrar"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>

        {/* Status Info */}
        <div className="text-gray-400 text-sm space-y-1">
          <p>
            {state.isRunning 
              ? state.isPaused 
                ? 'Pausado - Presiona play para continuar' 
                : state.phase === 'timer'
                ? `Ejecutando: ${getCurrentTimer()?.name || 'Timer'}`
                : state.phase === 'rest'
                ? 'Descanso entre repeticiones'
                : 'Descanso entre rondas'
              : 'Listo para comenzar'
            }
          </p>
          <p>Presiona ESC para salir • Usa las flechas para navegar</p>
          
          {/* Execution Flow Info */}
          {getCurrentTimer() && getCurrentTimer()!.repetitions > 1 && state.phase === 'timer' && (
            <div className="mt-3 p-2 bg-white/10 rounded text-xs">
              <p>
                Este timer se repetirá {getCurrentTimer()!.repetitions} veces
                {getCurrentTimer()!.restBetween && getCurrentTimer()!.restBetween! > 0 && (
                  <span> con {getCurrentTimer()!.restBetween}s de descanso entre repeticiones</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimerPlayback;