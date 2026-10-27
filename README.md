# 🏢 CoSpace — Plataforma de Reservas de Espacios de Coworking

CoSpace es una plataforma fullstack moderna diseñada para la gestión y reserva de salas de juntas, oficinas privadas y cabinas de trabajo con confirmación instantánea y validación transaccional estricta en tiempo real.

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **Base de Datos:** PostgreSQL en Supabase
- **ORM:** Prisma v6
- **Validación:** Zod v3
- **Autenticación:** JWT con par de tokens (Access y Refresh) almacenados en cookies seguras `HttpOnly` y revocación en base de datos
- **Middleware / Proxy:** `proxy.ts` / `middleware.ts` con protección de rutas
- **Estilos:** Tailwind CSS con diseño adaptativo móvil/escritorio

---

## 🏗️ Arquitectura de Rutas y Estrategias de Renderizado

La aplicación implementa Route Groups especializados para separar contextos de navegación y optimizar el rendimiento:

- **`(public)`**:
  - `app/(public)/page.tsx`: **SSG (`force-static`)** — Landing page con espacios destacados y ventajas del servicio.
  - `app/(public)/spaces/page.tsx`: **SSR (`force-dynamic`)** — Catálogo completo de espacios activos sincronizado en tiempo real.
  - `app/(public)/spaces/[id]/page.tsx`: **SSR (`force-dynamic`)** — Detalle del espacio, componente `<LocalTime />` anti-hidratación y formulario reactivo `<BookingForm />`.
- **`(auth)`**:
  - `app/(auth)/login/page.tsx`: **CSR (`'use client'`)** — Formulario de inicio de sesión con accesos rápidos de prueba.
  - `app/(auth)/register/page.tsx`: **CSR (`'use client'`)** — Registro de nuevos miembros.
- **`(private)`**:
  - `app/(private)/dashboard/page.tsx`: **CSR (`'use client'`)** — Panel de usuario con reservas activas y botón de cancelación con validación de ventana temporal (mínimo 2 horas).
- **`(admin)`**:
  - `app/(admin)/admin/spaces/page.tsx`: **CSR (`'use client'`)** — Gestión de espacios, creación y desactivación condicional (Regla 13).
  - `app/(admin)/admin/reservations/page.tsx`: **CSR (`'use client'`)** — Supervisión global y cancelación administrativa sin restricción de 2 horas.

---

## 🛡️ Reglas de Negocio Implementadas

1. **Autenticación Segura:**
   - Tokens JWT firmados con HMAC-SHA256.
   - Refresh tokens hasheados con bcrypt y almacenados en DB con revocación atómica.
2. **Motor de Reservas (`POST /api/reservations`):**
   - Rango horario permitido: 07:00 a 21:00 UTC el mismo día.
   - Duración: 1 a 4 horas exactas (minutos y segundos en 00).
   - Anticipación: Máximo 30 días, no se permiten reservas pasadas.
   - Límite por usuario: Máximo 3 reservas futuras confirmadas en simultáneo.
   - Prevención de solapamiento: Bloqueo transaccional ACID (`prisma.$transaction`) tanto a nivel de espacio como de usuario.
   - Cálculo del precio: Estrictamente en el servidor (`pricePerHour * durationHours`), nunca aceptado del cliente.
3. **Cancelaciones (`PATCH /api/reservations/[id]/cancel`):**
   - Borrado suave (Soft-delete): Actualización de `status: 'CANCELLED'`.
   - Autorización: Únicamente el propietario de la reserva o un usuario con rol `ADMIN`.
   - Ventana de anticipación: Usuarios regulares deben cancelar con al menos 2 horas de anticipación a `startTime`. Los administradores pueden cancelar en cualquier momento.
4. **Desactivación de Espacios - Regla 13 (`PATCH /api/spaces/[id]/deactivate`):**
   - Solo administradores (`session.role === 'ADMIN'`).
   - Verificación previa obligatoria: Si el espacio posee reservas futuras confirmadas (`CONFIRMED` y `startTime >= now`), la operación se rechaza con código `409 Conflict`. Si no existen cruces futuros, se desactiva (`isActive: false`).

---

## 👥 Credenciales de Prueba (Seed)

| Rol | Correo Electrónico | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@cospace.com` | `admin123` |
| **Usuario Estándar** | `user@cospace.com` | `user123` |

---

## 🚀 Guía de Instalación y Ejecución Local

### 1. Clonar el repositorio y configurar variables de entorno
```bash
git clone <URL_REPOSITORIO>
cd test_arsenal
cp .env.example .env
```

Configurar en `.env`:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
JWT_ACCESS_SECRET="clave_secreta_jwt_access_super_segura"
JWT_REFRESH_SECRET="clave_secreta_jwt_refresh_super_segura"
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Migrar base de datos y sembrar datos iniciales
```bash
npx prisma db push --force-reset
npx tsx prisma/seed.ts
```

### 4. Iniciar servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

---

## 🐳 Ejecución con Docker

```bash
docker build -t cospace .
docker run -p 3000:3000 --env-file .env cospace
```

---

## 🧪 Verificación de Tipos TypeScript

```bash
npm run typecheck
```
