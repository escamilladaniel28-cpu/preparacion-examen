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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      {/* Navegación de migas de pan */}
      <div className="mb-6">
        <Link
          href="/spaces"
          className="text-secondary hover:text-primary text-xs sm:text-sm font-sans font-medium inline-flex items-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al catálogo de espacios</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Información del Espacio */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-72 sm:h-96 w-full max-w-full rounded-lg overflow-hidden shadow-card border border-border bg-muted">
            <Image
              src={displayImage}
              alt={`Fotografía del espacio ${space.name}`}
              fill
              priority
              className="object-cover w-full max-w-full"
              unoptimized
            />
          </div>

          <div className="bg-surface border border-border rounded-lg p-6 sm:p-8 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h1 className="font-heading text-2xl sm:text-4xl font-normal tracking-tight text-primary">
                {space.name}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-sans font-medium uppercase tracking-wider bg-surface border border-border text-secondary shadow-subtle">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                Espacio Activo
              </span>
            </div>

            <div className="text-3xl font-semibold text-primary font-sans mb-6 tracking-tight">
              ${pricePerHour.toFixed(2)}{' '}
              <span className="text-sm font-normal text-secondary font-sans">/ hora</span>
            </div>

            <div className="border-t border-border pt-6 mb-6">
              <h2 className="text-xs font-sans uppercase text-secondary tracking-widest font-medium mb-3">
                Descripción
              </h2>
              <p className="text-secondary leading-relaxed whitespace-pre-line text-sm sm:text-base font-sans font-normal">
                {space.description}
              </p>
            </div>

            <div className="border-t border-border pt-6">
              <h2 className="text-xs font-sans uppercase text-secondary tracking-widest font-medium mb-4">
                Servicios Incluidos
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-secondary font-sans">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-sm bg-accent-subtle text-accent flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Wi-Fi de fibra óptica dedicado</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-sm bg-accent-subtle text-accent flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Tomas de corriente y conectividad premium</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-sm bg-accent-subtle text-accent flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Acceso a barra de café gourmet</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-sm bg-accent-subtle text-accent flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Climatización y control acústico</span>
                </li>
              </ul>
            </div>

            <div className="border-t border-border pt-4 mt-8 text-xs text-secondary flex items-center justify-between font-sans">
              <span>Hora local de consulta:</span>
              <LocalTime date={new Date()} format="full" className="text-secondary font-medium font-sans" />
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
