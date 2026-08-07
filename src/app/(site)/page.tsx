import Image from "next/image";
import Link from "next/link";
import { getPortfolioItems } from "@/lib/portfolioData";
import { getSiteSettings } from "@/lib/siteSettings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [portfolio, settings] = await Promise.all([getPortfolioItems(), getSiteSettings()]);
  const hero = portfolio[0];
  const highlights = portfolio.slice(0, 4);

  return (
    <div>
      <section className="container-page home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">{settings.heroKicker}</p>
          <h1>{settings.heroTitle}<span>✦</span></h1>
          <p className="home-hero-subtitle">{settings.heroSubtitle}</p>
          <p className="home-hero-intro">{settings.heroIntro}</p>
          <div className="hero-actions">
            <Link href="/stream" className="btn-primary">{settings.primaryCta}</Link>
            <Link href="/comisiones" className="btn-secondary">{settings.secondaryCta}</Link>
          </div>
          <div className="hero-socials"><p>Encuéntrame también en:</p><SocialStrip /></div>
        </div>
        <div className="home-hero-art">
          <div className="floating-note">¡Bienvenido! ♡</div>
          <Image src={hero?.image_url || "/gallery/full-body.webp"} alt={hero?.title || "Piumi saludando"} fill priority unoptimized className="object-cover" />
        </div>
      </section>

      <section className="soft-section" id="horario">
        <div className="container-page schedule-grid">
          <div>
            <p className="eyebrow">NOS VEMOS EN VIVO</p>
            <h2>{settings.scheduleTitle}</h2>
            <p>{settings.scheduleNote}</p>
            <Link href="/stream" className="text-link">Ver comunidad del stream →</Link>
          </div>
          <div className="schedule-image">
            <Image src={settings.scheduleImageUrl || "/schedule-placeholder.svg"} alt={settings.scheduleTitle} fill unoptimized className="object-contain" />
          </div>
        </div>
      </section>

      <section className="container-page home-section" id="quienes-somos">
        <div className="section-heading"><div><p className="eyebrow">NUESTRO PEQUEÑO UNIVERSO</p><h2>{settings.aboutTitle}</h2></div></div>
        <div className="about-cards">
          <article className="about-main"><h3>Piumi</h3><p>{settings.aboutText}</p></article>
          <article><span>🎥</span><h3>Stream</h3><p>Directos, juegos, charlas y momentos que después viven en la página.</p></article>
          <article><span>🎨</span><h3>Arte</h3><p>Ilustraciones, diseños y comisiones organizadas en una galería con filtros.</p></article>
          <article><span>⌨</span><h3>{settings.teamTitle}</h3><p>{settings.teamText}</p></article>
        </div>
      </section>

      <section className="container-page home-section">
        <div className="section-heading"><div><p className="eyebrow">ÚLTIMAS PIEZAS</p><h2>Galería destacada</h2></div><Link href="/galeria">Ver toda la galería →</Link></div>
        <div className="gallery-preview-grid">
          {highlights.map((item) => (
            <Link href="/galeria" key={item.id} className="gallery-preview-card">
              <div><Image src={item.thumbnail_url || item.image_url} alt={item.title} fill unoptimized className="object-cover" /></div>
              <h3>{item.title}</h3><p>{item.tags.slice(0, 3).join(" · ") || "Ilustración"}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

async function SocialStrip() {
  const settings = await getSiteSettings();
  return <div className="social-strip">{settings.socials.map((social) => <a key={social.href} href={social.href} target="_blank" rel="noreferrer"><span>{social.icon}</span>{social.label}</a>)}</div>;
}
