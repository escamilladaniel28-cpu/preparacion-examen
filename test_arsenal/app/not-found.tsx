import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19] px-4 text-center text-white relative overflow-hidden">
      {/* Glow ambiental */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#131A2B] p-8 rounded-2xl shadow-2xl border border-white/5 backdrop-blur-xl relative z-10 hover:border-purple-500/50 transition">
        <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
          <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            404
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
          Página no encontrada
        </h1>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          El espacio, reserva o recurso que buscas no existe o ha sido reubicado.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="rounded-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all tracking-wide"
          >
            ← Volver al Inicio
          </Link>
          <Link
            href="/spaces"
            className="rounded-full px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-sm border border-white/10 transition"
          >
            Explorar Espacios
          </Link>
        </div>
      </div>

      <div className="mt-8 text-xs text-slate-500 relative z-10">
        CoSpace © {new Date().getFullYear()} — High-Performance Workspaces
      </div>
    </div>
  );
}
