'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BookingFormProps {
  spaceId: string;
  pricePerHour: number;
}

export function BookingForm({ spaceId, pricePerHour }: BookingFormProps) {
  const router = useRouter();

  // Fecha predeterminada: Mañana a las 09:00 UTC
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState<string>(defaultDateStr);
  const [startHour, setStartHour] = useState<number>(9);
  const [durationHours, setDurationHours] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [needsAuth, setNeedsAuth] = useState<boolean>(false);

  // Calcular precio estimado
  const totalPrice = (pricePerHour * durationHours).toFixed(2);
  const endHour = startHour + durationHours;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsAuth(false);

    try {
      if (!date) {
        setError('Por favor selecciona una fecha');
        setLoading(false);
        return;
      }

      const [yearStr, monthStr, dayStr] = date.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1; // 0-indexed
      const day = parseInt(dayStr, 10);

      // Crear Date en UTC para garantizar horas exactas según la regla del backend
      const startUtc = new Date(Date.UTC(year, month, day, startHour, 0, 0, 0));
      const endUtc = new Date(Date.UTC(year, month, day, startHour + durationHours, 0, 0, 0));

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceId,
          startTime: startUtc.toISOString(),
          endTime: endUtc.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setNeedsAuth(true);
          setError('Debes iniciar sesión para realizar una reserva.');
        } else {
          setError(data.error || 'No se pudo completar la reserva. Verifica el horario.');
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      console.error('Error al reservar:', err);
      setError('Error de conexión con el servidor. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Reservar este espacio</h3>
      <p className="text-gray-500 text-xs mb-6">
        Horario de atención: 07:00 a 21:00 UTC · Duración permitida: 1 a 4 horas exactas
      </p>

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          {needsAuth && (
            <Link
              href="/login"
              className="inline-block mt-1 bg-red-600 hover:bg-red-700 text-white font-medium text-xs px-3 py-1.5 rounded transition text-center"
            >
              Iniciar Sesión Ahora →
            </Link>
          )}
        </div>
      )}

      {success && (
        <div className="mb-5 p-3.5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-2">
          <span>✅</span>
          <span>¡Reserva confirmada con éxito! Redirigiendo a tu panel...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selección de Fecha */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Fecha de la reserva
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            required
          />
        </div>

        {/* Hora de Inicio */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Hora de Inicio
          </label>
          <select
            value={startHour}
            onChange={(e) => setStartHour(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
          >
            {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((hour) => {
              const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
              return (
                <option key={hour} value={hour}>
                  {hourLabel}
                </option>
              );
            })}
          </select>
        </div>

        {/* Duración */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            Duración (Horas)
          </label>
          <select
            value={durationHours}
            onChange={(e) => setDurationHours(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
          >
            {[1, 2, 3, 4]
              .filter((dur) => startHour + dur <= 21)
              .map((dur) => (
                <option key={dur} value={dur}>
                  {dur} {dur === 1 ? 'hora' : 'horas'} (hasta las {(startHour + dur).toString().padStart(2, '0')}:00)
                </option>
              ))}
          </select>
        </div>

        {/* Resumen de Tarifa */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Tarifa por hora:</span>
            <span>${pricePerHour.toFixed(2)}/h</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>Horario seleccionado:</span>
            <span>
              {startHour.toString().padStart(2, '0')}:00 - {endHour.toString().padStart(2, '0')}:00
            </span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between items-center font-bold text-gray-900">
            <span className="text-sm">Total estimado:</span>
            <span className="text-lg text-indigo-600">${totalPrice}</span>
          </div>
        </div>

        {/* Botón de Enviar */}
        <button
          type="submit"
          disabled={loading || success || endHour > 21}
          className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-2.5 px-4 rounded-lg shadow transition"
        >
          {loading ? 'Procesando reserva...' : 'Confirmar Reserva'}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;
