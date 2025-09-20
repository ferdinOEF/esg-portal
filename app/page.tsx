// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative z-10">
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-[color:var(--text-1)] mb-4">
          Welcome to the ESG Portal
        </h1>
        <p className="max-w-2xl mx-auto text-[color:var(--text-2)] text-base sm:text-lg mb-12">
          Track ESG compliance across global and Indian frameworks, manage MSME profiles, 
          and unlock advanced tools for compliance and reporting.
        </p>

        {/* Main actions */}
        <div className="grid sm:grid-cols-3 gap-6">
          <Link
            href="/companies"
            className="rounded-2xl border border-[color:var(--border-1)] bg-[color:var(--glass)] 
                       backdrop-blur p-6 text-left hover:shadow-glow transition-all"
          >
            <h3 className="text-lg font-semibold text-[color:var(--text-1)] mb-2">Companies</h3>
            <p className="text-sm text-[color:var(--text-2)]">
              Add and manage MSME profiles for compliance tracking.
            </p>
          </Link>

          <Link
            href="/schemes"
            className="rounded-2xl border border-[color:var(--border-1)] bg-[color:var(--glass)] 
                       backdrop-blur p-6 text-left hover:shadow-glow transition-all"
          >
            <h3 className="text-lg font-semibold text-[color:var(--text-1)] mb-2">Repository</h3>
            <p className="text-sm text-[color:var(--text-2)]">
              Browse schemes, certifications, and frameworks in one place.
            </p>
          </Link>

          <Link
            href="/godmode"
            className="rounded-2xl border border-[color:var(--border-1)] bg-[color:var(--glass)] 
                       backdrop-blur p-6 text-left hover:shadow-glow transition-all"
          >
            <h3 className="text-lg font-semibold text-[color:var(--text-1)] mb-2">GodMode</h3>
            <p className="text-sm text-[color:var(--text-2)]">
              Access advanced admin and analytics tools for ESG operations.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
