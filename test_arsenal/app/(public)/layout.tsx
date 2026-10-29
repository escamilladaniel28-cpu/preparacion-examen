import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const userName =
    session?.name || session?.email
      ? String(session.name || session.email)
      : undefined;
  const userRole = session?.role;

  return (
    <div className="min-h-screen flex flex-col bg-[#09050D] text-zinc-100">
      <Navbar userName={userName} userRole={userRole} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
