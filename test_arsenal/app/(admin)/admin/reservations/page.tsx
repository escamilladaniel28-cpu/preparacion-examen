'use client';

import { useState, useEffect, useCallback } from 'react';
import { LocalTime } from '@/components/shared/LocalTime';

interface AdminReservation {
  id: string;
  startTime: string;
  endTime: string;
  totalPrice: number | string;
  status: 'CONFIRMED' | 'CANCELLED';
  space: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
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
        setFeedback({ message: 'Error al consultar reservas globales.', type: 'error' });
      }
    } catch {
      setFeedback({ message: 'Error de red.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleAdminCancel = async (id: string) => {
    if (!confirm('Como Administrador puedes cancelar esta reserva sin restricción de 2 horas. ¿Continuar?')) {
      return;
    }

    setCancellingId(id);
    setFeedback(null);

    try {
      const res = await fetch(`/api/reservations/${id}/cancel`, { method: 'PATCH' });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ message: data.error || 'Error al cancelar la reserva.', type: 'error' });
        return;
      }

      setFeedback({ message: 'Reserva cancelada por el administrador.', type: 'success' });
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'CANCELLED' } : r))
      );
    } catch {
      setFeedback({ message: 'Error de comunicación.', type: 'error' });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Todas las Reservas (Admin)</h1>
          <p className="text-gray-500 text-xs mt-1">
            Supervisión global de reservaciones en toda la plataforma CoSpace
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchReservations();
          }}
          className="text-xs bg-white hover:bg-gray-100 text-gray-700 font-medium px-3 py-2 rounded-lg border border-gray-300 transition"
        >
          🔄 Recargar
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-lg text-sm border flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold px-2 py-0.5">
            ✕
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Cargando reservas...</div>
        ) : reservations.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No hay reservas registradas en el sistema.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Espacio</th>
                  <th className="px-6 py-3">Usuario</th>
                  <th className="px-6 py-3">Horario</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-bold text-gray-900">{r.space.name}</td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{r.user?.name || 'Usuario'}</div>
                      <div className="text-xs text-gray-500">{r.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <LocalTime date={r.startTime} endDate={r.endTime} />
                    </td>
                    <td className="px-6 py-4 font-semibold text-indigo-600">
                      ${Number(r.totalPrice).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          r.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status === 'CONFIRMED' ? (
                        <button
                          onClick={() => handleAdminCancel(r.id)}
                          disabled={cancellingId === r.id}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1 rounded font-medium disabled:opacity-50"
                        >
                          {cancellingId === r.id ? '...' : 'Cancelar'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Cancelada</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
