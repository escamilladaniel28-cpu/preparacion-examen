'use client';

import Image from 'next/image';
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
      {/* Hero Section Premium de 2 Columnas (Estilo Linear / Vercel) */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-b from-white via-slate-50 to-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Columna Izquierda: Texto y Acciones */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200/80 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{t('heroBadge')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                {t('heroTitle')}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed font-normal max-w-xl">
                {t('heroSubtitle')}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/spaces"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition inline-flex items-center gap-2 text-sm"
                >
                  <span>{t('heroExploreBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3.5 rounded-xl border border-slate-300 shadow-sm transition text-sm"
                >
                  {t('heroReservationsBtn')}
                </Link>
              </div>
            </div>

            {/* Columna Derecha: Imagen Destacada del Espacio */}
            <div className="relative">
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-100">
                <Image
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
                  alt="Espacio moderno de coworking CoSpace"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Ventajas: Formato Horizontal con Tipografía Limpia */}
      <section className="py-20 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            <div className="flex items-start gap-4 p-6 rounded-2xl border border-slate-200/70 bg-slate-50/40 hover:bg-slate-50 transition">
              <div className="w-11 h-11 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">{t('feature1Title')}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{t('feature1Desc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl border border-slate-200/70 bg-slate-50/40 hover:bg-slate-50 transition">
              <div className="w-11 h-11 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">{t('feature2Title')}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{t('feature2Desc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl border border-slate-200/70 bg-slate-50/40 hover:bg-slate-50 transition">
              <div className="w-11 h-11 bg-sky-50 border border-sky-100 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">{t('feature3Title')}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{t('feature3Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Espacios Destacados con Espaciado Generoso */}
      <section className="py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
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
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center mx-auto mb-3">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
