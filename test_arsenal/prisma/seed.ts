import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface SeedSpace {
  name: string;
  description: string;
  pricePerHour: number;
  imageUrl: string;
  isActive: boolean;
  legacyNames?: string[];
}

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // 1. Usuarios (Admin y Normal)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cospace.com' },
    update: {
      passwordHash: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      email: 'admin@cospace.com',
      name: 'Admin CoSpace',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  const normalUser = await prisma.user.upsert({
    where: { email: 'user@cospace.com' },
    update: {
      passwordHash: userPassword,
      role: 'USER',
      isActive: true,
    },
    create: {
      email: 'user@cospace.com',
      name: 'Usuario CoSpace',
      passwordHash: userPassword,
      role: 'USER',
      isActive: true,
    },
  });

  // 2. Espacios de Coworking (Actualizados y Nuevos)
  const spacesData: SeedSpace[] = [
    {
      name: 'Gamespace & Lounge',
      description:
        'El epicentro del entretenimiento. Equipado con consolas de última generación, torneos de eSports y una mesa VIP para juegos de mesa. Diversión garantizada.',
      pricePerHour: 18.0,
      imageUrl:
        'https://images.unsplash.com/photo-1598550476439-6847785fceb2?q=80&w=1000&auto=format&fit=crop',
      isActive: true,
    },
    {
      name: "Sala de Juntas 'Titan'",
      description:
        'Sala ejecutiva con pantalla 4K, videoconferencia y sillas ergonómicas. Perfecta para tomar decisiones que cambian el juego.',
      pricePerHour: 35.0,
      imageUrl:
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1000&auto=format&fit=crop',
      isActive: true,
      legacyNames: ['Sala de Juntas A', 'Sala de Juntas'],
    },
    {
      name: "Cabina Silenciosa 'Focus'",
      description:
        'Aislamiento acústico total. El lugar ideal para programar, escribir o hacer llamadas sin distracciones.',
      pricePerHour: 15.0,
      imageUrl:
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1000&auto=format&fit=crop',
      isActive: true,
      legacyNames: ['Cabina Silenciosa'],
    },
    {
      name: "Escritorio Ventana 'Horizon'",
      description:
        'Luz natural, vistas despejadas y conexión de fibra óptica. Diseñado para mantener tu productividad al máximo.',
      pricePerHour: 20.0,
      imageUrl:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop',
      isActive: true,
      legacyNames: ['Escritorio Ventana'],
    },
  ];

  for (const space of spacesData) {
    // Buscar si ya existe por su nombre actual
    let target = await prisma.space.findFirst({
      where: { name: space.name },
    });

    // Si no existe con el nombre nuevo, buscar si existe con nombres anteriores para actualizarlo sin duplicar
    if (!target && space.legacyNames && space.legacyNames.length > 0) {
      target = await prisma.space.findFirst({
        where: { name: { in: space.legacyNames } },
      });
    }

    if (target) {
      await prisma.space.update({
        where: { id: target.id },
        data: {
          name: space.name,
          description: space.description,
          pricePerHour: space.pricePerHour,
          imageUrl: space.imageUrl,
          isActive: space.isActive,
        },
      });
      console.log(`[Actualizado] Espacio: ${space.name}`);
    } else {
      await prisma.space.create({
        data: {
          name: space.name,
          description: space.description,
          pricePerHour: space.pricePerHour,
          imageUrl: space.imageUrl,
          isActive: space.isActive,
        },
      });
      console.log(`[Creado] Espacio: ${space.name}`);
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
