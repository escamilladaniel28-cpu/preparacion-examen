import { prisma } from '@/lib/prisma';
import { HomeSections } from '@/components/shared/HomeSections';

export const dynamic = 'force-static';

export default async function HomePage() {
  let featuredSpaces: any[] = [];
  try {
    featuredSpaces = await prisma.space.findMany({
      where: { isActive: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('Aviso: Base de datos no conectada aún durante renderizado estático de Home:', err);
  }

  return <HomeSections featuredSpaces={featuredSpaces} />;
}
