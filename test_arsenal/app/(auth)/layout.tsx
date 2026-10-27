import Link from 'next/link';
import { Building2 } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-950 text-zinc-100 p-4 relative overflow-hidden">
      {/* Luz ambiental sutil en el fondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="mb-6 text-center relative z-10">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2.5 hover:text-amber-400 transition"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-black flex items-center justify-center shadow-lg shadow-amber-500/20 font-bold">
            <Building2 className="w-5 h-5 text-black" />
          </div>
          <span className="tracking-wider">CoSpace</span>
        </Link>
        <p className="text-xs text-zinc-400 mt-1 font-medium">
          Plataforma de espacios ejecutivos y coworking de alto rendimiento
        </p>
      </div>

      <div className="w-full max-w-md bg-zinc-900/90 p-8 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl relative z-10">
        {children}
      </div>
    </div>
  );
}
