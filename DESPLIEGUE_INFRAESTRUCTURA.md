# DESPLIEGUE E INFRAESTRUCTURA - BidHub

Sigue estos pasos al pie de la letra cuando vayas a desplegar la aplicación en producción.

## 1. Configuración de Supabase (Base de Datos)
1. Crear el proyecto en supabase.com y guardar la contraseña.
2. Ve a **Settings > Database > Connection String**.
3. Copia la URI de **Transaction Pooler** (puerto `6543`). Esta será tu `DATABASE_URL` para Vercel. 
   *IMPORTANTE:* Agrégale al final `?pgbouncer=true&connection_limit=1`.
4. Copia la URI de **Direct Connection** (puerto `5432`). Esta será tu `DIRECT_URL`.
   *NOTA TÉCNICA LOCAL:* Si pruebas en tu computadora local y el puerto `6543` falla por restricciones de ISP o IPv6, usa la URL directa del puerto `5432` en tu `.env` local. En Vercel en la nube, sí usa el Pooler `6543`.

## 2. Configuración de Prisma (`schema.prisma`)
Asegúrate de que el bloque `datasource` se vea así para que funcione en Vercel:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // Pooler (6543)
  directUrl = env("DIRECT_URL")     // Directa (5432)
}
```

## 3. Despliegue en Vercel
1. Sube el proyecto a GitHub.
2. En Vercel, haz clic en "Add New Project" e importa el repositorio.
3. En la sección **Environment Variables**, agrega EXACTAMENTE estas 4 variables:
   - `DATABASE_URL` (La del Pooler con `?pgbouncer=true&connection_limit=1`)
   - `DIRECT_URL` (La de conexión directa en el puerto `5432`)
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
4. Haz clic en **Deploy**.

## 4. Next.js 16 y el Proxy
Recuerda que en Next.js 16, el archivo `proxy.ts` debe estar en la raíz (junto a `package.json`), NO dentro de la carpeta `app` o `src`, para que Vercel lo detecte como middleware.

## 5. Variables de Entorno (.env.example)
El proyecto debe incluir un archivo `.env.example` con estas variables (sin valores reales):
```env
DATABASE_URL=
DIRECT_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
```
