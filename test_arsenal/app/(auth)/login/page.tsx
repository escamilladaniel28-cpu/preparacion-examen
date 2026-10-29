'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Shield, AlertCircle, X, Lock, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados para el Modal de Seguridad del PIN de Admin
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

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

  // Ejecución centralizada de inicio de sesión
  const executeLogin = async (loginEmail: string, loginPassword: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(email, password);
  };

  // Acceso rápido para usuario regular (sin PIN)
  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  // Verificación del PIN de Administrador
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPin = process.env.NEXT_PUBLIC_ADMIN_PIN;
    if (adminPin && pin === adminPin) {
      setIsPinModalOpen(false);
      setEmail('admin@cospace.com');
      setPassword('admin123');
      setPin('');
      setPinError(null);
      executeLogin('admin@cospace.com', 'admin123');
    } else {
      setPinError('Código inválido');
      setPin('');
    }
  };

  const handleClosePinModal = () => {
    setIsPinModalOpen(false);
    setPin('');
    setPinError(null);
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
            onClick={() => {
              setIsPinModalOpen(true);
              setPin('');
              setPinError(null);
            }}
            className="text-xs bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-white/10 hover:border-amber-500/40 py-2.5 px-3 rounded-xl font-medium transition text-left relative"
            title="Requiere código de verificación de 4 dígitos"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span>Admin</span>
              </div>
              <Lock className="w-3 h-3 text-amber-400/80" />
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5 truncate">admin@cospace.com (PIN)</div>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-zinc-400">
        ¿No tienes una cuenta aún?{' '}
        <Link href="/register" className="text-amber-400 font-semibold hover:text-amber-300 hover:underline ml-1">
          Regístrate aquí
        </Link>
      </div>

      {/* Modal de Verificación de PIN para Acceso Rápido de Admin */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative text-zinc-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Verificación de Seguridad</h3>
                  <p className="text-[11px] text-zinc-400">Acceso Rápido Administrador</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClosePinModal}
                className="text-zinc-400 hover:text-white p-1 rounded-lg transition"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed text-center">
              Ingresa el <span className="text-amber-400 font-semibold">Código de Verificación de 4 dígitos</span> para autorizar las credenciales de administración.
            </p>

            {pinError && (
              <div className="p-2.5 bg-red-950/70 border border-red-500/40 text-red-200 text-xs rounded-xl flex items-center justify-center gap-2 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="font-semibold">{pinError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  autoFocus
                  value={pin}
                  onChange={(e) => {
                    setPinError(null);
                    setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                  }}
                  placeholder="••••"
                  className="w-full text-center tracking-[0.6em] text-2xl font-mono py-3 bg-zinc-950 border border-white/15 rounded-xl text-amber-400 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleClosePinModal}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold px-4 py-2.5 rounded-xl border border-white/10 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pin.length < 4 || isSubmitting}
                  className="text-xs bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Verificar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
