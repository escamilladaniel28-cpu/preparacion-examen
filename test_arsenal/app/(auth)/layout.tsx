import Link from 'next/link';
import { Building2, ArrowLeft } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#09050D] text-zinc-100 p-4 relative overflow-hidden">
      {/* Botón Volver al inicio */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white bg-[#140A24]/60 hover:bg-[#140A24] border border-purple-500/20 px-3.5 py-2 rounded-xl backdrop-blur-md transition shadow-md hover:border-purple-500/50"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-purple-400" />
          <span>Volver al inicio</span>
        </Link>
      </div>

      {/* Luz ambiental sutil en el fondo (Sepia II Metallic) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="mb-6 text-center relative z-10">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2.5 hover:text-purple-300 transition"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-800 text-white flex items-center justify-center shadow-lg shadow-purple-900/30 font-bold">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="tracking-wider">CoSpace</span>
        </Link>
        <p className="text-xs text-zinc-400 mt-1 font-medium">
          Plataforma de espacios ejecutivos y coworking de alto rendimiento
        </p>
      </div>

      <div className="w-full max-w-md bg-[#140A24]/80 p-8 rounded-2xl shadow-2xl border border-purple-500/20 backdrop-blur-xl relative z-10">
        {children}
      </div>
    </div>
  );
}
