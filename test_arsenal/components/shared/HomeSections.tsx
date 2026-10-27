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
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      {/* Hero Section Luxury Dark (Inspirado en Koenigsegg / Hypercar Luxury) */}
      <section className="relative overflow-hidden py-24 lg:py-32 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black border-b border-white/10">
        {/* Glow dorado ambiental sutil en el fondo */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Columna Izquierda: Texto y Acciones */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-amber-400 mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>{t('heroBadge')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.08]">
                {t('heroTitle')}
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 mb-10 leading-relaxed font-normal max-w-xl">
                {t('heroSubtitle')}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/spaces"
                  className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all inline-flex items-center gap-2 text-sm tracking-wide"
                >
                  <span>{t('heroExploreBtn')}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-zinc-900/80 hover:bg-zinc-800 text-white font-semibold px-7 py-3.5 rounded-xl border border-white/20 shadow-sm transition text-sm"
                >
                  {t('heroReservationsBtn')}
                </Link>
              </div>
            </div>

            {/* Columna Derecha: Imagen con Borde Dorado Sutil y Sombra Profunda */}
            <div className="relative">
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl shadow-black border border-amber-500/30 ring-1 ring-amber-500/20 bg-zinc-900">
                <Image
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
                  alt="Espacio exclusivo de coworking CoSpace"
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

      {/* Sección de Ventajas: Bloques Horizontales Luxury Dark */}
      <section className="py-20 lg:py-24 bg-zinc-950 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            <div className="flex items-start gap-4 p-6 rounded-2xl border border-white/10 bg-zinc-900/60 hover:border-amber-500/40 hover:bg-zinc-900 transition-all duration-300">
              <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/25 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base mb-1.5">{t('feature1Title')}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{t('feature1Desc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl border border-white/10 bg-zinc-900/60 hover:border-amber-500/40 hover:bg-zinc-900 transition-all duration-300">
              <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/25 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base mb-1.5">{t('feature2Title')}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{t('feature2Desc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl border border-white/10 bg-zinc-900/60 hover:border-amber-500/40 hover:bg-zinc-900 transition-all duration-300">
              <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/25 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base mb-1.5">{t('feature3Title')}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{t('feature3Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Espacios Destacados */}
      <section className="py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t('featuredHeading')}
            </h2>
            <p className="text-zinc-400 text-sm mt-1">{t('featuredSubheading')}</p>
          </div>
          <Link
            href="/spaces"
            className="text-amber-400 hover:text-amber-300 font-semibold text-sm inline-flex items-center gap-1.5 transition"
          >
            <span>{t('viewAllSpaces')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredSpaces.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 rounded-2xl border border-white/10 p-8">
            <div className="w-12 h-12 bg-zinc-800 text-amber-400 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Catálogo listo para explorar</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Visita el catálogo completo para consultar espacios disponibles en tiempo real.
            </p>
            <Link
              href="/spaces"
              className="inline-block bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-bold text-xs px-5 py-2.5 rounded-lg transition shadow-md shadow-amber-500/20"
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
