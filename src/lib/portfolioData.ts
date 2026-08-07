import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PLACEHOLDER_COMMISSION_TYPES, PLACEHOLDER_PORTFOLIO_ITEMS } from "@/lib/placeholders";
import type { CommissionType, PortfolioItem, PriceSetting } from "@/types/commission";

type TagRelation = { tags: { name: string; searchable?: boolean; active?: boolean } | null };

export async function getPriceSettings(activeOnly = true): Promise<PriceSetting[]> {
  try {
    let query = getSupabaseServerClient()
      .from("price_settings")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("category", { ascending: true });
    if (activeOnly) query = query.eq("active", true);
    const { data, error } = await query;
    if (error || !data?.length) {
      return PLACEHOLDER_COMMISSION_TYPES.map((item, index) => ({
        id: item.id,
        category: item.name.split(" · ")[0] || item.name,
        style: item.name.split(" · ")[1] || "Servicio",
        description: item.description,
        price_from: item.price_from,
        price_to: item.price_to,
        currency: item.currency,
        image_url: item.image_url,
        active: item.active,
        sort_order: index,
      }));
    }
    return data.map((row, index) => ({
      id: String(row.id),
      category: String(row.category || "Comisión"),
      style: String(row.style || "Servicio"),
      description: row.description ? String(row.description) : null,
      price_from: Number(row.price_from ?? row.price ?? 0),
      price_to: row.price_to == null ? null : Number(row.price_to),
      currency: String(row.currency || "MXN"),
      image_url: row.image_url ? String(row.image_url) : null,
      active: row.active !== false,
      sort_order: Number(row.sort_order ?? index),
    }));
  } catch {
    return [];
  }
}

export async function getCommissionTypes(): Promise<CommissionType[]> {
  const prices = await getPriceSettings(true);
  return prices.map((price) => ({ ...price, name: `${price.category} · ${price.style}` }));
}

export async function getPortfolioItems(activeOnly = true): Promise<PortfolioItem[]> {
  try {
    let query = getSupabaseServerClient()
      .from("artworks")
      .select("*, artwork_tags(tags(name,searchable,active))")
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (activeOnly) query = query.eq("active", true);
    const { data, error } = await query;
    if (error || !data?.length) return PLACEHOLDER_PORTFOLIO_ITEMS.map((item, index) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      image_url: item.image_url,
      thumbnail_url: item.image_url,
      artist_name: null,
      artist_url: null,
      featured: index === 0,
      active: true,
      sort_order: index,
      tags: item.tags || [],
    }));
    return data.map((row, index) => ({
      id: String(row.id),
      title: String(row.title || "Sin título"),
      description: row.description ? String(row.description) : null,
      image_url: String(row.image_url),
      thumbnail_url: row.thumbnail_url ? String(row.thumbnail_url) : null,
      artist_name: row.artist_name ? String(row.artist_name) : null,
      artist_url: row.artist_url ? String(row.artist_url) : null,
      featured: Boolean(row.featured),
      active: row.active !== false,
      sort_order: Number(row.sort_order ?? index),
      tags: ((row.artwork_tags || []) as TagRelation[])
        .map((relation) => relation.tags)
        .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag && tag.searchable !== false && tag.active !== false))
        .map((tag) => tag.name),
    }));
  } catch {
    return PLACEHOLDER_PORTFOLIO_ITEMS.map((item, index) => ({
      id: item.id, title: item.title, description: item.description, image_url: item.image_url,
      thumbnail_url: item.image_url, artist_name: null, artist_url: null, featured: index === 0,
      active: true, sort_order: index, tags: item.tags || [],
    }));
  }
}
