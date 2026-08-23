import { ZodError } from 'zod';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
export function errorHandler(error, request, reply) {
    // AppError or any duck-typed Application Error (has statusCode & code properties)
    const isAppError = error instanceof AppError ||
        (typeof error?.statusCode === 'number' && typeof error?.code === 'string');
    if (isAppError) {
        const statusCode = error.statusCode || 500;
        const code = error.code || 'INTERNAL_SERVER_ERROR';
        reply.status(statusCode).send({
            error: {
                code,
                message: error.message || 'Application error',
            },
        });
        return;
    }
    // ZodError or duck-typed Zod error (has issues array)
    const isZodError = error instanceof ZodError ||
        error.name === 'ZodError' ||
        (Array.isArray(error?.issues) && error?.name === 'ZodError');
    if (isZodError) {
        const issues = error.issues || [];
        reply.status(400).send({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request payload',
                details: issues.map((issue) => ({
                    path: Array.isArray(issue.path) ? issue.path.join('.') : String(issue.path || ''),
                    message: issue.message,
                })),
            },
        });
        return;
    }
    // Fastify schema validation error
    if ('validation' in error && error.validation) {
        reply.status(400).send({
            error: {
                code: 'VALIDATION_ERROR',
                message: error.message,
            },
        });
        return;
    }
    // Handle Postgres / Drizzle invalid UUID syntax error (Postgres error code 22P02)
    const errCode = error?.code || error?.cause?.code;
    if (errCode === '22P02') {
        reply.status(400).send({
            error: {
                code: 'BAD_REQUEST',
                message: 'Invalid ID format provided',
            },
        });
        return;
    }
    logger.error({ err: error, url: request.url, method: request.method }, 'Unhandled API Error');
    reply.status(500).send({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected internal server error occurred',
        },
    });
}
