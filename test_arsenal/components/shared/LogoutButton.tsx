'use client';

import { useState } from 'react';

interface LogoutButtonProps {
  className?: string;
  label?: string;
  redirectTo?: string;
}

export function LogoutButton({
  className = 'bg-zinc-900 hover:bg-red-950/70 text-zinc-300 hover:text-red-300 border border-white/10 hover:border-red-500/30 text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-sm transition disabled:opacity-50',
  label = 'Cerrar Sesión',
  redirectTo = '/login',
}: LogoutButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setIsSubmitting(false);
      window.location.href = redirectTo;
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      className={className}
    >
      {isSubmitting ? 'Cerrando sesión...' : label}
    </button>
  );
}

export default LogoutButton;
