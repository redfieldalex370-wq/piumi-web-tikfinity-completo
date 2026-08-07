import { getSiteSettings } from "@/lib/siteSettings";

export default async function SocialLinks({ compact = false }: { compact?: boolean }) {
  const { socials } = await getSiteSettings();
  return (
    <nav className={compact ? "social-links compact" : "social-links"} aria-label="Redes sociales">
      {socials.map((social) => (
        <a key={`${social.name}-${social.href}`} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`Visitar ${social.label || social.name}`}>
          <span className="social-icon" aria-hidden="true">{social.icon || "✦"}</span>
          <span className="social-label">{social.label || social.name}</span>
        </a>
      ))}
    </nav>
  );
}
