'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, ShieldCheck, CreditCard, ArrowRight, Building2 } from 'lucide-react';
import { useLanguage } from '@/components/context/LanguageContext';
import { SpaceCard } from '@/components/shared/SpaceCard';
import { Hero } from '@/components/shared/Hero';

interface HomeSectionsProps {
  featuredSpaces: any[];
}

export function HomeSections({ featuredSpaces }: HomeSectionsProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-[#09050D] text-zinc-100">
      {/* Nuevo Hero de Alto Impacto Visual con Framer Motion y Glassmorphism */}
      <Hero />

      {/* Sección de Ventajas: Bloques Horizontales Sepia II Metallic */}
      <section className="py-20 lg:py-24 bg-[#09050D] border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            <div className="flex items-start gap-4 p-6 rounded-2xl border border-purple-500/20 bg-[#140A24]/60 backdrop-blur-md hover:border-purple-500/50 hover:bg-[#140A24]/80 transition-all duration-300 hover:shadow-[0_0_30px_rgba(123,44,191,0.2)]">
              <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/25 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base mb-1.5">{t('feature1Title')}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{t('feature1Desc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl border border-purple-500/20 bg-[#140A24]/60 backdrop-blur-md hover:border-purple-500/50 hover:bg-[#140A24]/80 transition-all duration-300 hover:shadow-[0_0_30px_rgba(123,44,191,0.2)]">
              <div className="w-11 h-11 bg-amber-500/10 border border-amber-500/25 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base mb-1.5">{t('feature2Title')}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{t('feature2Desc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl border border-purple-500/20 bg-[#140A24]/60 backdrop-blur-md hover:border-purple-500/50 hover:bg-[#140A24]/80 transition-all duration-300 hover:shadow-[0_0_30px_rgba(123,44,191,0.2)]">
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4 pb-4 border-b border-purple-500/20">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t('featuredHeading')}
            </h2>
            <p className="text-zinc-400 text-sm mt-1">{t('featuredSubheading')}</p>
          </div>
          <Link
            href="/spaces"
            className="text-purple-400 hover:text-purple-300 font-semibold text-sm inline-flex items-center gap-1.5 transition"
          >
            <span>{t('viewAllSpaces')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredSpaces.length === 0 ? (
          <div className="text-center py-16 bg-[#140A24]/60 backdrop-blur-md rounded-2xl border border-purple-500/20 p-8 shadow-xl">
            <div className="w-12 h-12 bg-[#09050D] text-amber-400 rounded-xl flex items-center justify-center mx-auto mb-3 border border-purple-500/20">
              <Building2 className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Catálogo listo para explorar</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Visita el catálogo completo para consultar espacios disponibles en tiempo real.
            </p>
            <Link
              href="/spaces"
              className="inline-block bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition shadow-md shadow-purple-900/30"
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
