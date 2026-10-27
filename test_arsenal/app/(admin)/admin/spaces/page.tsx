'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Plus, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface SpaceItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  pricePerHour: number | string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminSpacesPage() {
  const [spaces, setSpaces] = useState<SpaceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDeactivateId, setConfirmDeactivateId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('25.00');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSpaces = useCallback(async () => {
    try {
      const res = await fetch('/api/spaces?all=true');
      if (res.ok) {
        const data = await res.json();
        setSpaces(data.spaces || []);
      } else {
        setFeedback({
          message: 'Error al consultar espacios. Requiere privilegios de ADMIN.',
          type: 'error',
        });
      }
    } catch {
      setFeedback({
        message: 'Error de red al consultar los espacios.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  const handleDeactivate = async (spaceId: string, spaceName: string) => {
    setActionLoading(spaceId);
    setFeedback(null);
    setConfirmDeactivateId(null);

    try {
      const res = await fetch(`/api/spaces/${spaceId}/deactivate`, {
        method: 'PATCH',
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({
          message:
            data.error ||
            'No se puede desactivar el espacio porque tiene reservas futuras confirmadas (Regla 13).',
          type: 'error',
        });
        return;
      }

      setFeedback({
        message: `Espacio "${spaceName}" desactivado con éxito (Regla 13 cumplida).`,
        type: 'success',
      });

      setSpaces((prev) =>
        prev.map((s) => (s.id === spaceId ? { ...s, isActive: false } : s))
      );
    } catch {
      setFeedback({
        message: 'Error al comunicarse con el servidor.',
        type: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          description: newDescription,
          pricePerHour: parseFloat(newPrice),
          imageUrl: newImageUrl.trim() ? newImageUrl.trim() : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({
          message: data.error || 'Error al crear el espacio.',
          type: 'error',
        });
        setIsSubmitting(false);
        return;
      }

      setFeedback({
        message: 'Espacio creado exitosamente.',
        type: 'success',
      });

      setNewName('');
      setNewDescription('');
      setNewPrice('25.00');
      setNewImageUrl('');
      setShowCreateForm(false);
      fetchSpaces();
    } catch {
      setFeedback({
        message: 'Error de red al crear el espacio.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Gestión de Espacios (Admin)</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Control de inventario, precios y desactivación bajo Regla 13
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => {
              setLoading(true);
              fetchSpaces();
            }}
            className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold px-3.5 py-2 rounded-xl border border-white/10 transition shadow-sm inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="text-xs bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-bold px-4 py-2 rounded-xl shadow-lg shadow-amber-500/20 transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{showCreateForm ? 'Cerrar Formulario' : 'Nuevo Espacio'}</span>
          </button>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm border flex items-center justify-between shadow-lg ${
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
          <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Formulario de Creación */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateSpace}
          className="bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 text-zinc-100 animate-fadeIn"
        >
          <h2 className="text-base font-bold text-white mb-2">Crear Nuevo Espacio</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Nombre del Espacio
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. Sala Ejecutiva VIP"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/15 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Precio por Hora (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/15 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              URL de Imagen (Opcional)
            </label>
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/15 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Descripción
            </label>
            <textarea
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Describe las comodidades, capacidad y ambiente del espacio..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/15 rounded-xl text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 transition"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold px-4 py-2.5 rounded-xl border border-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-xs bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando espacio...' : 'Crear Espacio'}
            </button>
          </div>
        </form>
      )}

      {/* Tabla de Espacios */}
      <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-10 text-center text-zinc-400 text-sm">Cargando espacios...</div>
        ) : spaces.length === 0 ? (
          <div className="p-10 text-center text-zinc-400 text-sm">
            No se encontraron espacios registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/80 text-xs font-bold text-zinc-400 uppercase border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Espacio</th>
                  <th className="px-6 py-4">Precio / Hora</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {spaces.map((space) => (
                  <tr key={space.id} className="hover:bg-zinc-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{space.name}</div>
                      <div className="text-xs text-zinc-400 line-clamp-1">{space.description}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-500">
                      ${Number(space.pricePerHour).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {space.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-white/10">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {space.isActive ? (
                        confirmDeactivateId === space.id ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleDeactivate(space.id, space.name)}
                              disabled={actionLoading === space.id}
                              className="text-xs bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition disabled:opacity-50"
                            >
                              {actionLoading === space.id ? 'Comprobando...' : 'Confirmar'}
                            </button>
                            <button
                              onClick={() => setConfirmDeactivateId(null)}
                              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium px-2.5 py-1.5 rounded-lg transition border border-white/10"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeactivateId(space.id)}
                            disabled={actionLoading === space.id}
                            className="text-xs bg-zinc-950 hover:bg-red-950/70 text-red-400 border border-red-900/40 font-medium px-3.5 py-1.5 rounded-lg transition disabled:opacity-50 hover:border-red-500/40"
                          >
                            Desactivar
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-zinc-500 font-medium">Desactivado</span>
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
