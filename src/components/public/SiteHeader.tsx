import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/">
          <Image src="/brand/logo-light.png" alt="Strategnosis Solutions OPC" width={160} height={67} className="h-9 w-auto" priority />
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/services" className="hidden font-medium text-slate-600 hover:text-slate-900 sm:inline">Services</Link>
          <Link href="/toolkits" className="hidden font-medium text-slate-600 hover:text-slate-900 sm:inline">Toolkits</Link>
          <Link href="/about" className="hidden font-medium text-slate-600 hover:text-slate-900 sm:inline">About</Link>
          <Link href="/#contact" className="hidden font-medium text-slate-600 hover:text-slate-900 sm:inline">Contact</Link>
          <Link href="/login" className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-indigo-500">
            Team sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
