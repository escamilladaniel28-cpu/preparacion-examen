Te voy a dejar un documento completo para que lo copies y lo pegues en DeepSeek. Incluye el contexto de lo que ya hicimos, la arquitectura AWS, los comandos ejecutados, lo pendiente y el orden exacto del despliegue.

La idea es que DeepSeek pueda continuar desde donde nos quedamos sin que tengas que explicarle todo nuevamente.

# Guía maestra de despliegue de Workia en AWS

Redacción

# PROYECTO WORKIA — GUÍA COMPLETA DE DESPLIEGUE EN AWS

Necesito que actúes como un ingeniero DevOps y arquitecto cloud especializado en AWS, Ubuntu, Next.js, PostgreSQL, Nginx y PM2.

Quiero que me guíes paso a paso para desplegar mi aplicación Workia en dos instancias EC2 de AWS, utilizando PostgreSQL instalado en un servidor privado y Next.js en un servidor público.

**IMPORTANTE:** No quiero que asumas que algo ya está configurado si no te he mostrado evidencia. Debes indicarme los comandos exactos, decirme en qué servidor ejecutarlos y esperar mis resultados antes de continuar con operaciones delicadas.

---

## 1\. INFORMACIÓN DEL PROYECTO

Nombre comercial: Workia.

Dominio: https://workia.coderhivex.com

Repositorio GitHub:

https://github.com/escamilladaniel28-cpu/preparacion-examen/tree/main/test\_arsenal

Ruta del proyecto en mi PC:

bash

```bash
~/Documentos/Mdescamilla28/preparacion-examen/test_arsenal
```

Tecnologías:

- Next.js 16.4.3 (App Router).
- React 19.
- TypeScript.
- PostgreSQL 18.
- Prisma 6.4.1.
- Zod 3.
- JWT con Access Token y Refresh Token.
- Cookies HttpOnly.
- Tailwind CSS.
- PM2.
- Nginx.
- Ubuntu 26.04 LTS.

## 2\. ARQUITECTURA AWS

Tenemos dos instancias EC2.

### Servidor público

- Sistema operativo: Ubuntu 26.04 LTS.
- IP elástica: 13.185.38.87.
- IP privada observada: 10.3.0.179.
- Instancia: i-048775afb2efb9f67.
- Función: alojar Next.js, Node.js, PM2 y Nginx.

Software instalado y comprobado:

bash

```bash
node -v
# v24.22.3

npm -v
# 11.19.1

pm2 -v
# 7.1.2

certbot --version
# 4.0.0
```

Nginx está instalado y funcionando:

bash

```bash
sudo nginx -t
sudo systemctl status nginx
```

Resultado: configuración correcta y servicio activo.

PM2 tiene configurado el inicio automático mediante systemd:

bash

