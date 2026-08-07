export const TIKFINITY_EVENTS = [
  "chat",
  "gift",
  "share",
  "follow",
  "like",
  "roomUser",
  "subscribe",
] as const;

export type TikFinityEventName = (typeof TIKFINITY_EVENTS)[number];

export interface TikFinityEnvelope {
  event: TikFinityEventName | "bridge_status";
  data: Record<string, unknown>;
  eventKey?: string;
  occurredAt?: string;
  bridgeId?: string;
}

export interface LiveLeaderboardEntry {
  userId: string;
  uniqueId: string;
  nickname: string;
  avatarUrl: string | null;
  likes: number;
  gifts: number;
  diamonds: number;
  shares: number;
}

export interface LivePublicPayload {
  period: "today" | "month" | "all";
  settings: {
    publicTitle: string;
    publicSubtitle: string;
    showDailyGifts: boolean;
    showDailyLikes: boolean;
    showTopSupporter: boolean;
    showTopLiker: boolean;
    showRecentActivity: boolean;
    showUserAvatars: boolean;
    leaderboardLimit: number;
  };
  bridge: {
    status: "online" | "offline" | "error";
    lastSeenAt: string | null;
  };
  session: {
    isLive: boolean;
    currentViewers: number;
    peakViewers: number;
    startedAt: string | null;
  };
  summary: {
    likes: number;
    gifts: number;
    diamonds: number;
    shares: number;
    followers: number;
    subscribers: number;
  };
  topSupporters: LiveLeaderboardEntry[];
  topLikers: LiveLeaderboardEntry[];
  recentActivity: Array<{
    id: string;
    type: string;
    user: string;
    avatarUrl: string | null;
    detail: string;
    occurredAt: string;
  }>;
}
