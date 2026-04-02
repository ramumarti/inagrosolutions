import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtGuard } from './auth/jwt.guard';

@Controller('export')
export class ExportController {
  
  @UseGuards(JwtGuard)
  @Get('siex')
  export(@Req() req) {
    // Aquí se generaría el JSON oficial SIEX consultando la DB
    return {
      titular: req.user.email,
      parcelas: [],
      timestamp: new Date().toISOString(),
      formato: 'SIEX-OFFICIAL-V1.0'
    };
  }
}
