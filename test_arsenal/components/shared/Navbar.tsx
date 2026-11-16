'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Building2, Globe, Shield, Menu, X, LogOut, Sun, Moon } from 'lucide-react';
import { useLanguage } from '@/components/context/LanguageContext';
import { useTheme } from '@/components/context/ThemeContext';

interface NavbarProps {
  userName?: string;
  userRole?: string;
}

export function Navbar({ userName: initialUserName, userRole: initialUserRole }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
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

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
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
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border transition-colors w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* Marca a la izquierda */}
        <div className="flex items-center min-w-0 shrink-0">
          <Link
            href="/"
            className="font-heading text-lg sm:text-xl font-normal text-primary flex items-center gap-2 sm:gap-2.5 hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            <div className="w-8 h-8 rounded-sm bg-accent text-accent-fg flex items-center justify-center font-bold shadow-subtle shrink-0">
              <Building2 className="w-4 h-4 text-accent-fg" />
            </div>
            <span className="font-heading tracking-tight font-medium truncate">{t('logo')}</span>
          </Link>
        </div>

        {/* Links en el centro (solo escritorio >= md) */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-sans font-medium">
          <Link
            href="/spaces"
            className={`px-3.5 py-1.5 rounded-sm transition ${
              pathname === '/spaces'
                ? 'bg-muted text-primary font-semibold'
                : 'text-secondary hover:text-primary hover:bg-muted'
            }`}
          >
            {t('catalog')}
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className={`px-3.5 py-1.5 rounded-sm transition ${
                pathname === '/dashboard'
                  ? 'bg-muted text-primary font-semibold'
                  : 'text-secondary hover:text-primary hover:bg-muted'
              }`}
            >
              {t('dashboard')}
            </Link>
          )}
          {role === 'ADMIN' && (
            <Link
              href="/admin/spaces"
              className={`px-3.5 py-1.5 rounded-sm transition inline-flex items-center gap-1.5 ${
                pathname?.startsWith('/admin')
                  ? 'bg-accent text-accent-fg font-medium shadow-subtle'
                  : 'bg-surface text-secondary hover:text-primary border border-border'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-accent" />
              <span>Admin Espacios</span>
            </Link>
          )}
        </nav>

        {/* Acciones y Botones a la derecha */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Toggle de Tema (Claro / Oscuro) */}
          <button
            onClick={toggleTheme}
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-sans font-medium rounded-sm border border-border bg-surface hover:bg-muted text-secondary hover:text-primary transition shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="hidden sm:inline">Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="hidden sm:inline">Oscuro</span>
              </>
            )}
          </button>

          {/* Toggle de Idioma */}
          <button
            onClick={toggleLang}
            type="button"
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-sans font-medium rounded-sm border border-border bg-surface hover:bg-muted text-secondary hover:text-primary transition shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title="Switch language / Cambiar idioma"
          >
            <Globe className="w-3.5 h-3.5 text-secondary shrink-0" />
            <span>{t('switchLang')}</span>
          </button>

          {/* Elementos de Escritorio (>= md) */}
          <div className="hidden md:flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="bg-surface border border-border hover:border-border-strong text-primary text-xs sm:text-sm font-sans font-medium px-3.5 py-1.5 rounded-sm flex items-center gap-2 transition max-w-[140px] sm:max-w-[190px]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
                  <span className="truncate">{user}</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="bg-surface hover:bg-red-500/10 text-secondary hover:text-red-600 dark:hover:text-red-400 border border-border hover:border-red-300 text-xs font-sans font-medium px-3 py-1.5 rounded-sm transition disabled:opacity-50"
                >
                  {isLoggingOut ? 'Saliendo...' : t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-sans font-medium text-secondary hover:text-primary px-3 py-1.5 transition"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/register"
                  className="text-xs sm:text-sm bg-accent hover:bg-accent-hover text-accent-fg font-sans font-medium px-4 py-2 rounded-md shadow-subtle transition"
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
            className="md:hidden p-2 rounded-sm text-secondary hover:text-primary bg-surface hover:bg-muted border border-border transition shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable en Móviles (< md) */}
      {isMenuOpen && (
        <div className="md:hidden bg-surface border-b border-border px-4 py-4 space-y-3 w-full shadow-md">
          <nav className="flex flex-col space-y-1">
            <Link
              href="/spaces"
              onClick={() => setIsMenuOpen(false)}
              className={`px-3 py-2 rounded-sm text-sm font-sans font-medium transition ${
                pathname === '/spaces'
                  ? 'bg-muted text-primary font-semibold'
                  : 'text-secondary hover:text-primary hover:bg-muted'
              }`}
            >
              {t('catalog')}
            </Link>
            {user && (
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className={`px-3 py-2 rounded-sm text-sm font-sans font-medium transition ${
                  pathname === '/dashboard'
                    ? 'bg-muted text-primary font-semibold'
                    : 'text-secondary hover:text-primary hover:bg-muted'
                }`}
              >
                {t('dashboard')}
              </Link>
            )}
            {role === 'ADMIN' && (
              <Link
                href="/admin/spaces"
                onClick={() => setIsMenuOpen(false)}
                className={`px-3 py-2 rounded-sm text-sm font-sans font-medium flex items-center gap-2 transition ${
                  pathname?.startsWith('/admin')
                    ? 'bg-accent text-accent-fg shadow-subtle'
                    : 'bg-surface text-secondary hover:text-primary border border-border'
                }`}
              >
                <Shield className="w-4 h-4 text-accent" />
                <span>Admin Espacios</span>
              </Link>
            )}
          </nav>

          {user ? (
            <div className="pt-3 border-t border-border flex flex-col gap-2.5">
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-sm bg-muted border border-border text-primary text-xs sm:text-sm font-sans font-medium w-full"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
                <span className="truncate flex-1">{user}</span>
                {role === 'ADMIN' && (
                  <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-sm bg-accent text-accent-fg uppercase shrink-0">
                    ADMIN
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 bg-surface hover:bg-red-500/10 text-secondary hover:text-red-600 dark:hover:text-red-400 border border-border hover:border-red-300 text-xs font-sans font-medium px-4 py-2.5 rounded-sm transition disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isLoggingOut ? 'Saliendo...' : t('logout')}</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center text-xs sm:text-sm font-sans font-medium text-secondary hover:text-primary py-2 rounded-sm hover:bg-muted transition"
              >
                {t('login')}
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center text-xs sm:text-sm bg-accent hover:bg-accent-hover text-accent-fg font-sans font-medium py-2.5 rounded-md shadow-subtle transition"
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
