'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Iniciar Sesión</h2>
      <p className="text-xs text-gray-500 text-center mb-6">
        Accede a tu cuenta para gestionar y reservar espacios en CoSpace
      </p>

      {errorMessage && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚠️</span>
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs font-bold text-red-400 hover:text-red-700 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu-correo@ejemplo.com"
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2"
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
      <div className="mt-6 border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-500 mb-2 font-medium">Accesos rápidos de prueba (Seed):</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('user@cospace.com', 'user123')}
            className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 py-2 px-2.5 rounded-xl font-medium transition text-left"
          >
            👤 <span className="font-bold">Usuario</span>
            <div className="text-[10px] text-gray-400">user@cospace.com</div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@cospace.com', 'admin123')}
            className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 py-2 px-2.5 rounded-xl font-medium transition text-left"
          >
            🛡️ <span className="font-bold">Admin</span>
            <div className="text-[10px] text-gray-400">admin@cospace.com</div>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        ¿No tienes una cuenta aún?{' '}
        <Link href="/register" className="text-indigo-600 font-bold hover:underline">
          Regístrate aquí
        </Link>
      </div>
    </div>
  );
}
