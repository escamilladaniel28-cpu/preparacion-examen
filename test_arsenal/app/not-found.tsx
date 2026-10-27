import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl font-extrabold">
          404
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Página no encontrada
        </h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          El espacio, reserva o recurso que buscas no existe o ha cambiado de dirección.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow transition"
          >
            ← Volver al Inicio
          </Link>
          <Link
            href="/spaces"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm px-5 py-2.5 rounded-xl transition"
          >
            Explorar Espacios
          </Link>
        </div>
      </div>

      <div className="mt-8 text-xs text-gray-400">
        CoSpace © {new Date().getFullYear()} — Plataforma de Coworking
      </div>
    </div>
  );
}
