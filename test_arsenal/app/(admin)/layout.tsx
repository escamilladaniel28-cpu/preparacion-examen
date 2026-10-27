import Link from 'next/link';
import { getSession } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900">
      {/* Sidebar Lateral de Administración */}
      <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col justify-between p-4 shrink-0 shadow-lg">
        <div>
          <div className="mb-8 px-2">
            <Link href="/" className="text-2xl font-extrabold text-white flex items-center gap-2">
              <span>🏢</span> CoSpace
            </Link>
            <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-semibold bg-indigo-600 text-white rounded">
              Panel de Control
            </span>
          </div>

          <nav className="space-y-1">
            <Link
              href="/admin/spaces"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-800 hover:text-white transition"
            >
              <span>🏛️</span> Gestión de Espacios
            </Link>
            <Link
              href="/admin/reservations"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-800 hover:text-white transition"
            >
              <span>📅</span> Todas las Reservas
            </Link>
            <Link
              href="/spaces"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-800 hover:text-white transition"
            >
              <span>👀</span> Ver Catálogo
            </Link>
          </nav>
        </div>

        <div className="border-t border-gray-800 pt-4 px-2">
          <div className="text-xs text-gray-400 mb-2 truncate">
            Admin: {session?.email || 'admin@cospace.com'}
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full text-left text-xs text-red-400 hover:text-red-300 transition py-1"
            >
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 justify-between">
          <h1 className="text-lg font-bold text-gray-800">Administración de CoSpace</h1>
          <Link
            href="/"
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition"
          >
            ← Volver a la App
          </Link>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
