import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

export function errorHandler(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  // AppError or any duck-typed Application Error (has statusCode & code properties)
  const isAppError =
    error instanceof AppError ||
    (typeof (error as any)?.statusCode === 'number' && typeof (error as any)?.code === 'string');

  if (isAppError) {
    const statusCode = (error as any).statusCode || 500;
    const code = (error as any).code || 'INTERNAL_SERVER_ERROR';
    reply.status(statusCode).send({
      error: {
        code,
        message: error.message || 'Application error',
      },
    });
    return;
  }

  // ZodError or duck-typed Zod error (has issues array)
  const isZodError =
    error instanceof ZodError ||
    error.name === 'ZodError' ||
    (Array.isArray((error as any)?.issues) && (error as any)?.name === 'ZodError');

  if (isZodError) {
    const issues = (error as any).issues || [];
    reply.status(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload',
        details: issues.map((issue: any) => ({
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
  const errCode = (error as any)?.code || (error as any)?.cause?.code;
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
