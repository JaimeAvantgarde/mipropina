# mipropina.es — Plan Maestro de Mejoras y Features

> **Para agentes:** Usar superpowers:executing-plans para ejecutar este plan. Cada tarea usa checkbox (`- [ ]`) para tracking.

**Goal:** Llevar mipropina.es a producción sólida con todas las features presupuestadas implementadas.

**Architecture:** Next.js 16 App Router + Supabase (Postgres + Auth + RLS) + Stripe Connect + Vercel. La app usa server components, API routes propias, y service role admin client para operaciones privilegiadas.

**Tech Stack:** Next.js 16, TypeScript strict, Tailwind 4, Supabase SSR, Stripe SDK v20, web-push, Vercel

---

## FASE 0 — Acciones MANUALES del usuario (no automatizables)

> ⚠️ Hacer esto PRIMERO antes de ejecutar ninguna fase de código.

### Acción A: Rotar Stripe LIVE keys
- [ ] Ir a https://dashboard.stripe.com/apikeys
- [ ] Revocar las claves actuales (`pk_live_51TC32x…` y `sk_live_51TC32x…`)
- [ ] Crear nuevas claves LIVE
- [ ] Actualizar en Vercel Dashboard (Settings → Environment Variables): `STRIPE_SECRET_KEY` y `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Actualizar en `.env.local` local

### Acción B: Actualizar webhook URL de Stripe
- [ ] Ir a https://dashboard.stripe.com/webhooks
- [ ] Cambiar endpoint de `https://mipropina-seven.vercel.app/api/stripe/webhook` → `https://mipropina.es/api/stripe/webhook`
- [ ] Copiar nuevo webhook secret y actualizar `STRIPE_WEBHOOK_SECRET` en Vercel y `.env.local`

### Acción C: Rotar VAPID keys
- [ ] Ejecutar: `npx web-push generate-vapid-keys`
- [ ] Actualizar `VAPID_PRIVATE_KEY` y `NEXT_PUBLIC_VAPID_PUBLIC_KEY` en Vercel y `.env.local`

### Acción D: Limpiar historial git (si las keys antiguas estaban commiteadas)
- [ ] `git log --all --full-history -- .env.local` para confirmar si hay commits con el archivo
- [ ] Si hay: usar BFG Repo Cleaner o `git filter-repo` para purgar
- [ ] Force push (solo si repo es privado y Jaime es el único developer)

---

## FASE 1 — Fixes Críticos (código, ejecutar ahora)

### Tarea 1: Eliminar endpoint debug peligroso

**Archivos:**
- Eliminar: `src/app/api/admin/debug/route.ts`

- [ ] **Step 1: Eliminar el archivo**
```bash
rm src/app/api/admin/debug/route.ts
```

- [ ] **Step 2: Verificar que no hay referencias al endpoint**
```bash
grep -r "admin/debug" src/ --include="*.ts" --include="*.tsx"
```
Esperado: sin resultados

- [ ] **Step 3: Commit**
```bash
git add -A && git commit -m "security: remove debug endpoint that exposes admin config"
```

---

### Tarea 2: Migración DB — columnas Stripe Connect

**Problema:** El webhook `account.updated` intenta escribir `stripe_charges_enabled` y `stripe_payouts_enabled` pero las columnas no existen → falla silenciosamente.

**Archivos:**
- Crear: `supabase/migrations/004_stripe_connect_columns.sql`

- [ ] **Step 1: Crear migración**

```sql
-- supabase/migrations/004_stripe_connect_columns.sql
-- Adds Stripe Connect status columns needed by account.updated webhook

ALTER TABLE restaurant
  ADD COLUMN IF NOT EXISTS stripe_charges_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_payouts_enabled  boolean NOT NULL DEFAULT false;

ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS stripe_payouts_enabled boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN restaurant.stripe_charges_enabled IS 'Set by Stripe account.updated webhook';
COMMENT ON COLUMN restaurant.stripe_payouts_enabled  IS 'Set by Stripe account.updated webhook';
COMMENT ON COLUMN staff.stripe_payouts_enabled        IS 'Set by Stripe account.updated webhook';
```

