'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Algo salió mal</h2>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
