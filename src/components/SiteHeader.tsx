import Link from "next/link";
import { getSiteSettings } from "@/lib/siteSettings";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/stream", label: "Stream" },
  { href: "/galeria", label: "Galería" },
  { href: "/comisiones", label: "Comisiones" },
];

export default async function SiteHeader() {
  const settings = await getSiteSettings();
  return (
    <header className="site-header">
      <div className="container-page header-inner">
        <Link href="/" className="logo" aria-label={`${settings.brand}, inicio`}>
          {settings.brand}<span>✦</span>
        </Link>
        <nav className="main-nav" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <Link href="/comisiones#solicitar" className="talk-bubble">Pedir comisión ♡</Link>
      </div>
    </header>
  );
}
