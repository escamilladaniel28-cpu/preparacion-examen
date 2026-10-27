'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'es' | 'en';

export const translations = {
  // Navbar
  logo: { es: 'CoSpace', en: 'CoSpace' },
  catalog: { es: 'Catálogo de Espacios', en: 'Explore Spaces' },
  login: { es: 'Iniciar Sesión', en: 'Login' },
  register: { es: 'Crear Cuenta', en: 'Sign Up' },
  dashboard: { es: 'Mi Panel', en: 'Dashboard' },
  logout: { es: 'Cerrar Sesión', en: 'Sign Out' },
  switchLang: { es: 'EN', en: 'ES' },

  // Home Hero
  heroBadge: {
    es: '✨ Espacios modernos para equipos ágiles',
    en: '✨ Modern workspaces for agile teams',
  },
  heroTitle: {
    es: 'Reserva el espacio de trabajo perfecto por hora',
    en: 'Book the perfect workspace by the hour',
  },
  heroSubtitle: {
    es: 'Salas de juntas, oficinas privadas y cabinas insonorizadas diseñadas para maximizar tu concentración y productividad.',
    en: 'Meeting rooms, private offices, and soundproof pods designed to maximize your focus and productivity.',
  },
  heroExploreBtn: { es: 'Explorar Catálogo de Espacios', en: 'Explore Spaces Catalog' },
  heroReservationsBtn: { es: 'Mis Reservas', en: 'My Bookings' },

  // Home Features
  feature1Title: { es: 'Horas Exactas y Flexibles', en: 'Exact and Flexible Hours' },
  feature1Desc: {
    es: 'Reserva de 1 a 4 horas consecutivas entre las 07:00 y las 21:00 con confirmación instantánea.',
    en: 'Book 1 to 4 consecutive hours between 07:00 and 21:00 with instant confirmation.',
  },
  feature2Title: { es: 'Sin Solapamientos', en: 'Zero Overlaps' },
  feature2Desc: {
    es: 'Motor transaccional ACID en PostgreSQL que garantiza disponibilidad exclusiva en tiempo real.',
    en: 'ACID transactional engine in PostgreSQL guaranteeing exclusive real-time availability.',
  },
  feature3Title: { es: 'Tarifa Transparente', en: 'Transparent Pricing' },
  feature3Desc: {
    es: 'Precios calculados estrictamente por hora en el servidor, sin costos ocultos ni sorpresas.',
    en: 'Prices strictly calculated per hour on the server, with no hidden fees or surprises.',
  },
  featuredHeading: { es: 'Espacios Destacados', en: 'Featured Spaces' },
  featuredSubheading: {
    es: 'Conoce los espacios más solicitados listos para tus sesiones de trabajo',
    en: 'Discover the most requested workspaces ready for your work sessions',
  },
  viewAllSpaces: { es: 'Ver todos los espacios →', en: 'View all spaces →' },

  // Space Card & Catalog
  perHour: { es: '/hora', en: '/hour' },
  bookNow: { es: 'Ver detalles y reservar', en: 'View details & book' },
  notAvailable: { es: 'No disponible', en: 'Unavailable' },
  catalogTitle: { es: 'Catálogo de Espacios', en: 'Spaces Catalog' },
  catalogSubtitle: {
    es: 'Explora y reserva salas disponibles con confirmación inmediata',
    en: 'Explore and reserve available rooms with instant confirmation',
  },
  totalActive: { es: 'Total de espacios activos:', en: 'Total active spaces:' },

  // Footer
  footerCopyright: {
    es: 'CoSpace © 2026 — Plataforma de Coworking',
    en: 'CoSpace © 2026 — Coworking Platform',
  },
  footerSpaces: { es: 'Espacios', en: 'Spaces' },
  footerAccess: { es: 'Acceso', en: 'Sign In' },
  footerDashboard: { es: 'Mi Panel', en: 'Dashboard' },
};

export type TranslationKey = keyof typeof translations;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('es');

  useEffect(() => {
    const saved = localStorage.getItem('cospace_lang') as Language;
    if (saved === 'es' || saved === 'en') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('cospace_lang', newLang);
  };

  const toggleLang = () => {
    const nextLang = lang === 'es' ? 'en' : 'es';
    setLang(nextLang);
  };

  const t = (key: TranslationKey): string => {
    const item = translations[key];
    if (!item) return key;
    return item[lang] || item.es;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'es' as Language,
      setLang: () => {},
      toggleLang: () => {},
      t: (key: TranslationKey) => translations[key]?.es || key,
    };
  }
  return context;
}
