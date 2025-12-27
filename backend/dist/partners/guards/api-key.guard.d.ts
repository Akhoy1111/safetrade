import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PartnersService } from '../partners.service';
export declare class ApiKeyGuard implements CanActivate {
    private readonly partnersService;
    constructor(partnersService: PartnersService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
