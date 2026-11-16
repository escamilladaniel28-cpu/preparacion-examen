import { Fraunces, Manrope } from 'next/font/google';
import { LanguageProvider } from '@/components/context/LanguageContext';
import { ThemeProvider } from '@/components/context/ThemeContext';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'Workia — Plataforma de Gestión y Reserva de Espacios',
  description: 'Reserva salas de juntas, escritorios y suites privadas de coworking de alto rendimiento',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${fraunces.variable} ${manrope.variable} overflow-x-hidden`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('workia_theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind = window.tailwind || {};
              tailwind.config = {
                darkMode: 'class',
                theme: {
                  extend: {
                    colors: {
                      background: 'var(--color-background)',
                      surface: 'var(--color-surface)',
                      muted: 'var(--color-muted)',
                      primary: 'var(--color-text-primary)',
                      secondary: 'var(--color-text-secondary)',
                      border: 'var(--color-border)',
                      accent: {
                        DEFAULT: 'var(--color-accent)',
                        hover: 'var(--color-accent-hover)',
                        fg: 'var(--color-accent-fg)',
                        subtle: 'var(--color-accent-subtle)',
                        border: 'var(--color-accent-border)',
                      },
                    },
                    fontFamily: {
                      heading: ['var(--font-heading)', 'Fraunces', 'Playfair Display', 'Georgia', 'serif'],
                      sans: ['var(--font-sans)', 'Manrope', 'system-ui', 'sans-serif'],
                    },
                    boxShadow: {
                      subtle: 'var(--shadow-sm)',
                      card: 'var(--shadow-md)',
                      elevated: 'var(--shadow-lg)',
                    },
                    borderRadius: {
                      sm: 'var(--radius-sm)',
                      md: 'var(--radius-md)',
                      lg: 'var(--radius-lg)',
                      xl: 'var(--radius-xl)',
                    },
                  },
                },
              };
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                /* Modo claro (por defecto) */
                --color-background: #F7F5F0;
                --color-surface: #FFFFFF;
                --color-muted: #EFECE6;
                --color-text-primary: #1A1A1A;
                --color-text-secondary: #5C5C57;
                --color-border: #E7E4DC;
                --color-border-strong: #D5D1C7;
                --color-accent: #1E3A2F;
                --color-accent-hover: #142720;
                --color-accent-fg: #FFFFFF;
                --color-accent-subtle: #E8EFEA;
                --color-accent-border: #C2D6CA;

                --shadow-sm: 0 1px 3px rgba(30, 58, 47, 0.05);
                --shadow-md: 0 4px 16px rgba(30, 58, 47, 0.06);
                --shadow-lg: 0 12px 32px rgba(30, 58, 47, 0.08);

                --radius-sm: 6px;
                --radius-md: 8px;
                --radius-lg: 12px;
                --radius-xl: 16px;
              }

              .dark {
                /* Modo oscuro (grises cálidos, nunca negro puro) */
                --color-background: #161513;
                --color-surface: #1F1D1A;
                --color-muted: #282522;
                --color-text-primary: #EDEAE3;
                --color-text-secondary: #A8A49C;
                --color-border: #312E2A;
                --color-border-strong: #45413B;
                --color-accent: #3D6B57;
                --color-accent-hover: #4E816B;
                --color-accent-fg: #FFFFFF;
                --color-accent-subtle: #212D26;
                --color-accent-border: #2E4638;

                --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.25);
                --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.35);
                --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.45);
              }

              /* Tipografía global y escala */
              body {
                font-family: var(--font-sans), 'Manrope', system-ui, -apple-system, sans-serif !important;
                font-size: 16px;
                line-height: 1.6;
                background-color: var(--color-background);
                color: var(--color-text-primary);
                transition: background-color 0.2s ease, color 0.2s ease;
              }

              h1, h2, h3, h4, h5, h6 {
                font-family: var(--font-heading), 'Fraunces', 'Playfair Display', Georgia, serif !important;
                letter-spacing: -0.025em;
                line-height: 1.25;
              }

              /* Mapeo universal de fondos a tokens */
              .bg-\[\#0B0F19\],
              .bg-\[\#0B0F19\]\/80,
              .bg-\[\#0B0F19\]\/90,
              .bg-\[\#0B0F19\]\/95 {
                background-color: var(--color-background) !important;
              }

              .bg-\[\#131A2B\],
              .bg-\[\#131A2B\]\/90,
              .bg-\[\#131A2B\]\/80 {
                background-color: var(--color-surface) !important;
              }

              /* Mapeo universal de textos a tokens WCAG AA */
              .text-white {
                color: var(--color-text-primary) !important;
              }

              .text-slate-200,
              .text-slate-300,
              .text-slate-400,
              .text-slate-500 {
                color: var(--color-text-secondary) !important;
              }

              /* Mapeo de bordes */
              .border-white\/5,
              .border-white\/10 {
                border-color: var(--color-border) !important;
              }

              /* ELIMINACIÓN DE GRADIENTES MORADO-AZUL: Reemplazo por Acento Único Verde Bosque */
              .bg-gradient-to-r.from-blue-500.to-purple-600,
              .bg-gradient-to-r.from-blue-600.to-purple-700,
              [class*="from-blue-500"][class*="to-purple-600"] {
                background-image: none !important;
                background-color: var(--color-accent) !important;
                color: var(--color-accent-fg) !important;
              }

              .bg-gradient-to-r.from-blue-500.to-purple-600:hover,
              .bg-gradient-to-r.from-blue-600.to-purple-700:hover,
              [class*="from-blue-500"][class*="to-purple-600"]:hover {
                background-color: var(--color-accent-hover) !important;
              }

              /* Textos con gradiente eliminados: acento limpio */
              .bg-clip-text.text-transparent {
                background-image: none !important;
                -webkit-text-fill-color: initial !important;
                color: var(--color-accent) !important;
              }

              /* ELIMINACIÓN DE GLOWS / NEONES */
              .blur-\[140px\] {
                display: none !important;
              }

              [class*="shadow-purple-"],
              [class*="shadow-\[0_0_"] {
                box-shadow: var(--shadow-md) !important;
              }

              /* Primitivos: Botones consistentes */
              button:not(.text-slate-400):not([aria-label]),
              a[class*="rounded-full"][class*="bg-gradient-to-r"] {
                box-shadow: var(--shadow-sm) !important;
                border-radius: var(--radius-md) !important;
              }

              /* Tarjetas con radio jerárquico */
              .rounded-2xl {
                border-radius: var(--radius-lg) !important;
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased selection:bg-accent selection:text-white overflow-x-hidden w-full max-w-full">
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
