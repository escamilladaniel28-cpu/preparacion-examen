export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'BidHub Test',
  description: 'Test Arsenal',
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
