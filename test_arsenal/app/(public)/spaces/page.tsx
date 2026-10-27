import { prisma } from '@/lib/prisma';
import { SpaceCard } from '@/components/shared/SpaceCard';

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Catálogo de Espacios
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Explora y reserva salas disponibles con confirmación inmediata
          </p>
        </div>
        <div className="text-sm text-gray-600 bg-gray-100 px-3.5 py-1.5 rounded-full inline-block font-medium">
          Total de espacios activos: <span className="font-bold text-gray-900">{spaces.length}</span>
        </div>
      </div>

      {/* Grid de Espacios */}
      {spaces.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="text-4xl mb-3">🏢</div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No hay espacios disponibles</h3>
          <p className="text-gray-500 text-sm">
            Pronto añadiremos nuevos espacios a nuestro catálogo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => (
            <SpaceCard
              key={space.id}
              id={space.id}
              name={space.name}
              description={space.description}
              imageUrl={space.imageUrl}
              pricePerHour={Number(space.pricePerHour)}
              isActive={space.isActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
