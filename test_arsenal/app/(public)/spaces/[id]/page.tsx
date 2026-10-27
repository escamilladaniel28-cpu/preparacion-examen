import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { LocalTime } from '@/components/shared/LocalTime';
import { BookingForm } from './BookingForm';

export const dynamic = 'force-dynamic';

interface SpaceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SpaceDetailPage(props: SpaceDetailPageProps) {
  const { id } = await props.params;

  const space = await prisma.space.findUnique({
    where: { id },
  });

  if (!space || !space.isActive) {
    notFound();
  }

  const pricePerHour = Number(space.pricePerHour);
  const displayImage =
    space.imageUrl && space.imageUrl.trim().length > 0
      ? space.imageUrl
      : 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Navegación de migas de pan */}
      <div className="mb-6">
        <Link
          href="/spaces"
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium inline-flex items-center gap-1 transition"
        >
          ← Volver al catálogo de espacios
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Información del Espacio */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden shadow-sm bg-gray-100">
            <Image
              src={displayImage}
              alt={space.name}
              fill
              priority
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h1 className="text-3xl font-extrabold text-gray-900">{space.name}</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                ● Espacio Activo
              </span>
            </div>

            <div className="text-2xl font-bold text-indigo-600 mb-6">
              ${pricePerHour.toFixed(2)} <span className="text-sm font-normal text-gray-500">/ hora</span>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <h2 className="text-sm font-semibold uppercase text-gray-500 tracking-wider mb-2">
                Descripción
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                {space.description}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h2 className="text-sm font-semibold uppercase text-gray-500 tracking-wider mb-2">
                Equipamiento y Servicios Incluidos
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600">✓</span> Wi-Fi de alta velocidad simétrico
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600">✓</span> Tomas de corriente y puertos USB
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600">✓</span> Acceso a cafetería de cortesía
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600">✓</span> Climatización centralizada
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-6 text-xs text-gray-400 flex items-center justify-between">
              <span>Hora local de consulta:</span>
              <LocalTime date={new Date()} format="full" />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formulario de Reserva */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <BookingForm spaceId={space.id} pricePerHour={pricePerHour} />
          </div>
        </div>
      </div>
    </div>
  );
}
