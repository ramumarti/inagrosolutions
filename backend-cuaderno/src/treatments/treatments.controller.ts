import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { CreateTreatmentDto } from './dto/create-treatment.dto';

@Controller('treatments')
export class TreatmentsController {
  
  @UseGuards(JwtGuard)
  @Post()
  create(@Body() body: CreateTreatmentDto) {
    if (!body.ropo || body.ropo.trim() === '') {
      throw new BadRequestException('ROPO obligatorio para este trámite');
    }
    
    if (!body.numero_registro) {
      throw new BadRequestException('Producto no válido o número de registro ausente');
    }
    
    // Aquí persistiríamos en la DB vía TypeORM
    return {
      message: 'Tratamiento registrado correctamente',
      data: body
    };
  }
}
