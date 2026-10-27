'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { RefreshCw, Calendar, CheckCircle2, AlertCircle, X, Plus } from 'lucide-react';
import { LocalTime } from '@/components/shared/LocalTime';

interface ReservationItem {
  id: string;
  startTime: string;
  endTime: string;
  totalPrice: number | string;
  status: 'CONFIRMED' | 'CANCELLED';
  space: {
    id: string;
    name: string;
    pricePerHour: number | string;
  };
}

export default function DashboardPage() {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );

  const fetchReservations = useCallback(async () => {
    try {
      const res = await fetch('/api/reservations');
      if (res.ok) {
        const data = await res.json();
        setReservations(data.reservations || []);
      } else {
        setFeedback({
          message: 'Error al consultar tus reservas. Inicia sesión nuevamente si el problema persiste.',
          type: 'error',
        });
      }
    } catch {
      setFeedback({
        message: 'Error de red al consultar las reservas.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleCancelReservation = async (reservationId: string) => {
    setCancellingId(reservationId);
    setFeedback(null);
    setConfirmingId(null);

    try {
      const res = await fetch(`/api/reservations/${reservationId}/cancel`, {
        method: 'PATCH',
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({
          message: data.error || 'No se pudo cancelar la reserva.',
          type: 'error',
        });
        return;
      }

      setFeedback({
        message: 'Reserva cancelada exitosamente.',
        type: 'success',
      });

      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, status: 'CANCELLED' } : r))
      );
    } catch {
      setFeedback({
        message: 'Error al comunicarse con el servidor.',
        type: 'error',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const activeReservations = reservations.filter((r) => r.status === 'CONFIRMED');
  const pastOrCancelled = reservations.filter((r) => r.status === 'CANCELLED');

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Panel de Usuario — Mis Reservas
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Administra tus horarios reservados en los espacios de CoSpace
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLoading(true);
              fetchReservations();
            }}
            className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold px-3.5 py-2.5 rounded-xl border border-white/10 transition shadow-sm inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          <Link
            href="/spaces"
            className="text-xs bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition inline-flex items-center gap-1.5 tracking-wide"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Nueva Reserva</span>
          </Link>
        </div>
      </div>

      {/* Mensajes de Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm border flex items-center justify-between shadow-lg animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/70 border-red-500/40 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Reservas Activas */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-500" />
          <span>Próximas Reservas Confirmadas ({activeReservations.length})</span>
        </h2>

        {loading ? (
          <div className="text-center py-12 bg-zinc-900 rounded-2xl border border-white/10 text-zinc-400 text-sm">
            Cargando reservas...
          </div>
        ) : activeReservations.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 rounded-2xl border border-white/10 p-8 shadow-xl">
            <div className="w-12 h-12 bg-zinc-800 text-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Sin reservas activas</h3>
            <p className="text-zinc-400 text-sm mb-5">No tienes horarios reservados en este momento.</p>
            <Link
              href="/spaces"
              className="inline-block bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-amber-500/20"
            >
              Explorar espacios disponibles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activeReservations.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-xl hover:border-amber-500/40 transition flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-white text-lg">{item.space.name}</h3>
                    <span className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-bold px-3 py-0.5 rounded-full shadow-sm">
                      CONFIRMED
                    </span>
                  </div>
                  <div className="text-sm text-zinc-400">
                    <LocalTime date={item.startTime} endDate={item.endTime} className="text-zinc-300 font-medium" />
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t border-white/10 md:border-t-0 pt-4 md:pt-0">
                  <div className="text-right">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total</div>
                    <div className="text-2xl font-extrabold text-amber-500 tracking-tight">
                      ${Number(item.totalPrice).toFixed(2)}
                    </div>
                  </div>

                  {confirmingId === item.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCancelReservation(item.id)}
                        disabled={cancellingId === item.id}
                        className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2.5 px-3.5 rounded-xl shadow-md transition disabled:opacity-50"
                      >
                        {cancellingId === item.id ? 'Cancelando...' : 'Confirmar'}
                      </button>
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium py-2.5 px-3.5 rounded-xl transition border border-white/10"
                      >
                        Atrás
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingId(item.id)}
                      disabled={cancellingId === item.id}
                      className="bg-zinc-950 hover:bg-red-950/70 text-red-400 border border-red-900/40 text-xs font-semibold py-2.5 px-4 rounded-xl transition hover:border-red-500/40"
                    >
                      Cancelar Reserva
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Historial de Canceladas */}
      {pastOrCancelled.length > 0 && (
        <section className="pt-6 border-t border-white/10">
          <h2 className="text-base font-bold text-zinc-400 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60 inline-block"></span>
            <span>Reservas Canceladas ({pastOrCancelled.length})</span>
          </h2>

          <div className="space-y-3">
            {pastOrCancelled.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-950/70 border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 opacity-75"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-zinc-300 text-sm">{item.space.name}</h4>
                    <span className="bg-red-950/60 text-red-400 border border-red-500/20 text-xs px-2 py-0.5 rounded font-bold">
                      CANCELLED
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    <LocalTime date={item.startTime} endDate={item.endTime} className="text-zinc-400" />
                  </div>
                </div>

                <div className="text-xs text-zinc-500">
                  Importe: ${Number(item.totalPrice).toFixed(2)} (Sin cobro)
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
