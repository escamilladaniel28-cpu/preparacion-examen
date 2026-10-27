'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'es' | 'en';

export const translations = {
  // Navbar
  logo: { es: 'CoSpace', en: 'CoSpace' },
  catalog: { es: 'Espacios', en: 'Spaces' },
  login: { es: 'Iniciar Sesión', en: 'Log In' },
  register: { es: 'Crear Cuenta', en: 'Sign Up' },
  dashboard: { es: 'Mi Panel', en: 'Dashboard' },
  logout: { es: 'Cerrar Sesión', en: 'Sign Out' },
  switchLang: { es: 'EN', en: 'ES' },

  // Home Hero
  heroBadge: {
    es: 'Plataforma de reservas de espacios de trabajo',
    en: 'Workspace reservation platform',
  },
  heroTitle: {
    es: 'Reserva el espacio de trabajo que necesitas por hora',
    en: 'Book the workspace you need by the hour',
  },
  heroSubtitle: {
    es: 'Salas de juntas, oficinas privadas y estaciones individuales con confirmación inmediata.',
    en: 'Meeting rooms, private offices, and individual desks with instant confirmation.',
  },
  heroExploreBtn: { es: 'Ver Espacios Disponibles', en: 'View Available Spaces' },
  heroReservationsBtn: { es: 'Mis Reservas', en: 'My Bookings' },

  // Home Features
  feature1Title: { es: 'Horarios flexibles por hora', en: 'Flexible hourly booking' },
  feature1Desc: {
    es: 'Reserva el tiempo exacto que necesitas, de 1 a 4 horas entre las 07:00 y las 21:00 UTC con confirmación inmediata.',
    en: 'Book the exact duration you need, from 1 to 4 hours between 07:00 and 21:00 UTC with instant confirmation.',
  },
  feature2Title: { es: 'Disponibilidad en tiempo real', en: 'Real-time availability' },
  feature2Desc: {
    es: 'Evita reservas duplicadas con nuestro sistema de bloqueo inmediato.',
    en: 'Prevent duplicate reservations with our immediate slot locking system.',
  },
  feature3Title: { es: 'Tarifas transparentes', en: 'Transparent pricing' },
  feature3Desc: {
    es: 'Calculadas por hora exacta sin cargos adicionales ni costos ocultos.',
    en: 'Calculated strictly per hour with no additional charges or hidden fees.',
  },
  featuredHeading: { es: 'Espacios Destacados', en: 'Featured Spaces' },
  featuredSubheading: {
    es: 'Selecciona una ubicación y confirma tu reserva al instante',
    en: 'Select a location and confirm your booking instantly',
  },
  viewAllSpaces: { es: 'Ver todos los espacios', en: 'View all spaces' },

  // Space Card & Catalog
  perHour: { es: '/h', en: '/hr' },
  bookNow: { es: 'Ver detalles y reservar', en: 'View details & book' },
  notAvailable: { es: 'No disponible', en: 'Unavailable' },
  catalogTitle: { es: 'Catálogo de Espacios', en: 'Spaces Catalog' },
  catalogSubtitle: {
    es: 'Explora salas y oficinas disponibles con reserva inmediata',
    en: 'Explore available rooms and offices with instant booking',
  },
  totalActive: { es: 'Espacios activos:', en: 'Active spaces:' },

  // Footer
  footerCopyright: {
    es: 'CoSpace — Plataforma de Coworking',
    en: 'CoSpace — Coworking Platform',
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
