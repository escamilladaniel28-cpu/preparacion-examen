'use client';

import { useState, useEffect, useCallback } from 'react';

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

  // Formulario de creación
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
        message: '¡Espacio creado exitosamente!',
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Espacios (Admin)</h1>
          <p className="text-gray-500 text-xs mt-1">
            Control de inventario, precios y desactivación bajo Regla 13
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setLoading(true);
              fetchSpaces();
            }}
            className="text-xs bg-white hover:bg-gray-100 text-gray-700 font-semibold px-3 py-2 rounded-xl border border-gray-300 transition shadow-sm"
          >
            🔄 Recargar
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 rounded-xl shadow-sm transition"
          >
            {showCreateForm ? 'Cancelar' : '+ Nuevo Espacio'}
          </button>
        </div>
      </div>

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

      {/* Formulario de Creación */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateSpace}
          className="bg-white border border-indigo-200 rounded-2xl p-6 shadow-md space-y-4"
        >
          <h3 className="text-base font-bold text-indigo-900">Crear Nuevo Espacio</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nombre</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. Sala Creativa Nexus"
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
                required
                minLength={3}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Precio por Hora ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Descripción</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Descripción del espacio y características..."
              rows={2}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
              required
              minLength={5}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              URL de Imagen (Opcional)
            </label>
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? 'Guardando espacio...' : 'Crear Espacio'}
            </button>
          </div>
        </form>
      )}

      {/* Tabla de Espacios */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-gray-500 text-sm">Cargando espacios...</div>
        ) : spaces.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            No se encontraron espacios registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Espacio</th>
                  <th className="px-6 py-3">Precio / Hora</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {spaces.map((space) => (
                  <tr key={space.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{space.name}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{space.description}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ${Number(space.pricePerHour).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {space.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          ● Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          ○ Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {space.isActive ? (
                        confirmDeactivateId === space.id ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleDeactivate(space.id, space.name)}
                              disabled={actionLoading === space.id}
                              className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-1.5 rounded-lg shadow-sm transition disabled:opacity-50"
                            >
                              {actionLoading === space.id ? 'Comprobando...' : 'Sí, desactivar'}
                            </button>
                            <button
                              onClick={() => setConfirmDeactivateId(null)}
                              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-2 py-1.5 rounded-lg transition"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeactivateId(space.id)}
                            disabled={actionLoading === space.id}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          >
                            Desactivar
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Desactivado</span>
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
