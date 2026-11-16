'use client';

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
    <div className="flex flex-col min-h-screen bg-background text-primary">
      {/* SECCIÓN 1 (FONDO CREMA CÁLIDO): Hero */}
      <Hero />

      {/* SECCIÓN 2 (FONDO BLANCO / SUPERFICIE): Ventajas y Principios Editoriales */}
      <section className="py-24 sm:py-32 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-sans uppercase tracking-widest text-secondary font-medium mb-3">
              Estándares de CoSpace
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-normal text-primary tracking-tight">
              Diseño, tecnología y flexibilidad en cada reserva
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="flex flex-col items-start p-8 rounded-lg border border-border bg-background shadow-subtle">
              <div className="w-10 h-10 bg-accent-subtle text-accent rounded-sm flex items-center justify-center mb-6">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-normal text-primary mb-2.5">
                {t('feature1Title')}
              </h3>
              <p className="text-secondary text-sm leading-relaxed font-sans font-normal">
                {t('feature1Desc')}
              </p>
            </div>

            <div className="flex flex-col items-start p-8 rounded-lg border border-border bg-background shadow-subtle">
              <div className="w-10 h-10 bg-accent-subtle text-accent rounded-sm flex items-center justify-center mb-6">
                <ShieldCheck className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-normal text-primary mb-2.5">
                {t('feature2Title')}
              </h3>
              <p className="text-secondary text-sm leading-relaxed font-sans font-normal">
                {t('feature2Desc')}
              </p>
            </div>

            <div className="flex flex-col items-start p-8 rounded-lg border border-border bg-background shadow-subtle">
              <div className="w-10 h-10 bg-accent-subtle text-accent rounded-sm flex items-center justify-center mb-6">
                <CreditCard className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-normal text-primary mb-2.5">
                {t('feature3Title')}
              </h3>
              <p className="text-secondary text-sm leading-relaxed font-sans font-normal">
                {t('feature3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3 (FONDO CREMA CÁLIDO): Bento Asimétrico de Espacios Destacados */}
      <section className="py-24 sm:py-32 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4 pb-6 border-b border-border">
            <div>
              <p className="text-xs font-sans uppercase tracking-widest text-secondary font-medium mb-2">
                Selección Curada
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-normal tracking-tight text-primary">
                {t('featuredHeading')}
              </h2>
              <p className="text-secondary text-sm mt-1.5 font-sans">{t('featuredSubheading')}</p>
            </div>
            <Link
              href="/spaces"
              className="group inline-flex items-center gap-2 text-sm font-sans font-medium text-accent hover:text-accent-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm py-1"
            >
              <span>{t('viewAllSpaces')}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {featuredSpaces.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-lg border border-border p-8 shadow-subtle max-w-xl mx-auto">
              <div className="w-12 h-12 bg-muted text-accent rounded-sm flex items-center justify-center mx-auto mb-4 border border-border">
                <Building2 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-normal text-primary mb-2">
                Catálogo en preparación
              </h3>
              <p className="text-secondary text-sm mb-6 leading-relaxed font-sans">
                Explora el catálogo completo para consultar espacios disponibles en tiempo real.
              </p>
              <Link
                href="/spaces"
                className="inline-block rounded-md px-6 py-2.5 bg-accent hover:bg-accent-hover text-accent-fg font-sans font-medium text-xs tracking-wide uppercase transition shadow-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Ir al Catálogo
              </Link>
            </div>
          ) : (
            /* Grilla Bento Asimétrica Determinista */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredSpaces.map((space, index) => {
                // Patrón determinista para 3 espacios en landing
                let bentoGridClasses = 'col-span-1';
                let variant: 'normal' | 'wide' | 'tall' = 'normal';

                if (index === 0) {
                  // Primera tarjeta: wide (2 columnas en md y lg)
                  bentoGridClasses = 'col-span-1 md:col-span-2 lg:col-span-2';
                  variant = 'wide';
                } else if (index === 1) {
                  // Segunda tarjeta: tall (1 columna en md/lg, span 2 filas en lg)
                  bentoGridClasses = 'col-span-1 md:col-span-1 lg:col-span-1 lg:row-span-2';
                  variant = 'tall';
                } else if (index === 2) {
                  // Tercera tarjeta: wide en lg (2 columnas) para equilibrar con la tarjeta alta
                  bentoGridClasses = 'col-span-1 md:col-span-1 lg:col-span-2';
                  variant = 'wide';
                }

                return (
                  <div key={space.id} className={bentoGridClasses}>
                    <SpaceCard
                      id={space.id}
                      name={space.name}
                      description={space.description}
                      imageUrl={space.imageUrl}
                      pricePerHour={Number(space.pricePerHour)}
                      isActive={space.isActive}
                      variant={variant}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* SECCIÓN 4 (FONDO VERDE BOSQUE ACENTO): Manifiesto y Llamado a la Acción */}
      <section className="py-24 sm:py-32 bg-accent text-accent-fg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-widest opacity-80 font-sans font-medium mb-3">
              Membresía &amp; Experiencia
            </p>
            <h2 className="font-heading text-3xl sm:text-5xl font-normal leading-tight tracking-tight mb-4">
              Arquitectura concebida para la concentración y la claridad.
            </h2>
            <p className="opacity-90 text-sm sm:text-base leading-relaxed font-sans max-w-xl">
              Sin contratos forzosos ni complicaciones administrativas. Reserva por las horas que necesitas y disfruta de una infraestructura creada para profesionales de alta exigencia.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link
              href="/spaces"
              className="rounded-md px-8 py-4 bg-surface text-primary hover:bg-muted font-sans font-semibold text-sm transition-colors shadow-card text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Explorar Todos los Espacios
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomeSections;
