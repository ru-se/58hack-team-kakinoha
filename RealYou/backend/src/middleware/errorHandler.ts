import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';
import { ZodError, ZodIssue } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);

    // Zodのバリデーションエラーの場合は400として返す
    if (err instanceof ZodError) {
        const issues = err.issues;
        const message = issues.map((e: ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ');
        const apiError: ApiError = {
            status: 'error',
            error: 'validation_error',
            message: `Invalid request data: ${message}`,
        };
        return res.status(400).json(apiError);
    }

    const status = err.status || 500;
    const error = err.code || 'server_error';
    const message = err.message || 'Internal server error';

    const apiError: ApiError = {
        status: 'error',
        error,
        message,
    };

    res.status(status).json(apiError);
};
