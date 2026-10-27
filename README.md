# 🏢 CoSpace — Plataforma Fullstack de Reservas de Espacios de Coworking

CoSpace es una plataforma web integral para la gestión y reserva de espacios de trabajo colaborativo (salas de juntas, escritorios flexibles y cabinas privadas). Cuenta con validación transaccional estricta en tiempo real, autenticación segura mediante tokens JWT en cookies HttpOnly y soporte bilingüe (i18n).

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **Base de Datos:** PostgreSQL en Supabase
- **ORM:** Prisma v6
- **Validación:** Zod v3
- **Autenticación:** JWT con par de tokens (Access y Refresh) almacenados en cookies seguras `HttpOnly` y revocación de tokens en base de datos
- **Middleware / Proxy:** `proxy.ts` con protección de rutas privadas y roles administrativos
- **Estilos:** Tailwind CSS con diseño responsivo móvil/escritorio
- **Internacionalización (i18n):** Selector de idioma interactivo (Español / Inglés)

---

## 🏗️ Estrategias de Renderizado y Route Groups

El proyecto implementa la arquitectura de Route Groups de Next.js 16 cumpliendo rigurosamente los requerimientos de renderizado:

| Grupo | Ruta | Estrategia | Descripción |
| :--- | :--- | :--- | :--- |
| **`(public)`** | `/` | **SSG (`force-static`)** | Landing page con espacios destacados y ventajas del servicio |
| **`(public)`** | `/spaces` | **SSR (`force-dynamic`)** | Catálogo completo con conteo en vivo de espacios activos |
| **`(public)`** | `/spaces/[id]` | **SSR (`force-dynamic`)** | Detalle del espacio, componente anti-hidratación `<LocalTime />` y `<BookingForm />` |
| **`(auth)`** | `/login` | **CSR (`'use client'`)** | Inicio de sesión con accesos rápidos precargados |
| **`(auth)`** | `/register` | **CSR (`'use client'`)** | Registro de nuevos usuarios |
| **`(private)`** | `/dashboard` | **CSR (`'use client'`)** | Panel de usuario: reservas confirmadas y botón de cancelación (>= 2h) |
| **`(admin)`** | `/admin/spaces` | **CSR (`'use client'`)** | Panel administrativo: creación y desactivación condicional (**Regla 13**) |
| **`(admin)`** | `/admin/reservations` | **CSR (`'use client'`)** | Supervisión global y cancelación administrativa sin restricción |

---

## 🛡️ Reglas de Negocio Implementadas

1. **Horarios Permitidos:** Reservas exclusivamente entre las 07:00 y las 21:00 UTC el mismo día calendario.
2. **Duración Estricta:** Bloques exactos de 1 a 4 horas (minutos y segundos en `00`).
3. **Anticipación Máxima:** Hasta 30 días en el futuro. No se permiten reservas pasadas.
4. **Límite por Usuario:** Máximo 3 reservas futuras confirmadas simultáneas por usuario.
5. **Aislamiento Transaccional ACID:** `prisma.$transaction` para evitar solapamientos simultáneos de espacio y de usuario.
6. **Cálculo de Precio Servidor:** La tarifa se calcula exclusivamente en el backend (`pricePerHour * durationHours`).
7. **Cancelaciones:** Borrado lógico (`status: 'CANCELLED'`). Los usuarios normales requieren al menos 2 horas de anticipación a `startTime`. Los administradores pueden cancelar en cualquier momento.
8. **Desactivación de Espacios (Regla 13):** Solo administradores. Si existen reservas futuras confirmadas, el servidor rechaza la desactivación con código `409 Conflict`.
9. **Idempotencia en Creación de Reservas (Puntos Extra):** Soporte para el header `x-idempotency-key` (UUID v4). La tabla `IdempotencyKey` persiste atómicamente la clave dentro de `prisma.$transaction`. Si se reenvía la misma clave (ej. reintento de red), el backend devuelve `200 OK` con `idempotent: true` y la reserva previa sin duplicarla.

---

## 👥 Credenciales de Prueba (Seed)

| Rol | Correo Electrónico | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@cospace.com` | `admin123` |
| **Usuario Estándar** | `user@cospace.com` | `user123` |

---

## 📋 Requisitos Previos

- **Node.js:** Versión 20.x o superior.
- **npm:** Versión 10.x o superior.
- **Cuenta en Supabase:** Proyecto PostgreSQL activo.
- **Docker:** (Opcional) Para despliegues en contenedor.

---

## 🔑 Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto basándose en `.env.example`:

```env
# 1. DATABASE_URL: Transaction Pooler de Supabase (puerto 6543)
# Obtener en: Supabase > Project Settings > Database > Connection String (URI / Transaction Pooler)
# IMPORTANTE en Vercel: Agregar ?pgbouncer=true&connection_limit=1 al final
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# 2. DIRECT_URL: Conexión directa / Session Pooler (puerto 5432)
# Obtener en: Supabase > Project Settings > Database > Connection String (URI / Session Pooler o Direct)
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

