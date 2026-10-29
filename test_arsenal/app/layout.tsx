import { LanguageProvider } from '@/components/context/LanguageContext';

export const metadata = {
  title: 'CoSpace — Luxury Workspace & Private Suites',
  description: 'Reserva salas de juntas, escritorios y suites privadas de coworking de alto rendimiento',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="min-h-screen bg-[#09050D] text-zinc-50 antialiased selection:bg-purple-600 selection:text-white">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
