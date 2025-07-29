// src/components/ConfirmDialog.tsx

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       onConfirm,
                                                       title,
                                                       message,
                                                       confirmText = 'Confirmar',
                                                       cancelText = 'Cancelar',
                                                       variant = 'danger',
                                                       loading = false
                                                     }) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        };
      case 'warning':
        return {
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        };
      case 'info':
        return {
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        };
      default:
        return {
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        };
    }
  };

  const styles = getVariantStyles();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
      <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
      >
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${styles.iconBg}`}>
                <AlertTriangle className={`w-6 h-6 ${styles.iconColor}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
              </div>
              <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-elevated rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-dark-elevated rounded-b-lg flex items-center justify-end space-x-3">
            <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-elevated focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
                onClick={handleConfirm}
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmButton}`}
            >
              {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Procesando...</span>
                  </div>
              ) : (
                  confirmText
              )}
            </button>
          </div>
        </div>
      </div>
  );
};

export default ConfirmDialog;