# Landing Page B2C — Cuaderno Digital para Agricultores

## Contexto

El proyecto actual (`page.tsx`) es una landing B2B dirigida a **cooperativas y partners** con un diseño dark/neon. La petición es crear una **landing B2C completamente nueva** dirigida a **agricultores individuales** que necesitan ayuda con el Cuaderno Digital, con un tono cercano y un diseño agrícola profesional.

## Decisión de Arquitectura

> [!IMPORTANT]
> **¿Dónde encaja esta landing?** La landing actual (`/`) es para captar partners B2B. Esta nueva landing B2C se dirige a un público completamente diferente (agricultores finales) con un diseño radicalmente distinto (claro vs oscuro, servicio vs software).
>
> **Propuesta**: Crear la landing como un **archivo HTML/CSS/JS estático e independiente** en `public/landing-cuaderno-digital/index.html`, listo para desplegarse en cualquier dominio, subdominio o ruta. Esto permite:
> - Publicarla en un dominio dedicado (ej: `cuadernodigital.inagrosolutions.com`)
> - Usarla como landing de campañas de Facebook/Google Ads
> - Mantenerla totalmente aislada del SaaS (no depende de Next.js, React, ni Supabase)
> - Editar copy y estilos rápidamente sin rebuild

## Identidad Visual — Completamente diferente al SaaS

| Aspecto | SaaS actual (B2B) | Landing nueva (B2C) |
|---|---|---|
| Fondo | Dark (#050510) | Blanco / gris claro |
| Color primario | Neon green (#00FF66) | Verde agrícola (#2E7D32) |
| Tono | Tech/startup | Cercano/confianza |
| Tipografía | Sans bold | Inter — grande y legible |
| Estilo | Glassmorphism oscuro | Cards claras con sombras suaves |
| Target | Cooperativas/empresas | Agricultores individuales |

## Proposed Changes

### Archivos a crear

---

#### [NEW] [index.html](file:///c:/Users/RAMON/Desktop/INAGROSOLUTIONS/public/landing-cuaderno-digital/index.html)

**Landing page completa** con las 10 secciones solicitadas, todo en un solo archivo HTML autocontenido:

1. **Hero Section** — Imagen de fondo impactante (campo español), headline "Cumple con el Cuaderno Digital sin complicarte la vida", subheadline, bullets, dos CTAs, badge de confianza
2. **Sección Problema/Empatía** — "Sabemos lo que te preocupa" con cards de problemas reales
3. **Sección Solución** — "Nos encargamos de todo" con grid de 6 servicios + iconos SVG inline
4. **Beneficios Reales** — 6 cards premium con iconos check
5. **Prueba Social** — Métricas (+500 agricultores, +12.000 ha, +10 años), 3 testimonios
6. **Proceso Simple** — Timeline de 3 pasos con diseño moderno
7. **Urgencia** — "No lo dejes para última hora" con CTA
8. **Formulario de Captación** — Campos: nombre, teléfono, provincia (select con 50 provincias), tipo de cultivo, checkbox RGPD. Sin backend por ahora (se puede integrar con n8n, Make.com, o endpoint propio)
9. **FAQ** — Acordeón expandible con 6 preguntas
10. **Footer Profesional** — Logo, contacto, WhatsApp, links legales, redes sociales

**Características técnicas:**
- CSS embebido con variables CSS y animaciones
- Intersection Observer API para animaciones al hacer scroll (fade-in-up)
- FAQ con acordeón JS puro
- Smooth scroll para anclas internas
- CTA sticky inferior en móvil (botón fijo "QUE ME LLAMEN")
- Formulario con validación JS nativa
- 100% responsive (mobile-first)
- Google Fonts (Inter) cargada por CDN
- Iconos SVG inline (sin dependencias externas)
- Meta tags SEO optimizados para "cuaderno digital agrícola España"
- Open Graph tags para compartir en redes

---

#### [NEW] Hero Image (Generated)

Generaremos una imagen de héroe con IA representando un agricultor español en un campo de cultivo, estilo profesional y cálido.

---

### Plan de implementación del documento en `docs/`

#### [NEW] [plan_landing_cuaderno.md](file:///c:/Users/RAMON/Desktop/INAGROSOLUTIONS/docs/plan_landing_cuaderno.md)

Copia de este plan de implementación guardada en la carpeta docs del proyecto.

---

## Integración del Formulario

> [!NOTE]
> El formulario capturará leads pero **no se conectará a ningún backend en esta primera versión**. La estructura está preparada para integración con:
> - **Supabase** (INSERT directo a tabla `leads`)
> - **n8n / Make.com** (webhook POST)
> - **Google Sheets** (API)
> - **Email** (via edge function)
>
> El JS del formulario mostrará un mensaje de éxito con animación al enviar.

## Optimización para Conversión

- **7 CTAs** distribuidos a lo largo de la página
- **Formulario visible** al hacer clic en cualquier CTA (scroll suave al formulario)
- **CTA sticky** en móvil siempre visible
- **Número de WhatsApp** clickable integrado (link `wa.me`)
- **Urgencia** con lenguaje de normativa y plazos
- **Prueba social** con números grandes y testimonios
- **Micro-animaciones** en hover y scroll
- **Colores de alta conversión** (verde confianza + naranja/amber para CTAs de urgencia)

## Verification Plan

### Automated Tests
- Abrir la landing en el navegador local (`http://localhost:3000/landing-cuaderno-digital/`)
- Verificar responsive en 375px (móvil) y 1440px (desktop)
- Comprobar que el formulario valida correctamente
- Verificar que el CTA sticky aparece en móvil
- Comprobar que las animaciones de scroll funcionan

### Manual Verification
- Revisión visual completa de las 10 secciones
- Test de todos los botones CTA y enlaces
- Comprobación del FAQ acordeón
- Validación del formulario con datos reales
