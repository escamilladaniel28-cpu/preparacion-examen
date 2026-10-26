# SPEC.md - Proyecto BidHub

Este documento es la especificación técnica y de negocio para la plataforma de subastas BidHub. Es la fuente de la verdad. Cualquier código generado debe cumplir estrictamente con lo aquí descrito.

## 1. Stack Tecnológico
- **Framework:** Next.js 16 (App Router, TypeScript).
- **Base de Datos:** PostgreSQL (alojada en Supabase).
- **ORM:** Prisma.
- **Validación:** Zod.
- **Autenticación:** JWT (Access y Refresh) en cookies `httpOnly`.
- **Estilos:** Tailwind CSS (o CSS Modules, a elección, pero consistente).
- **i18n:** Diccionarios propios con selector de idioma (es/en).

## 2. Modelo de Datos (Prisma)
El estado de la subasta **NO SE GUARDA EN LA BASE DE DATOS**. Se calcula dinámicamente en cada consulta basándose en las fechas y si tiene ofertas.

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  name          String
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  
  refreshTokens RefreshToken[]
  auctions      Auction[] @relation("SellerAuctions")
  bids          Bid[]
}

enum Role {
  USER
  ADMIN
}

model RefreshToken {
  id        String   @id @default(uuid())
  tokenHash String   @unique // Hasheado, NUNCA en texto plano
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  revokedAt DateTime? // Si no es null, el token fue revocado (logout)
  createdAt DateTime @default(now())
}

model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  auctions    Auction[]
}

model Auction {
  id               String    @id @default(uuid())
  title            String
  description      String
  imageUrl         String?
  startingPrice    Decimal   @db.Decimal(10, 2)
  minIncrement     Decimal   @db.Decimal(10, 2)
  endsAt           DateTime  // Fecha de cierre (puede extenderse)
  sellerId         String
  seller           User      @relation("SellerAuctions", fields: [sellerId], references: [id])
  categoryId       String
  category         Category  @relation(fields: [categoryId], references: [id])
  
  // Moderación
  cancelledAt      DateTime?
  cancellationReason String?
  
  bids             Bid[]
  createdAt        DateTime  @default(now())

  // Índices para consultas rápidas
  @@index([sellerId])
  @@index([categoryId])
  @@index([endsAt])
}

model Bid {
  id           String   @id @default(uuid())
  amount       Decimal  @db.Decimal(10, 2)
  auctionId    String
  auction      Auction  @relation(fields: [auctionId], references: [id])
  bidderId     String
  bidder       User     @relation(fields: [bidderId], references: [id])
  createdAt    DateTime @default(now())

  @@index([auctionId])
  @@index([bidderId])
}

model IdempotencyKey {
  id        String   @id @default(uuid())
  key       String   @unique
  userId    String
  action    String   // Ej: "CREATE_BID_auctionId"
  createdAt DateTime @default(now())
}
```

## 3. Reglas de Negocio y Ciclo de Vida de las Subastas

### 3.1. Cálculo Dinámico de Estado
El estado nunca es un campo estático en la tabla `Auction`. Se computa dinámicamente:
- **`CANCELLED`**: Si `cancelledAt !== null`.
- **`ACTIVE`**: Si `now < endsAt` y `cancelledAt === null`.
- **`CLOSED`**: Si `now >= endsAt` y existen pujas registradas (`bids.length > 0`).
- **`DESERTED`**: Si `now >= endsAt` y no se recibieron ofertas (`bids.length === 0`).

### 3.2. Reglas de Ofertas y Anti-Sniping
1. **Validación de Oferente:** Un usuario no puede pujar en sus propias subastas (`sellerId !== bidderId`).
2. **Postor Líder (Self-bidding prevention):** Un usuario que ya tiene la oferta más alta de una subasta no puede volver a ofertar en ella (`highestBid.bidderId !== bidderId`). Debe devolver error `ALREADY_HIGHEST_BIDDER`.
3. **Incremento Mínimo:**
   - Si no hay pujas previas: `amount >= startingPrice`.
   - Si hay pujas previas: `amount >= highestBid.amount + minIncrement`.
4. **Manejo de Concurrencia:** Las ofertas deben ejecutarse dentro de una transacción atómica serializada (`prisma.$transaction`).
5. **Anti-Sniping (Extensión Automática de 5 Minutos):**
   - Si se registra una oferta válida dentro de los últimos 5 minutos antes del cierre (`endsAt.getTime() - now.getTime() <= 5 * 60 * 1000`):
   - La fecha de fin `endsAt` se extiende automáticamente 5 minutos adicionales (`newEndsAt = new Date(endsAt.getTime() + 5 * 60 * 1000)`).
   - Esto evita que bots o usuarios roben la subasta en el último segundo sin oportunidad de contraoferta.

## 4. Estructura de Route Groups (Next.js App Router)
```text
app/
├── (public)/              # Rutas accesibles sin autenticación
│   ├── page.tsx           # Home / Landing con catálogo de subastas (SSG/ISR)
│   ├── auctions/
│   │   ├── page.tsx       # Catálogo con filtros y búsqueda (SSR)
│   │   └── [id]/page.tsx  # Vista detallada de subasta, precio y Countdown (SSR)
│   └── layout.tsx
├── (auth)/                # Flujo de autenticación
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
├── (dashboard)/           # Rutas privadas protegidas por proxy.ts
│   ├── dashboard/page.tsx # Historial de pujas y mis subastas (CSR/RSC)
│   ├── auctions/new/      # Creación de nueva subasta
│   └── layout.tsx
└── api/                   # Route handlers backend
    ├── auth/              # login, register, refresh, logout
    └── auctions/          # CRUD de subastas y sub-ruta [id]/bids
```