- [ ] **Step 2: Aplicar en producción**
```bash
cat supabase/migrations/004_stripe_connect_columns.sql | fly postgres connect -a huella-db -d mipropina
```
> ⚠️ Nota: mipropina usa Supabase directamente, NO fly.io. Ejecutar desde el panel SQL de Supabase Studio o con `supabase db push`.

```bash
# Opción recomendada con Supabase CLI:
supabase db push
```

- [ ] **Step 3: Actualizar type Restaurant en types.ts**

Añadir a `src/lib/types.ts` en el tipo `Restaurant`:
```typescript
stripe_charges_enabled: boolean;
stripe_payouts_enabled: boolean;
```

Y en `Staff`:
```typescript
stripe_payouts_enabled: boolean;
```

- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "feat: add stripe_charges_enabled/payouts_enabled columns (fixes account.updated webhook)"
```

---

### Tarea 3: Soft-delete para Staff

**Problema:** `staff/delete` hace hard delete físico → se pierden payouts históricos, reportes, etc.
**Solución:** Usar el campo `active` ya existente (¡ya está en la tabla!) → marcar `active = false`.

**Archivos:**
- Modificar: `src/app/api/staff/delete/route.ts`
- Modificar: `src/app/api/staff/update/route.ts` (verificar que no puede activar staff inactivo sin permiso)

- [ ] **Step 1: Cambiar DELETE por soft-delete en route.ts**

Reemplazar el bloque de delete en `src/app/api/staff/delete/route.ts`:
```typescript
// ANTES:
const { error: deleteError } = await supabaseAdmin
  .from("staff")
  .delete()
  .eq("id", id);

// DESPUÉS:
const { error: deleteError } = await supabaseAdmin
  .from("staff")
  .update({ active: false })
  .eq("id", id);
```

- [ ] **Step 2: Asegurar que los queries de equipo filtran active=true**

En `src/app/api/dashboard/data/route.ts` y cualquier query que liste staff, añadir `.eq("active", true)`.

- [ ] **Step 3: Commit**
```bash
git add -A && git commit -m "feat: soft-delete staff (set active=false instead of hard delete)"
```

---

### Tarea 4: Rate Limiting en APIs sensibles

**Stack:** `@upstash/ratelimit` + `@upstash/redis` (tier gratuito en upstash.com)

**Setup previo (usuario):**
- Crear cuenta en https://upstash.com (gratis)
- Crear Redis database
- Copiar `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` → añadir a Vercel + `.env.local`

**Archivos:**
- Crear: `src/lib/rate-limit.ts`
- Modificar: `src/app/api/stripe/create-payment/route.ts`
- Modificar: `src/app/api/auth/` (si existe)
- Modificar: `src/app/api/invite/route.ts`

- [ ] **Step 1: Instalar dependencias**
```bash
npm install @upstash/ratelimit @upstash/redis
```

- [ ] **Step 2: Crear helper de rate limiting**

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Fallback: si no está configurado Upstash, no bloquear (dev mode)
function createRatelimiter(requests: number, window: string) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, window as `${number} ${"s" | "m" | "h" | "d"}`),
  });
}

export const paymentRatelimit  = createRatelimiter(10, "1 m");  // 10 pagos/min por IP
export const generalRatelimit  = createRatelimiter(30, "1 m");  // 30 req/min general

export async function checkRateLimit(
  limiter: ReturnType<typeof createRatelimiter>,
  identifier: string
): Promise<{ limited: boolean; reset?: number }> {
  if (!limiter) return { limited: false };
  const { success, reset } = await limiter.limit(identifier);
  return { limited: !success, reset };
}
```

- [ ] **Step 3: Añadir rate limiting a create-payment**

En `src/app/api/stripe/create-payment/route.ts`, al inicio del handler:
```typescript
import { paymentRatelimit, checkRateLimit } from "@/lib/rate-limit";

// En el POST handler, después de parsear body:
const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
const { limited } = await checkRateLimit(paymentRatelimit, ip);
if (limited) {
  return NextResponse.json({ error: "Demasiadas solicitudes. Inténtalo más tarde." }, { status: 429 });
}
```

- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "feat: add rate limiting to payment API via Upstash"
```

---

### Tarea 5: Idempotency Keys en Stripe

**Problema:** Si el mismo payout se llama dos veces (doble click, retry), se crean transferencias duplicadas.

**Archivos:**
- Modificar: `src/app/api/stripe/create-payout/route.ts`

- [ ] **Step 1: Añadir idempotency key a cada transfer**

En el bucle de payouts dentro de `create-payout/route.ts`:
```typescript
// ANTES:
const transfer = await getStripe().transfers.create({
  amount: payout.amount_cents,
  currency: "eur",
  destination: staff.stripe_payout_id,
  metadata: { ... },
});

// DESPUÉS:
const idempotencyKey = `payout-${distribution.id}-${payout.staff_id}`;
const transfer = await getStripe().transfers.create(
  {
    amount: payout.amount_cents,
    currency: "eur",
    destination: staff.stripe_payout_id,
    metadata: { ... },
  },
  { idempotencyKey }
);
```

- [ ] **Step 2: Commit**
```bash
git add -A && git commit -m "feat: add idempotency keys to Stripe transfers to prevent duplicates"
```

---

### Tarea 6: Sentry para monitoreo de errores

**Archivos:**
- Modificar: `next.config.ts`
- Crear: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- Añadir env var: `SENTRY_DSN`

- [ ] **Step 1: Instalar Sentry**
```bash
npx @sentry/wizard@latest -i nextjs
```
> Esto crea automáticamente los archivos de configuración y modifica next.config.ts

- [ ] **Step 2: Añadir SENTRY_DSN a Vercel + .env.local**

- [ ] **Step 3: Commit**
```bash
git add -A && git commit -m "feat: add Sentry error monitoring"
```

---

## FASE 2 — Features Presupuestadas

### Tarea 7: Montos configurables (~250€)

**Descripción:** El restaurante puede personalizar los botones de propina (ej: [0.50€, 1€, 2€, 5€]).

**Archivos:**
- Crear: `supabase/migrations/005_restaurant_tip_amounts.sql`
- Modificar: `src/lib/types.ts`
- Modificar: `src/app/api/restaurant/update/route.ts`
- Modificar: `src/app/dashboard/ajustes/page.tsx`
- Modificar: `src/components/tipping/amount-grid.tsx`
- Modificar: `src/app/t/[slug]/page.tsx` (cargar config del restaurante)

- [ ] **Step 1: Migración DB**
```sql
-- supabase/migrations/005_restaurant_tip_amounts.sql
ALTER TABLE restaurant
  ADD COLUMN IF NOT EXISTS tip_amounts integer[] NOT NULL 
    DEFAULT ARRAY[100, 200, 300, 500]  -- cents: 1€, 2€, 3€, 5€
  ,ADD COLUMN IF NOT EXISTS custom_amount_enabled boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN restaurant.tip_amounts IS 'Array of tip amounts in cents shown as quick-select buttons';
