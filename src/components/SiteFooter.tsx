import Link from "next/link";
import { getSiteSettings } from "@/lib/siteSettings";
import SocialLinks from "@/components/SocialLinks";

export default async function SiteFooter() {
  const settings = await getSiteSettings();
  return (
    <footer className="site-footer">
      <div className="container-page footer-grid">
        <div>
          <p className="footer-logo">{settings.brand}<span>✦</span></p>
          <p>{settings.footerText}</p>
        </div>
        <SocialLinks compact />
        <div className="footer-note">
          <p>{settings.footerThanks}</p>
          <p><Link href="/terminos">Términos</Link> · <Link href="/seguimiento">Mi comisión</Link></p>
        </div>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} {settings.brand}. Todos los derechos reservados.</p>
    </footer>
  );
}
