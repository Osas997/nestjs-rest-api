import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass, plainToInstance } from 'class-transformer';
import { WebResponse } from 'src/interface/web-response';

export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private dto: any) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: WebResponse<T>) => {
        if (!data.data) return data;

        return plainToInstance(this.dto, data.data);
      }),
    );
  }
}
