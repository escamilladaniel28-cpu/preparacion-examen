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

    const handlePageShow = () => {
      syncSession();
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePageShow);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePageShow);
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Marca y Navegación Principal */}
        <div className="flex items-center space-x-6 sm:space-x-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5 hover:text-indigo-600 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <span>{t('logo')}</span>
          </Link>

          <nav className="hidden sm:flex items-center space-x-2 text-sm font-medium">
            <Link
              href="/spaces"
              className={`px-3 py-1.5 rounded-md transition ${
                pathname === '/spaces'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('catalog')}
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-md transition ${
                  pathname === '/dashboard'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition"
            title="Switch language / Cambiar idioma"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('switchLang')}</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                href="/dashboard"
                className="bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md flex items-center gap-2 transition max-w-[140px] sm:max-w-[200px]"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="truncate">{user}</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 text-xs font-semibold px-3 py-1.5 rounded-md transition disabled:opacity-50"
              >
                {isLoggingOut ? 'Saliendo...' : t('logout')}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 px-3 py-1.5 transition"
              >
                {t('login')}
              </Link>
              <Link
                href="/register"
                className="text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3.5 py-1.5 rounded-md shadow-sm transition"
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
