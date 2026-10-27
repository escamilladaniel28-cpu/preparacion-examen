import { prisma } from '@/lib/prisma';
import { SpacesCatalogView } from '@/components/shared/SpacesCatalogView';

export const dynamic = 'force-dynamic';

export default async function SpacesCatalogPage() {
  let spaces: any[] = [];
  try {
    spaces = await prisma.space.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('Aviso: Error al consultar espacios en catálogo:', err);
  }

  return <SpacesCatalogView spaces={spaces} />;
}
