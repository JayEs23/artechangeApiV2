import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import config from 'src/utils/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = request.headers['api-key'] ?? request.query.api_key; // checks the header, moves to query if null
    return this.isKeyValid(key);
  }

  isKeyValid(key: string): boolean {
    if (!key) {
      throw new HttpException('API key is missing', HttpStatus.FORBIDDEN);
    }
    if (key !== config.apiKey) {
      throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
    }
    return true;
  }
}
