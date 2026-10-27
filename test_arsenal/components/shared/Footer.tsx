import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-white font-semibold">
          <span>🏢</span> CoSpace © {new Date().getFullYear()} — Plataforma de Coworking
        </div>
        <div className="flex space-x-6">
          <Link href="/spaces" className="hover:text-white transition">
            Espacios
          </Link>
          <Link href="/login" className="hover:text-white transition">
            Acceso
          </Link>
          <Link href="/dashboard" className="hover:text-white transition">
            Mi Panel
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
