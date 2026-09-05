# Revisión de arquitectura y plan de refactor

Fecha: 2026-09-04
Alcance: `src/app/api/`, `src/app/admin/`, `src/lib/services/`, `src/lib/`, `src/components/`, `prisma/schema.prisma`, `ARCHITECTURE.md`.

Esta revisión se basó en lectura directa del código (no en nombres de archivo). Cada hallazgo cita las rutas exactas verificadas.

---

## 1. Arquitectura actual (lo que el código realmente hace)

Stack: Next.js 16 (App Router), Prisma (`prisma-client` generator, output en `src/generated/prisma`), PostgreSQL (Supabase), JWT en cookie HttpOnly (`jose`), Tailwind.

### Capas observadas

```
prisma/schema.prisma          → 13 modelos (User, Business, Client, Category, Product,
                                  Order, OrderItem, Payment, Promotion, Combo, Settings,
                                  AuditLog) + enums de estado/tipo.

src/generated/prisma/          → cliente Prisma tipado (no editar).

src/lib/prisma.ts              → instancia única de PrismaClient (singleton para dev/HMR).
src/lib/auth.ts                → createToken/verifyToken (JWT HS256, jose), getCookieName().
src/middleware.ts               → guard de Edge para /admin/*: valida cookie+JWT (sin rol).

src/lib/services/*.service.ts  → capa de dominio: una función por operación
                                  (listX, createX, updateX, deleteX), siempre habla
                                  directo con `prisma`. Es la capa mejor construida
                                  del proyecto: sin lógica HTTP, tipos DTO propios,
                                  bien separada por dominio (menu, order, promotion,
                                  combo, payment, client, business, settings, auth,
                                  auditLog, report, reportFile, assistant).

src/app/api/v1/*/route.ts      → 24 route handlers. Cada uno repite: leer cookie →
                                  verifyToken → findUserById → chequear role ADMIN →
                                  parsear/validar body a mano → llamar al service →
                                  NextResponse.json.

src/app/api/auth/*             → login/logout/me/register (fuera de v1, capa de sesión).

src/lib/admin/*.ts             → formatters/tipos compartidos entre página y componentes
                                  de presentación (orders.ts, users.ts, clients.ts) —
                                  no son hooks de React, son funciones puras de mapeo
                                  API→UI.

src/components/admin/*         → componentes de presentación puros por dominio
                                  (orders/, clients/, dashboard/, deliveries/, settings/,
                                  auth/, ui/). Reciben datos y callbacks por props;
                                  no hacen fetch.

src/app/admin/(panel)/*/page.tsx → páginas "use client". Aquí vive el fetch, el estado
                                  de formularios, la validación de UI y, en los peores
                                  casos, también el markup completo del CRUD.

src/hooks/                     → solo contiene useAuth.ts (+ index.ts). El patrón de
                                  "un hook por dominio" que describe ARCHITECTURE.md
                                  (useProducts, useXxx) no existe para ningún otro
                                  dominio del panel.
```

### Flujo de una request típica (ej. editar un producto del menú)

```
┌──────────────────────┐
│ menu/page.tsx         │  "use client"
│ handleSaveProduct()   │  valida en el cliente (nombre, categoría, precio)
└──────────┬────────────┘
           │ fetch PATCH /api/v1/products/123  { name, categoryId, price, ... }
           ▼
┌──────────────────────────────┐
│ src/app/api/v1/products/[id]/route.ts │
│  1. cookies() → token de sesión        │
│  2. verifyToken(token) → payload JWT   │  ← jose, HS256, secreto en env
│  3. findUserById(payload.userId)       │  ← lib/services/auth.service.ts
│  4. user.role === "ADMIN"?             │  si no, 401/403 y corta aquí
│  5. parsear/validar body a mano        │  (if !name, if price<0, ...)
└──────────┬────────────────────────────┘
           │ llama a service
           ▼
┌──────────────────────────────┐
│ lib/services/menu.service.ts │  updateProduct(id, data) → prisma.product.update(...)
└──────────┬────────────────────┘
           ▼
┌──────────────────────────────┐
│ Prisma Client → PostgreSQL   │  (Supabase)
└──────────────────────────────┘
           │ resultado
           ▼
   NextResponse.json({ product })  → de vuelta al fetch en el page.tsx
           │
           ▼
   setState(...) en el componente → re-render de la tabla
```

