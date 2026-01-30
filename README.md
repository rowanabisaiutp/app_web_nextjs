This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

🖥️ Módulos del sistema administrador (Web)
1️⃣ Autenticación y roles

Login de administrador

Control de acceso

Gestión de sesión

Roles comunes:

Admin

Operador / Cocina

Cajero

2️⃣ Dashboard (panel principal)

Ventas del día

Pedidos activos

Pedidos por estado

Ingresos totales

Ticket promedio

📌 Vista rápida del negocio en tiempo real

3️⃣ Gestión de pedidos (módulo crítico)

Lista de pedidos en tiempo real

Detalle de pedido

Cambio de estado

Cancelación de pedidos

Historial de pedidos

Estados controlados:

Confirmado

En preparación

Listo

Entregado

Cancelado

4️⃣ Gestión del menú

Alta / edición / baja de productos

Gestión de categorías

Precios

Disponibilidad

Imágenes

5️⃣ Gestión de clientes

Listado de clientes

Detalle del cliente

Historial de pedidos

Datos de contacto

Bloqueo (opcional)

6️⃣ Pagos

Registro de pagos (efectivo o tarjeta)

Estado de pagos

Métodos de pago: efectivo, tarjeta

7️⃣ Entregas

Pedidos para recoger en local

Pedidos a domicilio

Direcciones de entrega

Confirmación de entrega

(Si no hay repartidores propios, este módulo es simple)

8️⃣ Promociones y descuentos

Creación de cupones

Combos

Promociones por tiempo

Activar / desactivar promociones

9️⃣ Reportes y métricas

Ventas por periodo

Productos más vendidos

Clientes recurrentes

Horarios pico

Exportación de datos (PDF / Excel)

🔟 Notificaciones

Mensajes automáticos a clientes

Avisos por cambio de estado

Promociones

Plantillas de mensajes

1️⃣1️⃣ Configuración del negocio

Información del negocio

Horarios de atención

Costos de envío

Impuestos

Métodos de pago

1️⃣2️⃣ Logs y auditoría (pro)

Historial de acciones

Cambios de estado

Errores del sistema
