import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4 text-center text-zinc-100 relative overflow-hidden">
      {/* Glow ambiental */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-zinc-900/90 p-8 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl relative z-10">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl font-extrabold shadow-inner">
          404
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
          Página no encontrada
        </h1>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          El espacio, reserva o recurso que buscas no existe o ha sido reubicado.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition tracking-wide"
          >
            ← Volver al Inicio
          </Link>
          <Link
            href="/spaces"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm px-5 py-2.5 rounded-xl border border-white/10 transition"
          >
            Explorar Espacios
          </Link>
        </div>
      </div>

      <div className="mt-8 text-xs text-zinc-500 relative z-10">
        CoSpace © {new Date().getFullYear()} — Luxury Workspace Suites
      </div>
    </div>
  );
}
