'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Shield } from 'lucide-react';
import { useLanguage } from '@/components/context/LanguageContext';

export function Footer() {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.user?.role === 'ADMIN') {
            setIsAdmin(true);
          }
        }
      } catch {
        // ignore
      }
    };
    checkRole();
  }, []);

  return (
    <footer className="bg-[#0B0F19] text-slate-400 py-10 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-slate-200 font-medium">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-600/20 flex items-center justify-center border border-white/10">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span>{t('footerCopyright')}</span>
        </div>
        <div className="flex items-center space-x-6 text-xs sm:text-sm">
          <Link href="/" className="hover:text-white transition font-medium text-slate-300">
            Inicio
          </Link>
          <Link href="/spaces" className="hover:text-white transition font-medium text-slate-300">
            Catálogo
          </Link>
          {isAdmin && (
            <Link
              href="/admin/spaces"
              className="text-purple-300 hover:text-white transition font-semibold inline-flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Panel Admin</span>
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
