'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Compass } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-28 lg:py-32 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Columna Izquierda: Mensaje Editorial */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-sm border border-border bg-surface text-secondary text-xs font-sans uppercase tracking-widest">
              <Compass className="w-3.5 h-3.5 text-accent" />
              <span>Workspace &amp; Coworking Premium</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-primary font-normal leading-[1.12] tracking-tight mb-6">
              Espacios concebidos para el{' '}
              <span className="italic font-light text-accent">enfoque profundo</span> y la calma.
            </h1>

            <p className="text-secondary text-base sm:text-lg mb-10 max-w-xl leading-relaxed font-sans font-normal">
              Suites ejecutivas, salas de juntas y estaciones dedicadas disponibles por hora con confirmación instantánea. Un entorno donde el diseño arquitectónico potencia tus mejores ideas.
            </p>

            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <Link
                href="/spaces"
                className="w-full sm:w-auto rounded-md px-7 py-3.5 bg-accent hover:bg-accent-hover text-accent-fg font-sans font-medium text-sm transition-colors shadow-subtle inline-flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto rounded-md px-7 py-3.5 bg-surface hover:bg-muted text-primary font-sans font-medium text-sm border border-border transition-colors shadow-subtle inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span>Mis Reservas</span>
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Composición Fotográfica Asimétrica */}
          <div className="lg:col-span-5 relative w-full">
            <div className="relative space-y-4">
              {/* Imagen Principal */}
              <div className="relative h-64 sm:h-80 w-full rounded-lg overflow-hidden border border-border shadow-card bg-muted group">
                <Image
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop"
                  alt="Suite Ejecutiva con iluminación natural"
                  fill
                  priority
                  unoptimized
                  className="object-cover w-full h-full brightness-95 group-hover:brightness-100 group-hover:scale-[1.03] transition-all duration-700 ease-out"
                />
                <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-sm bg-surface/90 backdrop-blur-sm border border-border flex items-center justify-between text-xs text-primary font-sans">
                  <span className="font-medium">Suite Ejecutiva Ventana</span>
                  <span className="text-secondary text-[11px] uppercase tracking-wider">Luz Natural</span>
                </div>
              </div>

              {/* Fila Inferior con 2 Imágenes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-40 sm:h-48 w-full rounded-lg overflow-hidden border border-border shadow-subtle bg-muted group">
                  <Image
                    src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1000&auto=format&fit=crop"
                    alt="Sala de Juntas Acústica"
                    fill
                    unoptimized
                    className="object-cover w-full h-full brightness-95 group-hover:brightness-100 group-hover:scale-[1.03] transition-all duration-700 ease-out"
                  />
                  <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded-sm bg-surface/90 backdrop-blur-sm border border-border text-[11px] font-medium text-primary font-sans truncate">
                    Sala de Juntas
                  </div>
                </div>

                <div className="relative h-40 sm:h-48 w-full rounded-lg overflow-hidden border border-border shadow-subtle bg-muted group">
                  <Image
                    src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1000&auto=format&fit=crop"
                    alt="Cabina Silenciosa Focus"
                    fill
                    unoptimized
                    className="object-cover w-full h-full brightness-95 group-hover:brightness-100 group-hover:scale-[1.03] transition-all duration-700 ease-out"
                  />
                  <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded-sm bg-surface/90 backdrop-blur-sm border border-border text-[11px] font-medium text-primary font-sans truncate">
                    Cabina Focus
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
