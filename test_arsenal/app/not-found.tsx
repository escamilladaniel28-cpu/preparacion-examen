import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#09050D] px-4 text-center text-zinc-100 relative overflow-hidden">
      {/* Glow ambiental BMW Sepia II */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#140A24]/80 p-8 rounded-2xl shadow-2xl border border-purple-500/20 backdrop-blur-xl relative z-10 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(123,44,191,0.2)] transition">
        <div className="w-16 h-16 bg-purple-600/15 border border-purple-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl font-extrabold shadow-inner">
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
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-purple-900/30 hover:shadow-[0_0_30px_rgba(123,44,191,0.2)] transition tracking-wide"
          >
            ← Volver al Inicio
          </Link>
          <Link
            href="/spaces"
            className="bg-[#09050D] hover:bg-[#140A24] text-zinc-200 font-semibold text-sm px-5 py-2.5 rounded-xl border border-purple-500/30 transition"
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
