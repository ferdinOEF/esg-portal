// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "ESG Portal",
  description: "MSME ESG Portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-night text-[color:var(--text-1)] antialiased">
        {/* Global top nav */}
        <NavBar />

        {/* Page content wrapper */}
        <main className="relative z-10 pt-6 pb-16">
          {children}
        </main>

        {/* Optional footer (subtle) */}
        <footer className="border-t border-[color:var(--border-1)]/60">
          <div className="max-w-7xl mx-auto px-4 py-6 text-xs text-[color:var(--text-2)]">
            © {new Date().getFullYear()} ESG Portal · Built for MSMEs
          </div>
        </footer>
      </body>
    </html>
  );
}
