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
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="relative h-48 w-full bg-gray-100">
        <Image
          src={displayImage}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          unoptimized
        />
        {!isActive && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow">
            {t('notAvailable')}
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{name}</h3>
            <span className="shrink-0 text-sm font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg">
              ${formattedPrice}{t('perHour')}
            </span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">{description}</p>
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
