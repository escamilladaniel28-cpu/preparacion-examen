'use client';

import { useState } from 'react'; // <-- IMPORTANTE: Agregamos useState
import Image from 'next/image';
import Link from 'next/link';

export interface SpaceItemData {
  id: string;
  name: string;
  description?: string;
  pricePerHour: number | string | { toNumber?: () => number; toString?: () => string };
  imageUrl?: string | null;
  isActive?: boolean;
  category?: string;
  location?: string;
  capacity?: string | number;
}

export interface SpaceCardProps {
  id?: string;
  name?: string;
  description?: string;
  imageUrl?: string | null;
  pricePerHour?: number | string | { toNumber?: () => number; toString?: () => string };
  isActive?: boolean;
  space?: SpaceItemData;
  variant?: 'normal' | 'wide' | 'tall';
  className?: string;
  category?: string;
  location?: string;
  capacity?: string | number;
}

function deriveMetadata(name: string, description?: string): { category: string; location: string; capacity: string } {
  const lower = `${name} ${description || ''}`.toLowerCase();
  if (lower.includes('junta') || lower.includes('board') || lower.includes('reunión')) {
    return { category: 'Sala de Juntas', location: 'Piso 4 · Centro Empresarial', capacity: 'Hasta 10 personas' };
  }
  if (lower.includes('suite') || lower.includes('ejecutiv') || lower.includes('oficina')) {
    return { category: 'Suite Privada', location: 'Piso 3 · Vista Exterior', capacity: '1 a 4 personas' };
  }
  if (lower.includes('cabina') || lower.includes('silent') || lower.includes('acústic') || lower.includes('focus')) {
    return { category: 'Cabina Focus', location: 'Piso 2 · Zona Silenciosa', capacity: '1 persona' };
  }
  if (lower.includes('coworking') || lower.includes('open') || lower.includes('escritorio') || lower.includes('estación')) {
    return { category: 'Escritorio Dedicado', location: 'Piso 1 · Atrio Principal', capacity: '1 persona' };
  }
  return { category: 'Espacio de Trabajo', location: 'Piso 2 · CoSpace', capacity: '2 a 6 personas' };
}

// URL por defecto si la de la base de datos falla
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';

export function SpaceCard(props: SpaceCardProps) {
  const item: SpaceItemData = props.space || {
    id: props.id || '',
    name: props.name || '',
    description: props.description,
    imageUrl: props.imageUrl,
    pricePerHour: props.pricePerHour ?? 0,
    isActive: props.isActive !== undefined ? props.isActive : true,
    category: props.category,
    location: props.location,
    capacity: props.capacity,
  };

  const variant = props.variant || 'normal';

  // Lógica para el precio
  let price = 0;
  if (typeof item.pricePerHour === 'number') {
    price = item.pricePerHour;
  } else if (item.pricePerHour && typeof (item.pricePerHour as any).toNumber === 'function') {
    price = (item.pricePerHour as any).toNumber();
  } else if (item.pricePerHour) {
    price = Number(String(item.pricePerHour));
  }

  const isAvailable = item.isActive !== false;
  const meta = deriveMetadata(item.name, item.description);
  const category = item.category || props.category || meta.category;
  const location = item.location || props.location || meta.location;
  const capacity = item.capacity || props.capacity || meta.capacity;

  // Usamos useState para manejar la URL de la imagen de forma reactiva
  const initialImage = item.imageUrl && item.imageUrl.trim().length > 0 ? item.imageUrl : FALLBACK_IMAGE;
  const [imgSrc, setImgSrc] = useState(initialImage);

  // Control de aspect-ratio según variante para protagonismo de la imagen
  const imageWrapperClasses = {
    normal: 'aspect-[4/3] w-full',
    wide: 'aspect-[16/10] sm:aspect-auto sm:w-7/12 sm:min-h-[260px]',
    tall: 'aspect-[3/4] sm:aspect-[4/5] w-full flex-1 min-h-[300px]',
  }[variant];

  const layoutClasses = {
    normal: 'flex flex-col h-full',
    wide: 'flex flex-col sm:flex-row h-full',
    tall: 'flex flex-col h-full justify-between',
  }[variant];

  return (
    <Link
      href={`/spaces/${item.id}`}
      aria-label={`${item.name}, ${category}, $${price.toFixed(2)} por hora`}
      className={`group relative rounded-lg overflow-hidden bg-surface border border-border hover:border-border-strong transition-all duration-300 hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${layoutClasses} ${props.className || ''}`}
    >
      {/* Contenedor de la Imagen Protagonista */}
      <div className={`relative overflow-hidden bg-muted ${imageWrapperClasses}`}>
        <Image
          src={imgSrc}
          alt={`Fotografía del espacio ${item.name}`}
          fill
          unoptimized
          onError={() => setImgSrc(FALLBACK_IMAGE)} // <-- AQUÍ ESTÁ LA MAGIA
          sizes={
            variant === 'wide'
              ? '(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw'
              : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          }
          className="object-cover w-full h-full brightness-95 group-hover:brightness-100 group-hover:scale-[1.03] transition-all duration-500 ease-out"
        />

        {/* Badge sutil y sobrio de estado */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-sans font-medium tracking-wide uppercase bg-surface/90 text-primary backdrop-blur-sm border border-border shadow-subtle">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAvailable ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-secondary'
              }`}
            />
            {isAvailable ? 'Disponible' : 'No disponible'}
          </span>
        </div>
      </div>

      {/* Información mínima y jerarquizada */}
      <div
        className={`p-5 flex flex-col justify-between ${
          variant === 'wide' ? 'sm:w-5/12 sm:p-6' : 'flex-1'
        }`}
      >
        <div>
          {/* Ubicación / Categoría en texto secundario pequeño */}
          <p className="text-[11px] font-sans uppercase tracking-wider text-secondary font-medium">
            {category} · {location}
          </p>

          {/* Nombre en Serif con hover a color acento */}
          <h3 className="font-heading text-lg sm:text-xl font-normal text-primary mt-1.5 tracking-tight group-hover:text-accent transition-colors duration-200 line-clamp-1">
            {item.name}
          </h3>

          {item.description && (
            <p className="text-secondary text-xs sm:text-sm mt-2 line-clamp-2 leading-relaxed font-sans font-normal">
              {item.description}
            </p>
          )}
        </div>

        {/* Precio y capacidad en Sans */}
        <div className="flex items-baseline justify-between pt-4 mt-4 border-t border-border font-sans">
          <span className="text-xs text-secondary font-normal">{capacity}</span>
          <div className="text-right">
            <span className="text-base sm:text-lg font-semibold text-primary font-sans">
              ${price.toFixed(2)}
            </span>
            <span className="text-xs text-secondary font-normal ml-1">/ hora</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default SpaceCard;