# 3. JWT_ACCESS_SECRET: Clave criptográfica para Access Tokens (mínimo 32 caracteres)
JWT_ACCESS_SECRET="clave_secreta_jwt_access_super_segura_de_al_menos_32_caracteres"

# 4. JWT_REFRESH_SECRET: Clave criptográfica para Refresh Tokens (mínimo 32 caracteres)
JWT_REFRESH_SECRET="clave_secreta_jwt_refresh_super_segura_de_al_menos_32_caracteres"
```

---

## 🚀 Comandos de Instalación y Ejecución en Orden

Sigue este orden exacto de comandos para preparar y ejecutar la aplicación localmente:

```bash
# 1. Entrar a la carpeta del proyecto
cd test_arsenal

# 2. Instalar dependencias
npm install

# 3. Generar el cliente tipado de Prisma
npx prisma generate

# 4. Sincronizar el esquema con la base de datos (reset limpio)
npx prisma db push --force-reset

# 5. Poblar la base de datos con los datos iniciales (Seed)
npx tsx prisma/seed.ts

# 6. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación quedará disponible inmediatamente en [http://localhost:3000](http://localhost:3000).

---

## 🧪 Verificación de Tipos TypeScript

Para validar que no existan errores de compilación en todo el proyecto:

```bash
npm run typecheck
```

---

## 🐳 Comandos de Ejecución con Docker

El proyecto incluye un `Dockerfile` multi-stage optimizado para producción.

### Compilar la imagen Docker:
```bash
# Desde la carpeta test_arsenal:
docker build -t cospace .

# O desde la raíz del repositorio:
docker build -t cospace -f Dockerfile .
```

### Ejecutar el contenedor con Docker o Docker Compose:
```bash
# Opción 1: Docker Compose (Recomendado)
docker compose up --build -d

# Opción 2: Docker CLI directo
docker run -p 3000:3000 --env-file .env cospace
```

---

## 📋 Estado de Auditoría de Calidad y Robustez (QA Checklist)

| Requisito / Componente | Estado | Evidencia y Ubicación en Código |
| :--- | :---: | :--- |
| **Logout con fetch** | ✅ Aprobado | `Navbar.tsx` y `LogoutButton.tsx` llaman a `fetch('/api/auth/logout', { method: 'POST' })` y redirigen limpiamente sin enlaces directos. |
| **Actualización de Navbar en Login** | ✅ Aprobado | `LoginPage.tsx` y `RegisterPage.tsx` invocan `router.refresh()` antes de redirigir al dashboard. |
| **Persistencia con botón Atrás** | ✅ Aprobado | `Navbar.tsx` escucha eventos `pageshow` y `popstate`, re-sincronizando sesión contra `GET /api/auth/me` con `no-store`. |
| **Cero alert() y confirm()** | ✅ Aprobado | Eliminados totalmente del código. Reemplazados por alertas contextuales estilizadas y confirmaciones inline en dos pasos. |
| **Estados de carga (isSubmitting)** | ✅ Aprobado | Todos los formularios (Login, Registro, Booking, Admin) bloquean doble clic y muestran spinner de carga interactivo. |
| **Manejo de errores del backend** | ✅ Aprobado | Errores de API (409 solapamiento, 400 validaciones Zod, 401 sesión) renderizados en tarjetas accesibles con icono de alerta. |
| **Home SSG (`force-static`)** | ✅ Aprobado | `app/(public)/page.tsx` declara `export const dynamic = 'force-static'`. |
| **Catálogo y Detalle SSR (`force-dynamic`)** | ✅ Aprobado | `app/(public)/spaces/page.tsx` y `app/(public)/spaces/[id]/page.tsx` declaran `export const dynamic = 'force-dynamic'`. |
| **Dashboard CSR (`'use client'`)** | ✅ Aprobado | `app/(private)/dashboard/page.tsx` inicia con directiva `'use client'`. |
| **Anti-hidratación `LocalTime`** | ✅ Aprobado | `<LocalTime />` integrado en el detalle del espacio con guardia `mounted` y atributo `suppressHydrationWarning`. |
| **next/image en `SpaceCard`** | ✅ Aprobado | `SpaceCard.tsx` renderiza imágenes con `<Image ... unoptimized />` sin usar `<img>` nativo. |
| **Archivos base del proyecto** | ✅ Aprobado | `Dockerfile` multi-stage, `README.md` exhaustivo y `.env.example` sincronizados en la raíz y en `test_arsenal`. |
| **Idempotencia (`x-idempotency-key`)** | ✅ Aprobado | Header `x-idempotency-key` generado en `BookingForm.tsx`, persistido en tabla `IdempotencyKey` en `prisma.$transaction` para prevenir duplicados. |
| **Rate Limiting en Login (Extra)** | ✅ Aprobado | Bloqueo por IP en memoria en `app/api/auth/login/route.ts` tras 5 intentos fallidos en 15 min con HTTP 429 y header `Retry-After`. |
| **Docker Compose (Extra)** | ✅ Aprobado | Archivo `docker-compose.yml` en la raíz configurado con servicio `cospace-app`, mapeo 3000:3000 y lectura de `.env`. |
