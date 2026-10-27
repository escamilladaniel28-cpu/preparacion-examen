'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/context/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-950 text-gray-400 py-8 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-white font-semibold">
          <span>🏢</span> {t('footerCopyright')}
        </div>
        <div className="flex space-x-6 text-xs sm:text-sm">
          <Link href="/spaces" className="hover:text-white transition">
            {t('footerSpaces')}
          </Link>
          <Link href="/login" className="hover:text-white transition">
            {t('footerAccess')}
          </Link>
          <Link href="/dashboard" className="hover:text-white transition">
            {t('footerDashboard')}
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
