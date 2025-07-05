// src/hooks/useNotifications.ts
import { useState, useEffect } from 'react';
import { notificationService, Notification } from '../utils/notifications';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const unsubscribe = notificationService.subscribe((notification) => {
            setNotifications(prev => [...prev, notification]);

            // Auto-remove notification after duration
            if (notification.duration) {
                setTimeout(() => {
                    setNotifications(prev => prev.filter(n => n.id !== notification.id));
                }, notification.duration);
            }
        });

        return unsubscribe;
    }, []);

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return {
        notifications,
        removeNotification
    };
};