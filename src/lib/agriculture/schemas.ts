import { z } from 'zod';

/**
 * SCHEMA: CreateTreatmentDto (Inspired by NestJS implementation)
 * 
 * Enforces legal requirements and data integrity for Spanish Digital Field Notebook.
 */
export const CreateTreatmentSchema = z.object({
  parcela_id: z.string().uuid({ message: "La parcela es obligatoria" }),
  fecha: z.string().or(z.date()).transform((val) => new Date(val)),
  producto: z.string().min(1, { message: "El producto es obligatorio" }),
  numero_registro: z.string().min(1, { message: "El número de registro MAPA es obligatorio" }),
  dosis: z.number().positive({ message: "La dosis debe ser mayor que cero" }),
  unidad: z.string().default('litros/ha'),
  ropo: z.string().min(1, { message: "El carnet ROPO es obligatorio para tratamientos fitosanitarios" }),
  metodo_aplicacion: z.string().optional(),
  plaga_objetivo: z.string().optional(),
  nivel_plaga: z.number().optional().default(0),
});

export const CreateExplotacionSchema = z.object({
  nombre: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  ubicacion: z.string().optional(),
  num_registro_siex: z.string().optional(),
  superficie_total: z.number().nonnegative().default(0),
});

export const CreateParcelaSchema = z.object({
  explotacion_id: z.string().uuid({ message: "La explotación es obligatoria" }),
  referencia_sigpac: z.string().min(5, { message: "Referencia SIGPAC inválida" }),
  nombre: z.string().min(1, { message: "El nombre es obligatorio" }),
  superficie: z.number().positive({ message: "La superficie debe ser mayor que cero" }),
  tipo_olivar: z.enum(['tradicional', 'intensivo', 'superintensivo']).default('tradicional'),
  sistema_produccion: z.enum(['convencional', 'integrado', 'ecologico']).default('convencional'),
  variedad: z.string().optional(),
  sistema_riego: z.enum(['secano', 'regadio']).default('secano'),
});

export const CreateFertilizacionSchema = z.object({
  parcela_id: z.string().uuid({ message: "La parcela es obligatoria" }),
  fecha: z.string().or(z.date()).transform((val) => new Date(val)),
  tipo: z.enum(['organico', 'mineral']).default('mineral'),
  producto: z.string().min(1, { message: "El nombre del abono es obligatorio" }),
  cantidad: z.number().positive({ message: "La cantidad debe ser mayor que cero" }),
  unidad: z.string().default('kg/ha'),
  metodo: z.string().min(3, { message: "El método de aplicación es obligatorio" }),
  justificacion: z.string().optional(),
});

export type CreateTreatmentDto = z.infer<typeof CreateTreatmentSchema>;
export type CreateExplotacionDto = z.infer<typeof CreateExplotacionSchema>;
export type CreateParcelaDto = z.infer<typeof CreateParcelaSchema>;
export type CreateFertilizacionDto = z.infer<typeof CreateFertilizacionSchema>;
