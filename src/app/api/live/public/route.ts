import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mexicoDate, monthRangeMexico } from "@/lib/date";
import { activityDetail, normalizeLiveEvent } from "@/lib/live/normalize";
import type { LiveLeaderboardEntry, LivePublicPayload, TikFinityEnvelope } from "@/types/live";

function number(value: unknown) { const parsed = Number(value ?? 0); return Number.isFinite(parsed) ? parsed : 0; }

export async function GET(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get("period");
  const period: LivePublicPayload["period"] = requested === "month" || requested === "all" ? requested : "today";
  const supabase = getSupabaseServerClient();
  let statsQuery = supabase.from("live_daily_user_stats").select("*, live_users(id,unique_id,nickname,avatar_url)");
  if (period === "today") statsQuery = statsQuery.eq("stat_date", mexicoDate());
  if (period === "month") { const { from, to } = monthRangeMexico(); statsQuery = statsQuery.gte("stat_date", from).lt("stat_date", to); }

  const [{ data: stats }, { data: settingsRow }, { data: bridgeRow }, { data: sessionRow }] = await Promise.all([
    statsQuery,
    supabase.from("live_public_settings").select("*").eq("singleton_key", "default").maybeSingle(),
    supabase.from("live_bridge_status").select("*").eq("singleton_key", "default").maybeSingle(),
    supabase.from("live_sessions").select("*").eq("status", "live").order("started_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const byUser = new Map<string, LiveLeaderboardEntry>();
  for (const row of stats || []) {
    const relation = Array.isArray(row.live_users) ? row.live_users[0] : row.live_users;
    if (!relation?.id) continue;
    const current = byUser.get(relation.id) || { userId: relation.id, uniqueId: relation.unique_id || "piumigo", nickname: relation.nickname || relation.unique_id || "Piumigo", avatarUrl: relation.avatar_url || null, likes: 0, gifts: 0, diamonds: 0, shares: 0 };
    current.likes += number(row.likes); current.gifts += number(row.gifts); current.diamonds += number(row.diamonds); current.shares += number(row.shares);
    byUser.set(relation.id, current);
  }
  const entries = Array.from(byUser.values());
  const limit = Math.min(20, Math.max(1, number(settingsRow?.leaderboard_limit) || 5));
  const summary = (stats || []).reduce((acc, row) => ({ likes: acc.likes + number(row.likes), gifts: acc.gifts + number(row.gifts), diamonds: acc.diamonds + number(row.diamonds), shares: acc.shares + number(row.shares), followers: acc.followers + number(row.follows), subscribers: acc.subscribers + number(row.subscriptions) }), { likes:0,gifts:0,diamonds:0,shares:0,followers:0,subscribers:0 });

  let eventQuery = supabase.from("live_events").select("id,event_type,quantity,gift_name,diamond_count,payload,occurred_at,live_users(unique_id,nickname,avatar_url)").eq("public_visible", true).order("occurred_at", { ascending: false }).limit(20);
  if (period === "today") eventQuery = eventQuery.gte("occurred_at", `${mexicoDate()}T00:00:00-06:00`);
  if (period === "month") { const { from } = monthRangeMexico(); eventQuery = eventQuery.gte("occurred_at", `${from}T00:00:00-06:00`); }
  const { data: events } = await eventQuery;
  const recentActivity = (events || []).map((event) => {
    const user = Array.isArray(event.live_users) ? event.live_users[0] : event.live_users;
    const normalized = normalizeLiveEvent({ event: event.event_type, data: { ...(event.payload || {}), repeatCount: event.quantity, giftName: event.gift_name, diamondCount: event.diamond_count } } as TikFinityEnvelope);
    return { id: event.id, type: event.event_type, user: user?.nickname || user?.unique_id || normalized.nickname, avatarUrl: user?.avatar_url || null, detail: activityDetail(normalized), occurredAt: event.occurred_at };
  });

  const lastSeen = bridgeRow?.last_seen_at ? new Date(bridgeRow.last_seen_at).getTime() : 0;
  const stale = !lastSeen || Date.now() - lastSeen > 90_000;
  const payload: LivePublicPayload = {
    period,
    settings: {
      publicTitle: settingsRow?.public_title || "La comunidad de Piumi",
      publicSubtitle: settingsRow?.public_subtitle || "Las huellas bonitas que dejó el directo de hoy.",
      showDailyGifts: settingsRow?.show_daily_gifts !== false,
      showDailyLikes: settingsRow?.show_daily_likes !== false,
      showTopSupporter: settingsRow?.show_top_supporter !== false,
      showTopLiker: settingsRow?.show_top_liker !== false,
      showRecentActivity: settingsRow?.show_recent_activity !== false,
      showUserAvatars: settingsRow?.show_user_avatars !== false,
      leaderboardLimit: limit,
    },
    bridge: { status: stale ? "offline" : bridgeRow?.status || "offline", lastSeenAt: bridgeRow?.last_seen_at || null },
    session: { isLive: Boolean(sessionRow && !stale), currentViewers: number(sessionRow?.current_viewers), peakViewers: number(sessionRow?.peak_viewers), startedAt: sessionRow?.started_at || null },
    summary,
    topSupporters: [...entries].sort((a,b)=>b.diamonds-a.diamonds || b.gifts-a.gifts).slice(0,limit),
    topLikers: [...entries].sort((a,b)=>b.likes-a.likes).slice(0,limit),
    recentActivity,
  };
  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}
