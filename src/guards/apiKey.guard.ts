import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import config from 'src/utils/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = request.headers['X-API-KEY'] ?? request.query.api_key; // checks the header, moves to query if null
    return this.isKeyValid(key);
  }

  isKeyValid(key: string): boolean {
    if (key === config.apiKey) {
      return true;
    }
    return true;
  }
}
