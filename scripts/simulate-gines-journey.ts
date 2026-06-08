import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

const ARTIFACTS_DIR = 'C:\\Users\\RAMON\\.gemini\\antigravity-ide\\brain\\de5c40ae-40af-45d2-8986-5041b1c46609';

async function run() {
  console.log('[SIMULATOR] Iniciando simulación del viaje de Ginés...');
  
  // Usar el ejecutable de Chrome local para no requerir descargas adicionales de Playwright
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    // ── Paso 1: Ir a la página de registro de La Remediadora ──
    console.log('[SIMULATOR] Navegando a la página de registro...');
    await page.goto('http://localhost:3000/signup?tenant=remediadora-68d79&plan=intermedio');
    await page.waitForTimeout(3000); // Esperar a que se carguen los datos
    
    // Captura del formulario de registro
    const signupPath = path.join(ARTIFACTS_DIR, 'gines_step1_signup.png');
    await page.screenshot({ path: signupPath });
    console.log(`[SIMULATOR] Captura guardada en: ${signupPath}`);

    // Rellenar formulario
    console.log('[SIMULATOR] Rellenando formulario de registro para Ginés...');
    await page.fill('input[placeholder="Nombre"]', 'Ginés');
    await page.fill('input[placeholder="Apellidos"]', 'Remediador');
    await page.fill('input[placeholder="Tu correo electrónico"]', 'gines.remediadora@inagrosolutions.com');
    await page.fill('input[placeholder="Crear Contraseña"]', 'gines_remediadora_2026');
    
    // Aceptar GDPR
    await page.check('input[type="checkbox"]#privacy');
    await page.waitForTimeout(500);

    // Clic en Completar Registro
    console.log('[SIMULATOR] Enviando formulario...');
    await page.click('button[type="submit"]');

    // ── Paso 2: Redirección a Stripe Checkout ──
    console.log('[SIMULATOR] Esperando redirección a Stripe Checkout...');
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30000 });
    await page.waitForTimeout(5000); // Darle tiempo a Stripe para renderizar los campos
    
    const checkoutPath = path.join(ARTIFACTS_DIR, 'gines_step2_checkout.png');
    await page.screenshot({ path: checkoutPath });
    console.log(`[SIMULATOR] Captura de Stripe guardada en: ${checkoutPath}`);

    // Seleccionar el método de pago 'Tarjeta'
    console.log('[SIMULATOR] Seleccionando método de pago Tarjeta...');
    try {
      await page.click('button[data-testid="card-accordion-item-button"]', { timeout: 5000 });
    } catch (e) {
      console.log('[SIMULATOR] Error al pulsar por selector de botón, probando click forzado en texto...');
      await page.click('text=Tarjeta', { force: true });
    }
    await page.waitForTimeout(2000);

    // Rellenar tarjeta de prueba
    console.log('[SIMULATOR] Rellenando datos de pago en Stripe (tarjeta ficticia)...');
    await page.fill('input#cardNumber', '4242');
    await page.keyboard.type('424242424242');
    
    await page.fill('input#cardExpiry', '12');
    await page.keyboard.type('28');
    
    await page.fill('input#cardCvc', '123');
    await page.fill('input#billingName', 'Ginés Remediador');
    
    // Rellenar código postal si es necesario
    const postalInput = await page.$('input#billingPostalCode');
    if (postalInput) {
      await page.fill('input#billingPostalCode', '23001');
    }
    
    await page.waitForTimeout(1000);
    
    // Clic en Suscribirse / Pagar
    console.log('[SIMULATOR] Procesando pago en Stripe...');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
    }
    
    // ── Paso 3: Esperar redirección de vuelta a la App ──
    console.log('[SIMULATOR] Esperando redirección de vuelta a la aplicación...');
    await page.waitForURL(/localhost:3000\/cuaderno/, { timeout: 30000 });
    
    // Esperar a que la verificación de pago y la redirección a /onboarding ocurran de forma segura
    console.log('[SIMULATOR] Esperando verificación de pago y redirección a /onboarding...');
    try {
      await page.waitForURL(/localhost:3000\/onboarding/, { timeout: 15000 });
    } catch (e) {
      console.log('[SIMULATOR] No se detectó redirección a /onboarding (quizás ya está onboarded).');
    }
    
    console.log(`[SIMULATOR] Estado actual. URL: ${page.url()}`);
    
    // ── Paso 4: Completar Onboarding (si redirige a /onboarding) ──
    if (page.url().includes('/onboarding')) {
      console.log('[SIMULATOR] Ejecutando flujo de Onboarding...');
      
      const onboardingPath1 = path.join(ARTIFACTS_DIR, 'gines_step3_onboarding_profile.png');
      await page.screenshot({ path: onboardingPath1 });
      
      // Paso 1: Perfil. Clic en Continuar.
      console.log('[SIMULATOR] Onboarding Paso 1: Perfil...');
      await page.click('button:has-text("Continuar")');
      await page.waitForTimeout(1500);

      // Paso 2: Explotación.
      console.log('[SIMULATOR] Onboarding Paso 2: Explotación...');
      const onboardingPath2 = path.join(ARTIFACTS_DIR, 'gines_step3_onboarding_farm.png');
      await page.screenshot({ path: onboardingPath2 });
      await page.fill('input[placeholder="Ej: Finca Los Olivos"]', 'Explotación de Ginés');
      await page.fill('input[type="number"]', '15');
      await page.click('button:has-text("Siguiente")');
      await page.waitForTimeout(1500);

      // Paso 3: Plan.
      console.log('[SIMULATOR] Onboarding Paso 3: Confirmar Plan...');
      const onboardingPath3 = path.join(ARTIFACTS_DIR, 'gines_step3_onboarding_plan.png');
      await page.screenshot({ path: onboardingPath3 });
      await page.click('button:has-text("Confirmar")');
      await page.waitForTimeout(1500);

      // Paso 4: Final.
      console.log('[SIMULATOR] Onboarding Paso 4: Finalizar...');
      const onboardingPath4 = path.join(ARTIFACTS_DIR, 'gines_step3_onboarding_ready.png');
      await page.screenshot({ path: onboardingPath4 });
      await page.click('button:has-text("Abrir Cuaderno Digital")');
      await page.waitForTimeout(5000);
    }
    
    // ── Paso 5: Panel Principal / Cuaderno ──
    console.log('[SIMULATOR] Accediendo al panel principal del Cuaderno...');
    await page.goto('http://localhost:3000/cuaderno');
    await page.waitForTimeout(4000);
    
    // Si aparece el botón de "Activar Campaña", pulsarlo
    const activarBtn = await page.$('button:has-text("Activar Campaña")');
    if (activarBtn) {
      console.log('[SIMULATOR] Creando y activando campaña agrícola inicial...');
      await activarBtn.click();
      await page.waitForTimeout(4000); // Esperar a que se cree la campaña
    }
    
    const dashboardPath = path.join(ARTIFACTS_DIR, 'gines_step4_dashboard.png');
    await page.screenshot({ path: dashboardPath });
    console.log(`[SIMULATOR] Captura del panel principal guardada en: ${dashboardPath}`);
    
    // ── Paso 6: Secciones del menú ──
    const sections = [
      { name: 'Parcelas', path: 'gines_step5_parcelas.png', clickText: 'Parcelas' },
      { name: 'Fitosanitarios', path: 'gines_step6_fitosanitarios.png', clickText: 'Fitosanitarios' },
      { name: 'Labores', path: 'gines_step7_labores.png', clickText: 'Labores' }
    ];
    
    for (const section of sections) {
      console.log(`[SIMULATOR] Navegando a la sección ${section.name}...`);
      
      // Buscar enlace en el sidebar
      const link = await page.$(`a:has-text("${section.clickText}")`);
      if (link) {
        await link.click();
        await page.waitForTimeout(3000);
        const sectionPath = path.join(ARTIFACTS_DIR, section.path);
        await page.screenshot({ path: sectionPath });
        console.log(`[SIMULATOR] Captura de ${section.name} guardada en: ${sectionPath}`);
      } else {
        console.warn(`[SIMULATOR] No se encontró el enlace de ${section.name}`);
      }
    }
    
    console.log('[SIMULATOR] Simulación completada con éxito.');
    
  } catch (error) {
    console.error('[SIMULATOR] Error en la simulación:', error);
    // Tomar captura de error
    const errorPath = path.join(ARTIFACTS_DIR, 'gines_error.png');
    await page.screenshot({ path: errorPath });
    console.log(`[SIMULATOR] Captura del error guardada en: ${errorPath}`);
  } finally {
    await browser.close();
  }
}

run();
