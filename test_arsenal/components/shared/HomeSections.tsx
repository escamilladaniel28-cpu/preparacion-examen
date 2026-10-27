'use client';

import Link from 'next/link';
import { Clock, ShieldCheck, CreditCard, ArrowRight, Building2 } from 'lucide-react';
import { useLanguage } from '@/components/context/LanguageContext';
import { SpaceCard } from '@/components/shared/SpaceCard';

interface HomeSectionsProps {
  featuredSpaces: any[];
}

export function HomeSections({ featuredSpaces }: HomeSectionsProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section Corporativo */}
      <section className="bg-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 mb-6">
            <span>{t('heroBadge')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight text-white">
            {t('heroTitle')}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/spaces"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-sm transition inline-flex items-center gap-2"
            >
              <span>{t('heroExploreBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-6 py-3 rounded-lg border border-slate-700 transition"
            >
              {t('heroReservationsBtn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Ventajas Corporativas */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-slate-700" />
              </div>
              <h3 className="font-semibold text-slate-900 text-base mb-2">{t('feature1Title')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('feature1Desc')}</p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-slate-700" />
              </div>
              <h3 className="font-semibold text-slate-900 text-base mb-2">{t('feature2Title')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('feature2Desc')}</p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
              <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-slate-700" />
              </div>
              <h3 className="font-semibold text-slate-900 text-base mb-2">{t('feature3Title')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t('feature3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Espacios Destacados */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {t('featuredHeading')}
            </h2>
            <p className="text-slate-500 text-sm mt-1">{t('featuredSubheading')}</p>
          </div>
          <Link
            href="/spaces"
            className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm inline-flex items-center gap-1.5 transition"
          >
            <span>{t('viewAllSpaces')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredSpaces.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
            <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">Catálogo listo para explorar</h3>
            <p className="text-slate-500 text-sm mb-4">
              Visita el catálogo completo para consultar espacios disponibles en tiempo real.
            </p>
            <Link
              href="/spaces"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition"
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
