import Link from 'next/link';
import { Building2, Layers, Calendar, ExternalLink, Users } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { LogoutButton } from '@/components/shared/LogoutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0B0F19] text-white">
      {/* Barra Superior Móvil (Pantallas pequeñas < md) */}
      <div className="md:hidden bg-[#0B0F19]/95 border-b border-white/5 p-3">
        <div className="flex items-center justify-between mb-2.5">
          <Link href="/" className="text-base font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/25">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold tracking-wide">CoSpace Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              ADMIN
            </span>
            <LogoutButton
              label="Salir"
              redirectTo="/"
              className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
            />
          </div>
        </div>

        {/* Pestañas de Navegación Móvil */}
        <div className="grid grid-cols-4 gap-1 text-[11px]">
          <Link
            href="/admin/spaces"
            className="flex flex-col items-center justify-center py-2 px-1 bg-[#131A2B] border border-white/5 text-blue-400 rounded-lg font-semibold transition text-center"
          >
            <Layers className="w-3.5 h-3.5 mb-0.5 text-blue-400" />
            <span>Espacios</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex flex-col items-center justify-center py-2 px-1 bg-[#131A2B] border border-white/5 text-blue-400 rounded-lg font-semibold transition text-center"
          >
            <Users className="w-3.5 h-3.5 mb-0.5 text-purple-400" />
            <span>Usuarios</span>
          </Link>
          <Link
            href="/admin/reservations"
            className="flex flex-col items-center justify-center py-2 px-1 bg-[#0B0F19] hover:bg-[#131A2B] text-slate-300 rounded-lg font-medium border border-white/5 transition text-center"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-400 mb-0.5" />
            <span>Reservas</span>
          </Link>
          <Link
            href="/spaces"
            className="flex flex-col items-center justify-center py-2 px-1 bg-[#0B0F19] hover:bg-[#131A2B] text-slate-300 rounded-lg font-medium border border-white/5 transition text-center"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
            <span>Catálogo</span>
          </Link>
        </div>
      </div>

      {/* Sidebar Lateral de Administración Exclusiva (Escritorio >= md) */}
      <aside className="hidden md:flex w-64 bg-[#0B0F19]/90 border-r border-white/5 text-slate-300 flex-col justify-between p-4 shrink-0 backdrop-blur-md">
        <div>
          <div className="mb-8 px-2">
            <Link href="/" className="text-xl font-bold text-white flex items-center gap-2 hover:opacity-90 transition">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/25">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="tracking-wider font-extrabold">CoSpace</span>
            </Link>
            <span className="inline-block mt-3 px-3 py-0.5 text-xs font-semibold bg-white/5 text-purple-300 border border-white/10 rounded-full">
              Panel Administrativo
            </span>
          </div>

          <nav className="space-y-1.5">
            <Link
              href="/admin/spaces"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-[#131A2B] border border-transparent hover:border-white/5 transition"
            >
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Gestión de Espacios</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-[#131A2B] border border-transparent hover:border-white/5 transition"
            >
              <Users className="w-4 h-4 text-purple-400" />
              <span>Gestión de Usuarios</span>
            </Link>
            <Link
              href="/admin/reservations"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-[#131A2B] border border-transparent hover:border-white/5 transition"
            >
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Todas las Reservas</span>
            </Link>
            <Link
              href="/spaces"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-[#131A2B] border border-transparent hover:border-white/5 transition"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span>Ver Catálogo</span>
            </Link>
          </nav>
        </div>

        <div className="border-t border-white/5 pt-4 px-2">
          <div className="text-xs text-slate-400 mb-2 truncate">
            Admin: {session?.email || 'admin@cospace.com'}
          </div>
          <LogoutButton
            label="Cerrar Sesión"
            redirectTo="/"
            className="w-full text-left text-xs text-red-400 hover:text-red-300 transition py-1"
          />
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B0F19] w-full">
        <header className="hidden md:flex bg-[#0B0F19]/80 border-b border-white/5 h-16 items-center px-6 justify-between backdrop-blur-md">
          <h1 className="text-sm font-bold text-white tracking-wide uppercase">
            Administración de Plataforma
          </h1>
          <Link
            href="/"
            className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 px-4 py-1.5 rounded-full transition"
          >
            Volver a la App
          </Link>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto w-full">{children}</main>
      </div>
    </div>
  );
}
