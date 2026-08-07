import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface SocialLink {
  name: string;
  label: string;
  icon: string;
  href: string;
}

export interface SiteSettings {
  brand: string;
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  heroIntro: string;
  primaryCta: string;
  secondaryCta: string;
  scheduleTitle: string;
  scheduleImageUrl: string;
  scheduleNote: string;
  aboutTitle: string;
  aboutText: string;
  teamTitle: string;
  teamText: string;
  footerText: string;
  footerThanks: string;
  socials: SocialLink[];
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brand: "Piumi",
  heroKicker: "¡Hola, Piumigo! ♡",
  heroTitle: "Soy Piumi",
  heroSubtitle: "VTuber, ilustradora y creadora de pequeñas aventuras digitales.",
  heroIntro: "Este es mi rincón para compartir streams, arte, proyectos y momentos con la comunidad.",
  primaryCta: "Entrar al Stream",
  secondaryCta: "Ver comisiones",
  scheduleTitle: "Horario de streams",
  scheduleImageUrl: "/schedule-placeholder.svg",
  scheduleNote: "El horario puede cambiar. Revisa mis redes para avisos de último momento.",
  aboutTitle: "Quiénes somos",
  aboutText: "Piumi es un proyecto VTuber construido entre ilustración, streaming, programación y una comunidad que deja corazones por todas partes.",
  teamTitle: "Detrás del proyecto",
  teamText: "Creamos contenido, arte y herramientas para que cada directo tenga algo nuevo que descubrir.",
  footerText: "Streams, arte y código con aroma a algodón de azúcar.",
  footerThanks: "Gracias por ser parte de esta pequeña constelación.",
  socials: [
    { name: "TikTok", label: "TikTok", icon: "♪", href: "https://www.tiktok.com/" },
    { name: "YouTube", label: "YouTube", icon: "▶", href: "https://www.youtube.com/" },
    { name: "Instagram", label: "Instagram", icon: "◎", href: "https://www.instagram.com/" },
    { name: "Discord", label: "Discord", icon: "◉", href: "https://discord.com/" },
  ],
};

function sanitizeSettings(value: unknown): SiteSettings {
  if (!value || typeof value !== "object") return DEFAULT_SITE_SETTINGS;
  const merged = { ...DEFAULT_SITE_SETTINGS, ...(value as Partial<SiteSettings>) };
  merged.socials = Array.isArray(merged.socials)
    ? merged.socials.filter((item) => item && item.name && item.href).slice(0, 12)
    : DEFAULT_SITE_SETTINGS.socials;
  return merged;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await getSupabaseServerClient()
      .from("site_settings")
      .select("content")
      .eq("key", "general")
      .maybeSingle();
    if (error || !data?.content) return DEFAULT_SITE_SETTINGS;
    return sanitizeSettings(data.content);
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export { sanitizeSettings };
