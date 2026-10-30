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
          className="text-slate-400 hover:text-white text-sm font-medium inline-flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al catálogo de espacios</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Información del Espacio */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-[#131A2B]">
            <Image
              src={displayImage}
              alt={space.name}
              fill
              priority
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="bg-[#131A2B] border border-white/5 hover:border-purple-500/50 transition-colors rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">{space.name}</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Espacio Activo
              </span>
            </div>

            <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 tracking-tight">
              ${pricePerHour.toFixed(2)}{' '}
              <span className="text-sm font-normal text-slate-400">/ hora</span>
            </div>

            <div className="border-t border-white/5 pt-5 mb-6">
              <h2 className="text-xs font-bold uppercase text-blue-400 tracking-wider mb-2.5">
                Descripción
              </h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {space.description}
              </p>
            </div>

            <div className="border-t border-white/5 pt-5">
              <h2 className="text-xs font-bold uppercase text-blue-400 tracking-wider mb-3.5">
                Servicios Incluidos
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span>Wi-Fi de fibra óptica dedicado</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span>Tomas de corriente y conectividad premium</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span>Acceso a barra de café gourmet</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span>Climatización y control acústico</span>
                </li>
              </ul>
            </div>

            <div className="border-t border-white/5 pt-4 mt-6 text-xs text-slate-500 flex items-center justify-between">
              <span>Hora local de consulta:</span>
              <LocalTime date={new Date()} format="full" className="text-slate-400 font-medium" />
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