El guard de `middleware.ts` solo protege la *navegación* de páginas `/admin/**` (verifica que el JWT sea válido), pero **no valida el rol** — cualquier JWT válido (aunque no sea ADMIN, dado que hoy solo existe ese rol) pasa. La verificación de rol real ocurre solo dentro de cada `route.ts` vía `requireAdmin()`.

### Lo que es consistente

- La capa de servicios (`src/lib/services/`) es uniforme: sin `cookies()`/`headers()`, sin lógica HTTP, siempre recibe/devuelve DTOs planos. Es el único punto que respeta al 100% la regla de `ARCHITECTURE.md` ("lib: funciones reutilizables del servidor... no usar use client").
- El patrón `pedidos/page.tsx` + `components/admin/orders/` + `lib/admin/orders.ts` (fetch en la página, formateo en `lib/admin`, presentación en columnas/paneles reutilizables) se repite razonablemente bien en `clientes/page.tsx` + `components/admin/clients/`. Es el mejor ejemplo de separación de responsabilidades que existe hoy en el panel, y es el patrón que el resto del panel debería copiar.
- Uso consistente de JWT en cookie HttpOnly vía `jose`, sin sesiones en servidor ni almacenamiento adicional.

---

## 2. Desviaciones respecto a `ARCHITECTURE.md`

`ARCHITECTURE.md` prescribe explícitamente:

> **Hooks** (`src/hooks/`): lógica reutilizable con estado (fetch, formularios...). Un hook por archivo: `useAuth.ts`, `useFetch.ts`, etc... "Añadir nuevos hooks: crear `src/hooks/useNombre.ts` (por ejemplo `useProducts.ts`)".

