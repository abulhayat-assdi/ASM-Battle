import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // The login page renders inside this layout too; it has no session yet.
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-slate-900">
              ⚔️ Team Battle Admin
            </Link>
            <nav className="hidden gap-1 sm:flex">
              <NavLink href="/admin">Dashboard</NavLink>
              <NavLink href="/admin/submissions">Submissions</NavLink>
              <NavLink href="/admin/report">Final Report</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">
              {session.name} ·{" "}
              <span className="font-medium text-slate-700">{session.role}</span>
            </span>
            <LogoutButton />
          </div>
        </div>
        <nav className="flex gap-1 border-t border-slate-100 px-4 py-2 sm:hidden">
          <NavLink href="/admin">Dashboard</NavLink>
          <NavLink href="/admin/submissions">Submissions</NavLink>
          <NavLink href="/admin/report">Report</NavLink>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}
