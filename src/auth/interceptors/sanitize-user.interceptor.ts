import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SanitizeUserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.sanitizeResponse(data)));
  }

  private sanitizeResponse(data: any): any {
    if (!data) return data;

    // if response has user object
    if (data.user) {
      return {
        ...data,
        user: this.removePassword(data.user),
      };
    }

    // if response itself is a user object
    if (data.password) {
      return this.removePassword(data);
    }

    // if response is array of users
    if (Array.isArray(data)) {
      return data.map((item) =>
        item?.password ? this.removePassword(item) : item,
      );
    }

    return data;
  }

  private removePassword(user: any) {
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
