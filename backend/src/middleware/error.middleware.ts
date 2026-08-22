import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

export function errorHandler(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    reply.status(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload',
        details: error.issues.map((issue) => ({
          path: issue.path.join('.'),
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

  logger.error({ err: error, url: request.url, method: request.method }, 'Unhandled API Error');

  reply.status(500).send({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred',
    },
  });
}
