# Backend - Sistema de Reservas

API REST para un sistema de reservas (barbería, consultorio, etc.) construido con Node.js, Express, PostgreSQL y Prisma.

## Tecnologías

- Node.js v22+
- Express
- PostgreSQL
- Prisma ORM
- JWT + Bcrypt

## Instalación

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno:
   - Copiar `.env.example` a `.env`
   - Configurar `DATABASE_URL` y `JWT_SECRET`
4. Ejecutar migraciones:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Iniciar servidor:
   ```bash
   npm run dev
   ```

## Endpoints

### Auth

- `POST /auth/register`: Registro de clientes (Rol CLIENT por defecto).
- {
  "name": "Juan Cliente",
  "email": "cliente@example.com",
  "password": "123456"
  }

- `POST /auth/login`: Login (Retorna JWT).
- `POST /auth/create-user`: Crear usuarios ADMIN o WORKER (Solo ADMIN).

### Services

- `GET /services`: Listar servicios.
- `POST /services`: Crear servicio (Solo ADMIN).
- `PUT /services/:id`: Actualizar servicio (Solo ADMIN).
- `DELETE /services/:id`: Eliminar servicio (Solo ADMIN).

### Bookings

- `POST /bookings`: Crear reserva.
- `GET /bookings/me`: Mis reservas.
- `GET /bookings`: Todas las reservas (Solo ADMIN).
- `PUT /bookings/:id/status`: Actualizar estado (Solo ADMIN).

## Roles

- **ADMIN**: Acceso total.
- **CLIENT**: Reservar, ver sus reservas.
- **WORKER**: Ver sus reservas (asignadas o generales según lógica de negocio, aquí implementado como ver sus propias reservas como cliente).

## Base de Datos

El esquema incluye tablas para `User`, `Service` y `Booking`.

- `User`: Almacena usuarios con roles.
- `Service`: Servicios ofrecidos.
- `Booking`: Reservas vinculando Usuario y Servicio.

## Pruebas

Importar la colección de Postman adjunta para probar los endpoints.
