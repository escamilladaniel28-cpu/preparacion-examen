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
    idempotencyKeyRef.current = null;
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
      setErrorMessage('Error de conexión con el servidor. Haz clic de nuevo para reintentar con seguridad.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#131A2B] border border-white/5 hover:border-purple-500/50 transition-colors rounded-2xl p-6 shadow-2xl text-white">
      <div className="border-b border-white/10 pb-4 mb-5">
        <h3 className="text-xl font-bold text-white tracking-tight">Reservar Espacio</h3>
        <p className="text-slate-400 text-xs mt-1">
          Horario de atención: 07:00 a 21:00 UTC · Duración: 1 a 4 horas
        </p>
      </div>

      {/* Alerta de Error */}
      {errorMessage && (
        <div className="mb-5 p-4 bg-red-950/60 border border-red-500/40 text-red-200 rounded-xl text-sm flex flex-col gap-2">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {needsAuth && (
            <div className="mt-2 pt-2 border-t border-red-500/30">
              <Link
                href="/login"
                className="w-full block text-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-xs py-2.5 px-4 transition"
              >
                Iniciar Sesión Aquí
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Alerta de Éxito */}
      {successMessage && (
        <div className="mb-5 p-4 bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 rounded-xl text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fecha */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Fecha de reserva
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition [color-scheme:dark]"
            required
          />
        </div>

        {/* Hora de inicio */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Hora de inicio (07:00 - 20:00)
          </label>
          <select
            value={startHour}
            onChange={(e) => handleStartHourChange(parseInt(e.target.value, 10))}
            className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition [color-scheme:dark]"
          >
            {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((hour) => (
              <option key={hour} value={hour} className="bg-[#131A2B] text-white">
                {hour.toString().padStart(2, '0')}:00 UTC
              </option>
            ))}
          </select>
        </div>

        {/* Duración */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Duración
          </label>
          <select
            value={durationHours}
            onChange={(e) => handleDurationChange(parseInt(e.target.value, 10))}
            className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition [color-scheme:dark]"
          >
            {[1, 2, 3, 4]
              .filter((dur) => startHour + dur <= 21)
              .map((dur) => (
                <option key={dur} value={dur} className="bg-[#131A2B] text-white">
                  {dur} {dur === 1 ? 'hora' : 'horas'} (hasta las {(startHour + dur).toString().padStart(2, '0')}:00 UTC)
                </option>
              ))}
          </select>
        </div>

        {/* Resumen */}
        <div className="bg-[#0B0F19]/80 border border-white/10 rounded-xl p-4 my-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Tarifa por hora:</span>
            <span className="font-semibold text-slate-200">${pricePerHour.toFixed(2)}/h</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Horario seleccionado:</span>
            <span className="font-semibold text-slate-200">
              {startHour.toString().padStart(2, '0')}:00 - {endHour.toString().padStart(2, '0')}:00 UTC
            </span>
          </div>
          <div className="border-t border-white/10 pt-2.5 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-300">Total:</span>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">${totalPrice}</span>
          </div>
        </div>

        {/* Botón Estilo Píldora */}
        <button
          type="submit"
          disabled={isSubmitting || Boolean(successMessage) || endHour > 21}
          className="w-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-sm tracking-wide"
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
