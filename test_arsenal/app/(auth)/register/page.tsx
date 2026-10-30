'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, X } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Error al crear la cuenta');
        setIsSubmitting(false);
        return;
      }

      router.refresh();
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    } catch {
      setErrorMessage('Error al comunicarse con el servidor.');
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white text-center mb-1 tracking-tight uppercase">Crear Cuenta</h2>
      <p className="text-xs text-slate-300 text-center mb-6">
        Únete a CoSpace para reservar salas y oficinas privadas de nivel ejecutivo
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
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Nombre Completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juan Pérez"
            className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            required
            minLength={2}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu-correo@ejemplo.com"
            className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all text-sm flex items-center justify-center gap-2 tracking-wide"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Registrando cuenta...</span>
            </>
          ) : (
            <span>Registrarse en CoSpace</span>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="text-blue-400 font-semibold hover:text-purple-400 hover:underline ml-1">
          Inicia sesión aquí
        </Link>
      </div>
    </div>
  );
}
