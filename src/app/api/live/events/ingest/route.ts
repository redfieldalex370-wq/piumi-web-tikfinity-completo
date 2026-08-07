import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mexicoDate } from "@/lib/date";
import { normalizeLiveEvent } from "@/lib/live/normalize";
import { TIKFINITY_EVENTS, type TikFinityEnvelope } from "@/types/live";

function authorized(request: NextRequest): boolean {
  const expected = process.env.LIVE_EVENT_INGEST_SECRET;
  if (!expected) return false;
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const header = request.headers.get("x-live-secret");
  return bearer === expected || header === expected;
}

function eventKey(envelope: TikFinityEnvelope, occurredAt: string): string {
  if (envelope.eventKey?.trim()) return envelope.eventKey.trim().slice(0, 250);
  const native = ["msgId", "messageId", "eventId", "logId"].map((key) => envelope.data?.[key]).find(Boolean);
  if (native) return `${envelope.event}:${native}`;
  return createHash("sha256").update(JSON.stringify([envelope.event, envelope.bridgeId, occurredAt, envelope.data])).digest("hex");
}

async function ensureSession() {
  const supabase = getSupabaseServerClient();
  const { data: current } = await supabase.from("live_sessions").select("*").eq("status", "live").order("started_at", { ascending: false }).limit(1).maybeSingle();
  if (current) {
    const last = current.last_event_at ? new Date(current.last_event_at).getTime() : new Date(current.started_at).getTime();
    if (Date.now() - last < 6 * 60 * 60 * 1000) return current;
    await supabase.from("live_sessions").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", current.id);
  }
  const { data, error } = await supabase.from("live_sessions").insert({ title: `TikTok LIVE ${mexicoDate()}`, status: "live" }).select("*").single();
  if (error) throw error;
  return data;
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Firma de ingesta inválida." }, { status: 401 });
  const envelope = await request.json().catch(() => null) as TikFinityEnvelope | null;
  if (!envelope || typeof envelope.event !== "string" || !envelope.data || typeof envelope.data !== "object") return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();

  if (envelope.event === "bridge_status") {
    const statusValue = String(envelope.data.status || "offline");
    const status = statusValue === "online" ? "online" : statusValue === "error" ? "error" : "offline";
    const { error } = await supabase.from("live_bridge_status").upsert({
      singleton_key: "default", status, last_seen_at: now,
      connected_at: status === "online" ? String(envelope.data.connectedAt || now) : null,
      last_error: envelope.data.error ? String(envelope.data.error) : null,
      bridge_version: envelope.data.version ? String(envelope.data.version) : null,
      metadata: { bridgeId: envelope.bridgeId || null, ...envelope.data },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, bridge: status });
  }

  if (!TIKFINITY_EVENTS.includes(envelope.event as never)) return NextResponse.json({ error: "Tipo de evento no permitido." }, { status: 400 });
  const normalized = normalizeLiveEvent(envelope);
  if (normalized.skip) return NextResponse.json({ ok: true, skipped: "gift-streak" });
  const occurredAt = envelope.occurredAt && !Number.isNaN(Date.parse(envelope.occurredAt)) ? new Date(envelope.occurredAt).toISOString() : now;
  const key = eventKey(envelope, occurredAt);

  const { data: user, error: userError } = await supabase.from("live_users").upsert({
    tiktok_user_id: normalized.tiktokUserId,
    unique_id: normalized.uniqueId,
    nickname: normalized.nickname,
    avatar_url: normalized.avatarUrl,
    last_seen_at: occurredAt,
  }, { onConflict: "tiktok_user_id" }).select("id").single();
  if (userError) return NextResponse.json({ error: userError.message }, { status: 500 });

  let session;
  try { session = await ensureSession(); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo abrir la sesión." }, { status: 500 }); }

  const { error: eventError } = await supabase.from("live_events").insert({
    event_key: key,
    session_id: session.id,
    user_id: user.id,
    event_type: normalized.eventType,
    quantity: normalized.quantity,
    gift_id: normalized.giftId,
    gift_name: normalized.giftName,
    diamond_count: normalized.diamondCount,
    public_visible: normalized.publicVisible,
    payload: envelope.data,
    occurred_at: occurredAt,
  });
  if (eventError?.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
  if (eventError) return NextResponse.json({ error: eventError.message }, { status: 500 });

  await Promise.all([
    supabase.rpc("increment_live_user_stats", { p_stat_date: mexicoDate(occurredAt), p_user_id: user.id, p_event_type: normalized.eventType, p_quantity: normalized.quantity, p_diamonds: normalized.diamondCount, p_event_at: occurredAt }),
    supabase.rpc("increment_live_session", { p_session_id: session.id, p_event_type: normalized.eventType, p_quantity: normalized.quantity, p_diamonds: normalized.diamondCount, p_viewers: normalized.viewers, p_event_at: occurredAt }),
    supabase.from("live_bridge_status").upsert({ singleton_key: "default", status: "online", last_seen_at: now, metadata: { bridgeId: envelope.bridgeId || null } }),
  ]);

  return NextResponse.json({ ok: true, eventKey: key });
}
