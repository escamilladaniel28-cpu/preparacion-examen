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
    },
  });

  // Cerrada (cierra en el pasado, con ofertas)
  const closedAuction = await prisma.auction.create({
    data: {
      title: 'Reloj Antiguo',
      description: 'De colección',
      startingPrice: 50,
      minIncrement: 5,
      endsAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      sellerId: admin.id,
      categoryId: catCartas.id,
    },
  });
  await prisma.bid.create({
    data: { amount: 60, auctionId: closedAuction.id, bidderId: admin.id },
  });

  // Desierta (cierra en el pasado, sin ofertas)
  await prisma.auction.create({
    data: {
      title: 'Vinilo Raro',
      description: 'Sin ofertas',
      startingPrice: 20,
      minIncrement: 2,
      endsAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      sellerId: admin.id,
      categoryId: catCartas.id,
    },
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
      cancellationReason: 'Artículo defectuoso',
    },
  });

  console.log('Seed completado con éxito en Supabase!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
