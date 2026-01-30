# Lógica de base de datos (backend)

Aquí va la lógica que usa Prisma y la base de datos. Las rutas API (`src/app/api/`) son finas: validan entrada, llaman al servicio y devuelven respuesta.

- **auth.service.ts** — Auth y roles: login, registro admin, sesión (User).
- Más adelante: pedidos, clientes, menú, pagos, etc. (uno por módulo).

Solo servicios de datos; JWT/cookies siguen en `src/lib/auth.ts`.
