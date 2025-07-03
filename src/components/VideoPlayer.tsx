import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, 
  Volume2, VolumeX, Maximize, Minimize,
  Clock, MessageSquare, X, Settings
} from 'lucide-react';
import { VideoItem, VideoNote } from './VideoLibrary';

interface VideoPlayerProps {
  video: VideoItem;
  onAddNote?: () => void;
  onClose: () => void;
  isOpen: boolean;
  currentUserId: string;
  isTrainer: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onAddNote,
  onClose,
  isOpen,
  currentUserId,
  isTrainer
}) => {
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);
  
  // Update video playback state
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);
  
  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  // Seek to position
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };
  
  // Skip forward/backward
  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    
    if (!isFullscreen) {
      if (playerContainerRef.current.requestFullscreen) {
        playerContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          handleSkip(-5);
          break;
        case 'ArrowRight':
          handleSkip(5);
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          setIsMuted(!isMuted);
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
          } else {
            onClose();
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isPlaying, isMuted, isFullscreen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div 
        ref={playerContainerRef}
        className="relative w-full h-full"
        onMouseMove={handleMouseMove}
      >
        {/* Video */}
        <video
          ref={videoRef}
          src={video.url}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
        
        {/* Controls Overlay */}
        {showControls && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
              <h2 className="text-white text-lg font-semibold">{video.title}</h2>
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Bottom Controls */}
            <div className="p-4">
              {/* Progress Bar */}
              <div className="mb-2 flex items-center space-x-2">
                <span className="text-white text-sm">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={video.duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-2 bg-gray-700 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                />
                <span className="text-white text-sm">{formatTime(video.duration)}</span>
              </div>
              
              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleSkip(-5)}
                    className="text-white hover:text-blue-400 transition-colors"
                    title="Retroceder 5 segundos"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={togglePlay}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={() => handleSkip(5)}
                    className="text-white hover:text-blue-400 transition-colors"
                    title="Avanzar 5 segundos"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-gray-700 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Add Note Button */}
                  {onAddNote && (
                    <button
                      onClick={onAddNote}
                      className="px-2 py-1 bg-pink-600 text-white rounded text-sm hover:bg-pink-700 transition-colors flex items-center space-x-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Añadir Nota</span>
                    </button>
                  )}
                  
                  {/* Playback Rate */}
                  <select
                    value={playbackRate}
                    onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                    className="bg-gray-800 text-white border-none rounded px-2 py-1 text-sm"
                  >
                    <option value="0.25">0.25x</option>
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1">1x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                  </select>
                  
                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;