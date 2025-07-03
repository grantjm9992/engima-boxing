import React, { useState } from 'react';
import { 
  FileText, Video, Link, Image, X, Save, 
  Edit3, Eye, Download, Upload, AlertTriangle,
  Info, Target, Zap, Clock, Users
} from 'lucide-react';

export interface MediaAttachment {
  id: string;
  type: 'video' | 'image' | 'link';
  url: string;
  title: string;
  description?: string;
  createdAt: Date;
}

export interface AdvancedNote {
  id: string;
  content: string;
  attachments: MediaAttachment[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface AdvancedNotesProps {
  note: AdvancedNote | null;
  onSaveNote: (note: Omit<AdvancedNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, updates: Partial<AdvancedNote>) => void;
  isEditing: boolean;
  onToggleEdit: () => void;
  placeholder?: string;
  title?: string;
  className?: string;
}

const AdvancedNotes: React.FC<AdvancedNotesProps> = ({
  note,
  onSaveNote,
  onUpdateNote,
  isEditing,
  onToggleEdit,
  placeholder = "Añade notas detalladas, instrucciones o información relevante...",
  title = "Notas Avanzadas",
  className = ""
}) => {
  const [content, setContent] = useState(note?.content || '');
  const [newAttachment, setNewAttachment] = useState<Partial<MediaAttachment>>({
    type: 'video',
    url: '',
    title: ''
  });
  const [showAttachmentForm, setShowAttachmentForm] = useState(false);

  const handleSave = () => {
    if (note) {
      onUpdateNote(note.id, { 
        content,
        attachments: note.attachments
      });
    } else {
      onSaveNote({
        content,
        attachments: [],
        tags: []
      });
    }
    onToggleEdit();
  };

  const handleAddAttachment = () => {
    if (newAttachment.url && newAttachment.title && note) {
      const attachment: MediaAttachment = {
        id: `attachment_${Date.now()}`,
        type: newAttachment.type as 'video' | 'image' | 'link',
        url: newAttachment.url,
        title: newAttachment.title,
        description: newAttachment.description,
        createdAt: new Date()
      };
      
      onUpdateNote(note.id, {
        attachments: [...note.attachments, attachment]
      });
      
      setNewAttachment({
        type: 'video',
        url: '',
        title: ''
      });
      setShowAttachmentForm(false);
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    if (note) {
      onUpdateNote(note.id, {
        attachments: note.attachments.filter(a => a.id !== attachmentId)
      });
    }
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'image': return Image;
      case 'link': return Link;
      default: return FileText;
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className={`bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>{title}</span>
        </h3>
        
        <button
          onClick={onToggleEdit}
          className={`p-2 rounded-lg transition-colors ${
            isEditing 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
              : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }`}
          title={isEditing ? "Ver" : "Editar"}
        >
          {isEditing ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-elevated dark:text-white"
            rows={6}
            placeholder={placeholder}
          />
        ) : (
          <div className="prose dark:prose-invert max-w-none">
            {content ? (
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {content}
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 italic">
                No hay notas disponibles
              </p>
            )}
          </div>
        )}
      </div>

      {/* Attachments */}
      {note && note.attachments.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-dark-border">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Material Adjunto
          </h4>
          
          <div className="space-y-3">
            {note.attachments.map((attachment) => {
              const IconComponent = getAttachmentIcon(attachment.type);
              
              return (
                <div 
                  key={attachment.id} 
                  className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-dark-elevated rounded-lg"
                >
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {attachment.title}
                      </h5>
                      
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Eliminar adjunto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    
                    {attachment.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {attachment.description}
                      </p>
                    )}
                    
                    <div className="mt-2">
                      <a 
                        href={attachment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver {attachment.type === 'video' ? 'video' : attachment.type === 'image' ? 'imagen' : 'enlace'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Attachment Form */}
      {isEditing && note && (
        <div className="p-4 border-t border-gray-200 dark:border-dark-border">
          {!showAttachmentForm ? (
            <button
              onClick={() => setShowAttachmentForm(true)}
              className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-600 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Upload className="w-4 h-4" />
              <span>Añadir Material Audiovisual</span>
            </button>
          ) : (
            <div className="p-4 border-2 border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Añadir Material
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Material *
                  </label>
                  <select
                    value={newAttachment.type}
                    onChange={(e) => setNewAttachment({ ...newAttachment, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                  >
                    <option value="video">Video</option>
                    <option value="image">Imagen</option>
                    <option value="link">Enlace</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={newAttachment.title}
                    onChange={(e) => setNewAttachment({ ...newAttachment, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                    placeholder="Título descriptivo"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={newAttachment.url}
                  onChange={(e) => setNewAttachment({ ...newAttachment, url: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white ${
                    newAttachment.url && !isValidUrl(newAttachment.url)
                      ? 'border-red-300 dark:border-red-700'
                      : 'border-gray-300 dark:border-dark-border'
                  }`}
                  placeholder={`URL del ${newAttachment.type === 'video' ? 'video' : newAttachment.type === 'image' ? 'imagen' : 'enlace'}`}
                />
                {newAttachment.url && !isValidUrl(newAttachment.url) && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Por favor, introduce una URL válida
                  </p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={newAttachment.description || ''}
                  onChange={(e) => setNewAttachment({ ...newAttachment, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-surface dark:text-white"
                  rows={2}
                  placeholder="Breve descripción del contenido"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleAddAttachment}
                  disabled={!newAttachment.url || !newAttachment.title || !isValidUrl(newAttachment.url)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir</span>
                </button>
                <button
                  onClick={() => setShowAttachmentForm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {isEditing && (
        <div className="p-4 bg-gray-50 dark:bg-dark-elevated border-t border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onToggleEdit}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      {isEditing && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="text-xs text-yellow-700 dark:text-yellow-300">
              <p>Puedes añadir enlaces a videos explicativos, imágenes de referencia o recursos externos.</p>
              <p className="mt-1">Para videos, usa enlaces de YouTube, Vimeo u otras plataformas de video.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedNotes;