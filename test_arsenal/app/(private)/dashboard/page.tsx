'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Calendar,
  Clock,
  Sparkles,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  Shield,
  ArrowRight,
} from 'lucide-react';
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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.user?.role) {
          setUserRole(data.user.role);
        }
      }
    } catch {
      // ignore
    }
  }, []);

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
    fetchSession();
    fetchReservations();
  }, [fetchSession, fetchReservations]);

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

  // Cálculos para el Bento Grid de Estadísticas
  const { totalReservations, totalHours, favoriteSpace, favoriteSpaceSubtitle, activeCount } =
    useMemo(() => {
      const total = reservations.length;
      const active = reservations.filter((r) => r.status === 'CONFIRMED').length;

      // Calcular horas totales
      let hoursSum = 0;
      const spaceCounts: Record<string, number> = {};

      reservations.forEach((r) => {
        try {
          const start = new Date(r.startTime).getTime();
          const end = new Date(r.endTime).getTime();
          if (!isNaN(start) && !isNaN(end) && end > start) {
            hoursSum += (end - start) / (1000 * 60 * 60);
          }
        } catch {
          // ignore date parse errors
        }

        const name = r.space?.name || 'Espacio';
        spaceCounts[name] = (spaceCounts[name] || 0) + 1;
      });

      // Espacio favorito
      let favName = 'Ninguno';
      let maxCount = 0;
      for (const [name, count] of Object.entries(spaceCounts)) {
        if (count > maxCount) {
          maxCount = count;
          favName = name;
        }
      }

      const favSubtitle =
        maxCount > 0
          ? `${maxCount} reserva${maxCount > 1 ? 's' : ''} realizada${maxCount > 1 ? 's' : ''}`
          : 'Sin reservas previas';

      return {
        totalReservations: total,
        totalHours: hoursSum,
        favoriteSpace: favName,
        favoriteSpaceSubtitle: favSubtitle,
        activeCount: active,
      };
    }, [reservations]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header con Título "Bienvenido de nuevo" y Botón Dorado "Reservar Espacio" */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Bienvenido de nuevo
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Administra tus reservas activas y consulta el balance de tus espacios
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLoading(true);
              fetchReservations();
            }}
            className="text-xs bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 font-semibold px-3.5 py-3 rounded-xl border border-white/10 transition shadow-sm inline-flex items-center gap-1.5"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <Link
            href="/spaces"
            className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-bold px-5 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 text-sm tracking-wide shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Reservar Espacio</span>
          </Link>
        </div>
      </div>

      {/* Banner de Acceso Rápido para Administradores */}
      {userRole === 'ADMIN' && (
        <div className="bg-gradient-to-r from-amber-500/15 via-zinc-900/60 to-zinc-900/80 border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Privilegios de Administrador Activos</h3>
                <span className="text-[10px] bg-amber-500 text-black font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Accede a la interfaz de gestión para administrar espacios, tarifas y usuarios.
              </p>
            </div>
          </div>
          <Link
            href="/admin/spaces"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition shrink-0"
          >
            <span>Panel Administrativo</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>
      )}

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

      {/* 2. Bento Grid (Estadísticas): 3 Tarjetas de Cristal */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Tarjeta 1: Total Reservas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative overflow-hidden bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl hover:border-amber-500/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Total Reservas
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {loading ? '...' : totalReservations}
          </div>
          <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{loading ? 'Calculando...' : `${activeCount} activas`}</span>
          </p>
        </motion.div>

        {/* Tarjeta 2: Horas Reservadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="relative overflow-hidden bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl hover:border-amber-500/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Horas Reservadas
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {loading ? '...' : `${Number(totalHours.toFixed(1)).toString()}h`}
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Tiempo acumulado de productividad
          </p>
        </motion.div>

        {/* Tarjeta 3: Espacio Favorito */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="relative overflow-hidden bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl hover:border-amber-500/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Espacio Favorito
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div
            className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate"
            title={favoriteSpace}
          >
            {loading ? '...' : favoriteSpace}
          </div>
          <p className="text-xs text-zinc-400 mt-2 truncate">
            {loading ? 'Calculando...' : favoriteSpaceSubtitle}
          </p>
        </motion.div>
      </section>

      {/* 3. Lista de Reservas (Tarjetas Horizontales con Animación Framer Motion) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Mis Reservas ({reservations.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-16 bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/10 text-zinc-400 text-sm">
            Cargando historial de reservas...
          </div>
        ) : reservations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-xl"
          >
            <div className="w-14 h-14 bg-zinc-800 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-lg">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Sin reservas registradas</h3>
            <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
              No tienes reservas en este momento. Descubre y reserva nuestros espacios de alto nivel.
            </p>
            <Link
              href="/spaces"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black text-xs font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Explorar Espacios</span>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3.5">
            {reservations.map((item, index) => {
              const isConfirmed = item.status === 'CONFIRMED';
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                  className={`group bg-zinc-900/50 backdrop-blur-md border rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                    isConfirmed
                      ? 'border-white/10 hover:border-amber-500/40 hover:shadow-[0_0_25px_rgba(245,158,11,0.08)]'
                      : 'border-white/5 opacity-65 bg-zinc-950/40'
                  }`}
                >
                  {/* Información Izquierda: Nombre, Estado, Fecha */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide truncate group-hover:text-amber-400 transition-colors">
                        {item.space?.name || 'Espacio CoSpace'}
                      </h3>
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Confirmado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                          Cancelado
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-zinc-400 text-xs sm:text-sm">
                      <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                      <LocalTime
                        date={item.startTime}
                        endDate={item.endTime}
                        className="text-zinc-300 font-medium"
                      />
                    </div>
                  </div>

                  {/* Sección Derecha: Total y Botón de Cancelar si está activa */}
                  <div className="flex items-center justify-between md:justify-end gap-5 border-t border-white/5 md:border-t-0 pt-3 md:pt-0 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">
                        Total
                      </span>
                      <span className="text-xl sm:text-2xl font-extrabold text-amber-500 tracking-tight">
                        ${Number(item.totalPrice).toFixed(2)}
                      </span>
                    </div>

                    {isConfirmed && (
                      <div>
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
                              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium py-2.5 px-3 rounded-xl transition border border-white/10"
                            >
                              Atrás
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmingId(item.id)}
                            disabled={cancellingId === item.id}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 hover:border-red-500/40 transition-all shadow-sm"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