```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

El servicio creado es:

bash

```bash
pm2-ubuntu.service
```

Sin embargo, todavía no hay aplicaciones ejecutándose en PM2.

Última comprobación:

bash

```bash
pm2 status
```

Resultado: lista vacía.

### Servidor privado

- Sistema operativo: Ubuntu 26.04 LTS.
- IP privada: 10.3.1.204.
- Función: alojar PostgreSQL 18.

PostgreSQL está instalado y funcionando.

Comprobaciones realizadas:

bash

```bash
psql --version
# PostgreSQL 18.6
```

bash

```bash
sudo pg_lsclusters
```

Resultado:

text

```text
Ver Cluster Port Status Owner
18  main    5432 online postgres
```

Todavía falta configurar la base de datos de Workia, usuario, contraseña, acceso remoto privado y conexión desde el servidor público.

IMPORTANTE: verificar primero que las dos instancias se encuentren en una red VPC compatible y que exista conectividad entre ellas.

## 3\. DOMINIO

Dominio:

text

```text
workia.coderhivex.com
```

IP elástica:

text

```text
13.185.38.87
```

Debemos comprobar que el registro DNS A del subdominio apunte a la IP elástica.

Después configuraremos:

- Nginx como proxy inverso.
- Certificado HTTPS mediante Certbot.
- Redirección HTTP a HTTPS.
- Renovación automática del certificado.

## 4\. PROYECTO CLONADO EN MI PC

Ya cloné el repositorio:

bash

```bash
git clone --branch main https://github.com/escamilladaniel28-cpu/preparacion-examen.git
```

Luego entré:

bash

```bash
cd preparacion-examen/test_arsenal
```

La carpeta contiene:

text

```text
app/
components/
lib/
prisma/
public/
Dockerfile
docker-compose.yml
next.config.ts
package.json
package-lock.json
proxy.ts
README.md
.env.example
```

Node y npm en mi PC:

text

```text
Node.js v24.19.0
npm 12.0.2
```

El package.json contiene:

json

```json
{
  "name": "test_arsenal",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "postinstall": "prisma generate",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@prisma/client": "^6.4.1",
    "bcryptjs": "^2.4.3",
    "framer-motion": "^14.7.1",
    "jose": "^5.9.6",
    "lucide-react": "^1.62.0",
    "next": "16.4.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "prisma": "^6.4.1",
    "tsx": "^4.23.15",
    "typescript": "^5.7.0"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

## 5\. CONFIGURACIÓN ACTUAL DE PRISMA

Archivo:

text

```text
prisma/schema.prisma
```

Contenido:

prisma

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

La aplicación actualmente tiene referencias a Supabase en el archivo `.env.example`.

Ya no vamos a utilizar Supabase como base de datos de producción. Queremos utilizar PostgreSQL 18 instalado en nuestro servidor privado AWS.

Hay que revisar la configuración de Prisma y utilizar las variables apropiadas para conectar al PostgreSQL privado.

No inventar contraseñas ni direcciones.

## 6\. FUNCIONALIDADES DE WORKIA

Es una plataforma integral de reservas de espacios de coworking.

Incluye:

- Landing page.
- Catálogo de espacios.
- Detalle de cada espacio.
- Registro de usuarios.
- Inicio de sesión.
- Autenticación JWT.
- Cookies HttpOnly.
- Dashboard de usuario.
- Reservas de espacios.
- Panel de administración.
- Gestión de espacios.
- Supervisión de reservas.
- Internacionalización español/inglés.

Reglas de negocio:

1. Reservas entre las 07:00 y las 21:00 UTC.
2. Duración entre 1 y 4 horas exactas.
3. Máximo 30 días de anticipación.
4. Máximo 3 reservas futuras confirmadas por usuario.
5. Transacciones Prisma para prevenir solapamientos.
6. Precio calculado exclusivamente en el servidor.
7. Cancelación de usuario con al menos 2 horas de anticipación.
8. Cancelación administrativa sin restricción.
9. Desactivación de espacios bloqueada si existen reservas futuras confirmadas.
10. Idempotencia de creación de reservas mediante UUID v4 y header x-idempotency-key.
11. Rate limiting en login.

## 7\. CREDENCIALES DE PRUEBA

Seed de desarrollo:

Administrador:

text

```text
admin@cospace.com
admin123
```

Usuario:

text

```text
user@cospace.com
user123
```

Son credenciales exclusivamente de prueba. No deben mantenerse en producción.

También existe una variable NEXT\_PUBLIC\_ADMIN\_PIN en el ejemplo de configuración. Debemos revisar su implementación, porque cualquier variable NEXT\_PUBLIC queda expuesta al navegador. No debemos considerar ese PIN un mecanismo de seguridad real.

## 8\. PLAN DE TRABAJO OBLIGATORIO

Quiero realizar el despliegue en este orden:

### FASE 1. Preparar el proyecto local

1. Instalar dependencias con npm install.
2. Generar Prisma Client.
3. Ejecutar npm run typecheck.
4. Revisar los archivos de configuración.
5. Comprobar que no haya errores.
6. Ejecutar el build de producción.
7. No ejecutar db push --force-reset sobre ninguna base de datos con información importante.

### FASE 2. Preparar PostgreSQL privado

En el servidor privado:

1. Verificar PostgreSQL 18.
2. Crear una base de datos llamada workia.
3. Crear un usuario exclusivo para la aplicación.
4. Asignar contraseña segura.
5. Configurar PostgreSQL para escuchar en la IP privada necesaria.
6. Configurar pg\_hba.conf para permitir conexiones exclusivamente desde la IP privada del servidor público.
7. Configurar el Security Group de AWS para permitir TCP 5432 solamente desde el Security Group del servidor público.
8. No abrir PostgreSQL a Internet.
9. Probar conexión desde el servidor público con psql.
10. Configurar backups automáticos.

### FASE 3. Configurar variables de entorno

Preparar un archivo `.env` de producción con:

env

```env
DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@IP_PRIVADA:5432/workia?schema=public"
DIRECT_URL="postgresql://USUARIO:CONTRASEÑA@IP_PRIVADA:5432/workia?schema=public"

JWT_ACCESS_SECRET="SECRETO_ALEATORIO_SEGURO"
JWT_REFRESH_SECRET="OTRO_SECRETO_ALEATORIO_SEGURO"
NEXT_PUBLIC_ADMIN_PIN="VALOR_REVISADO"
```

No compartir contraseñas ni secretos en el chat.

Verificar si las versiones instaladas de Prisma y el esquema actual requieren ajustes adicionales.

### FASE 4. Crear el esquema y los datos iniciales

1. Crear el esquema en PostgreSQL privado utilizando una migración de Prisma.
2. Preferir `prisma migrate deploy` en producción.
3. Revisar las migraciones existentes antes de ejecutar comandos.
4. Si no existen migraciones, generar una migración inicial de manera controlada.
5. Ejecutar el seed solamente cuando se haya verificado la base de datos correcta.
6. Comprobar que existan las tablas y los usuarios iniciales.

### FASE 5. Desplegar Next.js en el servidor público

1. Clonar el repositorio en el servidor público o transferir el código de forma segura.
2. Instalar dependencias con npm ci.
3. Configurar variables de entorno fuera del repositorio.
4. Generar Prisma Client.
5. Compilar con npm run build.
6. Iniciar Next.js en el puerto 3000 mediante PM2.
7. Comprobar con curl http://127.0.0.1:3000.
8. Ejecutar pm2 save para persistir la lista de procesos.
9. Verificar el servicio PM2 y su inicio automático.

### FASE 6. Configurar Nginx

Configurar Nginx como proxy inverso hacia:

text

```text
127.0.0.1:3000
```

El dominio será:

text

```text
workia.coderhivex.com
```

Configurar:

- server\_name.
- proxy\_pass.
- Cabeceras X-Forwarded-For.
- X-Forwarded-Proto.
- X-Real-IP.
- HTTP y HTTPS.
- Redirección HTTP a HTTPS.

Validar con:

bash

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### FASE 7. Certificado SSL

Verificar DNS y conectividad de los puertos 80 y 443.

Instalar o utilizar Certbot, que ya está instalado en el servidor público.

Solicitar certificado para:

text

```text
workia.coderhivex.com
```

Comprobar renovación:

bash

```bash
sudo certbot renew --dry-run
```

### FASE 8. Pruebas finales

Comprobar:

1. Acceso por HTTPS.
2. Landing page.
3. Registro.
4. Login.
5. Logout.
6. Cookies HttpOnly.
7. Dashboard.
8. Catálogo.
9. Detalle de espacios.
10. Creación de reservas.
11. Prevención de solapamientos.
12. Cancelaciones.
13. Panel administrativo.
14. Conexión real con PostgreSQL privado.
15. Persistencia después de reiniciar los servicios.

También verificar logs:

bash

```bash
pm2 logs
sudo journalctl -u nginx -f
sudo journalctl -u pm2-ubuntu -f
```

### FASE 9. Seguridad y mantenimiento

- Restringir SSH a IPs administrativas autorizadas.
- No exponer PostgreSQL públicamente.
- No subir `.env` a GitHub.
- Utilizar secretos aleatorios robustos.
- Revisar cookies Secure, HttpOnly y SameSite.
- Configurar backups y probar restauración.
- Configurar actualizaciones de seguridad.
- Revisar permisos y firewall.
- Documentar procedimiento de actualización y rollback.

---

## 9\. REGLAS PARA GUIARME

Quiero que trabajes conmigo de esta manera:

1. No me des 30 comandos de golpe.
2. Indica siempre dónde ejecutar cada comando:
   - PC local.
   - Servidor público.
   - Servidor privado.
3. Dame comandos listos para copiar y pegar.
4. Espera a que te envíe el resultado antes de avanzar cuando una operación dependa de él.
5. Explica brevemente para qué sirve cada comando.
6. Advierte antes de comandos que borren datos, reinicien servicios o modifiquen configuraciones.
7. No inventes resultados ni supongas que las configuraciones funcionan.
8. Prioriza seguridad y buenas prácticas.
9. Si encuentras un error, ayúdame a solucionarlo antes de continuar.
10. Mantén el contexto de las dos instancias EC2.

## 10\. PUNTO EXACTO DONDE NOS QUEDAMOS

El proyecto ya está clonado en mi PC.

Ya revisamos:

- package.json.
- prisma/schema.prisma.
- .env.example.
- La estructura de archivos.

Todavía no he creado el archivo `.env` real.

Todavía no he ejecutado npm install en esta copia del proyecto.

Todavía no he conectado el proyecto con PostgreSQL privado.

Todavía no he desplegado Next.js en el servidor público.

**EMPIEZA POR LA FASE 1, PASO 1: instalar las dependencias en mi PC con npm install.**

Dame únicamente los comandos del primer paso y espera mi resultado antes de continuar.

## Mi recomendación antes de continuar

Hay tres cosas importantes que no debes perder de vista:

1. No borres Supabase todavía. Conserva la base de datos hasta verificar que PostgreSQL privado funciona y que Workia tiene todos sus datos necesarios.
2. No uses `db push --force-reset` en producción. Podrías perder toda la información.
3. No abras el puerto 5432 a todo Internet. La comunicación entre los servidores debe hacerse por sus IP privadas y grupos de seguridad.

Con ese documento, DeepSeek tendrá el contexto técnico y el punto exacto donde te quedaste.
