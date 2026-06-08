import { chromium } from 'playwright';
import * as path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\RAMON\\.gemini\\antigravity-ide\\brain\\de5c40ae-40af-45d2-8986-5041b1c46609';

async function run() {
  console.log('[SIMULATOR] Iniciando captura de vistas activas de Ginés...');
  
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    // ── Paso 1: Login ──
    console.log('[SIMULATOR] Navegando al login...');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);

    console.log('[SIMULATOR] Rellenando credenciales de Ginés...');
    await page.fill('input[type="email"]', 'gines.remediadora@inagrosolutions.com');
    await page.fill('input[type="password"]', 'gines_remediadora_2026');
    
    console.log('[SIMULATOR] Haciendo clic en iniciar sesión...');
    await page.click('button[type="submit"]');
    
    // Esperar redirección al Cuaderno
    await page.waitForURL(/.*\/cuaderno.*/, { timeout: 15000 });
    await page.waitForTimeout(10000); // Esperar a que se carguen los componentes y marca blanca
    
    // ── Paso 2: Dashboard principal ──
    const activeDashboardPath = path.join(ARTIFACTS_DIR, 'gines_active_dashboard.png');
    await page.screenshot({ path: activeDashboardPath });
    console.log(`[SIMULATOR] Captura de Dashboard activo guardada en: ${activeDashboardPath}`);
    
    // ── Paso 3: Secciones del menú ──
    const sections = [
      { name: 'Parcelas', path: 'gines_active_parcelas.png', clickText: 'Gestión de Parcelas' },
      { name: 'Fitosanitarios', path: 'gines_active_fitosanitarios.png', clickText: 'Fitosanitarios' },
      { name: 'Labores', path: 'gines_active_labores.png', clickText: 'Labores Agrícolas' }
    ];
    
    for (const section of sections) {
      console.log(`[SIMULATOR] Navegando a la sección ${section.name}...`);
      
      // Buscar enlace en el sidebar usando has-text
      const link = await page.$(`a:has-text("${section.clickText}")`);
      if (link) {
        await link.click();
        await page.waitForTimeout(3000);
        const sectionPath = path.join(ARTIFACTS_DIR, section.path);
        await page.screenshot({ path: sectionPath });
        console.log(`[SIMULATOR] Captura de ${section.name} activo guardada en: ${sectionPath}`);
      } else {
        // Buscar por texto general si falla a
        console.warn(`[SIMULATOR] No se encontró el enlace de ${section.name} con has-text, probando click en texto directamente...`);
        try {
          await page.click(`text=${section.clickText}`);
          await page.waitForTimeout(3000);
          const sectionPath = path.join(ARTIFACTS_DIR, section.path);
          await page.screenshot({ path: sectionPath });
          console.log(`[SIMULATOR] Captura de ${section.name} activo guardada en: ${sectionPath}`);
        } catch (e) {
          console.error(`[SIMULATOR] Error al navegar a ${section.name}:`, e);
        }
      }
    }
    
    console.log('[SIMULATOR] Captura de pantallas activa completada.');
    
  } catch (error) {
    console.error('[SIMULATOR] Error:', error);
  } finally {
    await browser.close();
  }
}

run();
