/**
 * SMART WEATHER ALERTS: OLIVE GROVES (SPAIN)
 * 
 * Logic to detect agricultural risks based on meteorological data.
 */

export interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number; // km/h
  precip: number;    // mm
}

export interface SmartAlert {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low' | 'success';
  icon: string;
}

export class WeatherAlertService {
  
  static getAlerts(data: WeatherData): SmartAlert[] {
    const alerts: SmartAlert[] = [];

    // 1. REPILO RISK (Fungus)
    // Repilo favors humidity > 80% and temp 10-20°C
    if (data.humidity > 80 && data.temp >= 8 && data.temp <= 22) {
      alerts.push({
        id: 'repilo',
        title: 'Riesgo de Repilo Alto',
        description: 'Condiciones óptimas para el hongo. Vigile el haz de las hojas y considere tratamiento preventivo en zonas umbrías.',
        severity: 'high',
        icon: 'CloudRain'
      });
    }

    // 2. SPRAYING CONDITIONS
    // Avoid treatment if wind > 15 km/h or temp > 30°C
    if (data.windSpeed > 15) {
      alerts.push({
        id: 'wind',
        title: 'Viento Excesivo',
        description: 'Vientos de ' + data.windSpeed + ' km/h. Se desaconseja el tratamiento fitosanitario por deriva.',
        severity: 'medium',
        icon: 'Wind'
      });
    } else if (data.temp > 28) {
      alerts.push({
        id: 'heat-spray',
        title: 'Calor Extremo',
        description: 'Temperatura superior a 28°C. Evite tratamientos para prevenir fitotoxicidad o evaporación rápida.',
        severity: 'medium',
        icon: 'Thermometer'
      });
    }

    // 3. WATER STRESS
    if (data.temp > 32 && data.humidity < 30) {
      alerts.push({
        id: 'stress',
        title: 'Estrés Hídrico',
        description: 'Baja humedad y calor. Asegure el riego en parcelas intensivas para evitar cierre de estomas.',
        severity: 'high',
        icon: 'Droplets'
      });
    }

    // 4. GOOD CONDITIONS
    if (alerts.length === 0) {
      alerts.push({
        id: 'ok',
        title: 'Condiciones Óptimas',
        description: 'La meteorología actual es ideal para labores de campo y tratamientos.',
        severity: 'success',
        icon: 'Check'
      });
    }

    return alerts;
  }
}
