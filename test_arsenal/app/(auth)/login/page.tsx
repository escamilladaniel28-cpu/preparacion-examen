'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Shield, AlertCircle, X } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Protección ante BFCache y navegación hacia atrás:
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const searchParams = new URLSearchParams(window.location.search);
            const redirectParam = searchParams.get('redirect');
            router.replace(redirectParam || '/dashboard');
          }
        }
      } catch {
        // ignore
      }
    };

    checkActiveSession();

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        window.location.reload();
      } else {
        checkActiveSession();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Credenciales inválidas');
        setIsSubmitting(false);
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const redirectParam = searchParams.get('redirect');
      const targetDestination = redirectParam || '/dashboard';

      router.refresh();
      setTimeout(() => {
        window.location.href = targetDestination;
      }, 100);
    } catch {
      setErrorMessage('Error al comunicarse con el servidor. Intenta nuevamente.');
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white text-center mb-1 tracking-tight">Iniciar Sesión</h2>
      <p className="text-xs text-zinc-400 text-center mb-6">
        Accede a tu cuenta para gestionar y reservar espacios en CoSpace
      </p>

      {errorMessage && (
        <div className="mb-5 p-3.5 bg-red-950/70 border border-red-500/40 text-red-200 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-zinc-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu-correo@ejemplo.com"
            className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/15 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/15 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 disabled:opacity-50 text-black font-bold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition text-sm flex items-center justify-center gap-2 tracking-wide"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Iniciando sesión...</span>
            </>
          ) : (
            <span>Ingresar a CoSpace</span>
          )}
        </button>
      </form>

      {/* Cuentas de Demostración del Seed */}
      <div className="mt-6 border-t border-white/10 pt-4">
        <p className="text-xs text-zinc-400 mb-2.5 font-medium">Accesos rápidos de prueba (Seed):</p>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleQuickLogin('user@cospace.com', 'user123')}
            className="text-xs bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-white/10 hover:border-amber-500/40 py-2.5 px-3 rounded-xl font-medium transition text-left"
          >
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>Usuario</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5 truncate">user@cospace.com</div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@cospace.com', 'admin123')}
            className="text-xs bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-white/10 hover:border-amber-500/40 py-2.5 px-3 rounded-xl font-medium transition text-left"
          >
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span>Admin</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5 truncate">admin@cospace.com</div>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-zinc-400">
        ¿No tienes una cuenta aún?{' '}
        <Link href="/register" className="text-amber-400 font-semibold hover:text-amber-300 hover:underline ml-1">
          Regístrate aquí
        </Link>
      </div>
    </div>
  );
}
