import type { TikFinityEnvelope, TikFinityEventName } from "@/types/live";

function getPath(source: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined, source);
}

export function firstString(source: Record<string, unknown>, paths: string[], fallback = ""): string {
  for (const path of paths) {
    const value = getPath(source, path);
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return fallback;
}

export function firstNumber(source: Record<string, unknown>, paths: string[], fallback = 0): number {
  for (const path of paths) {
    const value = getPath(source, path);
    const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
    if (Number.isFinite(number)) return number;
  }
  return fallback;
}

export function firstBoolean(source: Record<string, unknown>, paths: string[], fallback = false): boolean {
  for (const path of paths) {
    const value = getPath(source, path);
    if (typeof value === "boolean") return value;
    if (value === 1 || value === "1" || value === "true") return true;
    if (value === 0 || value === "0" || value === "false") return false;
  }
  return fallback;
}

export interface NormalizedLiveEvent {
  eventType: TikFinityEventName;
  tiktokUserId: string;
  uniqueId: string;
  nickname: string;
  avatarUrl: string | null;
  quantity: number;
  giftId: string | null;
  giftName: string | null;
  diamondCount: number;
  viewers: number | null;
  publicVisible: boolean;
  skip: boolean;
}

export function normalizeLiveEvent(envelope: TikFinityEnvelope): NormalizedLiveEvent {
  const data = envelope.data || {};
  const eventType = envelope.event as TikFinityEventName;
  const uniqueId = firstString(data, ["uniqueId", "user.uniqueId", "userDetails.uniqueId", "userDetails.uniqueId"]);
  const tiktokUserId = firstString(data, ["userId", "user.id", "userDetails.userId", "userDetails.userId"], uniqueId || `anonymous-${eventType}`);
  const nickname = firstString(data, ["nickname", "user.nickname", "userDetails.nickname"], uniqueId || "Piumigo");
  const avatarCandidate = firstString(data, ["profilePictureUrl", "avatarUrl", "user.profilePictureUrl", "userDetails.profilePictureUrl", "userDetails.profilePictureUrls.0"]);
  const repeatCount = Math.max(1, Math.trunc(firstNumber(data, ["repeatCount", "repeat_count", "giftDetails.repeatCount"], 1)));
  const giftType = firstNumber(data, ["giftType", "giftDetails.giftType"], 0);
  const repeatEnd = firstBoolean(data, ["repeatEnd", "repeat_end"], giftType !== 1);
  const likeCount = Math.max(0, Math.trunc(firstNumber(data, ["likeCount", "count", "likes"], 1)));
  const diamondEach = Math.max(0, Math.trunc(firstNumber(data, ["diamondCount", "giftDetails.diamondCount", "gift.diamondCount"], 0)));
  const viewersValue = firstNumber(data, ["viewerCount", "roomUserCount", "totalUser", "users"], -1);
  const quantity = eventType === "gift" ? repeatCount : eventType === "like" ? likeCount : eventType === "roomUser" ? 0 : 1;
  return {
    eventType,
    tiktokUserId,
    uniqueId: uniqueId || nickname.replace(/^@/, "").replace(/\s+/g, "_").toLowerCase(),
    nickname,
    avatarUrl: avatarCandidate || null,
    quantity,
    giftId: eventType === "gift" ? firstString(data, ["giftId", "giftDetails.giftId", "gift.id"]) || null : null,
    giftName: eventType === "gift" ? firstString(data, ["giftName", "giftDetails.giftName", "gift.name"], "Regalo") : null,
    diamondCount: eventType === "gift" ? diamondEach * repeatCount : 0,
    viewers: eventType === "roomUser" && viewersValue >= 0 ? Math.trunc(viewersValue) : null,
    publicVisible: ["gift", "follow", "share", "subscribe"].includes(eventType),
    skip: eventType === "gift" && giftType === 1 && !repeatEnd,
  };
}

export function activityDetail(event: NormalizedLiveEvent): string {
  switch (event.eventType) {
    case "gift": return `envió ${event.quantity > 1 ? `${event.quantity} × ` : ""}${event.giftName || "un regalo"}`;
    case "follow": return "se unió a la comunidad";
    case "share": return "compartió el directo";
    case "subscribe": return "se suscribió al LIVE";
    case "like": return `envió ${event.quantity.toLocaleString("es-MX")} likes`;
    default: return "participó en el directo";
  }
}
