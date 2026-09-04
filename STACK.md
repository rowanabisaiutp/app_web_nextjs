# Stack tecnológico

Resumen de las herramientas usadas en el desarrollo de este proyecto, de principio a fin.

## Base

| Tecnología | Para qué sirvió |
|---|---|
| **Next.js 16** (App Router, Turbopack) | Framework principal — frontend (páginas admin) y backend (API routes) en un solo proyecto |
| **React 19** | UI del panel administrativo |
| **TypeScript** | Tipado en todo el proyecto (frontend, backend, servicios) |
| **Tailwind CSS v4** | Estilos de todo el panel |
| **lucide-react** | Set de iconos usado en toda la UI |
| **pnpm** | Gestor de paquetes |

## Base de datos

| Tecnología | Para qué sirvió |
|---|---|
| **PostgreSQL** | Base de datos relacional (reemplazó a MySQL/MariaDB) |
| **Supabase** | Hosting de la base Postgres (pooler de conexiones transaction/session mode) |
| **Prisma 7** | ORM — schema, migraciones (`db push`), cliente tipado |
| **@prisma/adapter-pg** + **pg** | Driver adapter para conectar Prisma a Postgres |

## Autenticación

| Tecnología | Para qué sirvió |
|---|---|
| **jose** | Firmar y verificar JWT de sesión (cookie `admin_session`) |
| **bcryptjs** | Hash de contraseñas |

## Mapas y geolocalización

| Tecnología | Para qué sirvió |
|---|---|
| **Leaflet** + **react-leaflet** | Mapas interactivos (ubicación de negocios, dirección de entregas) |
| **OpenStreetMap** | Tiles del mapa — gratis, sin API key |
| **Nominatim** (OpenStreetMap) | Geocodificación — buscar direcciones y convertirlas a coordenadas, autocompletado |

## Inteligencia artificial

| Tecnología | Para qué sirvió |
|---|---|
| **NVIDIA NIM** (API compatible con OpenAI) | Asistente de IA del Dashboard — responde preguntas sobre ventas/pedidos/productos con datos reales |
| Modelo `openai/gpt-oss-20b` | Modelo usado por el asistente (rápido y sin mezclar razonamiento con la respuesta) |

## Generación de reportes

| Tecnología | Para qué sirvió |
|---|---|
| **pdfkit** | Generar reportes en PDF |
| **docx** | Generar reportes en Word |
| **exceljs** | Generar reportes en Excel |
| **sharp** | Generar reportes como imagen (rasteriza SVG a PNG) |

## Infraestructura y despliegue

| Tecnología | Para qué sirvió |
|---|---|
| **Docker** | Contenerizar la app para producción |
| **Fly.io** | Hosting/deploy de la app en producción |
| **GitHub Actions** | CI/CD — deploy automático a Fly.io en cada push a `main` |
| **flyctl** / **gh CLI** | Gestión de secrets, máquinas y despliegues desde terminal |

## Herramientas de desarrollo

| Tecnología | Para qué sirvió |
|---|---|
| **ESLint** | Linting del código |
| **Git / GitHub** | Control de versiones |
| **Claude Code** | Asistente de desarrollo — migración de DB, features nuevas, auditoría de código y fixes |
