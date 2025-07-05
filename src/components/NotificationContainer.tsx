// src/components/NotificationContainer.tsx
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationContainer: React.FC = () => {
    const { notifications, removeNotification } = useNotifications();

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
            case 'info':
                return <Info className="w-5 h-5 text-blue-600" />;
            default:
                return <Info className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStyles = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`max-w-sm p-4 border rounded-lg shadow-lg transition-all duration-300 ${getStyles(notification.type)}`}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                            {getIcon(notification.type)}
                            <div>
                                <h4 className="font-medium">{notification.title}</h4>
                                {notification.message && (
                                    <p className="text-sm mt-1 opacity-90">{notification.message}</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="ml-4 opacity-70 hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationContainer;