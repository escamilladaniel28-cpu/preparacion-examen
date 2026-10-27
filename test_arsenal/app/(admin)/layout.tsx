import Link from 'next/link';
import { Building2, Layers, Calendar, ExternalLink } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { LogoutButton } from '@/components/shared/LogoutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      {/* Sidebar Lateral de Administración */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 shrink-0 shadow-lg">
        <div>
          <div className="mb-8 px-2">
            <Link href="/" className="text-xl font-bold text-white flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-indigo-500 text-white flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <span>CoSpace</span>
            </Link>
            <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-semibold bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded">
              Panel Administrativo
            </span>
          </div>

          <nav className="space-y-1">
            <Link
              href="/admin/spaces"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800 hover:text-white transition"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Gestión de Espacios</span>
            </Link>
            <Link
              href="/admin/reservations"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800 hover:text-white transition"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Todas las Reservas</span>
            </Link>
            <Link
              href="/spaces"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800 hover:text-white transition"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span>Ver Catálogo</span>
            </Link>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 px-2">
          <div className="text-xs text-slate-400 mb-2 truncate">
            Admin: {session?.email || 'admin@cospace.com'}
          </div>
          <LogoutButton
            label="Cerrar Sesión"
            redirectTo="/login"
            className="w-full text-left text-xs text-red-400 hover:text-red-300 transition py-1"
          />
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between">
          <h1 className="text-base font-bold text-slate-900">Administración de CoSpace</h1>
          <Link
            href="/"
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md transition"
          >
            Volver a la App
          </Link>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
