# Plan de Control de Calidad - InagroSolutions 🚀

Este documento sirve para verificar la integridad y funcionamiento de todas las rutas y funcionalidades de la plataforma tras el despliegue exitoso.

## 1. Acceso Público y Landing Pages
- [ ] **Landing Principal (`/`)**: Verificar diseño premium, animaciones y carga de imágenes.
- [ ] **Página de Planes (`/planes`)**: Verificar que cargan los precios y que los botones de "Seleccionar" llevan al registro.
- [ ] **Landing de Marca Blanca (`/c/[slug]`)**: Probar con un slug de cooperativa existente.
- [ ] **Páginas Legales**:
    - [ ] Aviso Legal (`/legal-notice`)
    - [ ] Política de Privacidad (`/privacy-policy`)
    - [ ] Política de Cookies (`/cookie-policy`)
    - [ ] Política de Partners (`/partner-policy`)

## 2. Autenticación y Onboarding
- [ ] **Registro (`/signup`)**: Crear un nuevo usuario de prueba.
- [ ] **Login (`/login`)**: Acceder con credenciales válidas.
- [ ] **Recuperar Contraseña (`/forgot-password`)**.
- [ ] **Onboarding Agricultor (`/onboarding`)**: Probar flujo inicial tras registro.
- [ ] **Onboarding Partner (`/onboarding-partner`)**: Flujo para nuevas cooperativas.

## 3. Panel de Superadmin (`/superadmin`)
- [ ] **Gestión de Tenants (`/superadmin/tenants`)**: Ver lista de cooperativas y editar.
- [ ] **Gestión de Usuarios (`/superadmin/users`)**.
- [ ] **Configuración de Planes (`/superadmin/plans`)**.
- [ ] **Auditoría de Sistema (`/superadmin/audit`)**.
- [ ] **Editor de Landing (`/superadmin/landing`)**.

## 4. Panel de Admin / Cooperativa (`/admin`)
- [ ] **Dashboard Principal**: Métricas de socios y actividad.
- [ ] **Gestión de Socios (`/admin/members`)**.
- [ ] **Branding (`/admin/branding`)**: Cambiar logo/colores y verificar que se aplican a la landing `/c/[slug]`.
- [ ] **Facturación y Stripe (`/admin/billing`)**: Verificar estado de cuenta Connect.
- [ ] **Maquinaria y Trabajadores (`/admin/machinery`, `/admin/workers`)**.
- [ ] **Supervisión de Cuadernos (`/admin/supervision`)**.

## 5. Cuaderno Digital (Agricultor) (`/cuaderno`)
- [ ] **Dashboard del Agricultor**: Resumen de parcelas y tareas.
- [ ] **Gestión de Parcelas**: Crear, editar y ver en mapa.
- [ ] **Registro de Tratamientos**: Formulario de fitosanitarios.
- [ ] **Generación de Informes (`/cuaderno/report`)**: Exportación legal (Excel/PDF).
- [ ] **Gestión de Suscripción (`/cuaderno/suscripcion`)**: Integración con Stripe Customer Portal.

## 6. Panel Técnico (`/technician`)
- [ ] **Lista de Agricultores Asignados (`/technician/farmers`)**.
- [ ] **Recomendaciones (`/technician/recommendations`)**: Enviar consejo a un agricultor.
- [ ] **Gestión de Tareas (`/technician/tasks`)**.
- [ ] **Acceso a Cuaderno de Socio (`/technician/farmer/[id]/cuaderno`)**.

## 7. Integraciones Críticas
- [ ] **Pasarela Stripe**: Verificar que el checkout de suscripción funciona.
- [ ] **Mapas (Leaflet)**: Carga correcta de capas SIGPAC.
- [ ] **Envío de Emails**: Verificación de cuenta y notificaciones.
- [ ] **PWA / Service Worker**: Verificar que la web es instalable y funciona offline básico.

---
**Fecha de última revisión:** 02/05/2026
**Estado General:** 🟢 Desplegado en producción
