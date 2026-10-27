import Link from 'next/link';
import { Building2 } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4">
      <div className="mb-6 text-center">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-slate-900 flex items-center justify-center gap-2 hover:text-indigo-600 transition"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <span>CoSpace</span>
        </Link>
        <p className="text-xs text-slate-500 mt-1">Plataforma de reservas de espacios de trabajo</p>
      </div>
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        {children}
      </div>
    </div>
  );
}
