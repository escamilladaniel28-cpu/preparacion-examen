'use client';

import { Building2 } from 'lucide-react';
import { useLanguage } from '@/components/context/LanguageContext';
import { SpaceCard } from '@/components/shared/SpaceCard';

interface SpacesCatalogViewProps {
  spaces: any[];
}

export function SpacesCatalogView({ spaces }: SpacesCatalogViewProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header del Catálogo */}
      <div className="border-b border-purple-500/20 pb-6 mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {t('catalogTitle')}
          </h1>
          <p className="text-zinc-400 text-sm mt-1.5 max-w-2xl">
            {t('catalogSubtitle')}
          </p>
        </div>
        <div className="text-xs text-purple-300 bg-purple-950/40 border border-purple-500/30 px-4 py-2 rounded-full inline-block font-medium shadow-sm">
          {t('totalActive')}{' '}
          <span className="font-bold text-white ml-1">{spaces.length}</span>
        </div>
      </div>

      {/* Grid de Espacios */}
      {spaces.length === 0 ? (
        <div className="text-center py-20 bg-[#140A24]/60 backdrop-blur-md rounded-2xl border border-purple-500/20 p-8 shadow-xl">
          <div className="w-12 h-12 bg-[#09050D] text-amber-500 border border-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">{t('notAvailable')}</h3>
          <p className="text-zinc-400 text-sm">
            Pronto añadiremos nuevos espacios a nuestro catálogo exclusivo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

export default SpacesCatalogView;
