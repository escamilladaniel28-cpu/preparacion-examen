'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, LayoutDashboard, Layers, User, Shield, LogOut } from 'lucide-react';
import { LogoutButton } from '@/components/shared/LogoutButton';

interface PrivateNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
}

export function PrivateNav({ user }: PrivateNavProps) {
  const pathname = usePathname();
  const userName = user?.name || user?.email || 'Usuario';
  const isAdmin = user?.role === 'ADMIN';

  const navLinks = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      href: '/spaces',
      label: 'Espacios',
      icon: Layers,
      active: pathname === '/spaces' || (pathname && pathname.startsWith('/spaces/')),
    },
    {
      href: '/profile',
      label: 'Perfil',
      icon: User,
      active: pathname === '/profile',
    },
    ...(isAdmin
      ? [
          {
            href: '/admin/spaces',
            label: 'Panel Admin',
            icon: Shield,
            active: pathname && pathname.startsWith('/admin'),
            isAdminBadge: true,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Sidebar Flotante Izquierdo (Escritorio >= md) */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0B0F19]/90 backdrop-blur-md border-r border-white/5 z-40 hidden md:flex flex-col justify-between p-6">
        <div>
          {/* Logo CoSpace */}
          <Link href="/" className="flex items-center gap-3 group px-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-wider text-white">CoSpace</span>
              <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-widest -mt-0.5">
                Exclusive Workspace
              </span>
            </div>
          </Link>

          {/* Links de Navegación */}
          <nav className="space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    link.active
                      ? 'bg-gradient-to-r from-blue-500/15 to-purple-600/15 text-white border border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                      : 'text-slate-400 hover:text-white hover:bg-[#131A2B] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${link.active ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.isAdminBadge && (
                    <span className="text-[10px] bg-gradient-to-r from-blue-500 to-purple-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                      ADMIN
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sección Inferior del Sidebar */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="bg-[#131A2B] border border-white/5 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{userName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <p className="text-[10px] text-slate-400 capitalize">{user?.role ? user.role.toLowerCase() : 'activo'}</p>
              </div>
            </div>
          </div>

          <LogoutButton
            redirectTo="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 hover:border-red-500/40 transition-all shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </LogoutButton>
        </div>
      </aside>

      {/* Barra de Navegación Inferior en Móviles (md:hidden) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B0F19]/95 backdrop-blur-md border-t border-white/5 md:hidden px-3 py-2 flex items-center justify-around shadow-2xl">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[11px] font-medium transition ${
                link.active
                  ? 'text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${link.active ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}

        <LogoutButton
          redirectTo="/"
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[11px] font-medium text-red-400 hover:text-red-300 transition"
        >
          <LogOut className="w-5 h-5 mb-0.5 text-red-400" />
          <span>Salir</span>
        </LogoutButton>
      </div>
    </>
  );
}

export default PrivateNav;
