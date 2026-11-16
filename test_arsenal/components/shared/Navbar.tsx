'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Building2, Globe, Shield, Menu, X, LogOut } from 'lucide-react';
import { useLanguage } from '@/components/context/LanguageContext';

interface NavbarProps {
  userName?: string;
  userRole?: string;
}

export function Navbar({ userName: initialUserName, userRole: initialUserRole }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleLang, t } = useLanguage();
  const [user, setUser] = useState<string | null>(initialUserName || null);
  const [role, setRole] = useState<string | null>(initialUserRole || null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (initialUserName) {
      setUser(initialUserName);
    }
    if (initialUserRole) {
      setRole(initialUserRole);
    }
  }, [initialUserName, initialUserRole]);

  const syncSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user.name || data.user.email);
          setRole(data.user.role || null);
        } else {
          setUser(null);
          setRole(null);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    syncSession();

    // Detección y recuperación ante el Back/Forward Cache (BFCache)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // La página se cargó desde el BFCache del navegador: forzar recarga para revalidar sesión
        window.location.reload();
      } else {
        syncSession();
      }
    };

    const handlePopState = () => {
      syncSession();
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [syncSession]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setUser(null);
      setIsLoggingOut(false);
      router.refresh();
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/5 transition-colors w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* Marca a la izquierda */}
        <div className="flex items-center min-w-0 shrink-0">
          <Link
            href="/"
            className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2 sm:gap-2.5 hover:opacity-90 transition"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/25 shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="tracking-wider font-extrabold truncate">{t('logo')}</span>
          </Link>
        </div>

        {/* Links en el centro (solo escritorio >= md) */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
          <Link
            href="/spaces"
            className={`px-4 py-1.5 rounded-full transition ${
              pathname === '/spaces'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {t('catalog')}
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className={`px-4 py-1.5 rounded-full transition ${
                pathname === '/dashboard'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {t('dashboard')}
            </Link>
          )}
          {role === 'ADMIN' && (
            <Link
              href="/admin/spaces"
              className={`px-4 py-1.5 rounded-full transition inline-flex items-center gap-1.5 ${
                pathname?.startsWith('/admin')
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold shadow-md shadow-purple-500/25'
                  : 'bg-white/5 text-purple-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Admin Espacios</span>
            </Link>
          )}
        </nav>

        {/* Acciones y Botones a la derecha */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <button
            onClick={toggleLang}
            type="button"
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition shrink-0"
            title="Switch language / Cambiar idioma"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>{t('switchLang')}</span>
          </button>

          {/* Elementos de Escritorio (>= md) */}
          <div className="hidden md:flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="bg-[#131A2B] border border-white/10 hover:border-purple-500/50 text-slate-200 text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full flex items-center gap-2 transition max-w-[130px] sm:max-w-[180px]"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="truncate">{user}</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="bg-white/5 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-white/10 hover:border-red-500/30 text-xs font-semibold px-3.5 py-1.5 rounded-full transition disabled:opacity-50"
                >
                  {isLoggingOut ? 'Saliendo...' : t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/register"
                  className="text-xs sm:text-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-6 py-2.5 rounded-full shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Botón Hamburguesa para Móviles (< md) */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition shrink-0"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable en Móviles (< md) */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#0B0F19]/95 backdrop-blur-md border-b border-white/10 px-4 py-4 space-y-3 w-full">
          <nav className="flex flex-col space-y-1">
            <Link
              href="/spaces"
              onClick={() => setIsMenuOpen(false)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                pathname === '/spaces'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {t('catalog')}
            </Link>
            {user && (
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                  pathname === '/dashboard'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {t('dashboard')}
              </Link>
            )}
            {role === 'ADMIN' && (
              <Link
                href="/admin/spaces"
                onClick={() => setIsMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
                  pathname?.startsWith('/admin')
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'bg-white/5 text-purple-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Admin Espacios</span>
              </Link>
            )}
          </nav>

          {user ? (
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#131A2B] border border-white/10 text-slate-200 text-xs sm:text-sm font-medium w-full"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span className="truncate flex-1">{user}</span>
                {role === 'ADMIN' && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white uppercase shrink-0">
                    ADMIN
                  </span>
                )}
              </Link>

              {/* Botón Cerrar Sesión colocado justo debajo del correo del usuario */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 bg-red-950/40 hover:bg-red-950/60 text-red-300 hover:text-red-200 border border-red-500/30 text-xs font-semibold px-4 py-2.5 rounded-xl transition disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isLoggingOut ? 'Saliendo...' : t('logout')}</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center text-xs sm:text-sm font-semibold text-slate-300 hover:text-white py-2 rounded-xl hover:bg-white/5 transition"
              >
                {t('login')}
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center text-xs sm:text-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2.5 rounded-full shadow-lg shadow-purple-500/25 transition"
              >
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
