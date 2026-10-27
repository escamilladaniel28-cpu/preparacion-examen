'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/components/context/LanguageContext';

export interface SpaceCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  pricePerHour: number | string | { toString(): string };
  isActive?: boolean;
}

export function SpaceCard({
  id,
  name,
  description,
  imageUrl,
  pricePerHour,
  isActive = true,
}: SpaceCardProps) {
  const { t } = useLanguage();
  const formattedPrice = Number(pricePerHour).toFixed(2);
  const displayImage =
    imageUrl && imageUrl.trim().length > 0
      ? imageUrl
      : 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Contenedor de Imagen con Zoom sutil al hover */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        <Image
          src={displayImage}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          unoptimized
        />
        {!isActive && (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow">
            {t('notAvailable')}
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors mb-2">
            {name}
          </h3>

          {/* Precio destacado con tipografía premium */}
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-2xl font-bold tracking-tight text-slate-900">${formattedPrice}</span>
            <span className="text-xs font-medium text-slate-500">{t('perHour')}</span>
          </div>

          <p className="text-slate-600 text-sm line-clamp-2 mb-6 leading-relaxed">
            {description}
          </p>
        </div>

        <Link
          href={`/spaces/${id}`}
          className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors block shadow-sm"
        >
          {t('bookNow')}
        </Link>
      </div>
    </div>
  );
}

export default SpaceCard;
