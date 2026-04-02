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

export type CreateTreatmentDto = z.infer<typeof CreateTreatmentSchema>;
