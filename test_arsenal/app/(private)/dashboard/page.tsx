'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Panel de Usuario — Mis Reservas
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Administra tus horarios reservados en los espacios de CoSpace
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLoading(true);
              fetchReservations();
            }}
            className="text-xs bg-white hover:bg-gray-100 text-gray-700 font-semibold px-3.5 py-2 rounded-xl border border-gray-300 transition shadow-sm"
          >
            🔄 Actualizar
          </button>
          <Link
            href="/spaces"
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow-sm transition"
          >
            + Nueva Reserva
          </Link>
        </div>
      </div>

      {/* Mensajes de Feedback Estilizados */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm border flex items-center justify-between shadow-sm animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{feedback.type === 'success' ? '✅' : '⚠️'}</span>
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold px-2 py-0.5 rounded hover:bg-black/5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Lista de Reservas Confirmadas */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>🟢</span> Reservas Confirmadas ({activeReservations.length})
          </h2>
          <span className="text-xs text-gray-500">
            Regla: Cancelaciones con al menos 2 horas de anticipación
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <div className="inline-block animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-2"></div>
            <p className="text-gray-500 text-sm">Cargando tus reservas...</p>
          </div>
        ) : activeReservations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-base font-bold text-gray-800 mb-1">Sin reservas activas</h3>
            <p className="text-gray-500 text-sm mb-4">No tienes horarios reservados en este momento.</p>
            <Link
              href="/spaces"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
            >
              Explorar espacios disponibles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activeReservations.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-gray-900 text-base">{item.space.name}</h3>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      CONFIRMED
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <LocalTime date={item.startTime} endDate={item.endTime} />
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Total a pagar</div>
                    <div className="text-lg font-extrabold text-indigo-600">
                      ${Number(item.totalPrice).toFixed(2)}
                    </div>
                  </div>

                  {confirmingId === item.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCancelReservation(item.id)}
                        disabled={cancellingId === item.id}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-3 rounded-lg shadow transition disabled:opacity-50"
                      >
                        {cancellingId === item.id ? 'Cancelando...' : 'Sí, cancelar'}
                      </button>
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2 px-3 rounded-lg transition"
                      >
                        Atrás
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingId(item.id)}
                      disabled={cancellingId === item.id}
                      className="bg-white hover:bg-red-50 text-red-600 border border-red-300 hover:border-red-400 text-xs font-semibold py-2 px-3.5 rounded-lg transition"
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
        <section className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span>⚪</span> Reservas Canceladas ({pastOrCancelled.length})
          </h2>

          <div className="space-y-3">
            {pastOrCancelled.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 opacity-80"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-700 text-sm">{item.space.name}</h4>
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded font-medium">
                      CANCELLED
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    <LocalTime date={item.startTime} endDate={item.endTime} />
                  </div>
                </div>

                <div className="text-xs text-gray-500">
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
