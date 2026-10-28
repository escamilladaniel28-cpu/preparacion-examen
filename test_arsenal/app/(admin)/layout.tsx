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
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-100">
      {/* Barra Superior Móvil (Pantallas pequeñas < md) */}
      <div className="md:hidden bg-zinc-900 border-b border-white/10 p-3">
        <div className="flex items-center justify-between mb-2.5">
          <Link href="/" className="text-base font-bold text-white flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-black flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <Building2 className="w-4 h-4 text-black" />
            </div>
            <span>CoSpace Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold uppercase">
              ADMIN
            </span>
            <LogoutButton
              label="Salir"
              redirectTo="/login"
              className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
            />
          </div>
        </div>

        {/* Pestañas de Navegación Móvil */}
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          <Link
            href="/admin/spaces"
            className="flex items-center justify-center gap-1.5 py-2 px-2 bg-zinc-950 border border-amber-500/40 text-amber-400 rounded-lg font-semibold"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Espacios</span>
          </Link>
          <Link
            href="/admin/reservations"
            className="flex items-center justify-center gap-1.5 py-2 px-2 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 rounded-lg font-medium border border-white/5"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>Reservas</span>
          </Link>
          <Link
            href="/spaces"
            className="flex items-center justify-center gap-1.5 py-2 px-2 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 rounded-lg font-medium border border-white/5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            <span>Catálogo</span>
          </Link>
        </div>
      </div>

      {/* Sidebar Lateral de Administración Exclusiva (Escritorio >= md) */}
      <aside className="hidden md:flex w-64 bg-zinc-900/90 border-r border-white/10 text-zinc-300 flex-col justify-between p-4 shrink-0">
        <div>
          <div className="mb-8 px-2">
            <Link href="/" className="text-xl font-bold text-white flex items-center gap-2 hover:text-amber-400 transition">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-black flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                <Building2 className="w-5 h-5 text-black" />
              </div>
              <span className="tracking-wider">CoSpace</span>
            </Link>
            <span className="inline-block mt-3 px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-md">
              Panel Administrativo
            </span>
          </div>

          <nav className="space-y-1.5">
            <Link
              href="/admin/spaces"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/60 border border-transparent hover:border-white/5 transition"
            >
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Gestión de Espacios</span>
            </Link>
            <Link
              href="/admin/reservations"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/60 border border-transparent hover:border-white/5 transition"
            >
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Todas las Reservas</span>
            </Link>
            <Link
              href="/spaces"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/60 border border-transparent hover:border-white/5 transition"
            >
              <ExternalLink className="w-4 h-4 text-zinc-400" />
              <span>Ver Catálogo</span>
            </Link>
          </nav>
        </div>

        <div className="border-t border-white/10 pt-4 px-2">
          <div className="text-xs text-zinc-400 mb-2 truncate">
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
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950 w-full">
        <header className="hidden md:flex bg-zinc-900/60 border-b border-white/10 h-16 items-center px-6 justify-between backdrop-blur-md">
          <h1 className="text-sm font-bold text-white tracking-wide uppercase">
            Administración de Plataforma
          </h1>
          <Link
            href="/"
            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 px-3.5 py-1.5 rounded-lg transition"
          >
            Volver a la App
          </Link>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto w-full">{children}</main>
      </div>
    </div>
  );
}
