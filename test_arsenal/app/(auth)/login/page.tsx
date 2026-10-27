'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Credenciales inválidas');
        setLoading(false);
        return;
      }

      // Redirigir usando window.location para recargar el contexto de cookies en layouts
      window.location.href = '/dashboard';
    } catch {
      setError('Error al comunicarse con el servidor.');
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Iniciar Sesión</h2>
      <p className="text-xs text-gray-500 text-center mb-6">
        Accede a tu cuenta para gestionar y reservar espacios
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu-correo@ejemplo.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow transition disabled:bg-gray-400 text-sm"
        >
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </form>

      {/* Cuentas de Demostración del Seed */}
      <div className="mt-6 border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-500 mb-2 font-medium">Accesos rápidos de prueba (Seed):</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('user@cospace.com', 'user123')}
            className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 py-1.5 px-2 rounded font-medium transition text-left"
          >
            👤 <span className="font-semibold">Usuario Demo</span>
            <div className="text-[10px] text-gray-400">user@cospace.com</div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@cospace.com', 'admin123')}
            className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 py-1.5 px-2 rounded font-medium transition text-left"
          >
            🛡️ <span className="font-semibold">Admin Demo</span>
            <div className="text-[10px] text-gray-400">admin@cospace.com</div>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        ¿No tienes una cuenta aún?{' '}
        <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
          Regístrate aquí
        </Link>
      </div>
    </div>
  );
}
