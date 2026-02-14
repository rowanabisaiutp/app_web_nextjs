# Estructura de `src` y orden reutilizable

## Regla general

- **`app/`** → Rutas y páginas (Next.js). Poca lógica; importan de `components/` y `lib/`.
- **`lib/`** → Lógica, datos y utilidades (sin UI). Servicios, tipos, constantes, formateadores.
- **`components/`** → UI reutilizable. Organizado por **alcance**: genérico (ui) vs por dominio (orders, etc.).

---

## `lib/` — Capa de datos y lógica

| Ruta                  | Uso                                                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/utils/`          | Utilidades puras (format, etc.).                                                                                                                   |
| `lib/services/`       | Servicios de API/DB (order.service, auth.service, …).                                                                                              |
| `lib/admin/`          | Lógica compartida del **panel admin** (tipos, constantes, formateadores por dominio).                                                              |
| `lib/admin/orders.ts` | Tipos (`OrderRow`, `OrderDetailRow`), constantes (`ORDER_STATUS_OPTIONS`, `ORDER_STATUS_BADGE`), `formatOrderFromApi`, `formatOrderDetailFromApi`. |
| `lib/admin/index.ts`  | Barrel: reexporta todo de `orders` para importar desde `@/lib/admin`.                                                                              |

**Importar:** `import { ... } from "@/lib/admin"` (o `@/lib/utils`, `@/lib/services/...`).

---

## `components/` — Componentes reutilizables

### 1. UI genérica del panel admin: `components/admin/ui/`

Componentes sin lógica de negocio, reutilizables en **cualquier** página del panel:

- `AdminPageHeader` — Título + descripción de página.
- `AdminCard` — Bloque con cabecera opcional (título, icono, acción).
- `AdminTable` — Tabla con columnas configurables, loading, vacío, error.
- `AdminPagination` — Paginación (Anterior / Siguiente).

**Importar:** `import { AdminCard, AdminTable, ... } from "@/components/admin"` (el barrel de `admin` reexporta `ui`).

### 2. Por dominio: `components/admin/orders/`

Solo lo que pertenece al dominio **Pedidos/Órdenes**:

- `OrderDetailPanel.tsx` — Panel de detalle de pedido (cliente, ítems, total, cambiar estado, cancelar).
- `orderTableColumns.tsx` — `getOrderListColumns(onVer)` para la tabla de lista de pedidos.
- `orders/index.ts` — Exporta `OrderDetailContent`, `getOrderListColumns`.

**Importar:** `import { OrderDetailContent, getOrderListColumns } from "@/components/admin"`.

### 3. Barrel `components/admin/index.ts`

Reexporta:

- Todo lo de `./ui` (genérico).
- Todo lo de `./orders` (dominio pedidos).

Así las páginas siguen importando desde un solo sitio: `@/components/admin`.

---

## Resumen del orden reutilizable

| Si es…                                                             | Va en                                            |
| ------------------------------------------------------------------ | ------------------------------------------------ |
| Utilidad pura (format, etc.)                                       | `lib/utils/`                                     |
| Servicio API/DB                                                    | `lib/services/`                                  |
| Tipos/constantes/helpers del panel admin (por dominio)             | `lib/admin/` (p. ej. `orders.ts`)                |
| Componente UI genérico del panel (Card, Table, Header, Pagination) | `components/admin/ui/`                           |
| Componente o columnas de un dominio (pedidos, entregas, …)         | `components/admin/<dominio>/` (p. ej. `orders/`) |
| Página o ruta                                                      | `app/`                                           |

**Nuevos dominios** (p. ej. clientes, pagos): añadir `lib/admin/<dominio>.ts` si hay tipos/constantes/helpers, y `components/admin/<dominio>/` si hay componentes específicos; luego reexportar en `lib/admin/index.ts` y `components/admin/index.ts` si quieres un único punto de importación.
