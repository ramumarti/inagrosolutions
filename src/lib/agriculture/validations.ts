/**
 * VALIDATION SERVICE: CUADERNO DE CAMPO (OLIVAR SPAIN)
 * 
 * Logic to enforce compliance with Spanish regulations (MAPA, PAC, ECO/INTEGRADO)
 */

export type SistemaProduccion = 'convencional' | 'integrado' | 'ecologico';
export type TipoOlivar = 'tradicional' | 'intensivo' | 'superintensivo';

export interface RuleResult {
  valid: boolean;
  message?: string;
  level: 'error' | 'warning' | 'info';
}

// SIMULATED: White list of ecological registry numbers (In a real app, this would be a lookup table/API)
const ECOLOGICAL_REGISTRY_WHITELIST = ['123', '456', '789'];
const INTEGRATED_PLAGA_THRESHOLD = 5.0; // 5% minimum infestation to treat

export class AgriculturalValidator {
  
  /**
   * Validate a fitosanitary treatment
   */
  static validateTratamiento(
    parcela: { sistema_produccion: SistemaProduccion },
    data: { 
      numero_registro: string, 
      nivel_plaga?: number,
      plaga_objetivo?: string 
    }
  ): RuleResult {
    
    // 1. ECOLOGICAL VALIDATION
    if (parcela.sistema_produccion === 'ecologico') {
      if (!ECOLOGICAL_REGISTRY_WHITELIST.includes(data.numero_registro)) {
        return {
          valid: false,
          level: 'error',
          message: `INCUMPLIMIENTO ECOLÓGICO: El producto con registro ${data.numero_registro} no está autorizado para producción ecológica.`
        };
      }
    }

    // 2. INTEGRATED VALIDATION
    if (parcela.sistema_produccion === 'integrado') {
      if (data.nivel_plaga === undefined || data.nivel_plaga < INTEGRATED_PLAGA_THRESHOLD) {
        return {
          valid: false,
          level: 'warning',
          message: `ALERTA PRODUCCIÓN INTEGRADA: El nivel de plaga (${data.nivel_plaga || 0}%) está por debajo del umbral de tratamiento (${INTEGRATED_PLAGA_THRESHOLD}%). Justifique la necesidad o evite el tratamiento.`
        };
      }
    }

    return { valid: true, level: 'info' };
  }

  /**
   * Validate irrigation frequency
   */
  static validateRiego(
    parcela: { tipo_olivar: TipoOlivar },
    lastRiegoDate?: Date
  ): RuleResult {
    
    if (parcela.tipo_olivar === 'superintensivo') {
      // In super-intensive, irrigation must be frequent (e.g., every 72h)
      if (!lastRiegoDate) {
        return { valid: false, level: 'warning', message: 'AVISO: No consta registro de riego inicial para parcela superintensiva.' };
      }
      
      const hoursSinceLast = (new Date().getTime() - lastRiegoDate.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLast > 72) {
        return {
          valid: false,
          level: 'warning',
          message: `ALERTA ESTRÉS HÍDRICO: Han pasado más de 72h desde el último riego en parcela superintensiva.`
        };
      }
    }

    return { valid: true, level: 'info' };
  }

  /**
   * Generate Security Period Alert (Plazo de Seguridad)
   */
  static checkSecurityPeriod(lastTreatmentDate: Date, plazoSeguridadDays: number): RuleResult {
    const today = new Date();
    const expiryDate = new Date(lastTreatmentDate);
    expiryDate.setDate(expiryDate.getDate() + plazoSeguridadDays);

    if (today < expiryDate) {
      const remaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return {
        valid: false,
        level: 'error',
        message: `ALERTA DE SEGURIDAD: Faltan ${remaining} días para que se cumpla el plazo de seguridad. PROHIBIDA la recolección.`
      };
    }

    return { valid: true, level: 'info' };
  }
}
