import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable, retry } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/auth/decorator/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly refector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPiblic = this.refector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPiblic) return true;

    return super.canActivate(context);
  }
}
