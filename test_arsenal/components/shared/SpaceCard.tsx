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
    <div className="group bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-lg shadow-black/50 hover:border-amber-500/50 hover:shadow-amber-500/10 transition-all duration-300 flex flex-col h-full">
      {/* Contenedor de Imagen con Zoom sutil al hover */}
      <div className="relative h-52 w-full overflow-hidden bg-zinc-950">
        <Image
          src={displayImage}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          unoptimized
        />
        {!isActive && (
          <div className="absolute top-3 right-3 bg-red-950/80 text-red-300 border border-red-800 text-xs font-bold px-2.5 py-1 rounded-md shadow backdrop-blur-md">
            {t('notAvailable')}
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-white line-clamp-1 group-hover:text-amber-400 transition-colors mb-2">
            {name}
          </h3>

          {/* Precio destacado en dorado */}
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-2xl font-bold tracking-tight text-amber-500">${formattedPrice}</span>
            <span className="text-xs font-medium text-zinc-400">{t('perHour')}</span>
          </div>

          <p className="text-zinc-400 text-sm line-clamp-2 mb-6 leading-relaxed">
            {description}
          </p>
        </div>

        <Link
          href={`/spaces/${id}`}
          className="w-full text-center bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-bold py-2.5 px-4 rounded-xl text-sm transition-all duration-200 block shadow-md shadow-amber-500/20"
        >
          {t('bookNow')}
        </Link>
      </div>
    </div>
  );
}

export default SpaceCard;
