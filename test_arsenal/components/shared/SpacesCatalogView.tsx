'use client';

import React, { useState, useMemo } from 'react';
import { Search, Building2, SlidersHorizontal, RotateCcw, ShieldCheck, KeyRound, ReceiptText, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/components/context/LanguageContext';
import { SpaceCard } from '@/components/shared/SpaceCard';

interface SpacesCatalogViewProps {
  spaces: any[];
  isLoading?: boolean;
  error?: string | null;
}

export function SpacesCatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {[0, 1, 2, 3].map((index) => {
        const isWide = index % 4 === 0 || index % 4 === 3;
        const colClasses = isWide
          ? 'col-span-1 md:col-span-2 lg:col-span-2'
          : 'col-span-1 md:col-span-1 lg:col-span-1';

        return (
          <div
            key={index}
            className={`rounded-lg border border-border bg-surface overflow-hidden shadow-subtle ${colClasses} ${
              isWide ? 'flex flex-col sm:flex-row' : 'flex flex-col'
            }`}
          >
            <div
              className={`bg-muted animate-pulse ${
                isWide
                  ? 'aspect-[16/10] sm:aspect-auto sm:w-7/12 sm:min-h-[260px]'
                  : 'aspect-[4/3] w-full'
              }`}
            />
            <div className={`p-5 flex flex-col justify-between ${isWide ? 'sm:w-5/12' : 'flex-1'} space-y-4`}>
              <div className="space-y-2">
                <div className="h-3 w-1/3 bg-muted animate-pulse rounded-sm" />
                <div className="h-5 w-3/4 bg-muted animate-pulse rounded-sm" />
                <div className="h-3 w-full bg-muted animate-pulse rounded-sm" />
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <div className="h-3 w-1/4 bg-muted animate-pulse rounded-sm" />
                <div className="h-4 w-1/4 bg-muted animate-pulse rounded-sm" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SpacesCatalogView({ spaces, isLoading = false, error = null }: SpacesCatalogViewProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Filtros interactivos
  const categories = [
    { id: 'ALL', label: 'Todos los espacios' },
    { id: 'BOARD', label: 'Salas de Juntas' },
    { id: 'SUITE', label: 'Suites Privadas' },
    { id: 'FOCUS', label: 'Cabinas Focus' },
  ];

  const filteredSpaces = useMemo(() => {
    return spaces.filter((space) => {
      const name = (space.name || '').toLowerCase();
      const desc = (space.description || '').toLowerCase();
      const term = searchTerm.trim().toLowerCase();

      // Búsqueda por texto
      const matchesSearch = term === '' || name.includes(term) || desc.includes(term);

      // Filtro por disponibilidad
      const matchesAvailability = !onlyAvailable || space.isActive !== false;

      // Filtro por categoría
      let matchesCategory = true;
      if (selectedCategory === 'BOARD') {
        matchesCategory = name.includes('junta') || desc.includes('junta') || name.includes('reunión');
      } else if (selectedCategory === 'SUITE') {
        matchesCategory = name.includes('suite') || desc.includes('suite') || name.includes('oficina');
      } else if (selectedCategory === 'FOCUS') {
        matchesCategory = name.includes('cabina') || desc.includes('cabina') || desc.includes('silenc');
      }

      return matchesSearch && matchesAvailability && matchesCategory;
    });
  }, [spaces, searchTerm, selectedCategory, onlyAvailable]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setOnlyAvailable(false);
  };

  return (
    <div className="min-h-screen bg-background text-primary flex flex-col">
      {/* SECCIÓN 1: Header del Catálogo con Filtros y Búsqueda */}
      <section className="py-12 sm:py-16 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <p className="text-xs font-sans uppercase tracking-widest text-secondary font-medium mb-2">
                Espacios Disponibles
              </p>
              <h1 className="font-heading text-3xl sm:text-5xl font-normal tracking-tight text-primary">
                {t('catalogTitle')}
              </h1>
              <p className="text-secondary text-sm sm:text-base mt-2 max-w-2xl font-sans font-normal">
                {t('catalogSubtitle')}
              </p>
            </div>

            <div className="text-xs font-sans text-secondary bg-surface border border-border px-4 py-2 rounded-sm inline-flex items-center gap-2 self-start md:self-auto shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              <span>
                {filteredSpaces.length} {filteredSpaces.length === 1 ? 'espacio disponible' : 'espacios disponibles'}
              </span>
            </div>
          </div>

          {/* Barra de Búsqueda y Filtros */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, palabra clave o servicio..."
                  aria-label="Buscar espacios"
                  className="w-full pl-10 pr-4 py-2.5 rounded-md bg-surface border border-border text-primary placeholder:text-secondary text-sm font-sans focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOnlyAvailable(!onlyAvailable)}
                  className={`px-4 py-2.5 rounded-md border text-xs font-sans font-medium transition-colors flex items-center gap-2 ${
                    onlyAvailable
                      ? 'bg-accent text-accent-fg border-accent'
                      : 'bg-surface text-secondary hover:text-primary border-border'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Solo disponibles</span>
                </button>

                {(searchTerm !== '' || selectedCategory !== 'ALL' || onlyAvailable) && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-3 py-2.5 rounded-md border border-border bg-surface text-secondary hover:text-primary text-xs font-sans font-medium transition-colors flex items-center gap-1.5"
                    title="Restablecer filtros"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Restablecer</span>
                  </button>
                )}
              </div>
            </div>

            {/* Chips de Categorías */}
            <div className="flex flex-wrap gap-2 pt-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-sm text-xs font-sans font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-accent text-accent-fg shadow-subtle'
                      : 'bg-surface hover:bg-muted text-secondary border border-border'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: Grilla Bento Asimétrica de Catálogo / Skeletons / Estados */}
      <section className="py-16 sm:py-20 flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error ? (
            /* Estado de Error */
            <div className="text-center py-16 bg-surface rounded-lg border border-border p-8 shadow-subtle max-w-lg mx-auto">
              <div className="w-12 h-12 bg-red-500/10 text-red-600 dark:text-red-400 rounded-sm flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-normal text-primary mb-2">
                No fue posible cargar el catálogo
              </h3>
              <p className="text-secondary text-sm mb-6 leading-relaxed font-sans font-normal">
                {error}
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-md px-6 py-2.5 bg-accent hover:bg-accent-hover text-accent-fg font-sans font-medium text-xs tracking-wide uppercase transition shadow-subtle"
              >
                Reintentar
              </button>
            </div>
          ) : isLoading ? (
            /* Estado de Carga (Skeletons Bento) */
            <SpacesCatalogSkeleton />
          ) : filteredSpaces.length === 0 ? (
            /* Estado Vacío */
            <div className="text-center py-20 bg-surface rounded-lg border border-border p-8 shadow-subtle max-w-lg mx-auto">
              <div className="w-12 h-12 bg-muted text-accent rounded-sm flex items-center justify-center mx-auto mb-4 border border-border">
                <Building2 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-normal text-primary mb-2">
                Sin resultados coincidentes
              </h3>
              <p className="text-secondary text-sm mb-6 leading-relaxed font-sans font-normal">
                No encontramos espacios que coincidan con tus criterios de búsqueda actuales.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-md px-6 py-2.5 bg-accent hover:bg-accent-hover text-accent-fg font-sans font-medium text-xs tracking-wide uppercase transition shadow-subtle"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ver todos los espacios</span>
              </button>
            </div>
          ) : (
            /* Grilla Bento Asimétrica Determinista (Sin huecos raros) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredSpaces.map((space, index) => {
                // Patrón determinista repetible de 4 posiciones:
                // index % 4 === 0 -> wide (2 cols en md y lg)
                // index % 4 === 1 -> normal (1 col en md y lg)
                // index % 4 === 2 -> normal (1 col en md y lg)
                // index % 4 === 3 -> wide (2 cols en md y lg)
                //
                // Matemáticas de columnas:
                // Móvil (1 col): [1, 1, 1, 1] -> 0 huecos
                // Tablet (2 cols): [2], [1+1], [2] -> filas de 2 cols exactas
                // Desktop (3 cols): [2+1], [1+2] -> filas de 3 cols exactas
                const isWide = index % 4 === 0 || index % 4 === 3;
                const bentoGridClasses = isWide
                  ? 'col-span-1 md:col-span-2 lg:col-span-2'
                  : 'col-span-1 md:col-span-1 lg:col-span-1';
                const variant: 'normal' | 'wide' = isWide ? 'wide' : 'normal';

                return (
                  <div key={space.id} className={bentoGridClasses}>
                    <SpaceCard
                      id={space.id}
                      name={space.name}
                      description={space.description}
                      imageUrl={space.imageUrl}
                      pricePerHour={Number(space.pricePerHour)}
                      isActive={space.isActive}
                      variant={variant}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* SECCIÓN 3: Beneficios y Garantías de Reserva (Fondo Blanco / Superficie) */}
      <section className="py-24 sm:py-32 bg-surface border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-12">
            <p className="text-xs font-sans uppercase tracking-widest text-secondary font-medium mb-2">
              Compromiso CoSpace
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-normal text-primary tracking-tight">
              Una experiencia de reserva diseñada sin fricciones
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-border bg-background shadow-subtle">
              <div className="w-9 h-9 rounded-sm bg-accent-subtle text-accent flex items-center justify-center mb-4">
                <KeyRound className="w-4 h-4 text-accent" />
              </div>
              <h3 className="font-heading text-lg font-normal text-primary mb-1.5">
                Acceso Digital Inmediato
              </h3>
              <p className="text-secondary text-xs sm:text-sm leading-relaxed font-sans font-normal">
                Tras confirmar tu reserva, recibes acceso directo y validado para ingresar a tu espacio sin filas ni recepciones lentas.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-background shadow-subtle">
              <div className="w-9 h-9 rounded-sm bg-accent-subtle text-accent flex items-center justify-center mb-4">
                <ShieldCheck className="w-4 h-4 text-accent" />
              </div>
              <h3 className="font-heading text-lg font-normal text-primary mb-1.5">
                Cancelación Flexible
              </h3>
              <p className="text-secondary text-xs sm:text-sm leading-relaxed font-sans font-normal">
                Modifica o cancela tu reserva hasta con 2 horas de anticipación desde tu panel de usuario sin penalizaciones.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-background shadow-subtle">
              <div className="w-9 h-9 rounded-sm bg-accent-subtle text-accent flex items-center justify-center mb-4">
                <ReceiptText className="w-4 h-4 text-accent" />
              </div>
              <h3 className="font-heading text-lg font-normal text-primary mb-1.5">
                Tarifas por Hora Exacta
              </h3>
              <p className="text-secondary text-xs sm:text-sm leading-relaxed font-sans font-normal">
                Facturación transparente y calculada en estricto apego a las horas reservadas, con confirmación fiscal lista para exportar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: Banner con Acento Verde Bosque */}
      <section className="py-20 sm:py-24 bg-accent text-accent-fg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center sm:text-left">
          <div>
            <h2 className="font-heading text-2xl sm:text-4xl font-normal tracking-tight mb-2">
              ¿Requieres un espacio exclusivo para tu equipo?
            </h2>
            <p className="opacity-90 text-sm sm:text-base max-w-xl font-sans">
              Configuramos jornadas empresariales personalizadas con soporte técnico y catering dedicado.
            </p>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-md px-7 py-3.5 bg-surface text-primary hover:bg-muted font-sans font-semibold text-xs tracking-wide uppercase transition shadow-card"
          >
            Explorar Espacios Activos
          </button>
        </div>
      </section>
    </div>
  );
}

export default SpacesCatalogView;
