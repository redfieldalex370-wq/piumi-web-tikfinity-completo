import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { DEFAULT_TERMS_CONTENT } from "@/lib/defaultTerms";

export interface PublishedTerms {
  id: string | null;
  version: string;
  title: string;
  content: string;
  publishedAt: string | null;
}

export async function getPublishedTerms(): Promise<PublishedTerms> {
  try {
    const { data, error } = await getSupabaseServerClient()
      .from("terms_versions")
      .select("id,version,title,content,published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) throw error;
    return {
      id: data.id,
      version: data.version,
      title: data.title,
      content: data.content,
      publishedAt: data.published_at,
    };
  } catch {
    return { id: null, version: "v1", title: "Términos de servicio", content: DEFAULT_TERMS_CONTENT, publishedAt: null };
  }
}

export async function getSiteContent(key: string): Promise<string> {
  if (key !== "terms") return "";
  return (await getPublishedTerms()).content;
}

export const CONTENT_KEYS = { terms: "terms" } as const;
