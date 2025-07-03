import React, { useEffect, useState } from 'react';
import { Timer, Pause, Play, Square } from 'lucide-react';

interface CountdownDisplayProps {
  timeRemaining: number;
  totalTime: number;
  isRunning: boolean;
  isPaused?: boolean;
  timerName: string;
  timerColor: string;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  showProgressiveTime?: boolean;
  className?: string;
}

const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
  timeRemaining,
  totalTime,
  isRunning,
  isPaused = false,
  timerName,
  timerColor,
  onPause,
  onResume,
  onStop,
  showProgressiveTime = false,
  className = ""
}) => {
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // Format time to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
  const progressiveTime = totalTime - timeRemaining;

  // Pulse animation for last 10 seconds
  useEffect(() => {
    if (timeRemaining <= 10 && timeRemaining > 0 && isRunning) {
      setPulseAnimation(true);
      const timer = setTimeout(() => setPulseAnimation(false), 500);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, isRunning]);

  // Warning colors for last seconds
  const getTimerColor = () => {
    if (timeRemaining <= 3 && isRunning) return '#EF4444'; // Red for last 3 seconds
    if (timeRemaining <= 10 && isRunning) return '#F59E0B'; // Orange for last 10 seconds
    return timerColor;
  };

  const getTextColor = () => {
    if (timeRemaining <= 3 && isRunning) return 'text-red-600';
    if (timeRemaining <= 10 && isRunning) return 'text-orange-600';
    return 'text-white';
  };

  if (!isRunning && timeRemaining === totalTime) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 ${className}`}>
      <div className="text-center p-8">
        {/* Timer Name */}
        <div className="mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{timerName}</h2>
          <div className="flex items-center justify-center space-x-2 text-gray-300">
            <Timer className="w-5 h-5" />
            <span className="text-lg">
              {isPaused ? 'Pausado' : isRunning ? 'En progreso' : 'Finalizado'}
            </span>
          </div>
        </div>

        {/* Main Timer Display */}
        <div 
          className={`
            relative mb-8 p-8 rounded-3xl shadow-2xl transition-all duration-300
            ${pulseAnimation ? 'animate-pulse scale-105' : ''}
          `}
          style={{ 
            backgroundColor: getTimerColor(),
            boxShadow: `0 0 50px ${getTimerColor()}40`
          }}
        >
          {/* Countdown Time */}
          <div className={`text-8xl md:text-9xl font-mono font-bold ${getTextColor()} mb-4`}>
            {formatTime(timeRemaining)}
          </div>

          {/* Progressive Time (if enabled) */}
          {showProgressiveTime && (
            <div className="text-2xl md:text-3xl text-white/80 mb-4">
              Transcurrido: {formatTime(progressiveTime)}
            </div>
          )}

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-3 mb-4 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time Info */}
          <div className="text-white/80 text-lg">
            <span>{formatTime(progressiveTime)} / {formatTime(totalTime)}</span>
          </div>

          {/* Warning Indicators */}
          {timeRemaining <= 10 && timeRemaining > 0 && isRunning && (
            <div className="absolute -top-4 -right-4">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-white font-bold text-sm">!</span>
              </div>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4">
          {isRunning && !isPaused && onPause && (
            <button
              onClick={onPause}
              className="p-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full transition-colors shadow-lg"
              title="Pausar"
            >
              <Pause className="w-6 h-6" />
            </button>
          )}

          {isPaused && onResume && (
            <button
              onClick={onResume}
              className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors shadow-lg"
              title="Reanudar"
            >
              <Play className="w-6 h-6" />
            </button>
          )}

          {onStop && (
            <button
              onClick={onStop}
              className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-lg"
              title="Detener"
            >
              <Square className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-gray-400 text-sm">
          <p>Presiona ESC para ocultar temporalmente</p>
        </div>
      </div>
    </div>
  );
};

export default CountdownDisplay;