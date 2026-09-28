import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(error: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = error instanceof HttpException ? error.getResponse() : null;
    const message =
      typeof payload === 'object' && payload !== null && 'message' in payload
        ? payload.message
        : error instanceof HttpException
        ? error.message
        : 'Внутренняя ошибка сервера.';
    const code =
      typeof payload === 'object' &&
      payload !== null &&
      'code' in payload &&
      typeof payload.code === 'string'
        ? payload.code
        : status === 500
        ? 'INTERNAL_ERROR'
        : `HTTP_${status}`;
    if (!(error instanceof HttpException)) this.logger.error('Неожиданная ошибка запроса', error);
    else if (status >= 500) this.logger.warn(`${code}: ${error.message}`);
    response.status(status).json({ statusCode: status, code, message });
  }
}
