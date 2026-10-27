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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('catalogTitle')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t('catalogSubtitle')}
          </p>
        </div>
        <div className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full inline-block font-medium">
          {t('totalActive')} <span className="font-semibold text-slate-900">{spaces.length}</span>
        </div>
      </div>

      {/* Grid de Espacios */}
      {spaces.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">{t('notAvailable')}</h3>
          <p className="text-slate-500 text-sm">
            Pronto añadiremos nuevos espacios a nuestro catálogo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
