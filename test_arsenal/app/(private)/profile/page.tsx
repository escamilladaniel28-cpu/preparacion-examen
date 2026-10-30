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
        <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">Mi Perfil</h1>
        <p className="text-slate-300 text-sm mt-1">
          Información general de tu cuenta en CoSpace Workspace
        </p>
      </div>

      <div className="bg-[#131A2B] border border-white/5 hover:border-purple-500/50 rounded-2xl p-6 sm:p-8 shadow-xl transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-8 border-b border-white/5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-purple-500/25">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{userName}</h2>
              <span
                className={`text-xs px-3 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  userRole === 'ADMIN'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm'
                    : 'bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                {userRole}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">{userEmail}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
          <div className="p-4 rounded-xl bg-[#0B0F19]/70 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Correo Electrónico</p>
              <p className="text-sm font-medium text-white">{userEmail}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F19]/70 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 shadow-inner">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Rol del Sistema</p>
              <p className="text-sm font-medium text-white">{userRole === 'ADMIN' ? 'Administrador' : 'Cliente Miembro'}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F19]/70 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Estado de Cuenta</p>
              <p className="text-sm font-medium text-emerald-400">Activo y Verificado</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F19]/70 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Membresía</p>
              <p className="text-sm font-medium text-white">High Performance Suite</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-4">
          <Link
            href="/dashboard"
            className="rounded-full px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all"
          >
            Ir al Dashboard
          </Link>
          <Link
            href="/spaces"
            className="rounded-full px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 font-semibold text-xs transition"
          >
            Explorar Espacios
          </Link>
        </div>
      </div>
    </div>
  );
}
