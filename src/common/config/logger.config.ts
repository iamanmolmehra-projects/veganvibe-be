import { registerAs } from '@nestjs/config';

import type { Request } from 'express';
import type { Params } from 'nestjs-pino';

export default registerAs('logger', (): Params => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';

  // In test environment, silence logs unless LOG_LEVEL is explicitly set
  if (isTest && process.env.LOG_LEVEL === undefined) {
    return {
      pinoHttp: {
        level: 'silent',
      },
    };
  }

  const config: Params = {
    pinoHttp: {
      customProps: (req: Request & { correlationId?: string }) => ({
        correlationId: req.correlationId,
        service: process.env.APP_NAME ?? 'backend-service-template',
      }),
      formatters: {
        level: (label) => ({ level: label }),
      },
      level: process.env.LOG_LEVEL ?? (isDevelopment ? 'debug' : 'info'),
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.body.password',
          'req.body.token',
          'req.body.secret',
          'req.body.apiKey',
          'req.body.api_key',
          'req.body.access_token',
          'req.body.refresh_token',
          '*.password',
          '*.token',
          '*.secret',
          '*.apiKey',
          '*.api_key',
          '*.access_token',
          '*.refresh_token',
        ],
        remove: true,
      },
      serializers: {
        req: (req: Request & { correlationId?: string; remoteAddress?: string }) => ({
          correlationId: req.correlationId,
          ip: req.ip ?? req.remoteAddress,
          method: req.method,
          url: req.url,
          userAgent: req.headers['user-agent'],
        }),
        res: (res: { statusCode: number }) => ({
          statusCode: res.statusCode,
        }),
      },
      timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
      transport: isDevelopment
        ? {
            options: {
              colorize: true,
              ignore: 'pid,hostname',
              singleLine: false,
              translateTime: 'yyyy-mm-dd HH:MM:ss.l',
            },
            target: 'pino-pretty',
          }
        : undefined,
    },
  };

  return config;
});
