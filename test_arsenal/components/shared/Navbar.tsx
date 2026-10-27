'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

const dict = {
  es: {
    logo: 'CoSpace',
    catalog: 'Catálogo de Espacios',
    login: 'Iniciar Sesión',
    register: 'Crear Cuenta',
    dashboard: 'Mi Panel',
    logout: 'Cerrar Sesión',
    lang: 'EN',
  },
  en: {
    logo: 'CoSpace',
    catalog: 'Explore Spaces',
    login: 'Login',
    register: 'Sign Up',
    dashboard: 'Dashboard',
    logout: 'Sign Out',
    lang: 'ES',
  },
};

interface NavbarProps {
  userName?: string;
}

export function Navbar({ userName: initialUserName }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [user, setUser] = useState<string | null>(initialUserName || null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const t = dict[lang];

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

  const toggleLang = () => {
    setLang((prev) => (prev === 'es' ? 'en' : 'es'));
  };

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
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Marca y Navegación Principal */}
        <div className="flex items-center space-x-6 sm:space-x-8">
          <Link
            href="/"
            className="text-xl font-black text-indigo-600 flex items-center gap-2 hover:opacity-90 transition"
          >
            <span className="text-2xl">🏢</span>
            <span>{t.logo}</span>
          </Link>

          <nav className="hidden sm:flex items-center space-x-4 text-sm font-medium">
            <Link
              href="/spaces"
              className={`px-3 py-1.5 rounded-lg transition ${
                pathname === '/spaces'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {t.catalog}
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-lg transition ${
                  pathname === '/dashboard'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {t.dashboard}
              </Link>
            )}
          </nav>
        </div>

        {/* Acciones del Usuario */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={toggleLang}
            type="button"
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition"
            title="Cambiar idioma / Switch language"
          >
            🌐 {t.lang}
          </button>

          {user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                href="/dashboard"
                className="bg-gray-50 border border-gray-200 hover:border-indigo-300 text-gray-800 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2 transition max-w-[140px] sm:max-w-[200px]"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="truncate">{user}</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {isLoggingOut ? 'Saliendo...' : t.logout}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-indigo-600 px-3 py-1.5 transition"
              >
                {t.login}
              </Link>
              <Link
                href="/register"
                className="text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3.5 py-1.5 rounded-lg shadow-sm transition"
              >
                {t.register}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
