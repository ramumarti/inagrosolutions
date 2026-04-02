import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTreatmentDto {
  @IsNotEmpty()
  @IsString()
  producto: string;

  @IsNotEmpty()
  @IsString()
  numero_registro: string;

  @IsNotEmpty()
  @IsNumber()
  dosis: number;

  @IsNotEmpty()
  @IsString()
  ropo: string;

  @IsNotEmpty()
  @IsString()
  unidad: string;

  @IsNotEmpty()
  fecha: Date;
}
