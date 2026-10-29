import { getSession } from '@/lib/auth';
import { User, Shield, Mail, Calendar, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getSession();
  const userName = typeof session?.name === 'string' ? session.name : (session?.email ? String(session.email) : 'Usuario');
  const userEmail = session?.email ? String(session.email) : 'usuario@cospace.com';
  const userRole = session?.role ? String(session.role) : 'USER';

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Mi Perfil</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Información general de tu cuenta en CoSpace Luxury Workspace
        </p>
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-8 border-b border-white/10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-black flex items-center justify-center font-black text-3xl shadow-xl shadow-amber-500/20">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{userName}</h2>
              <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {userRole}
              </span>
            </div>
            <p className="text-zinc-400 text-sm mt-1">{userEmail}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-amber-400 border border-white/10">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-semibold">Correo Electrónico</p>
              <p className="text-sm font-medium text-white">{userEmail}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-amber-400 border border-white/10">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-semibold">Rol del Sistema</p>
              <p className="text-sm font-medium text-white">{userRole === 'ADMIN' ? 'Administrador' : 'Cliente Miembro'}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-emerald-400 border border-white/10">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-semibold">Estado de Cuenta</p>
              <p className="text-sm font-medium text-emerald-400">Activo y Verificado</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-amber-400 border border-white/10">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-semibold">Membresía</p>
              <p className="text-sm font-medium text-white">Luxury Access</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-4">
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition"
          >
            Ir al Dashboard
          </Link>
          <Link
            href="/spaces"
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 font-semibold text-xs px-5 py-2.5 rounded-xl transition"
          >
            Explorar Espacios
          </Link>
        </div>
      </div>
    </div>
  );
}
