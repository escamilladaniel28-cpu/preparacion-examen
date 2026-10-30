'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export interface SpaceItemData {
  id: string;
  name: string;
  description?: string;
  pricePerHour: number | string | { toNumber?: () => number; toString?: () => string };
  imageUrl?: string | null;
  isActive?: boolean;
}

export interface SpaceCardProps {
  id?: string;
  name?: string;
  description?: string;
  imageUrl?: string | null;
  pricePerHour?: number | string | { toNumber?: () => number; toString?: () => string };
  isActive?: boolean;
  space?: SpaceItemData;
}

export function SpaceCard(props: SpaceCardProps) {
  const item: SpaceItemData = props.space || {
    id: props.id || '',
    name: props.name || '',
    description: props.description,
    imageUrl: props.imageUrl,
    pricePerHour: props.pricePerHour ?? 0,
    isActive: props.isActive !== undefined ? props.isActive : true,
  };

  let price = 0;
  if (typeof item.pricePerHour === 'number') {
    price = item.pricePerHour;
  } else if (item.pricePerHour && typeof (item.pricePerHour as any).toNumber === 'function') {
    price = (item.pricePerHour as any).toNumber();
  } else if (item.pricePerHour) {
    price = Number(String(item.pricePerHour));
  }

  const isAvailable = item.isActive !== false;
  const descriptionText =
    item.description && item.description.trim().length > 0
      ? item.description
      : 'Espacio de alto rendimiento diseñado para tu productividad.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="group relative rounded-2xl overflow-hidden bg-[#131A2B] border border-white/5 hover:border-purple-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] flex flex-col h-full"
    >
      <div className="relative h-56 w-full overflow-hidden bg-[#0B0F19]">
        <Image
          src={item.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500'}
          alt={item.name}
          fill
          unoptimized
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#131A2B] via-transparent to-transparent opacity-90" />
      </div>

      <div className="p-6 relative z-10 flex flex-col justify-between flex-1">
        <div>
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-bold text-xl text-white tracking-wide line-clamp-1">{item.name}</h3>
            {isAvailable ? (
              <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                Disponible
              </span>
            ) : (
              <span className="bg-red-500/10 text-red-400 text-xs font-semibold px-3 py-0.5 rounded-full border border-red-500/20 shrink-0">
                No disponible
              </span>
            )}
          </div>

          <p className="text-slate-300 text-sm mb-6 line-clamp-2 leading-relaxed">
            {descriptionText}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-extrabold text-2xl">
            ${price.toFixed(2)}{' '}
            <span className="text-sm text-slate-400 font-normal">/ hora</span>
          </p>

          <Link
            href={`/spaces/${item.id}`}
            className="rounded-full px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-sm shadow-md shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 transition-all"
          >
            Reservar
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default SpaceCard;
