// src/components/ErrorBoundary.tsx

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                        Algo salió mal
                    </h3>
                    <p className="text-red-700 dark:text-red-300 text-center mb-4 max-w-md">
                        Ha ocurrido un error inesperado. Por favor, intenta recargar el componente.
                    </p>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 rounded border text-sm">
                            <summary className="cursor-pointer text-red-800 dark:text-red-200 font-medium">
                                Detalles del error (desarrollo)
                            </summary>
                            <pre className="mt-2 text-red-700 dark:text-red-300 whitespace-pre-wrap text-xs">
                {this.state.error.message}
                                {'\n'}
                                {this.state.error.stack}
              </pre>
                        </details>
                    )}
                    <button
                        onClick={this.handleRetry}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Intentar de nuevo</span>
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;