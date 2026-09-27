import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = error instanceof HttpException ? error.getResponse() : null;
    const message =
      typeof payload === 'object' && payload !== null && 'message' in payload
        ? payload.message
        : error instanceof HttpException
          ? error.message
          : 'Внутренняя ошибка сервера.';
    if (!(error instanceof HttpException)) console.error(error);
    response.status(status).json({ statusCode: status, message });
  }
}
