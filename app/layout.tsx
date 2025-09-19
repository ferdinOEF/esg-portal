import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "ESG Portal",
  description: "MSME ESG compliance portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
            <Link href="/" className="font-semibold">ESG Portal</Link>
            <nav className="space-x-4 text-sm">
              <Link href="/companies" className="hover:underline">Companies</Link>
              <Link href="/frameworks" className="hover:underline">Frameworks</Link>
              <Link href="/evidence" className="hover:underline">Evidence</Link>
<Link href="/schemes" className="hover:underline">Schemes</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4">{children}</main>
        <footer className="text-center text-xs text-gray-500 py-6">© {new Date().getFullYear()} ESG Portal</footer>
      </body>
    </html>
  );
}
