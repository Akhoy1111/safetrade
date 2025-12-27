// src/partners/guards/api-key.guard.ts
// Guard for validating partner API key authentication
// Use this guard on endpoints that require partner authentication

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PartnersService } from '../partners.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly partnersService: PartnersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key is required in X-API-Key header');
    }

    try {
      // Verify API key and get partner
      const partner = await this.partnersService.findByApiKey(apiKey);

      // Attach partner to request for use in controllers
      request.partner = partner;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or inactive API key');
    }
  }
}