COMMENT ON COLUMN restaurant.custom_amount_enabled IS 'Whether to show custom amount input';
```

- [ ] **Step 2: Actualizar types.ts**
```typescript
// Añadir a Restaurant type:
tip_amounts: number[];          // cents
custom_amount_enabled: boolean;
```

- [ ] **Step 3: Actualizar restaurant/update/route.ts**
```typescript
// Añadir a los campos actualizables:
if (Array.isArray(body.tip_amounts) && body.tip_amounts.length >= 2) {
  const amounts = body.tip_amounts.map(Number).filter(n => n >= 50 && n <= 50000);
  if (amounts.length >= 2) updates.tip_amounts = amounts;
}
if (typeof body.custom_amount_enabled === "boolean") {
  updates.custom_amount_enabled = body.custom_amount_enabled;
}
```

- [ ] **Step 4: Actualizar amount-grid.tsx para usar config dinámica**
```typescript
// Props: amounts: number[], onChange: (cents: number) => void
// Renderizar botones dinámicamente desde props en lugar de hardcoded
```

- [ ] **Step 5: Actualizar ajustes page para editar los montos**
- Añadir sección "Montos de propina"
- 4 inputs numéricos + toggle "Permitir monto personalizado"
- Guardar via PUT /api/restaurant/update

- [ ] **Step 6: Pasar config a la tipping page**
- En `src/app/t/[slug]/page.tsx`, incluir `tip_amounts` y `custom_amount_enabled` en el fetch del restaurante
- Pasar como props al `amount-grid`

- [ ] **Step 7: Commit**
```bash
git add -A && git commit -m "feat: configurable tip amounts per restaurant"
```

---

### Tarea 8: Mensaje de agradecimiento personalizado (~200€)

**Descripción:** El restaurante puede configurar el mensaje que ve el cliente al completar una propina.

**Archivos:**
- Crear: `supabase/migrations/006_thank_you_message.sql`
- Modificar: `src/lib/types.ts`
- Modificar: `src/app/api/restaurant/update/route.ts`
- Modificar: `src/app/dashboard/ajustes/page.tsx`
- Modificar: `src/app/t/[slug]/success/page.tsx`

- [ ] **Step 1: Migración DB**
```sql
-- supabase/migrations/006_thank_you_message.sql
ALTER TABLE restaurant
  ADD COLUMN IF NOT EXISTS thank_you_message text 
    DEFAULT '¡Gracias por tu propina! El equipo lo agradece mucho.';

