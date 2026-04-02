import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthorizedException('No token provided');

    const token = authHeader.split(' ')[1];
    try { 
      const decoded = this.jwt.verify(token, { secret: 'SECRET_KEY' }); 
      req.user = decoded; 
      return true; 
    } catch { 
      throw new UnauthorizedException('Invalid token');
    }
  }
}
