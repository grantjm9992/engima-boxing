import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, User, Clock, Save, X, 
  Plus, Search, AlertTriangle
} from 'lucide-react';
import { VideoNote } from './VideoLibrary';
import { StudentProfile } from './StudentProfile';

interface VideoNoteEditorProps {
  videoId: string;
  currentTime: number;
  onAddNote: (note: Omit<VideoNote, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  students: StudentProfile[];
  currentUserId: string;
  isOpen: boolean;
}

const VideoNoteEditor: React.FC<VideoNoteEditorProps> = ({
  videoId,
  currentTime,
  onAddNote,
  onCancel,
  students,
  currentUserId,
  isOpen
}) => {
  const [content, setContent] = useState('');
  const [mentionedStudents, setMentionedStudents] = useState<string[]>([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearchTerm, setMentionSearchTerm] = useState('');
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Add timestamp to note
  const addTimestamp = () => {
    const timestamp = `[${formatTime(currentTime)}] `;
    
    if (cursorPosition !== null && textareaRef.current) {
      const before = content.substring(0, cursorPosition);
      const after = content.substring(cursorPosition);
      setContent(before + timestamp + after);
      
      // Set cursor position after the inserted timestamp
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = cursorPosition + timestamp.length;
          textareaRef.current.selectionEnd = cursorPosition + timestamp.length;
        }
      }, 0);
    } else {
      setContent(prev => prev + timestamp);
    }
  };
  
  // Track cursor position
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };
  
  const handleTextareaClick = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  };
  
  const handleTextareaKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
    
    // Check for @ symbol to trigger mention dropdown
    if (e.key === '@') {
      setShowMentionDropdown(true);
      setMentionSearchTerm('');
    }
  };
  
  // Handle mentions
  const addMention = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const mentionText = `@${student.firstName} ${student.lastName} `;
    
    if (cursorPosition !== null && textareaRef.current) {
      // Find the position of the @ that triggered this
      const beforeCursor = content.substring(0, cursorPosition);
      const atIndex = beforeCursor.lastIndexOf('@');
      
      if (atIndex !== -1) {
        const before = content.substring(0, atIndex);
        const after = content.substring(cursorPosition);
        setContent(before + mentionText + after);
        
        // Set cursor position after the inserted mention
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            const newPosition = atIndex + mentionText.length;
            textareaRef.current.selectionStart = newPosition;
            textareaRef.current.selectionEnd = newPosition;
            setCursorPosition(newPosition);
          }
        }, 0);
      }
    }
    
    // Add to mentioned students array if not already included
    if (!mentionedStudents.includes(studentId)) {
      setMentionedStudents([...mentionedStudents, studentId]);
    }
    
    setShowMentionDropdown(false);
  };
  
  const removeMention = (studentId: string) => {
    setMentionedStudents(mentionedStudents.filter(id => id !== studentId));
    
    // Remove from text (this is a simplified approach)
    const student = students.find(s => s.id === studentId);
    if (student) {
      const mentionText = `@${student.firstName} ${student.lastName}`;
      setContent(content.replace(mentionText, ''));
    }
  };
  
  // Filter students for mention dropdown
  const filteredStudents = students.filter(student => 
    (student.firstName.toLowerCase().includes(mentionSearchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(mentionSearchTerm.toLowerCase()))
  );
  
  // Handle save
  const handleSave = () => {
    if (content.trim()) {
      onAddNote({
        videoId,
        content: content.trim(),
        timestamp: currentTime,
        createdBy: currentUserId,
        mentions: mentionedStudents
      });
      onCancel();
    }
  };
  
  // Close mention dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showMentionDropdown && textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
        setShowMentionDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMentionDropdown]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Añadir Nota al Video</span>
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-elevated rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tiempo actual: {formatTime(currentTime)}
              </span>
              <button
                onClick={addTimestamp}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-xs"
              >
                Insertar timestamp
              </button>
            </div>
            
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleTextareaChange}
                onClick={handleTextareaClick}
                onKeyUp={handleTextareaKeyUp}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                rows={5}
                placeholder="Escribe tu nota sobre este momento del video. Usa @ para mencionar estudiantes y [MM:SS] para añadir timestamps."
                autoFocus
              />
              
              {/* Mention Dropdown */}
              {showMentionDropdown && (
                <div className="absolute z-10 mt-1 w-64 bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border rounded-lg shadow-lg">
                  <div className="p-2 border-b border-gray-200 dark:border-dark-border">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={mentionSearchTerm}
                        onChange={(e) => setMentionSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white text-sm"
                        placeholder="Buscar estudiante..."
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  <div className="max-h-40 overflow-y-auto p-1">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => (
                        <button
                          key={student.id}
                          onClick={() => addMention(student.id)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center space-x-2"
                        >
                          <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {student.firstName} {student.lastName}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                        No se encontraron estudiantes
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Mentioned Students */}
          {mentionedStudents.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estudiantes mencionados:
              </div>
              <div className="flex flex-wrap gap-2">
                {mentionedStudents.map(studentId => {
                  const student = students.find(s => s.id === studentId);
                  return (
                    <div 
                      key={studentId}
                      className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-xs"
                    >
                      <User className="w-3 h-3" />
                      <span>{student ? `${student.firstName} ${student.lastName}` : 'Estudiante'}</span>
                      <button
                        onClick={() => removeMention(studentId)}
                        className="hover:text-red-600 dark:hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Help Text */}
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                <p><strong>Consejos:</strong></p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Usa <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">[MM:SS]</code> para añadir timestamps que serán clicables.</li>
                  <li>Usa <code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">@Nombre</code> para mencionar a un estudiante.</li>
                  <li>Los estudiantes mencionados recibirán una notificación sobre esta nota.</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Nota</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoNoteEditor;