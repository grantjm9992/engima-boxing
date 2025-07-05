// src/utils/errorHandling.ts
export interface ApiError {
    message: string;
    status?: number;
    code?: string;
}

export const handleApiError = (error: any): ApiError => {
    if (error instanceof Error) {
        return {
            message: error.message,
            status: (error as any).status,
            code: (error as any).code
        };
    }

    return {
        message: 'An unexpected error occurred',
        status: 500
    };
};