import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { Footer } from '@/components/shared/Footer';
import { LogoutButton } from '@/components/shared/LogoutButton';

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const userName = String(session?.name || session?.email || 'Mi Cuenta');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-xl font-bold text-indigo-600 flex items-center gap-2">
              <span>🏢</span> CoSpace
            </Link>
            <nav className="flex space-x-4 text-sm font-medium text-gray-600">
              <Link href="/spaces" className="hover:text-indigo-600 transition">
                Catálogo
              </Link>
              <Link href="/dashboard" className="text-indigo-600 font-semibold">
                Mi Panel
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
              <span className="max-w-[150px] truncate">{userName}</span>
            </div>
            <Link
              href="/dashboard"
              className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded font-medium transition"
            >
              Dashboard
            </Link>
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
