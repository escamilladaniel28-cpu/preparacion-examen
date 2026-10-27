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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Panel de Usuario — Mis Reservas
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Administra tus horarios reservados en los espacios de CoSpace
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLoading(true);
              fetchReservations();
            }}
            className="text-xs bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3.5 py-2 rounded-lg border border-slate-300 transition shadow-sm inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          <Link
            href="/spaces"
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow-sm transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Reserva</span>
          </Link>
        </div>
      </div>

      {/* Mensajes de Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-lg text-sm border flex items-center justify-between shadow-sm animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Lista de Reservas Confirmadas */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Reservas Confirmadas ({activeReservations.length})</span>
          </h2>
          <span className="text-xs text-slate-500">
            Cancelaciones permitidas con al menos 2 horas de anticipación
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <div className="inline-block animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-2"></div>
            <p className="text-slate-500 text-sm">Cargando tus reservas...</p>
          </div>
        ) : activeReservations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
            <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">Sin reservas activas</h3>
            <p className="text-slate-500 text-sm mb-4">No tienes horarios reservados en este momento.</p>
            <Link
              href="/spaces"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              Explorar espacios disponibles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activeReservations.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-slate-900 text-base">{item.space.name}</h3>
                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      CONFIRMED
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    <LocalTime date={item.startTime} endDate={item.endTime} />
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Total</div>
                    <div className="text-lg font-bold text-indigo-600">
                      ${Number(item.totalPrice).toFixed(2)}
                    </div>
                  </div>

                  {confirmingId === item.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCancelReservation(item.id)}
                        disabled={cancellingId === item.id}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-3 rounded-md shadow-sm transition disabled:opacity-50"
                      >
                        {cancellingId === item.id ? 'Cancelando...' : 'Confirmar'}
                      </button>
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-2 px-3 rounded-md transition"
                      >
                        Atrás
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingId(item.id)}
                      disabled={cancellingId === item.id}
                      className="bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold py-2 px-3.5 rounded-md transition"
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
        <section className="pt-6 border-t border-slate-200">
          <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
            <span>Reservas Canceladas ({pastOrCancelled.length})</span>
          </h2>

          <div className="space-y-3">
            {pastOrCancelled.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 opacity-80"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-700 text-sm">{item.space.name}</h4>
                    <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded font-medium">
                      CANCELLED
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    <LocalTime date={item.startTime} endDate={item.endTime} />
                  </div>
                </div>

                <div className="text-xs text-slate-500">
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
