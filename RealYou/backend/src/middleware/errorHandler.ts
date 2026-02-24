import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);

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
