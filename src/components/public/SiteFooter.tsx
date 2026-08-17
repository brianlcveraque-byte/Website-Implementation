import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center">
        <Image
          src="/brand/logo-dark.png"
          alt="Strategnosis Solutions OPC"
          width={320}
          height={133}
          className="h-14 w-auto sm:h-16"
        />
        <nav className="flex flex-wrap justify-center gap-4 text-xs text-slate-400">
          <Link href="/services" className="hover:text-slate-200">Services</Link>
          <Link href="/about" className="hover:text-slate-200">About</Link>
          <Link href="/#contact" className="hover:text-slate-200">Contact</Link>
          <Link href="/privacy" className="hover:text-slate-200">Privacy notice</Link>
        </nav>
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} Strategnosis Solutions OPC.</p>
      </div>
    </footer>
  );
}
