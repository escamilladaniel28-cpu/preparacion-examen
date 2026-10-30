import Link from 'next/link';
import { Building2, ArrowLeft } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0B0F19] text-white p-4 relative overflow-hidden">
      {/* Botón Volver al inicio estilo píldora */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md transition shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
          <span>Volver al inicio</span>
        </Link>
      </div>

      {/* Luz ambiental sutil en el fondo (Azul y Púrpura) */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="mb-6 text-center relative z-10">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2.5 hover:opacity-90 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 font-bold">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="tracking-wider font-extrabold">CoSpace</span>
        </Link>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          Plataforma de espacios ejecutivos y coworking de alto rendimiento
        </p>
      </div>

      <div className="w-full max-w-md bg-[#131A2B] p-8 rounded-2xl shadow-2xl border border-white/5 relative z-10">
        {children}
      </div>
    </div>
  );
}
