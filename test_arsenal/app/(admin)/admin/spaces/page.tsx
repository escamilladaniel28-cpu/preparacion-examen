'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  RefreshCw,
  Plus,
  AlertCircle,
  CheckCircle2,
  X,
  Pencil,
  Ban,
  Building2,
  DollarSign,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react';

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

  // Estado del Formulario Unificado (Creación y Edición) - Abierto por defecto
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [editingSpace, setEditingSpace] = useState<SpaceItem | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerHour, setPricePerHour] = useState('25.00');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  // Consultar todos los espacios (incluidos inactivos para ADMIN con ?admin=true)
  const fetchSpaces = useCallback(async () => {
    try {
      const res = await fetch('/api/spaces?admin=true', { cache: 'no-store' });
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

  // Abrir formulario para nuevo espacio
  const handleOpenCreate = () => {
    setEditingSpace(null);
    setName('');
    setDescription('');
    setPricePerHour('25.00');
    setImageUrl('');
    setIsFormOpen(true);
    setFeedback(null);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Abrir formulario para editar espacio existente
  const handleOpenEdit = (space: SpaceItem) => {
    setEditingSpace(space);
    setName(space.name);
    setDescription(space.description);
    setPricePerHour(String(space.pricePerHour));
    setImageUrl(space.imageUrl || '');
    setIsFormOpen(true);
    setFeedback(null);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Cerrar y resetear formulario
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSpace(null);
    setName('');
    setDescription('');
    setPricePerHour('25.00');
    setImageUrl('');
  };

  // Enviar formulario (POST para crear o PATCH para editar)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const priceNum = parseFloat(pricePerHour);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFeedback({
        message: 'El precio por hora debe ser un número válido mayor a 0.',
        type: 'error',
      });
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      pricePerHour: priceNum,
      imageUrl: imageUrl.trim() ? imageUrl.trim() : null,
    };

    try {
      if (editingSpace) {
        // Modo Edición -> PATCH /api/spaces/[id]
        const res = await fetch(`/api/spaces/${editingSpace.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          setFeedback({
            message: data.error || 'Error al actualizar el espacio.',
            type: 'error',
          });
          setIsSubmitting(false);
          return;
        }

        setFeedback({
          message: `Espacio "${payload.name}" actualizado exitosamente.`,
          type: 'success',
        });
        handleCloseForm();
        fetchSpaces();
      } else {
        // Modo Creación -> POST /api/spaces
        const res = await fetch('/api/spaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
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
          message: `Espacio "${payload.name}" creado exitosamente.`,
          type: 'success',
        });
        handleCloseForm();
        fetchSpaces();
      }
    } catch {
      setFeedback({
        message: 'Error de red al procesar la solicitud.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Desactivación con verificación estricta de Regla 13 y manejo de error 409
  const handleDeactivate = async (spaceId: string, spaceName: string) => {
    setActionLoading(spaceId);
    setFeedback(null);
    setConfirmDeactivateId(null);

    try {
      const res = await fetch(`/api/spaces/${spaceId}/deactivate`, {
        method: 'PATCH',
      });

      const data = await res.json();

      if (res.status === 409) {
        // Conflicto: Regla 13 - Reservas futuras existentes
        setFeedback({
          message:
            data.error ||
            `Conflicto (409): No se puede desactivar "${spaceName}" porque cuenta con reservas futuras confirmadas (Regla 13 de negocio).`,
          type: 'error',
        });
        return;
      }

      if (!res.ok) {
        setFeedback({
          message: data.error || `Error (${res.status}) al intentar desactivar el espacio.`,
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
        message: 'Error de red al comunicarse con el servidor.',
        type: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Reactivación lógica de espacio (Solo ADMIN)
  const handleActivate = async (spaceId: string, spaceName: string) => {
    setActionLoading(spaceId);
    setFeedback(null);

    try {
      const res = await fetch(`/api/spaces/${spaceId}/activate`, {
        method: 'PATCH',
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({
          message: data.error || `Error (${res.status}) al reactivar el espacio.`,
          type: 'error',
        });
        return;
      }

      setFeedback({
        message: `Espacio "${spaceName}" reactivado con éxito.`,
        type: 'success',
      });

      setSpaces((prev) =>
        prev.map((s) => (s.id === spaceId ? { ...s, isActive: true } : s))
      );
    } catch {
      setFeedback({
        message: 'Error de red al comunicarse con el servidor.',
        type: 'error',
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Acciones Principales */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-purple-500/20">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Gestión de Espacios (Admin)</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Control de inventario, edición de tarifas y desactivación lógica protegida (Regla 13)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setLoading(true);
              fetchSpaces();
            }}
            className="text-xs bg-[#140A24] hover:bg-purple-900/30 text-zinc-300 font-semibold px-3.5 py-2 rounded-xl border border-purple-500/30 transition shadow-sm inline-flex items-center gap-1.5"
            title="Refrescar catálogo"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </button>
          <button
            onClick={() => {
              if (editingSpace) {
                handleOpenCreate();
              } else {
                setIsFormOpen(!isFormOpen);
              }
            }}
            className="text-xs bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white font-bold px-4 py-2 rounded-xl shadow-lg shadow-purple-900/30 hover:shadow-[0_0_30px_rgba(123,44,191,0.2)] transition inline-flex items-center gap-1.5"
          >
            {editingSpace ? (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Crear Nuevo</span>
              </>
            ) : isFormOpen ? (
              <>
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Ocultar Formulario</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Nuevo Espacio</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alerta de Feedback Visual (Sin alert() ni confirm()) */}
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
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
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

      {/* Formulario Unificado (Creación / Edición) */}
      {isFormOpen && (
        <div
          ref={formRef}
          className="bg-[#140A24]/90 border border-purple-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-5 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-amber-400">
                {editingSpace ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  {editingSpace ? `Editar Espacio: ${editingSpace.name}` : 'Crear Nuevo Espacio'}
                </h2>
                <p className="text-xs text-zinc-400">
                  {editingSpace
                    ? `Modificando registro ID: ${editingSpace.id}`
                    : 'Ingresa los detalles para registrar un nuevo espacio en el catálogo'}
                </p>
              </div>
            </div>

            {editingSpace && (
              <span className="px-2.5 py-1 text-xs font-semibold bg-purple-600/20 text-purple-300 border border-purple-500/40 rounded-full">
                Modo Edición
              </span>
            )}
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Nombre del Espacio *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Suite Ejecutiva Black"
                  className="w-full px-3.5 py-2.5 bg-[#09050D] border border-purple-500/25 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  required
                  minLength={3}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Precio por Hora (USD) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#09050D] border border-purple-500/25 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                URL de Imagen (Opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#09050D] border border-purple-500/25 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Descripción Completa *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe las amenidades, capacidad, equipos audiovisuales y ergonomía..."
                className="w-full px-3.5 py-2.5 bg-[#09050D] border border-purple-500/25 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                required
                minLength={5}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseForm}
                className="text-xs bg-[#09050D] hover:bg-[#140A24] text-zinc-300 font-semibold px-4 py-2.5 rounded-xl border border-purple-500/30 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="text-xs bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-900/30 hover:shadow-[0_0_30px_rgba(123,44,191,0.2)] transition disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>{editingSpace ? 'Guardando cambios...' : 'Creando espacio...'}</span>
                  </>
                ) : (
                  <span>{editingSpace ? 'Guardar Cambios' : 'Crear Espacio'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de Espacios */}
      <div className="bg-[#140A24]/60 backdrop-blur-md border border-purple-500/20 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 text-sm flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
            <span>Cargando inventario de espacios...</span>
          </div>
        ) : spaces.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-sm">
            <Building2 className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="font-semibold text-white">No se encontraron espacios registrados</p>
            <p className="text-xs text-zinc-500 mt-1">Crea el primer espacio usando el botón superior.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-[#09050D]/80 text-xs font-bold text-zinc-400 uppercase border-b border-purple-500/20">
                <tr>
                  <th className="px-6 py-4">Espacio</th>
                  <th className="px-6 py-4">Tarifa</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/15">
                {spaces.map((space) => (
                  <tr
                    key={space.id}
                    className={`transition ${
                      editingSpace?.id === space.id
                        ? 'bg-purple-600/15 border-l-2 border-purple-500'
                        : space.isActive
                        ? 'hover:bg-purple-900/20'
                        : 'opacity-50 hover:opacity-80 bg-[#09050D]/40'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-[#09050D] border border-purple-500/20 overflow-hidden shrink-0 flex items-center justify-center">
                          {space.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={space.imageUrl}
                              alt={space.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Building2 className="w-5 h-5 text-zinc-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate">{space.name}</div>
                          <div className="text-xs text-zinc-400 line-clamp-1 max-w-xs sm:max-w-md">
                            {space.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-purple-400">
                        ${Number(space.pricePerHour).toFixed(2)}
                      </div>
                      <div className="text-[11px] text-zinc-500">por hora</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {space.isActive ? (
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
                        {/* Botón de Edición */}
                        <button
                          onClick={() => handleOpenEdit(space)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1.5 transition border ${
                            editingSpace?.id === space.id
                              ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white border-purple-400 shadow-md shadow-purple-900/30'
                              : 'bg-[#09050D] hover:bg-[#140A24] text-purple-300 hover:text-white border-purple-500/30'
                          }`}
                          title="Editar información del espacio"
                        >
                          <Pencil className="w-3.5 h-3.5 text-amber-400" />
                          <span>Editar</span>
                        </button>

                        {/* Botón de Desactivación Lógica (Regla 13) */}
                        {space.isActive ? (
                          confirmDeactivateId === space.id ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleDeactivate(space.id, space.name)}
                                disabled={actionLoading === space.id}
                                className="text-xs bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition disabled:opacity-50 inline-flex items-center gap-1"
                              >
                                {actionLoading === space.id ? (
                                   <>
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    <span>Verificando...</span>
                                  </>
                                ) : (
                                  <span>¿Confirmar?</span>
                                )}
                              </button>
                              <button
                                onClick={() => setConfirmDeactivateId(null)}
                                className="text-xs bg-[#09050D] hover:bg-[#140A24] text-zinc-300 font-medium px-2.5 py-1.5 rounded-lg transition border border-purple-500/30"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeactivateId(space.id)}
                              disabled={actionLoading === space.id}
                              className="text-xs bg-[#09050D] hover:bg-red-950/70 text-red-400 hover:text-red-300 border border-red-900/40 hover:border-red-500/40 font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50 inline-flex items-center gap-1"
                              title="Desactivar espacio (Regla 13)"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Desactivar</span>
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => handleActivate(space.id, space.name)}
                            disabled={actionLoading === space.id}
                            className="text-xs bg-emerald-950 hover:bg-emerald-900/80 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50 inline-flex items-center gap-1.5 shadow-sm"
                            title="Reactivar espacio"
                          >
                            {actionLoading === space.id ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Reactivando...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Reactivar</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
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