COMMENT ON COLUMN restaurant.thank_you_message IS 'Custom message shown on tip success page';
```

- [ ] **Step 2: Actualizar types.ts**
```typescript
thank_you_message: string | null;
```

- [ ] **Step 3: Actualizar restaurant/update**
```typescript
if (typeof body.thank_you_message === "string") {
  updates.thank_you_message = body.thank_you_message.slice(0, 300).trim();
}
```

- [ ] **Step 4: Añadir campo en ajustes page**
- Textarea con max 300 caracteres
- Placeholder: "¡Gracias por tu propina!..."
- Contador de caracteres

- [ ] **Step 5: Mostrar en success page**
- La página `/t/[slug]/success` recibe el restaurante vía params/searchParams
- Mostrar `restaurant.thank_you_message` en lugar del texto hardcoded

- [ ] **Step 6: Commit**
```bash
git add -A && git commit -m "feat: custom thank-you message per restaurant"
```

---

### Tarea 9: Tema de colores personalizable (~250€)

**Descripción:** El restaurante personaliza el color principal de su página de propina. La columna `theme_color` ya existe en la DB.

**Archivos:**
- Modificar: `src/app/api/restaurant/update/route.ts`
- Modificar: `src/app/dashboard/ajustes/page.tsx`
- Modificar: `src/app/t/[slug]/page.tsx`
- Modificar: `src/app/t/[slug]/success/page.tsx`
- Modificar: `src/globals.css` (variables CSS dinámicas)

- [ ] **Step 1: Actualizar restaurant/update para aceptar theme_color**
```typescript
// Validar que es un color hex válido:
if (body.theme_color && /^#[0-9A-Fa-f]{6}$/.test(body.theme_color)) {
  updates.theme_color = body.theme_color;
}
```

- [ ] **Step 2: Añadir color picker en ajustes page**
```tsx
// Input type="color" + preview del resultado
// Presets: 6 colores populares para hostelería
const PRESET_COLORS = ["#2ECC87", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
```

- [ ] **Step 3: Aplicar color en tipping page como CSS variable**
```tsx
// En layout/page de /t/[slug]:
<div style={{ "--brand-color": restaurant.theme_color } as React.CSSProperties}>
  ...
</div>
```

- [ ] **Step 4: Reemplazar colores hardcoded en tipping components**
- Cambiar clases Tailwind de color fijo a `style={{ color: "var(--brand-color)" }}`
- Botones de propina, indicador de progreso, botón de pagar

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: customizable brand color per restaurant"
```

---

### Tarea 10: QR imprimible con diseño (~400€)

**Descripción:** Página imprimible con QR grande, logo del restaurante y branding. PDF-ready.

**Archivos:**
- Crear: `src/app/dashboard/qr-print/page.tsx`
- Crear: `src/app/dashboard/qr-print/print.css`
- Modificar: `src/app/dashboard/page.tsx` (añadir botón "Imprimir QR")

- [ ] **Step 1: Instalar qrcode.react para QR SVG**
```bash
npm install qrcode.react
```

- [ ] **Step 2: Crear página de impresión**
```tsx
// src/app/dashboard/qr-print/page.tsx
// - Logo del restaurante (emoji o imagen)
// - Nombre del restaurante
// - QR grande (SVG, 300x300)
// - "Deja tu propina escaneando este código"
// - URL debajo del QR
// - Botón imprimir (solo visible en pantalla, oculto al imprimir)
// - @media print: ocultar sidebar, botones, nav
```

- [ ] **Step 3: Añadir variantes: mesa específica, camarero específico**
- Query param `?table=Mesa 1` para personalizar el QR URL
- QR URL: `https://mipropina.es/t/[slug]?table=Mesa+1`

- [ ] **Step 4: CSS de impresión**
```css
/* print.css */
@media print {
  .no-print { display: none !important; }
  body { margin: 0; }
  .qr-container { page-break-inside: avoid; }
}
```

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "feat: printable QR with restaurant branding"
```

---

### Tarea 11: Exportar CSV (~250€)

**Descripción:** Owner puede descargar un CSV con el historial de propinas y repartos.

**Archivos:**
- Crear: `src/app/api/export/tips/route.ts`
- Crear: `src/app/api/export/distributions/route.ts`
- Modificar: `src/app/dashboard/page.tsx` (botón exportar)

- [ ] **Step 1: Crear endpoint export/tips**
```typescript
// GET /api/export/tips?from=2025-01-01&to=2025-12-31
// Requiere requireOwner()
// Devuelve CSV con: fecha, monto, platform_fee, neto, estado
// Headers: Content-Type: text/csv, Content-Disposition: attachment; filename="propinas-2025.csv"
```

- [ ] **Step 2: Crear endpoint export/distributions**
```typescript
// GET /api/export/distributions
// CSV con: fecha, total, método, estado, camareros pagados
```

- [ ] **Step 3: Añadir botón en dashboard**
```tsx
// Botón "Exportar CSV" en la sección de historial
// Llama a /api/export/tips con el rango de fechas actual
// Usa fetch + URL.createObjectURL para descarga directa
```

- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "feat: CSV export for tips and distributions"
```

---

### Tarea 12: Notificaciones por email (~350€)

**Descripción:** Email al owner cuando llega una nueva propina. Configurable (on/off).

**Stack:** Resend (https://resend.com) — tier gratuito: 3.000 emails/mes. SDK oficial.

**Setup previo (usuario):**
- Crear cuenta en https://resend.com
- Verificar dominio `mipropina.es` (añadir registros DNS)
- Crear API key → añadir `RESEND_API_KEY` a Vercel + `.env.local`

**Archivos:**
- Instalar: `resend`
- Crear: `src/lib/email.ts`
- Crear: `src/emails/new-tip.tsx` (template React Email)
- Modificar: `src/app/api/stripe/webhook/route.ts`
- Crear: `supabase/migrations/007_email_notifications.sql`
- Modificar: `src/app/dashboard/ajustes/page.tsx`

- [ ] **Step 1: Instalar dependencias**
```bash
npm install resend @react-email/components
```

- [ ] **Step 2: Migración DB**
```sql
-- supabase/migrations/007_email_notifications.sql
ALTER TABLE restaurant
  ADD COLUMN IF NOT EXISTS email_notifications_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notification_email text;  -- null = usa el email del owner

COMMENT ON COLUMN restaurant.notification_email IS 'Override email for tip notifications, null = owner email';
```

- [ ] **Step 3: Crear helper email**
```typescript
// src/lib/email.ts
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

export async function sendTipNotificationEmail({
  to, restaurantName, amountCents, totalToday
}: { to: string; restaurantName: string; amountCents: number; totalToday: number }) {
  if (!resend) return;
  await resend.emails.send({
    from: "mipropina.es <notificaciones@mipropina.es>",
    to,
    subject: `Nueva propina en ${restaurantName}: ${(amountCents / 100).toFixed(2)}€`,
    react: NewTipEmail({ restaurantName, amountCents, totalToday }),
  });
}
```

- [ ] **Step 4: Crear template React Email**
```tsx
// src/emails/new-tip.tsx
// Email bonito y responsivo con:
// - Header con logo mipropina
// - "Has recibido una propina de X€"
// - Total del día
// - CTA "Ver en dashboard"
// - Footer con unsubscribe
```

- [ ] **Step 5: Conectar en webhook**
En `webhook/route.ts`, en el case `payment_intent.succeeded`:
```typescript
// Obtener email del owner y config de notificaciones
const { data: restaurant } = await supabaseAdmin
  .from("restaurant")
  .select("name, email_notifications_enabled, notification_email, owner_id")
  .eq("id", restaurantId)
  .single();

if (restaurant?.email_notifications_enabled) {
  const ownerEmail = restaurant.notification_email || 
    (await supabaseAdmin.auth.admin.getUserById(restaurant.owner_id)).data.user?.email;
  if (ownerEmail) {
    sendTipNotificationEmail({
      to: ownerEmail,
      restaurantName: restaurant.name,
      amountCents: tipCents,
      totalToday: 0, // TODO: calcular
    }).catch(console.error);
  }
}
```

- [ ] **Step 6: Añadir toggle en ajustes page**
- Toggle "Notificaciones por email"
- Campo opcional "Email de notificaciones" (por defecto: email del owner)

- [ ] **Step 7: Commit**
```bash
git add -A && git commit -m "feat: email notifications for new tips via Resend"
```

---

### Tarea 13: Google OAuth (~200€)

**Descripción:** El componente `GoogleButton` ya existe. Hay que verificar si está configurado en Supabase y conectarlo a las páginas de auth.

**Archivos:**
- `src/components/auth/google-button.tsx` (leer, ya existe)
- Modificar: `src/app/auth/login/page.tsx`
- Modificar: `src/app/auth/registro/page.tsx`
- Setup en: Supabase Dashboard + Google Cloud Console

**Setup previo (usuario):**
- En Google Cloud Console: crear OAuth 2.0 credentials
- En Supabase → Authentication → Providers → Google: activar con Client ID + Secret
- Añadir redirect URL: `https://gmuyfeewrcpidchcekmf.supabase.co/auth/v1/callback`

- [ ] **Step 1: Leer google-button.tsx para entender la implementación actual**

- [ ] **Step 2: Añadir GoogleButton a login page**
```tsx
// Después del formulario de email/password:
<div className="relative my-4">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t border-gray-200" />
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-white px-2 text-gray-500">O continúa con</span>
  </div>
</div>
<GoogleButton />
```

- [ ] **Step 3: Añadir GoogleButton a registro page**
- Mismo patrón que login

- [ ] **Step 4: Commit**
```bash
git add -A && git commit -m "feat: Google OAuth on login and register pages"
```

---

### Tarea 14: Multi-restaurante (~1.000€)

**Descripción:** Un owner puede crear y gestionar múltiples restaurantes. Dashboard con selector de restaurante activo.

> ⚠️ Esta es la tarea más compleja. Requiere refactorizar el modelo de datos.

**Cambios en DB:**
- La relación usuario-restaurante es actualmente 1:1 (staff tiene restaurant_id)
- Con multi-restaurante: un user puede ser owner de múltiples restaurants
- El middleware/auth debe saber en cuál restaurante está trabajando ahora

**Estrategia:**
- Mantener la tabla staff tal cual (ya soporta múltiples filas por auth_user_id)
- Añadir `active_restaurant_id` como cookie de sesión del dashboard
- Selector de restaurante en el sidebar

**Archivos:**
- Crear: `supabase/migrations/008_multi_restaurant.sql`
- Modificar: `src/lib/auth.ts` (permitir multiple restaurant_ids)
- Crear: `src/lib/active-restaurant.ts` (cookie/session de restaurante activo)
- Modificar: `src/app/dashboard/layout.tsx` (selector en sidebar)
- Modificar: `src/components/dashboard/sidebar.tsx`
- Modificar: `src/app/api/restaurant/create/route.ts` (permitir crear más de uno)

- [ ] **Step 1: Migración — eliminar restricción de un restaurante por usuario**
```sql
-- supabase/migrations/008_multi_restaurant.sql
-- Ya no hay restricción dura de 1 owner por restaurante
-- El constraint actual es UNIQUE(restaurant_id, email) en staff, que está bien
-- Solo necesitamos quitar cualquier check que limite a 1 restaurante por user
```

- [ ] **Step 2: Helper de restaurante activo**
```typescript
// src/lib/active-restaurant.ts
// Lee/escribe una cookie httpOnly "active_restaurant_id"
// Si no hay cookie, usa el primero disponible del usuario
export async function getActiveRestaurantId(userId: string): Promise<string | null>
export async function setActiveRestaurantId(restaurantId: string): Promise<void>
```

- [ ] **Step 3: Actualizar requireAuth para multi-restaurante**
```typescript
// En lugar de devolver un único restaurantId,
// devolver todos los restaurantIds del usuario y el activo
```

- [ ] **Step 4: Selector de restaurante en sidebar**
```tsx
// Dropdown con nombre del restaurante activo
// Clic → lista de todos los restaurantes del usuario
// Opción "Crear nuevo restaurante"
// Al seleccionar → actualiza cookie + reload
```

- [ ] **Step 5: Permitir crear restaurante adicional desde dashboard**
- Botón en el selector → modal de creación
- Ya existe `/api/restaurant/create` pero puede tener guardas de "solo uno"

- [ ] **Step 6: Tests end-to-end**
- Crear 2 restaurantes con mismo owner
- Verificar que datos están aislados
- Verificar que el selector funciona

- [ ] **Step 7: Commit**
```bash
git add -A && git commit -m "feat: multi-restaurant support with active restaurant switcher"
```

---

## FASE 3 — Apps Nativas iOS + Android (~5.000€)

> Esta fase es un proyecto separado. Definir spec detallada cuando llegue el momento.

**Scope aproximado:**
- App iOS (Swift/SwiftUI) — arquitectura hexagonal similar a Huella
- App Android (Kotlin/Compose) — arquitectura MVVM+Clean similar a Huella
- API REST nueva o extensión de la existente para mobile
- Auth con Supabase native SDK
- Push notifications nativas
- QR scanner integrado
- Dashboard de propinas

**Estimación:** 3-4 semanas de desarrollo por plataforma.

---

## Resumen de Tareas y Valor

| Fase | Tarea | Valor | Estado |
|------|-------|-------|--------|
| 0 | Rotar keys + Webhook URL | Seguridad crítica | Manual |
| 1 | Eliminar /api/admin/debug | Seguridad | - |
| 1 | Migración DB stripe_connect | Fix webhook | - |
| 1 | Soft-delete staff | Data integrity | - |
| 1 | Rate limiting | Seguridad | - |
| 1 | Idempotency keys | Fiabilidad | - |
| 1 | Sentry | Observabilidad | - |
| 2 | Montos configurables | ~250€ | - |
| 2 | Mensaje agradecimiento | ~200€ | - |
| 2 | Tema de colores | ~250€ | - |
| 2 | QR imprimible | ~400€ | - |
| 2 | Exportar CSV | ~250€ | - |
| 2 | Email notificaciones | ~350€ | - |
| 2 | Google OAuth | ~200€ | - |
| 2 | Multi-restaurante | ~1.000€ | - |
| 3 | Apps nativas | ~5.000€ | Plan separado |

**Total features presupuestadas: ~7.900€**
