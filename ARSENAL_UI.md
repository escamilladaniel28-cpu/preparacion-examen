# ARSENAL UI - BidHub

## 1. Componente Countdown (Client Component)
```tsx
'use client';
import { useState, useEffect } from 'react';

export function Countdown({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(endsAt).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft('Finalizada');
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      
      setTimeLeft(`${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTime(); // Ejecución inicial
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  if (!timeLeft) return <span className="animate-pulse bg-gray-200 text-transparent rounded">Cargando...</span>;

  return <span className="font-mono text-red-500 font-bold">{timeLeft}</span>;
}
```

## 2. Componente AuctionCard
```tsx
import Image from 'next/image';
import Link from 'next/link';
import { Countdown } from './Countdown';

interface AuctionCardProps {
  id: string;
  title: string;
  imageUrl: string | null;
  currentPrice: number;
  status: string; // 'ACTIVE', 'CLOSED', etc.
  endsAt: string;
}

export function AuctionCard({ id, title, imageUrl, currentPrice, status, endsAt }: AuctionCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="relative h-48 w-full bg-gray-100">
        <Image 
          src={imageUrl || '/placeholder.png'} 
          alt={title} 
          fill 
          className="object-cover" 
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg truncate">{title}</h3>
        <p className="text-gray-600">Precio actual: <span className="font-bold text-black">${currentPrice}</span></p>
        <div className="mt-2 text-sm">
          {status === 'ACTIVE' ? (
            <p>Tiempo restante: <Countdown endsAt={endsAt} /></p>
          ) : (
            <span className={`px-2 py-1 rounded text-xs font-bold ${status === 'CLOSED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
              {status}
            </span>
          )}
        </div>
        <Link href={`/auctions/${id}`} className="mt-4 block text-center bg-black text-white py-2 rounded hover:bg-gray-800">
          Ver Detalle
        </Link>
      </div>
    </div>
  );
}
```

## 3. Script de Seed
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  // 1. Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bithub.com' },
    update: {},
    create: {
      email: 'admin@bithub.com',
      name: 'Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  // 2. Categorías
  const catCartas = await prisma.category.upsert({
    where: { name: 'Cartas' },
    update: {},
    create: { name: 'Cartas' },
  });

  // 3. Subastas
  const now = new Date();
  
  // Activa (cierra en 2 días)
  await prisma.auction.create({
    data: {
      title: 'Carta de Charizard',
      description: 'Primera edición',
      startingPrice: 100,
      minIncrement: 10,
      endsAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      sellerId: admin.id,
      categoryId: catCartas.id,
    }
  });

  // Cerrada (cierra en el pasado, con ofertas)
  const closedAuction = await prisma.auction.create({
    data: {
      title: 'Reloj Antiguo',
      description: 'De colección',
      startingPrice: 50,
      minIncrement: 5,
      endsAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Pasado
      sellerId: admin.id,
      categoryId: catCartas.id,
    }
  });
  await prisma.bid.create({
    data: { amount: 60, auctionId: closedAuction.id, bidderId: admin.id }
  });

  // Desierta (cierra en el pasado, sin ofertas)
  await prisma.auction.create({
    data: {
      title: 'Vinilo Raro',
      description: 'Sin ofertas',
      startingPrice: 20,
      minIncrement: 2,
      endsAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Pasado
      sellerId: admin.id,
      categoryId: catCartas.id,
    }
  });

  // Cancelada
  await prisma.auction.create({
    data: {
      title: 'Figura Rota',
      description: 'Cancelada por admin',
      startingPrice: 10,
      minIncrement: 1,
      endsAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      sellerId: admin.id,
      categoryId: catCartas.id,
      cancelledAt: new Date(),
      cancellationReason: 'Artículo defectuoso'
    }
  });

  console.log('Seed completado');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
```
