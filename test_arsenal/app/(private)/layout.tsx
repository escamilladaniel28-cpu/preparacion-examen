import { getSession } from '@/lib/auth';
import { PrivateNav } from '@/components/shared/PrivateNav';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const userName = typeof session?.name === 'string' ? session.name : (session?.email ? String(session.email) : null);
  const userEmail = session?.email ? String(session.email) : null;
  const userRole = session?.role ? String(session.role) : null;

  return (
    <div className="min-h-screen bg-[#09050D] text-zinc-100 selection:bg-purple-600 selection:text-white">
      {/* Navegación Flotante: Sidebar en Escritorio y Barra Inferior en Móviles */}
      <PrivateNav
        user={{
          name: userName,
          email: userEmail,
          role: userRole,
        }}
      />

      {/* Contenido Principal con margen para acomodar el sidebar */}
      <main className="md:ml-64 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
