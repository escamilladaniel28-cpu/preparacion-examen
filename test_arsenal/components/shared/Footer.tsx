'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { useLanguage } from '@/components/context/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-zinc-950 text-zinc-400 py-10 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-zinc-200 font-medium">
          <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Building2 className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span>{t('footerCopyright')}</span>
        </div>
        <div className="flex space-x-6 text-xs sm:text-sm">
          <Link href="/spaces" className="hover:text-amber-400 transition">
            {t('footerSpaces')}
          </Link>
          <Link href="/login" className="hover:text-amber-400 transition">
            {t('footerAccess')}
          </Link>
          <Link href="/dashboard" className="hover:text-amber-400 transition">
            {t('footerDashboard')}
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
