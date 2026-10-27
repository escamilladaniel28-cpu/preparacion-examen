'use client';

import { useState } from 'react';

interface LogoutButtonProps {
  className?: string;
  label?: string;
  redirectTo?: string;
}

export function LogoutButton({
  className = 'text-xs bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 px-3 py-1.5 rounded font-medium transition',
  label = 'Cerrar Sesión',
  redirectTo = '/login',
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      window.location.href = redirectTo;
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={className}
    >
      {loading ? 'Saliendo...' : label}
    </button>
  );
}

export default LogoutButton;
