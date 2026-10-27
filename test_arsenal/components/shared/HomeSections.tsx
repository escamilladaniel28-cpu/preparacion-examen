'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/context/LanguageContext';
import { SpaceCard } from '@/components/shared/SpaceCard';

interface HomeSectionsProps {
  featuredSpaces: any[];
}

export function HomeSections({ featuredSpaces }: HomeSectionsProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white py-16 px-4 sm:px-6 lg:px-8 text-center shadow-inner">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-700/60 border border-indigo-500/40 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6">
            <span>✨</span> {t('heroBadge')}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/spaces"
              className="bg-white text-indigo-950 hover:bg-gray-100 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition"
            >
              {t('heroExploreBtn')}
            </Link>
            <Link
              href="/dashboard"
              className="bg-indigo-700 hover:bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl border border-indigo-500 transition shadow"
            >
              {t('heroReservationsBtn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Ventajas */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
                ⏱️
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{t('feature1Title')}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{t('feature1Desc')}</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
                🛡️
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{t('feature2Title')}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{t('feature2Desc')}</p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
                💳
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{t('feature3Title')}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{t('feature3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Espacios Destacados */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              {t('featuredHeading')}
            </h2>
            <p className="text-gray-500 text-sm mt-1">{t('featuredSubheading')}</p>
          </div>
          <Link
            href="/spaces"
            className="text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center gap-1 transition"
          >
            {t('viewAllSpaces')}
          </Link>
        </div>

        {featuredSpaces.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="text-4xl mb-3">🏢</div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Catálogo listo para explorar</h3>
            <p className="text-gray-500 text-sm mb-4">
              Visita el catálogo completo para consultar espacios disponibles en tiempo real.
            </p>
            <Link
              href="/spaces"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2 rounded-xl transition shadow"
            >
              Ir al Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSpaces.map((space) => (
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
      </section>
    </div>
  );
}

export default HomeSections;
