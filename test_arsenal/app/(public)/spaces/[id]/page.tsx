import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { LocalTime } from '@/components/shared/LocalTime';
import { BookingForm } from './BookingForm';

export const dynamic = 'force-dynamic';

interface SpaceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SpaceDetailPage(props: SpaceDetailPageProps) {
  const { id } = await props.params;

  let space: any = null;
  try {
    space = await prisma.space.findUnique({
      where: { id },
    });
  } catch (err) {
    console.error('Error fetching space:', err);
  }

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
          className="text-slate-600 hover:text-indigo-600 text-sm font-medium inline-flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al catálogo de espacios</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Información del Espacio */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden shadow-sm bg-slate-100">
            <Image
              src={displayImage}
              alt={space.name}
              fill
              priority
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{space.name}</h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Espacio Activo
              </span>
            </div>

            <div className="text-2xl font-bold text-indigo-600 mb-6">
              ${pricePerHour.toFixed(2)} <span className="text-sm font-normal text-slate-500">/ hora</span>
            </div>

            <div className="border-t border-slate-100 pt-4 mb-6">
              <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                Descripción
              </h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {space.description}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">
                Servicios Incluidos
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Wi-Fi de alta velocidad</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tomas de corriente y conectividad</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Acceso a cafetería</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Climatización central</span>
                </li>
              </ul>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6 text-xs text-slate-400 flex items-center justify-between">
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
