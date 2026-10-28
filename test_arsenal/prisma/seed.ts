import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // 1. Usuarios (Admin y Normal)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cospace.com' },
    update: {
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@cospace.com',
      name: 'Admin CoSpace',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  const normalUser = await prisma.user.upsert({
    where: { email: 'user@cospace.com' },
    update: {
      passwordHash: userPassword,
      role: 'USER',
    },
    create: {
      email: 'user@cospace.com',
      name: 'Usuario CoSpace',
      passwordHash: userPassword,
      role: 'USER',
    },
  });

  // 2. Espacios de Coworking con Imágenes Específicas de Unsplash
  const spacesData = [
    {
      name: 'Escritorio Ventana',
      description: 'Puesto individual con abundante luz natural y vista panorámica, ideal para trabajo enfocado.',
      pricePerHour: 10,
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop',
      isActive: true,
    },
    {
      name: 'Sala de Juntas A',
      description: 'Sala ejecutiva equipada con proyector, pizarra interactiva y capacidad para 8 personas.',
      pricePerHour: 25,
      imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1000&auto=format&fit=crop',
      isActive: true,
    },
    {
      name: 'Cabina Silenciosa',
      description: 'Cabina individual insonorizada diseñada para llamadas confidenciales y reuniones virtuales.',
      pricePerHour: 15,
      imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1000&auto=format&fit=crop',
      isActive: true,
    },
  ];

  for (const space of spacesData) {
    const existing = await prisma.space.findFirst({
      where: { name: space.name },
    });

    if (existing) {
      await prisma.space.update({
        where: { id: existing.id },
        data: {
          description: space.description,
          pricePerHour: space.pricePerHour,
          imageUrl: space.imageUrl,
          isActive: space.isActive,
        },
      });
    } else {
      await prisma.space.create({
        data: space,
      });
    }
  }

  console.log('Seed de CoSpace completado con éxito!');
  console.log(`- Admin: ${admin.email}`);
  console.log(`- Usuario: ${normalUser.email}`);
  console.log(`- Espacios sincronizados: ${spacesData.length}`);
}

main()
  .catch((e) => {
    console.error('Error ejecutando el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
