import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, Plus, X, Search, Filter, Edit3, Eye, 
  Trash2, Upload, Download, Tag, Calendar, Clock,
  User, MessageSquare, Play, Pause, Settings,
  FileText, Lock, Unlock, AlertTriangle, Info
} from 'lucide-react';
import { StudentProfile } from './StudentProfile';
import VideoPlayer from './VideoPlayer';
import VideoNoteEditor from './VideoNoteEditor';

export interface VideoNote {
  id: string;
  videoId: string;
  content: string;
  timestamp: number; // seconds
  createdAt: Date;
  createdBy: string; // user ID
  mentions: string[]; // student IDs
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  uploadedAt: Date;
  uploadedBy: string; // user ID
  duration: number; // seconds
  tags: string[];
  category: 'technique' | 'sparring' | 'analysis' | 'competition' | 'other';
  level: 'principiante' | 'intermedio' | 'avanzado' | 'competidor' | 'elite';
  visibleTo: string[]; // student IDs, empty means visible to all
  allowDownload: boolean;
  notes: VideoNote[];
}

interface VideoLibraryProps {
  videos: VideoItem[];
  students: StudentProfile[];
  currentUserId: string;
  isTrainer: boolean;
  onAddVideo: (video: Omit<VideoItem, 'id' | 'uploadedAt' | 'notes'>) => void;
  onUpdateVideo: (id: string, updates: Partial<VideoItem>) => void;
  onDeleteVideo: (id: string) => void;
  onAddNote: (note: Omit<VideoNote, 'id' | 'createdAt'>) => void;
  onDeleteNote: (videoId: string, noteId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const VideoLibrary: React.FC<VideoLibraryProps> = ({
  videos,
  students,
  currentUserId,
  isTrainer,
  onAddVideo,
  onUpdateVideo,
  onDeleteVideo,
  onAddNote,
  onDeleteNote,
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'duration'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [isEditingVideo, setIsEditingVideo] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  const [videoForm, setVideoForm] = useState<Partial<VideoItem>>({
    title: '',
    description: '',
    url: '',
    thumbnailUrl: '',
    duration: 0,
    tags: [],
    category: 'technique',
    level: 'intermedio',
    visibleTo: [],
    allowDownload: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const categoryOptions = [
    { value: 'technique', label: 'Técnica' },
    { value: 'sparring', label: 'Sparring' },
    { value: 'analysis', label: 'Análisis' },
    { value: 'competition', label: 'Competición' },
    { value: 'other', label: 'Otros' }
  ];
  
  const levelOptions = [
    { value: 'principiante', label: 'Principiante' },
    { value: 'intermedio', label: 'Intermedio' },
    { value: 'avanzado', label: 'Avanzado' },
    { value: 'competidor', label: 'Competidor' },
    { value: 'elite', label: 'Élite' }
  ];
  
  // Filter videos
  const filteredVideos = videos
    .filter(video => {
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by category
      const matchesCategory = filterCategory === 'all' || video.category === filterCategory;
      
      // Filter by level
      const matchesLevel = filterLevel === 'all' || video.level === filterLevel;
      
      // Filter by tags
      const matchesTags = filterTags.length === 0 || 
        filterTags.some(tag => video.tags.includes(tag));
      
      // Filter by visibility (if not trainer)
      const isVisible = isTrainer || 
        video.visibleTo.length === 0 || 
        video.visibleTo.includes(currentUserId);
      
      return matchesSearch && matchesCategory && matchesLevel && matchesTags && isVisible;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.uploadedAt.getTime() - a.uploadedAt.getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'duration':
          return a.duration - b.duration;
        default:
          return 0;
      }
    });
  
  const handleAddVideo = () => {
    if (videoForm.title?.trim() && videoForm.url?.trim()) {
      onAddVideo({
        title: videoForm.title.trim(),
        description: videoForm.description?.trim() || '',
        url: videoForm.url.trim(),
        thumbnailUrl: videoForm.thumbnailUrl?.trim() || '',
        duration: videoForm.duration || 0,
        tags: videoForm.tags || [],
        category: videoForm.category as 'technique' | 'sparring' | 'analysis' | 'competition' | 'other',
        level: videoForm.level as 'principiante' | 'intermedio' | 'avanzado' | 'competidor' | 'elite',
        visibleTo: videoForm.visibleTo || [],
        allowDownload: videoForm.allowDownload || false,
        uploadedBy: currentUserId
      });
      
      resetVideoForm();
    }
  };
  
  const handleUpdateVideo = () => {
    if (isEditingVideo && videoForm.title?.trim()) {
      onUpdateVideo(isEditingVideo, {
        title: videoForm.title.trim(),
        description: videoForm.description?.trim() || '',
        url: videoForm.url?.trim(),
        thumbnailUrl: videoForm.thumbnailUrl?.trim(),
        duration: videoForm.duration,
        tags: videoForm.tags,
        category: videoForm.category as 'technique' | 'sparring' | 'analysis' | 'competition' | 'other',
        level: videoForm.level as 'principiante' | 'intermedio' | 'avanzado' | 'competidor' | 'elite',
        visibleTo: videoForm.visibleTo,
        allowDownload: videoForm.allowDownload
      });
      
      resetVideoForm();
    }
  };
  
  const resetVideoForm = () => {
    setVideoForm({
      title: '',
      description: '',
      url: '',
      thumbnailUrl: '',
      duration: 0,
      tags: [],
      category: 'technique',
      level: 'intermedio',
      visibleTo: [],
      allowDownload: false
    });
    setIsAddingVideo(false);
    setIsEditingVideo(null);
  };
  
  const startEditingVideo = (video: VideoItem) => {
    setVideoForm({
      title: video.title,
      description: video.description,
      url: video.url,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      tags: [...video.tags],
      category: video.category,
      level: video.level,
      visibleTo: [...video.visibleTo],
      allowDownload: video.allowDownload
    });
    setIsEditingVideo(video.id);
    setIsAddingVideo(false);
  };
  
  const handlePlayVideo = (video: VideoItem) => {
    setSelectedVideo(video);
    setIsPlayerOpen(true);
  };
  
  const handleAddNote = () => {
    if (selectedVideo) {
      setIsNoteEditorOpen(true);
    }
  };
  
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getCategoryLabel = (category: string): string => {
    return categoryOptions.find(opt => opt.value === category)?.label || category;
  };
  
  const getLevelLabel = (level: string): string => {
    return levelOptions.find(opt => opt.value === level)?.label || level;
  };
  
  const getStudentName = (studentId: string): string => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Estudiante';
  };
  
  const handleTagClick = (tag: string) => {
    if (filterTags.includes(tag)) {
      setFilterTags(filterTags.filter(t => t !== tag));
    } else {
      setFilterTags([...filterTags, tag]);
    }
  };
  
  const toggleStudentVisibility = (studentId: string) => {
    const currentVisibleTo = videoForm.visibleTo || [];
    if (currentVisibleTo.includes(studentId)) {
      setVideoForm({
        ...videoForm,
        visibleTo: currentVisibleTo.filter(id => id !== studentId)
      });
    } else {
      setVideoForm({
        ...videoForm,
        visibleTo: [...currentVisibleTo, studentId]
      });
    }
  };
  
  // Get all unique tags from videos
  const allTags = Array.from(new Set(videos.flatMap(video => video.tags)));
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-pink-600 to-pink-700 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="pr-12">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Biblioteca Audiovisual</h1>
                <p className="text-pink-100">Gestión de videos técnicos y análisis</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {isTrainer && (
                <button
                  onClick={() => {
                    setIsAddingVideo(true);
                    setIsEditingVideo(null);
                  }}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Subir Video</span>
                </button>
              )}
              
              <div className="flex items-center space-x-1 text-sm">
                <Video className="w-4 h-4" />
                <span>{videos.length} videos disponibles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-dark-surface dark:text-white"
                placeholder="Buscar videos..."
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-dark-surface dark:text-white"
            >
              <option value="all">Todas las categorías</option>
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-dark-surface dark:text-white"
            >
              <option value="all">Todos los niveles</option>
              {levelOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-dark-surface dark:text-white"
            >
              <option value="date">Más recientes primero</option>
              <option value="title">Ordenar por título</option>
              <option value="duration">Ordenar por duración</option>
            </select>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="mb-6">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filtrar por etiquetas:
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      filterTags.includes(tag)
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-pink-100 dark:hover:bg-pink-900/20'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Video Form */}
          {(isAddingVideo || isEditingVideo) && (
            <div className="mb-6 p-6 border-2 border-pink-200 dark:border-pink-700 rounded-lg bg-pink-50 dark:bg-pink-900/20">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {isEditingVideo ? 'Editar Video' : 'Subir Nuevo Video'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={videoForm.title || ''}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-dark-surface dark:text-white"
                    placeholder="Ej: Técnica de Jab - Fundamentos"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL del Video *
                  </label>
                  <input
                    type="url"
                    value={videoForm.url || ''}
                    onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-dark-surface dark:text-white"
                    placeholder="https://ejemplo.com/video.mp4"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={videoForm.description || ''}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-dark-surface dark:text-white"
                  rows={3}
                  placeholder="Descripción detallada del contenido del video..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL de Miniatura
                  </label>
                  <input
                    type="url"
                    value={videoForm.thumbnailUrl || ''}
                    onChange={(e) => setVideoForm({ ...videoForm, thumbnailUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-dark-surface dark:text-white"
                    placeholder="https://ejemplo.com/thumbnail.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría
                  </label>
                  <select
                    value={videoForm.category || 'technique'}
                    onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-dark-surface dark:text-white"
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nivel
                  </label>
                  <select
                    value={videoForm.level || 'intermedio'}
                    onChange={(e) => setVideoForm({ ...videoForm, level: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-dark-surface dark:text-white"
                  >
                    {levelOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Etiquetas (separadas por comas)
                </label>
                <input
                  type="text"
                  value={(videoForm.tags || []).join(', ')}
                  onChange={(e) => setVideoForm({ 
                    ...videoForm, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-dark-surface dark:text-white"
                  placeholder="Ej: Jab, Técnica, Fundamentos"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duración (segundos)
                </label>
                <input
                  type="number"
                  value={videoForm.duration || ''}
                  onChange={(e) => setVideoForm({ ...videoForm, duration: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-dark-surface dark:text-white"
                  placeholder="Ej: 325 (5:25)"
                  min="0"
                />
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Visibilidad para Estudiantes
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setVideoForm({ ...videoForm, visibleTo: [] })}
                      className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      Visible para todos
                    </button>
                    <button
                      onClick={() => setVideoForm({ ...videoForm, visibleTo: students.map(s => s.id) })}
                      className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                    >
                      Seleccionar todos
                    </button>
                  </div>
                </div>
                
                <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-dark-border rounded-lg p-2">
                  {students.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {students.map(student => {
                        const isSelected = (videoForm.visibleTo || []).includes(student.id);
                        return (
                          <div 
                            key={student.id}
                            onClick={() => toggleStudentVisibility(student.id)}
                            className={`p-2 rounded cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-pink-100 dark:bg-pink-900/30 border border-pink-300 dark:border-pink-700'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-pink-600 border-pink-600 dark:bg-pink-500 dark:border-pink-500' 
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span className="text-sm text-gray-900 dark:text-white">
                                {student.firstName} {student.lastName}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No hay estudiantes registrados
                    </div>
                  )}
                </div>
                
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {(videoForm.visibleTo || []).length === 0 
                    ? 'Visible para todos los estudiantes' 
                    : `Visible para ${(videoForm.visibleTo || []).length} estudiante(s) seleccionado(s)`}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowDownload"
                    checked={videoForm.allowDownload || false}
                    onChange={(e) => setVideoForm({ ...videoForm, allowDownload: e.target.checked })}
                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="allowDownload" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Permitir descarga del video
                  </label>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={isEditingVideo ? handleUpdateVideo : handleAddVideo}
                  disabled={!videoForm.title?.trim() || !videoForm.url?.trim()}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isEditingVideo ? 'Actualizar' : 'Subir'} Video</span>
                </button>
                <button
                  onClick={resetVideoForm}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Videos Grid/List */}
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Video className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No se encontraron videos</h3>
              <p>Ajusta los filtros o sube un nuevo video</p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {filteredVideos.map((video) => (
                <div 
                  key={video.id} 
                  className={`bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden hover:shadow-md dark:hover:shadow-dark transition-shadow ${
                    viewMode === 'grid' ? '' : 'flex'
                  }`}
                >
                  {/* Thumbnail */}
                  <div 
                    className={`relative cursor-pointer ${
                      viewMode === 'grid' ? 'h-48' : 'h-32 w-48 flex-shrink-0'
                    }`}
                    onClick={() => handlePlayVideo(video)}
                  >
                    <img 
                      src={video.thumbnailUrl || 'https://via.placeholder.com/640x360?text=Video'} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center hover:bg-opacity-20 transition-all">
                      <div className="w-12 h-12 bg-pink-600 bg-opacity-80 rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded">
                      {formatDuration(video.duration)}
                    </div>
                    {video.visibleTo.length > 0 && (
                      <div className="absolute top-2 right-2 p-1 bg-black bg-opacity-70 text-white rounded-full">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{video.title}</h3>
                        
                        <div className="flex items-center space-x-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{getCategoryLabel(video.category)}</span>
                          <span>•</span>
                          <span>{getLevelLabel(video.level)}</span>
                          <span>•</span>
                          <span>{video.uploadedAt.toLocaleDateString()}</span>
                        </div>
                        
                        {viewMode === 'grid' && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                        
                        {/* Tags */}
                        {video.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {video.tags.slice(0, viewMode === 'grid' ? 3 : 5).map((tag, index) => (
                              <span 
                                key={index}
                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {video.tags.length > (viewMode === 'grid' ? 3 : 5) && (
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                                +{video.tags.length - (viewMode === 'grid' ? 3 : 5)}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Notes Count */}
                        {video.notes.length > 0 && (
                          <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                            <MessageSquare className="w-3 h-3" />
                            <span>{video.notes.length} nota{video.notes.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      {viewMode === 'list' && (
                        <div className="flex space-x-1 ml-4">
                          <button
                            onClick={() => handlePlayVideo(video)}
                            className="p-1 text-gray-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded transition-colors"
                            title="Reproducir video"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          
                          {isTrainer && (
                            <>
                              <button
                                onClick={() => startEditingVideo(video)}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Editar video"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => onDeleteVideo(video.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Eliminar video"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          {video.allowDownload && (
                            <a
                              href={video.url}
                              download
                              className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                              title="Descargar video"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Grid View Actions */}
                    {viewMode === 'grid' && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-dark-border">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handlePlayVideo(video)}
                            className="p-1 text-gray-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded transition-colors"
                            title="Reproducir video"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          
                          {isTrainer && (
                            <>
                              <button
                                onClick={() => startEditingVideo(video)}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Editar video"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => onDeleteVideo(video.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Eliminar video"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                        
                        {video.allowDownload && (
                          <a
                            href={video.url}
                            download
                            className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                            title="Descargar video"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Player */}
      {selectedVideo && isPlayerOpen && (
        <VideoPlayer
          video={selectedVideo}
          onAddNote={isTrainer ? () => setIsNoteEditorOpen(true) : undefined}
          onClose={() => {
            setIsPlayerOpen(false);
            setSelectedVideo(null);
          }}
          isOpen={isPlayerOpen}
          currentUserId={currentUserId}
          isTrainer={isTrainer}
        />
      )}

      {/* Note Editor */}
      {selectedVideo && isNoteEditorOpen && (
        <VideoNoteEditor
          videoId={selectedVideo.id}
          currentTime={currentTime}
          onAddNote={onAddNote}
          onCancel={() => setIsNoteEditorOpen(false)}
          students={students}
          currentUserId={currentUserId}
          isOpen={isNoteEditorOpen}
        />
      )}
    </div>
  );
};

// Helper component for the checkbox in student selection
const Check = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default VideoLibrary;