import { randomUUID } from 'node:crypto';

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface RequestWithCorrelation extends Request {
  correlationId: string;
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  private readonly headerName = 'x-correlation-id';

  use(req: RequestWithCorrelation, res: Response, next: NextFunction): void {
    // Try to get correlation ID from header, or generate a new one
    const correlationId = 
      (req.headers[this.headerName] as string) ?? randomUUID();

    // Add to request object
    req.correlationId = correlationId;

    // Add to response headers for client tracking
    res.setHeader(this.headerName, correlationId);

    next();
  }
}
