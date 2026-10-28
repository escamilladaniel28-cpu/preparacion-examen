'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-zinc-950">
      {/* Luces de fondo (Aura) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
        {/* Texto a la izquierda */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-500 text-sm font-semibold tracking-wide">
            La nueva era del Coworking
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            Reserva espacios <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              de alto nivel
            </span>
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg mb-10 max-w-lg leading-relaxed">
            Accede a las mejores salas de juntas, oficinas privadas y cabinas de concentración. Diseñadas para quienes no aceptan menos que la excelencia.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/spaces"
              className="bg-gradient-to-r from-amber-500 to-amber-700 text-black font-bold px-8 py-4 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-amber-500/25"
            >
              Explorar Catálogo
            </Link>
            <Link
              href="/dashboard"
              className="border border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/5 transition-colors"
            >
              Mis Reservas
            </Link>
          </div>
        </motion.div>

        {/* Imagen a la derecha con efecto 3D */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-[400px] sm:h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] group"
        >
          <Image 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop" 
            alt="Coworking Premium" 
            fill 
            priority
            unoptimized
            className="object-cover transition-transform duration-1000 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
          
          {/* Tarjeta flotante decorativa */}
          <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-zinc-900/60 backdrop-blur-md border border-white/10 flex items-center justify-between shadow-xl">
            <div>
              <p className="text-white font-bold text-base">Sala Ejecutiva</p>
              <p className="text-amber-500 text-xs sm:text-sm font-medium">Disponible ahora</p>
            </div>
            <div className="h-10 w-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-black font-extrabold shadow-md shadow-amber-500/20">
              ★
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
