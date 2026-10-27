'use client';

import { useState, useEffect } from 'react';

interface LocalTimeProps {
  date: string | Date;
  endDate?: string | Date;
  format?: 'full' | 'date' | 'time' | 'short';
  className?: string;
}

export function LocalTime({
  date,
  endDate,
  format = 'full',
  className = '',
}: LocalTimeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={`text-gray-400 ${className}`}>Cargando fecha...</span>;
  }

  const d = new Date(date);

  if (endDate) {
    const end = new Date(endDate);
    const datePart = d.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const startTimePart = d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const endTimePart = end.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <span className={className}>
        {datePart} · {startTimePart} - {endTimePart}
      </span>
    );
  }

  let formatted = '';
  switch (format) {
    case 'date':
      formatted = d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      break;
    case 'time':
      formatted = d.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
      break;
    case 'short':
      formatted = `${d.toLocaleDateString('es-ES')} ${d.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
      break;
    case 'full':
    default:
      formatted = d.toLocaleString('es-ES', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      break;
  }

  return <span className={className}>{formatted}</span>;
}

export default LocalTime;
