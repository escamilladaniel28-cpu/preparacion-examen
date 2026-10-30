'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0B0F19]">
      {/* Resplandores ambientales de agencia de alta gama */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Columna Izquierda Asimétrica (7 columnas) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 flex flex-col items-start"
          >
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-300 text-xs sm:text-sm font-semibold tracking-wider uppercase backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Workspace de Nueva Generación</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.08] tracking-tight mb-6 uppercase">
              RESERVA ESPACIOS DE{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                ALTO RENDIMIENTO
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg mb-10 max-w-xl leading-relaxed">
              Suites ejecutivas, salas de juntas inmersivas y cabinas privadas diseñadas con estética de alta gama para profesionales y equipos que demandan excelencia.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/spaces"
                className="rounded-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all inline-flex items-center gap-2"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-sm sm:text-base border border-white/10 transition-colors inline-flex items-center gap-2"
              >
                <span>Mis Reservas</span>
              </Link>
            </div>
          </motion.div>

          {/* Columna Derecha Asimétrica (5 columnas): Galería apilada de 3 imágenes */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative space-y-4">
              {/* Imagen 1 (Principal Superior) */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative h-60 sm:h-72 w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#131A2B] group"
              >
                <Image
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop"
                  alt="Escritorio Ejecutivo Premium"
                  fill
                  priority
                  unoptimized
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19]/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                  <span className="font-bold tracking-wide">Suite Ejecutiva Ventana</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold text-[11px]">
                    Luz Natural
                  </span>
                </div>
              </motion.div>

              {/* Fila Inferior con 2 Imágenes Apiladas (Estilo Galería) */}
              <div className="grid grid-cols-2 gap-4">
                {/* Imagen 2: Sala de Juntas */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-40 sm:h-48 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#131A2B] group"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1000&auto=format&fit=crop"
                    alt="Sala de Juntas"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-3 text-[11px] font-semibold text-white">
                    Sala de Juntas A
                  </div>
                </motion.div>

                {/* Imagen 3: Cabina Silenciosa */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-40 sm:h-48 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#131A2B] group"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1000&auto=format&fit=crop"
                    alt="Cabina Silenciosa"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-3 text-[11px] font-semibold text-white">
                    Cabina Silenciosa
                  </div>
                </motion.div>
              </div>

              {/* Tarjeta Flotante de Prestigio (Glassmorphism de Agencia) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -bottom-4 -left-3 sm:-bottom-5 sm:-left-5 p-3.5 sm:p-4 rounded-2xl bg-[#131A2B]/90 backdrop-blur-md border border-white/10 shadow-2xl flex items-center gap-3 z-20"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-purple-500/30">
                  ★
                </div>
                <div>
                  <p className="text-white font-bold text-xs sm:text-sm">99.8% Disponibilidad</p>
                  <p className="text-slate-400 text-[11px]">Reserva confirmada al instante</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
