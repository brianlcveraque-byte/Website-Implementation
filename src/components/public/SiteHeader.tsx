import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Sized for brand presence rather than to tuck out of the way — the
            logo is the largest thing in the header on purpose. Width is doubled
            alongside height so the intrinsic ratio still matches what is
            rendered, otherwise Next serves an image half the resolution it
            needs and it looks soft on retina screens. */}
        <Link href="/" className="shrink-0">
          <Image
            src="/brand/logo-light.png"
            alt="Strategnosis Solutions OPC"
            width={320}
            height={134}
            className="h-12 w-auto sm:h-16"
            priority
          />
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
