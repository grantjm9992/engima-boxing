// src/utils/notifications.ts
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message?: string;
    duration?: number;
}

class NotificationService {
    private listeners: ((notification: Notification) => void)[] = [];

    subscribe(listener: (notification: Notification) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify(notification: Omit<Notification, 'id'>) {
        const id = Date.now().toString();
        const fullNotification: Notification = {
            id,
            duration: 5000,
            ...notification
        };

        this.listeners.forEach(listener => listener(fullNotification));
    }

    success(title: string, message?: string) {
        this.notify({ type: 'success', title, message });
    }

    error(title: string, message?: string) {
        this.notify({ type: 'error', title, message, duration: 8000 });
    }

    warning(title: string, message?: string) {
        this.notify({ type: 'warning', title, message });
    }

    info(title: string, message?: string) {
        this.notify({ type: 'info', title, message });
    }
}

export const notificationService = new NotificationService();