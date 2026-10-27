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
  // Si el usuario ya tiene sesión activa en el servidor, no permitir que vea el Login
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            router.replace('/dashboard');
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

      router.refresh();
      setTimeout(() => {
        window.location.href = '/dashboard';
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
      <h2 className="text-xl font-bold text-slate-900 text-center mb-1">Iniciar Sesión</h2>
      <p className="text-xs text-slate-500 text-center mb-6">
        Accede a tu cuenta para gestionar y reservar espacios en CoSpace
      </p>

      {errorMessage && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-slate-400 hover:text-slate-600 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu-correo@ejemplo.com"
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm transition text-sm flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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
      <div className="mt-6 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500 mb-2 font-medium">Accesos rápidos de prueba (Seed):</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('user@cospace.com', 'user123')}
            className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-2 px-2.5 rounded-lg font-medium transition text-left"
          >
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Usuario</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">user@cospace.com</div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@cospace.com', 'admin123')}
            className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-2 px-2.5 rounded-lg font-medium transition text-left"
          >
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span>Admin</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">admin@cospace.com</div>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        ¿No tienes una cuenta aún?{' '}
        <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
          Regístrate aquí
        </Link>
      </div>
    </div>
  );
}
