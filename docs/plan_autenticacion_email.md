# Plan de Implementación: Autenticación con Confirmación de Email de Supabase

Este documento detalla el plan de acción para implementar (y/o consolidar) el sistema de autenticación con Supabase en la aplicación Next.js (App Router), asegurando un flujo completo de registro con verificación por correo electrónico.

## Stack Tecnológico
* **Framework:** Next.js (App Router)
* **Autenticación:** Supabase JS v2 (`@supabase/supabase-js` y `@supabase/ssr`)
* **Arquitectura:** Separación estricta entre cliente (`lib/supabase/client.ts`) y servidor (`lib/supabase/server.ts` y middleware).

---

## 1. Configuración del Entorno y Supabase

### 1.1 Variables de Entorno (Local y Producción)
Asegurar que el archivo `.env.local` (y las variables en Vercel) contengan:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### 1.2 Configuración del Dashboard de Supabase (CRÍTICO)
1. Navegar a **Authentication > URL Configuration** en el panel de Supabase.
2. **Site URL:**  
   * Local: `http://localhost:3000`  
   * Producción: `https://inagrosolutions.com`
3. **Redirect URLs (Añadir ambas):**
   * Local: `http://localhost:3000/auth/callback`
   * Producción: `https://inagrosolutions.com/auth/callback`
4. **Email Templates:** Personalizar la plantilla de confirmación de registro (Confirm signup) garantizando que el enlace utilice `{{ .ConfirmationURL }}`.

---

## 2. Petición de Registro (`/signup` o `/register`)

### 2.1 Requisitos de la Interfaz
Formulario con campos obligatorios para:
* Nombre (`first_name`)
* Apellidos (`last_name`)
* Email (`email`)
* Contraseña (`password`)
* Casillas de aceptación (Privacidad y Ley).

### 2.2 Lógica Cliente
Al enviar el formulario, llamar a Supabase:
```typescript
const origin = window.location.origin;

const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    // IMPORTANTE: Ruta hacia nuestro callback handler
    emailRedirectTo: `${origin}/auth/callback`,
    data: {
      first_name: firstName,
      last_name: lastName,
      // ... otros metadatos (como tenant_slug o role)
    }
  }
});

if (error) {
  // Manejar el error (ej: email ya registrado)
} else {
  // Manejar el éxito
  // Mostrar feedback: "Revisa tu correo para confirmar tu cuenta"
}
```

---

## 3. Callback de Verificación (`/auth/callback/route.ts` o página)

*En Next.js App Router con `@supabase/ssr`, es preferible usar un Route Handler (`route.ts`) para el callback de autenticación y gestionar las cookies del servidor.*

### 3.1 Flujo del Handler
1. Leer el código temporal (`code`) de los parámetros de búsqueda de la URL.
2. Intercambiar el código por una sesión usando `supabase.auth.exchangeCodeForSession(code)`.
3. Si el intercambio es exitoso, redirigir al dashboard seguro (ej. `/cuaderno`).
4. Si hay un error (enlace inválido o expirado), redirigir a `/login?error=invalid_link` para poder mostrar un aviso al usuario.

---

## 4. Persistencia del Perfil de Usuario

Para el manejo del perfil (nombre, apellidos, rol), Supabase permite dos estrategias:

*   **Opción A (Guardado en metadata):** Guardarlos en `user_metadata` durante el `signUp`, como se muestra en el punto 2. Supabase lo gestiona en la tabla oculta auth.users.
*   **Opción B (Tabla `users` o `profiles`):**
    1. Crear una tabla `users` con FK a `auth.users(id)`.
    2. Crear un *Trigger* en PostgreSQL en la base de datos de Supabase que automáticamente inserte la fila utilizando `new.raw_user_meta_data`.

*(En este proyecto, se usa un trigger de BD para volcar el perfil a la tabla pública `users` basándose en los metadatos de auth).*

---

## 5. Middleware y Protección de Rutas

El archivo `src/middleware.ts` interceptará todas las peticiones para verificar la sesión.

1.  Actualizar la sesión con la nueva librería SSR en servidores (`supabase.auth.getUser()`).
2.  Si la ruta es privada (ej. `/dashboard` o `/cuaderno`) y NO hay usuario, redirigir a `/login`.
3.  Si la ruta es de autenticación (`/login`, `/signup`) y SÍ hay usuario, redirigir a `/cuaderno` automáticamente (para evitar reingresos).

---

## 6. UX / Manejo de Errores a verificar
*   **Loading:** Los botones "Crear Cuenta" o "Inicia sesión" se desactivarán o mostrarán íconos de carga mientras se ejecuta una promesa.
*   **Gestión de `Toast` Notifications:**
    *   Fallo en la creación: "El correo ya ha sido registrado" / Error 400.
    *   Éxito pre-confirmación: "Revisa tu bandeja de entrada o carpeta SPAM".
    *   Fallo en el magic link/callback: "Enlace expirado. Inténtalo de nuevo".

---

## Siguientes Pasos (Checklist de Ejecución)
- [x] 1. Verificar `emailRedirectTo` y `URL Configuration` en el dashboard de Supabase (para `localhost` y `inagrosolutions.com`).
- [x] 2. Chequear que `src/app/auth/callback/route.ts` procesa el código e inserta las cookies correctas.
- [x] 3. Asegurar las validaciones visuales (loading states, toast messages).
- [ ] 4. Testear el flujo completo registrando un usuario y haciendo clic en el mail.

## Correcciones Aplicadas (12-Abril-2026)
- [x] **FIX RLS:** Añadida política INSERT en `tenants` para que usuarios autenticados sin tenant puedan crear uno.
- [x] **FIX RLS:** Añadida política UPDATE en `users` para que usuarios puedan actualizar su propio perfil.
- [x] **FIX Trigger:** `handle_new_user()` actualizado a `SECURITY DEFINER` para crear el tenant automáticamente en la BD durante el signup de empresa, evitando problemas de RLS en el callback.
- [x] **FIX Callback:** Simplificado `auth/callback/route.ts` — la creación de tenant se delega al trigger de BD. El callback solo gestiona: intercambio de código, aceptación de invitaciones, y auto-vinculación de agricultores.
- [x] **FIX Data:** Vinculados manualmente los 2 usuarios huérfanos (`ramumarti+test1` y `ramumarti+1r`) que se registraron antes del fix.

