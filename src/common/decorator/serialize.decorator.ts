import { UseInterceptors } from '@nestjs/common';
import { SerializeInterceptor } from '../interceptor/serialize.interceptor';

export function Serialize<T>(dto: T) {
  return UseInterceptors(new SerializeInterceptor<T>(dto));
}
