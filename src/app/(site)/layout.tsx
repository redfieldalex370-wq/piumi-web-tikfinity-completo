import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import SocialLinks from "@/components/SocialLinks";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <aside className="social-rail" aria-label="Sígueme">
        <p>Sígueme ♡</p>
        <SocialLinks />
      </aside>
      <aside className="mobile-social-dock" aria-label="Redes sociales">
        <SocialLinks compact />
      </aside>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
