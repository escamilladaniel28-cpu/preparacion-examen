'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

const dict = {
  es: {
    logo: 'CoSpace',
    catalog: 'Espacios',
    login: 'Ingresar',
    register: 'Registro',
    dashboard: 'Mi Panel',
    logout: 'Salir',
    lang: 'EN',
  },
  en: {
    logo: 'CoSpace',
    catalog: 'Spaces',
    login: 'Login',
    register: 'Sign Up',
    dashboard: 'Dashboard',
    logout: 'Logout',
    lang: 'ES',
  },
};

interface NavbarProps {
  userName?: string;
}

export function Navbar({ userName: initialUserName }: NavbarProps) {
  const router = useRouter();
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [user, setUser] = useState<string | null>(initialUserName || null);
  const [loggingOut, setLoggingOut] = useState(false);
  const t = dict[lang];

  // Actualizar si la prop del servidor cambia
  useEffect(() => {
    if (initialUserName) {
      setUser(initialUserName);
    }
  }, [initialUserName]);

  // Verificar la sesión activamente en el cliente (útil ante botones Atrás/Adelante y bfcache)
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
      // Ignorar fallos de red
    }
  }, []);

  useEffect(() => {
    syncSession();

    // Evento al volver con el botón Back del navegador
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
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setUser(null);
      router.refresh();
      window.location.href = '/';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <span>🏢</span> {t.logo}
          </Link>
          <nav className="flex space-x-6 text-sm font-medium text-gray-700">
            <Link href="/spaces" className="hover:text-indigo-600 transition">
              {t.catalog}
            </Link>
            {user && (
              <Link href="/dashboard" className="hover:text-indigo-600 transition">
                {t.dashboard}
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleLang}
            type="button"
            className="px-2.5 py-1 text-xs font-semibold rounded border border-gray-300 hover:bg-gray-100 text-gray-700 transition"
            title="Cambiar idioma / Switch language"
          >
            🌐 {t.lang}
          </button>

          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                <span className="max-w-[150px] truncate">{user}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded font-medium transition disabled:opacity-50"
              >
                {loggingOut ? '...' : t.logout}
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-indigo-600"
              >
                {t.login}
              </Link>
              <Link
                href="/register"
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-md font-medium shadow-sm transition"
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
