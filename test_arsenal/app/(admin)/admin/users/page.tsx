'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Mail,
  Calendar,
} from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  _count?: {
    reservations: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        setFeedback({
          message: 'Error al consultar la lista de usuarios. Requiere privilegios de ADMIN.',
          type: 'error',
        });
      }
    } catch {
      setFeedback({
        message: 'Error de red al consultar los usuarios.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Cambiar rol entre USER y ADMIN
  const handleToggleRole = async (userId: string, currentRole: 'USER' | 'ADMIN', userName: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    const actionKey = `${userId}-role`;
    setActionLoading(actionKey);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({
          message: data.error || 'Error al actualizar el rol del usuario.',
          type: 'error',
        });
        return;
      }

      setFeedback({
        message: `Rol de "${userName}" actualizado a ${newRole}.`,
        type: 'success',
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch {
      setFeedback({
        message: 'Error de red al intentar actualizar el rol.',
        type: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Cambiar estado entre Activo e Inactivo
  const handleToggleStatus = async (userId: string, currentStatus: boolean, userName: string) => {
    const newStatus = !currentStatus;
    const actionKey = `${userId}-status`;
    setActionLoading(actionKey);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({
          message: data.error || 'Error al actualizar el estado del usuario.',
          type: 'error',
        });
        return;
      }

      setFeedback({
        message: `Usuario "${userName}" ${newStatus ? 'activado' : 'desactivado'} con éxito.`,
        type: 'success',
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: newStatus } : u))
      );
    } catch {
      setFeedback({
        message: 'Error de red al intentar actualizar el estado.',
        type: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Gestión de Usuarios (Admin)</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Administración de cuentas, asignación de roles y control de acceso al sistema
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            fetchUsers();
          }}
          className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold px-3.5 py-2 rounded-xl border border-white/10 transition shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
          title="Refrescar usuarios"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Refrescar</span>
        </button>
      </div>

      {/* Alerta de Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm border flex items-start justify-between shadow-xl backdrop-blur-md animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/80 border-red-500/50 text-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold text-sm">
                {feedback.type === 'success' ? 'Operación Exitosa' : 'Aviso del Sistema'}
              </p>
              <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{feedback.message}</p>
            </div>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition"
            aria-label="Cerrar alerta"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 text-sm flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
            <span>Cargando usuarios registrados...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-sm">
            <Users className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="font-semibold text-white">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/80 text-xs font-bold text-zinc-400 uppercase border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Correo</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => {
                  const roleActionKey = `${user.id}-role`;
                  const statusActionKey = `${user.id}-status`;

                  return (
                    <tr
                      key={user.id}
                      className={`transition ${
                        user.isActive ? 'hover:bg-zinc-800/40' : 'opacity-60 bg-zinc-950/40'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              user.role === 'ADMIN'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-zinc-800 text-zinc-300 border border-white/10'
                            }`}
                          >
                            {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{user.name || 'Sin nombre'}</div>
                            <div className="text-[11px] text-zinc-500">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-zinc-300 text-xs">
                          <Mail className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{user.email}</span>
                        </div>
                        {user._count?.reservations !== undefined && (
                          <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{user._count.reservations} reservas</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.role === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                            <Shield className="w-3.5 h-3.5 text-amber-400" />
                            ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-white/10">
                            USER
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-950/70 text-red-400 border border-red-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                            Inactivo
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          {/* Botón de Asignación / Remoción de Rol Admin */}
                          <button
                            onClick={() => handleToggleRole(user.id, user.role, user.name || user.email)}
                            disabled={actionLoading === roleActionKey}
                            className={`text-xs px-3 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1.5 transition border disabled:opacity-50 ${
                              user.role === 'ADMIN'
                                ? 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border-white/10'
                                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                            }`}
                            title={user.role === 'ADMIN' ? 'Quitar rol de Administrador' : 'Hacer Administrador'}
                          >
                            {actionLoading === roleActionKey ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : user.role === 'ADMIN' ? (
                              <>
                                <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Quitar Admin</span>
                              </>
                            ) : (
                              <>
                                <Shield className="w-3.5 h-3.5 text-amber-400" />
                                <span>Hacer Admin</span>
                              </>
                            )}
                          </button>

                          {/* Botón de Activación / Desactivación */}
                          <button
                            onClick={() => handleToggleStatus(user.id, user.isActive, user.name || user.email)}
                            disabled={actionLoading === statusActionKey}
                            className={`text-xs px-3 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1.5 transition border disabled:opacity-50 ${
                              user.isActive
                                ? 'bg-zinc-950 hover:bg-red-950/70 text-red-400 hover:text-red-300 border-red-900/40 hover:border-red-500/40'
                                : 'bg-emerald-950 hover:bg-emerald-900/80 text-emerald-400 hover:text-emerald-300 border-emerald-500/30'
                            }`}
                            title={user.isActive ? 'Desactivar acceso al usuario' : 'Activar acceso al usuario'}
                          >
                            {actionLoading === statusActionKey ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : user.isActive ? (
                              <>
                                <UserX className="w-3.5 h-3.5 text-red-400" />
                                <span>Desactivar</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Activar</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
