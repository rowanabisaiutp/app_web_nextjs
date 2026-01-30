# Arquitectura del proyecto (Back + Front)

Estructura recomendada para separar backend, frontend y código compartido.

## Estructura de carpetas

```
src/
├── app/                    # Next.js App Router (rutas y API)
│   ├── api/                # Backend: Route Handlers (API REST)
│   │   └── auth/
│   ├── admin/              # Frontend: páginas del panel admin
│   └── ...
├── components/             # Frontend: componentes UI reutilizables (opcional)
├── hooks/                  # Frontend: React hooks
│   ├── index.ts            # Barrel export: import { useAuth } from "@/hooks"
│   ├── useAuth.ts
│   └── useXxx.ts           # Más hooks por dominio
├── lib/                    # Backend + compartido: lógica de negocio y utilidades
│   ├── auth.ts             # Sesión, JWT (usado en API y middleware)
│   ├── prisma.ts           # Cliente DB (solo server)
│   └── database-url.ts
├── types/                  # Compartido: tipos TypeScript (back y front)
│   └── index.ts            # User, respuestas de API, etc.
├── generated/              # Prisma Client (no editar)
└── middleware.ts           # Protección de rutas (Edge)
```

## Reglas de uso

### Backend (`src/app/api/`, `src/lib/`)

- **Route Handlers** (`app/api/**/route.ts`): validar input, llamar a `lib` o Prisma, devolver JSON.
- **lib**: funciones reutilizables del servidor (auth, DB, servicios). No usar `"use client"`.
- Prisma y código que use `cookies()`, `headers()` o secretos solo en server (API o Server Components).

### Frontend (`src/hooks/`, `src/components/`, páginas con `"use client"`)

- **Hooks** (`src/hooks/`): lógica reutilizable con estado (fetch, formularios, auth en cliente).
  - Un hook por archivo: `useAuth.ts`, `useFetch.ts`, etc.
  - Import: `import { useAuth } from "@/hooks";` o `import { useAuth } from "@/hooks/useAuth";`
- **Componentes**: UI en `components/` si crecen; si son de una sola página, pueden vivir en `app/.../`.
- Los hooks llaman a las APIs (`/api/...`) y exponen estado + acciones a la UI.

### Compartido (`src/types/`)

- Interfaces y tipos usados por:
  - Respuestas de las APIs (frontend las consume).
  - Parámetros o DTOs que coincidan entre API y cliente.
- Ejemplo: `User`, `AuthLoginResponse`, etc. en `types/index.ts`.

## Flujo típico Back ↔ Front

1. **API** (`app/api/auth/login/route.ts`): recibe body, valida, usa `lib/auth` y `lib/prisma`, devuelve JSON.
2. **Tipos** (`types/index.ts`): definen la forma de ese JSON (`AuthLoginResponse`, `User`).
3. **Hook** (`hooks/useAuth.ts`): `login(email, password)` hace `fetch("/api/auth/login", ...)`, lee el JSON (tipado con `AuthLoginResponse`), actualiza estado y redirige.
4. **Página** (`app/admin/login/page.tsx`): usa `useAuth()`, enlaza inputs a estado y llama `login(email, password)` en submit.

## Añadir nuevos hooks

1. Crear `src/hooks/useNombre.ts` (por ejemplo `useProducts.ts`).
2. Implementar el hook (estado, `fetch` a `/api/...`, tipos desde `@/types`).
3. Re-exportar en `src/hooks/index.ts`: `export { useNombre } from "./useNombre";`
4. Usar en componentes: `import { useNombre } from "@/hooks";`

## Resumen

| Dónde         | Qué va ahí                                           |
| ------------- | ---------------------------------------------------- |
| `app/api/`    | Backend: endpoints REST                              |
| `lib/`        | Backend/compartido: auth, DB, utilidades de servidor |
| `hooks/`      | Frontend: lógica con estado y llamadas a API         |
| `types/`      | Compartido: tipos para API y cliente                 |
| `components/` | Frontend: UI reutilizable (opcional)                 |

Así back y front quedan separados y los hooks centralizan la lógica de cliente que habla con el backend.
