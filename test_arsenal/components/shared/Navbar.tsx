'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Building2, Globe } from 'lucide-react';
import { useLanguage } from '@/components/context/LanguageContext';

interface NavbarProps {
  userName?: string;
}

export function Navbar({ userName: initialUserName }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleLang, t } = useLanguage();
  const [user, setUser] = useState<string | null>(initialUserName || null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (initialUserName) {
      setUser(initialUserName);
    }
  }, [initialUserName]);

  const syncSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user.name || data.user.email);
        } else {
          setUser(null);
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
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Marca y Navegación Principal */}
        <div className="flex items-center space-x-6 sm:space-x-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5 hover:text-amber-400 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-black flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <Building2 className="w-5 h-5 text-black" />
            </div>
            <span className="tracking-wider">{t('logo')}</span>
          </Link>

          <nav className="hidden sm:flex items-center space-x-2 text-sm font-medium">
            <Link
              href="/spaces"
              className={`px-3 py-1.5 rounded-lg transition ${
                pathname === '/spaces'
                  ? 'bg-zinc-900 text-amber-400 font-semibold border border-white/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              {t('catalog')}
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === '/dashboard'
                    ? 'bg-zinc-900 text-amber-400 font-semibold border border-white/10'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                }`}
              >
                {t('dashboard')}
              </Link>
            )}
          </nav>
        </div>

        {/* Acciones del Usuario */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={toggleLang}
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 transition"
            title="Switch language / Cambiar idioma"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('switchLang')}</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                href="/dashboard"
                className="bg-zinc-900 border border-white/10 hover:border-amber-500/40 text-zinc-200 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-2 transition max-w-[140px] sm:max-w-[200px]"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span className="truncate">{user}</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-zinc-900 hover:bg-red-950/80 text-zinc-400 hover:text-red-300 border border-white/10 hover:border-red-500/30 text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
              >
                {isLoggingOut ? 'Saliendo...' : t('logout')}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white px-3 py-1.5 transition"
              >
                {t('login')}
              </Link>
              <Link
                href="/register"
                className="text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-bold px-3.5 py-1.5 rounded-lg shadow-md shadow-amber-500/20 transition"
              >
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
