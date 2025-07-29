// src/components/SafeRoutineBuilder.tsx

import React from 'react';
import RoutineBuilder from './RoutineBuilder';
import ErrorBoundary from './ErrorBoundary';
import { Routine, Exercise } from './RoutineManager';
import { Block } from './BlockEditor';
import { MultiTimerExercise } from './MultiTimerExercise';
import { TagType } from './TagManager';

interface SafeRoutineBuilderProps {
    routine?: Routine;
    availableTags?: TagType[];
    onSave: (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
    onPlayExercise?: (exercise: Exercise | MultiTimerExercise) => void;
    onPlayBlock?: (block: Block) => void;
    isOpen: boolean;
    onOpenTagManager?: () => void;
}

const SafeRoutineBuilder: React.FC<SafeRoutineBuilderProps> = (props) => {
    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
        // Log the error for debugging
        console.error('RoutineBuilder Error:', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            routine: props.routine,
            timestamp: new Date().toISOString()
        });

        // You could also send this to an error reporting service here
        // errorReportingService.captureException(error, { extra: errorInfo });
    };

    const errorFallback = (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-2xl p-6">
                <ErrorBoundary onError={handleError} />
            </div>
        </div>
    );

    return (
        <ErrorBoundary onError={handleError} fallback={errorFallback}>
            <RoutineBuilder {...props} />
        </ErrorBoundary>
    );
};

export default SafeRoutineBuilder;