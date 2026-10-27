'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle, CheckCircle2, X } from 'lucide-react';
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
    setCancellingId(id);
    setFeedback(null);
    setConfirmingId(null);

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
      <div className="flex justify-between items-center pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Todas las Reservas (Admin)</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Supervisión global de reservaciones en toda la plataforma CoSpace
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchReservations();
          }}
          className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold px-3.5 py-2 rounded-xl border border-white/10 transition shadow-sm inline-flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Recargar</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm border flex items-center justify-between shadow-lg animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/70 border-red-500/40 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-10 text-center text-zinc-400 text-sm">Cargando reservas...</div>
        ) : reservations.length === 0 ? (
          <div className="p-10 text-center text-zinc-400 text-sm">
            No hay reservas registradas en el sistema.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/80 text-xs font-bold text-zinc-400 uppercase border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Espacio</th>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Horario</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-800/40 transition">
                    <td className="px-6 py-4 font-semibold text-white">{r.space.name}</td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{r.user?.name || 'Usuario'}</div>
                      <div className="text-xs text-zinc-400">{r.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-300">
                      <LocalTime date={r.startTime} endDate={r.endTime} />
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-500">
                      ${Number(r.totalPrice).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold inline-block ${
                          r.status === 'CONFIRMED'
                            ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-950/70 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status === 'CONFIRMED' ? (
                        confirmingId === r.id ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleAdminCancel(r.id)}
                              disabled={cancellingId === r.id}
                              className="text-xs bg-red-600 hover:bg-red-500 text-white font-bold px-2.5 py-1.5 rounded-lg shadow-sm disabled:opacity-50"
                            >
                              {cancellingId === r.id ? '...' : 'Confirmar'}
                            </button>
                            <button
                              onClick={() => setConfirmingId(null)}
                              className="text-xs bg-zinc-800 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmingId(r.id)}
                            className="text-xs bg-zinc-950 hover:bg-red-950/70 text-red-400 border border-red-900/40 hover:border-red-500/40 px-3.5 py-1.5 rounded-lg font-medium transition"
                          >
                            Cancelar
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-zinc-500 font-medium">Cancelada</span>
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
