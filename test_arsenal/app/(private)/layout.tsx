import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { Footer } from '@/components/shared/Footer';
import { LogoutButton } from '@/components/shared/LogoutButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const userName = String(session?.name || session?.email || 'Mi Cuenta');

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <header className="bg-zinc-950/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6 sm:space-x-8">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5 hover:text-amber-400 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-black flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                <Building2 className="w-5 h-5 text-black" />
              </div>
              <span className="tracking-wider">CoSpace</span>
            </Link>
            <nav className="flex space-x-4 text-sm font-medium">
              <Link href="/spaces" className="text-zinc-400 hover:text-white transition">
                Catálogo
              </Link>
              <Link href="/dashboard" className="text-amber-400 font-semibold border-b-2 border-amber-500 pb-1">
                Mi Panel
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="text-xs sm:text-sm font-medium text-zinc-300 bg-zinc-900/80 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
              <span className="max-w-[140px] sm:max-w-[200px] truncate">{userName}</span>
            </div>
            <LogoutButton redirectTo="/login" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      <Footer />
    </div>
  );
}
