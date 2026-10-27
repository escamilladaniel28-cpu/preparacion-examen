export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'CoSpace — Espacios de Coworking',
  description: 'Reserva salas de juntas, escritorios y cabinas de trabajo por hora',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
