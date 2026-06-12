import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    if (request.url === '/') {
      return next.handle();
    }
    return next
      .handle()
      .pipe(map((res: unknown) => this.responseHandler(res, context)));
  }

  private async responseHandler(res: unknown, context: ExecutionContext): Promise<unknown> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<{ statusCode: number }>();
    const statusCode = response.statusCode;
    const actualResponse = await res;
    const safeData = actualResponse ?? [];

    const hasNextPage = actualResponse != null && 
      typeof actualResponse === 'object' && 
      'data' in actualResponse && 
      actualResponse.data != null && 
      typeof actualResponse.data === 'object' &&
      'hasNextPage' in actualResponse.data 
        ? Boolean((actualResponse.data as { hasNextPage?: boolean }).hasNextPage)
        : undefined;

    return {
      data: safeData,
      hasNextPage,
      message: 'Request processed successfully',
      status: 'success',
      statusCode,
    };
  }
}
