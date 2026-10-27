import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
      <div className="mb-6 text-center">
        <Link
          href="/"
          className="text-3xl font-extrabold text-indigo-600 flex items-center justify-center gap-2 hover:opacity-90 transition"
        >
          <span>🏢</span> CoSpace
        </Link>
        <p className="text-xs text-gray-500 mt-1">Tu espacio ideal de coworking</p>
      </div>
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-gray-200">
        {children}
      </div>
    </div>
  );
}
