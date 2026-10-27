'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface BookingFormProps {
  spaceId: string;
  pricePerHour: number;
}

export function BookingForm({ spaceId, pricePerHour }: BookingFormProps) {
  const router = useRouter();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState<string>(defaultDateStr);
  const [startHour, setStartHour] = useState<number>(9);
  const [durationHours, setDurationHours] = useState<number>(2);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(false);

  // Clave de Idempotencia: Se mantiene en caso de fallo de red para permitir reintentos seguros
  const idempotencyKeyRef = useRef<string | null>(null);

  const getOrCreateIdempotencyKey = () => {
    if (!idempotencyKeyRef.current) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        idempotencyKeyRef.current = crypto.randomUUID();
      } else {
        idempotencyKeyRef.current = 'idem_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      }
    }
    return idempotencyKeyRef.current;
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    idempotencyKeyRef.current = null; // Parámetros cambiados -> nueva clave para nueva reserva
  };

  const handleStartHourChange = (newHour: number) => {
    setStartHour(newHour);
    idempotencyKeyRef.current = null;
  };

  const handleDurationChange = (newDuration: number) => {
    setDurationHours(newDuration);
    idempotencyKeyRef.current = null;
  };

  const totalPrice = (pricePerHour * durationHours).toFixed(2);
  const endHour = startHour + durationHours;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setNeedsAuth(false);

    try {
      if (!date) {
        setErrorMessage('Por favor selecciona una fecha válida.');
        setIsSubmitting(false);
        return;
      }

      const [yearStr, monthStr, dayStr] = date.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1;
      const day = parseInt(dayStr, 10);

      const startUtc = new Date(Date.UTC(year, month, day, startHour, 0, 0, 0));
      const endUtc = new Date(Date.UTC(year, month, day, startHour + durationHours, 0, 0, 0));

      const idempotencyKey = getOrCreateIdempotencyKey();

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': idempotencyKey,
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
          setErrorMessage('Debes iniciar sesión para confirmar tu reserva.');
        } else {
          setErrorMessage(data.error || 'No se pudo procesar la reserva. Revisa el horario elegido.');
        }
        setIsSubmitting(false);
        // NOTA: No reseteamos idempotencyKeyRef para que el reintento use la misma clave
        return;
      }

      // Éxito: Limpiar clave para futuras reservas
      idempotencyKeyRef.current = null;

      if (data.idempotent) {
        setSuccessMessage('Operación ya procesada anteriormente (Idempotente). Redirigiendo a tu panel...');
      } else {
        setSuccessMessage('Reserva creada exitosamente. Redirigiendo a tu panel...');
      }

      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1200);
    } catch {
      // Error de red: La clave permanece intacta en idempotencyKeyRef para reintentar sin duplicar
      setErrorMessage('Error de conexión con el servidor. Haz clic de nuevo para reintentar con seguridad.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-4 mb-5">
        <h3 className="text-xl font-bold text-slate-900">Reservar Espacio</h3>
        <p className="text-slate-500 text-xs mt-1">
          Horario de atención: 07:00 a 21:00 UTC · Duración: 1 a 4 horas
        </p>
      </div>

      {/* Alerta de Error Elegante */}
      {errorMessage && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex flex-col gap-2">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {needsAuth && (
            <div className="mt-2 pt-2 border-t border-red-200">
              <Link
                href="/login"
                className="w-full block text-center bg-red-600 hover:bg-red-700 text-white font-semibold text-xs py-2 px-3 rounded-md transition"
              >
                Iniciar Sesión Aquí
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Alerta de Éxito */}
      {successMessage && (
        <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fecha */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Fecha de reserva
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            required
          />
        </div>

        {/* Hora de inicio */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Hora de inicio (07:00 - 20:00)
          </label>
          <select
            value={startHour}
            onChange={(e) => handleStartHourChange(parseInt(e.target.value, 10))}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          >
            {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((hour) => (
              <option key={hour} value={hour}>
                {hour.toString().padStart(2, '0')}:00 UTC
              </option>
            ))}
          </select>
        </div>

        {/* Duración */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Duración
          </label>
          <select
            value={durationHours}
            onChange={(e) => handleDurationChange(parseInt(e.target.value, 10))}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          >
            {[1, 2, 3, 4]
              .filter((dur) => startHour + dur <= 21)
              .map((dur) => (
                <option key={dur} value={dur}>
                  {dur} {dur === 1 ? 'hora' : 'horas'} (hasta las {(startHour + dur).toString().padStart(2, '0')}:00 UTC)
                </option>
              ))}
          </select>
        </div>

        {/* Resumen */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 my-4">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>Tarifa por hora:</span>
            <span className="font-semibold text-slate-900">${pricePerHour.toFixed(2)}/h</span>
          </div>
          <div className="flex justify-between text-xs text-slate-600 mb-2">
            <span>Horario seleccionado:</span>
            <span className="font-semibold text-slate-900">
              {startHour.toString().padStart(2, '0')}:00 - {endHour.toString().padStart(2, '0')}:00 UTC
            </span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-800">Total:</span>
            <span className="text-xl font-bold text-indigo-600">${totalPrice}</span>
          </div>
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={isSubmitting || Boolean(successMessage) || endHour > 21}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-3 px-4 rounded-lg shadow-sm transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Procesando reserva...</span>
            </>
          ) : (
            <span>Confirmar y Reservar</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;