Realidad: de ~11 páginas del panel, **solo `useAuth` existe como hook**. Todo el resto (menú, promociones, pagos, entregas, configuración, notificaciones, logs, auth-y-roles) hace `fetch` + `useState` + `useCallback` directamente dentro del componente de página. Esto es la causa raíz de los "God components" (ítem #2 del plan).

Otras desviaciones:

- `ARCHITECTURE.md` no menciona una carpeta de autorización de servidor (`src/lib/api/` o similar) para centralizar checks de sesión/rol en los route handlers — y, en la práctica, cada handler la reimplementa desde cero (ítem #1 del plan).
- El documento no dice nada sobre logging/auditoría, pero el propio schema de Prisma (`model AuditLog`) y `src/lib/services/auditLog.service.ts` (con `createAuditLog`) sugieren que sí formaba parte de la intención de diseño. En la práctica **`createAuditLog` nunca se invoca** desde ningún route handler (ver hallazgo #4 abajo): la tabla de auditoría solo tiene lectura (`GET /api/v1/audit-logs`), nunca escritura real desde las mutaciones del panel.
- `middleware.ts` duplica literalmente la constante `COOKIE_NAME` y el fallback de `SECRET` de `src/lib/auth.ts` en vez de importarlos (no puede importar `lib/auth.ts` tal cual porque corre en Edge runtime, pero el fallback hardcodeado de secreto se duplicó a mano en dos archivos — ver hallazgo de seguridad más abajo).

---

## 3. Plan de refactor priorizado

### 3.1. Centralizar `requireAdmin()` en un helper compartido — **Prioridad 1 (confirmado)**

**Problema:** la función `async function requireAdmin()` (leer cookie de sesión → `verifyToken` JWT → `findUserById` → comprobar `role === "ADMIN"`) está copiada casi al carácter en **22 de los 24** route handlers de `src/app/api/v1/*/route.ts`. Peor aún: **2 archivos** (`src/app/api/v1/orders/route.ts` y `src/app/api/v1/users/route.ts`) ni siquiera tienen la función local — repiten las mismas 4 líneas de chequeo inline dentro de cada `GET`/`POST`, duplicando la duplicación.

**Archivos afectados (22 con la función local, verificados por grep):**
`assistant/route.ts`, `assistant/report/route.ts`, `audit-logs/route.ts`, `audit-logs/[id]/route.ts`, `businesses/route.ts`, `businesses/[id]/route.ts`, `categories/route.ts`, `categories/[id]/route.ts`, `clients/route.ts`, `clients/[id]/route.ts`, `combos/route.ts`, `combos/[id]/route.ts`, `orders/[id]/route.ts`, `payments/route.ts`, `payments/[id]/route.ts`, `products/route.ts`, `products/[id]/route.ts`, `promotions/route.ts`, `promotions/[id]/route.ts`, `reports/route.ts`, `settings/route.ts`, `users/[id]/route.ts`
**+ 2 archivos con el chequeo inline sin función:** `orders/route.ts`, `users/route.ts`

**Estado final propuesto:**
- Un único módulo `src/lib/api/requireAdmin.ts` que exporte:
  - `requireAdmin(): Promise<{ user: AdminUser } | { error: NextResponse }>` — misma firma que hoy, para poder migrar archivo por archivo sin romper nada.
  - `withAdminAuth(handler: (req, ctx, user) => Promise<NextResponse>)` — wrapper de orden superior que los `route.ts` usan como `export const GET = withAdminAuth(async (req, ctx, user) => {...})`, eliminando el boilerplate `const { error } = await requireAdmin(); if (error) return error;` de cada handler (son ~46 apariciones hoy, 2 por archivo en promedio).
- Los 24 route handlers importan de `@/lib/api/requireAdmin` en vez de redefinir la función.
- Beneficio adicional: un solo lugar para endurecer políticas (rate limiting, logging de intentos no autorizados, futuro soporte multi-rol) sin tocar 24 archivos.
- Migración segura: puede hacerse incrementalmente (un archivo por PR) porque la firma no cambia.

### 3.2. Descomponer los "God components" de `menu` y `promociones` — **Prioridad 2 (confirmado)**

**Problema:** `src/app/admin/(panel)/menu/page.tsx` (637 líneas) y `src/app/admin/(panel)/promociones/page.tsx` (1198 líneas) mezclan en un solo componente: fetch de datos, validación de formularios, manejo de estado de edición/alta/baja, y el JSX completo de tablas + formularios. `promociones/page.tsx` es el caso más severo: son **tres dominios independientes** (cupones, combos, promociones por tiempo) implementados como tres copias casi idénticas del mismo patrón fetch/estado/CRUD dentro del mismo archivo (confirmado leyendo las secciones de estado: `cupones`/`formCupon`, `combos`/`formCombo`, `promosTiempo`/`formTiempo`, cada una con su propio `fetchX`, `handleSaveX`, `handleDeleteX`).

**Archivos afectados:**
- `src/app/admin/(panel)/menu/page.tsx`
- `src/app/admin/(panel)/promociones/page.tsx`

**Patrón de referencia ya existente y que funciona bien:**
- `src/app/admin/(panel)/pedidos/page.tsx` (179 líneas) + `src/lib/admin/orders.ts` (formatters) + `src/components/admin/orders/` (`OrderDetailPanel.tsx`, `orderTableColumns.tsx`).
- `src/app/admin/(panel)/clientes/page.tsx` (371 líneas) + `src/lib/admin/clients.ts` + `src/components/admin/clients/`.

**Estado final propuesto:**
- Crear hooks de datos en `src/hooks/` (cumpliendo lo que ya prescribe `ARCHITECTURE.md` pero que nadie implementó salvo `useAuth`):
  - `useCategories()` y `useProducts(categoryId?)` para `menu/page.tsx` — cada uno encapsula fetch, estado de carga/error y las mutaciones (create/update/delete/toggle) que hoy están sueltas en el componente.
  - `usePromotions(type)`, `useCombos()` para `promociones/page.tsx` — separando explícitamente los tres sub-dominios (cupones, combos, tiempo) en hooks independientes en vez de bloques de estado paralelos en un mismo componente.
- Extraer el JSX de tablas/formularios a `src/components/admin/menu/` y `src/components/admin/promotions/` (columnas de tabla + paneles de alta/edición), siguiendo el mismo esquema de `components/admin/orders/` (un archivo de columnas + un panel de detalle/edición, re-exportados desde un `index.ts`).
- Resultado esperado: cada `page.tsx` queda como orquestador delgado (similar a `pedidos/page.tsx`, <200 líneas), y la lógica de datos queda testeable de forma aislada de la UI.

### 3.3. Activar la escritura de `AuditLog` — **Prioridad 3 (hallazgo nuevo)**

**Problema:** el schema define `model AuditLog` con soporte completo para trazabilidad (`action`, `resourceType`, `resourceId`, `oldValue`, `newValue`, `logType`), y `src/lib/services/auditLog.service.ts` expone `createAuditLog()`. Sin embargo, una búsqueda de `createAuditLog(` en todo `src/` solo encuentra su propia definición — **ninguna ruta de creación/edición/borrado del panel (productos, categorías, promociones, combos, pagos, clientes, usuarios, settings, businesses) la invoca nunca**. La página `src/app/admin/(panel)/logs/page.tsx` (250 líneas) existe para mostrar esta auditoría, pero solo puede mostrar logs si alguna vez se insertan, y hoy no se insertan por ningún camino de escritura del panel.

**Archivos afectados:** los 24 handlers `POST`/`PATCH`/`DELETE` bajo `src/app/api/v1/*` que mutan datos, más `src/lib/services/auditLog.service.ts` (ya listo, solo falta consumirlo) y `src/app/admin/(panel)/logs/page.tsx` (consumidor final, sin cambios).

**Estado final propuesto:** integrar `createAuditLog()` en el mismo wrapper `withAdminAuth` del ítem 3.1 (o en cada service de mutación), para que cada operación de escritura relevante quede registrada automáticamente sin que cada handler tenga que recordar hacerlo a mano — evitando así repetir el mismo problema de duplicación/omisión que el ítem 3.1 resuelve para la autenticación.

### 3.4. Manejo de errores inconsistente entre route handlers — **Prioridad 4**

**Problema:** algunos handlers envuelven la llamada al service en `try/catch` y devuelven un JSON de error controlado (ej. `promotions/route.ts` POST: `catch (e) { ... NextResponse.json({ error: msg }, { status: 400 }) }`), mientras que otros (ej. `products/route.ts` POST, que llama a `createProduct(...)` sin ningún `try/catch` alrededor) dejan que una excepción de Prisma (por ejemplo una FK inválida en `categoryId`) se propague sin capturar, generando una respuesta de error genérica de Next.js en vez de un JSON consistente con el resto de la API.

**Archivos afectados (muestra representativa, no exhaustiva):** `src/app/api/v1/products/route.ts`, `src/app/api/v1/categories/route.ts` (comparar con `src/app/api/v1/promotions/route.ts`, que sí maneja el caso correctamente).

**Estado final propuesto:** definir un único formato de error (`{ error: string }` + status code apropiado) y aplicarlo de forma sistemática, idealmente centralizado dentro del mismo `withAdminAuth` (ítem 3.1) con un `try/catch` global que capture errores de Prisma/servicio y homogeneice la respuesta, en vez de que cada handler decida por su cuenta si envuelve o no la llamada al service.

### 3.5. Secreto JWT hardcodeado como fallback, duplicado en dos archivos — **Prioridad 5 (seguridad)**

**Problema:** tanto `src/lib/auth.ts` como `src/middleware.ts` definen de forma independiente:
```
process.env.AUTH_SECRET || "cambiar-en-produccion-secret-min-32-chars"
```
Si `AUTH_SECRET` no está configurado en el entorno de despliegue (fácil de olvidar, por ejemplo en un entorno de staging nuevo), **todos los tokens se firman con un secreto público conocido** (está en el propio repo), permitiendo a cualquiera forjar una cookie de sesión válida. Además, al estar duplicado en dos archivos, un cambio de secreto o de estrategia de fallback requiere recordar tocar ambos (`lib/auth.ts` no puede reexportarse directamente en `middleware.ts` por restricciones del Edge runtime, pero al menos la constante debería vivir en un solo lugar, p. ej. `src/lib/auth-constants.ts`, importable desde ambos).

**Archivos afectados:** `src/lib/auth.ts` (líneas 4-6), `src/middleware.ts` (líneas 6-8).

**Estado final propuesto:** eliminar el fallback hardcodeado; si `AUTH_SECRET` no está definido, fallar rápido al arrancar (throw en el módulo) en vez de operar de forma insegura por defecto. Extraer `COOKIE_NAME` a un módulo compartido sin dependencias de Node (p. ej. `src/lib/auth-constants.ts`) para que `middleware.ts` deje de redefinirlo.

### 3.6. Guard de `middleware.ts` no valida rol — **Prioridad 6 (menor, mitigado hoy)**

**Problema:** `middleware.ts` valida que el JWT sea válido, pero no comprueba `role === "ADMIN"`. Hoy no es explotable porque `Role` solo tiene el valor `ADMIN` en el enum de Prisma, pero es una trampa a futuro: si se añade un segundo rol (ej. `STAFF` con permisos limitados), el middleware seguiría dejando pasar a cualquier usuario autenticado a cualquier página de `/admin/**`, y la única barrera real seguiría siendo el `requireAdmin()` de cada API — que además no protege las *páginas*, solo las llamadas a la API que ellas disparan después de renderizar.

**Archivos afectados:** `src/middleware.ts`.

**Estado final propuesto:** cuando se introduzca un segundo rol, mover la comprobación de rol al middleware (o a un layout de servidor en `src/app/admin/(panel)/layout.tsx`) para que la protección de página y la de API compartan la misma fuente de verdad de roles — probablemente el mismo helper del ítem 3.1.

---

## 4. Resumen de prioridades

| # | Ítem | Impacto | Esfuerzo | Archivos |
|---|------|---------|----------|----------|
| 1 | Centralizar `requireAdmin` / `withAdminAuth` | Alto (mantenibilidad + seguridad) | Medio | 24 route.ts |
| 2 | Dividir `menu/page.tsx` y `promociones/page.tsx` en hooks + componentes | Alto (mantenibilidad) | Medio-Alto | 2 páginas + nuevos hooks/componentes |
| 3 | Activar escritura real de `AuditLog` | Medio (trazabilidad/compliance) | Bajo-Medio | 24 route.ts + service ya existente |
| 4 | Unificar manejo de errores en route handlers | Medio | Bajo (si se hace junto al #1) | products, categories, y similares |
| 5 | Eliminar secreto JWT hardcodeado / centralizar constantes de auth | Alto (seguridad) | Bajo | auth.ts, middleware.ts |
| 6 | Middleware sin chequeo de rol | Bajo hoy / Medio a futuro | Bajo | middleware.ts |

Los ítems 1 y 2 son los de mayor valor confirmado por lectura directa del código y deberían abordarse primero; el ítem 1 además simplifica la implementación de los ítems 3 y 4 si se hacen en el mismo wrapper.
