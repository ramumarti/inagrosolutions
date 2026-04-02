import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    const hashed = await this.service.hash(body.password);
    // En una implementación real, aquí se llamaría al servicio de usuarios para guardar en DB
    return { ...body, password: hashed, message: 'Simulación de registro' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; id: number }) {
    // Aquí se debería validar el usuario contra la DB primero
    return { 
      token: this.service.token({ id: body.id, email: body.email }) 
    };
  }
}
