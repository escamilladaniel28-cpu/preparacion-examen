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
    <footer className="bg-surface text-secondary py-12 border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6 text-sm">
        <div className="flex items-center gap-2.5 text-primary font-medium font-sans">
          <div className="w-7 h-7 rounded-sm bg-accent-subtle text-accent flex items-center justify-center border border-border">
            <Building2 className="w-4 h-4 text-accent" />
          </div>
          <span className="font-heading text-base">{t('footerCopyright')}</span>
        </div>
        <div className="flex items-center space-x-6 text-xs sm:text-sm font-sans">
          <Link href="/" className="hover:text-primary transition font-medium text-secondary">
            Inicio
          </Link>
          <Link href="/spaces" className="hover:text-primary transition font-medium text-secondary">
            Catálogo
          </Link>
          {isAdmin && (
            <Link
              href="/admin/spaces"
              className="text-accent hover:text-accent-hover transition font-medium inline-flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Panel Admin</span>
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
