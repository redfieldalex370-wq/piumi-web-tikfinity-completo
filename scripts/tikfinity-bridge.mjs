/**
 * TikFinity -> Piumi Event Ingest bridge
 * Run: npm run tikfinity
 * Requires TikFinity open with Event API at ws://localhost:21213/
 */
import { createHash, randomUUID } from "node:crypto";

const VERSION = "1.0.0";
const WS_URL = process.env.TIKFINITY_WS_URL || "ws://localhost:21213/";
const INGEST_URL = process.env.PIUMI_EVENT_INGEST_URL || "http://localhost:3000/api/live/events/ingest";
const SECRET = process.env.PIUMI_EVENT_INGEST_SECRET || process.env.LIVE_EVENT_INGEST_SECRET;
const BRIDGE_ID = process.env.TIKFINITY_BRIDGE_ID || `piumi-${process.platform}`;
const LIKE_FLUSH_MS = Math.max(1000, Number(process.env.TIKFINITY_LIKE_FLUSH_MS || 4000));
const EVENT_ALIASES = new Map([
  ["member", "roomUser"],
  ["roomuser", "roomUser"],
  ["social", "share"],
  ["viewer", "roomUser"],
]);
const ALLOWED_EVENTS = new Set(["chat", "gift", "share", "follow", "like", "roomUser", "subscribe"]);

if (!SECRET) {
  console.error("Missing PIUMI_EVENT_INGEST_SECRET or LIVE_EVENT_INGEST_SECRET.");
  process.exit(1);
}

const WebSocketClient = globalThis.WebSocket || (await import("ws")).default;

let socket;
let reconnectTimer;
let heartbeatTimer;
let reconnectAttempt = 0;
let shuttingDown = false;
const likeBuffer = new Map();
const deliveryQueue = [];
let delivering = false;

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function getUserKey(data = {}) {
  return String(data.userId || data.uniqueId || data.nickname || "anonymous");
}

function normalizeEventName(event) {
  const raw = String(event || "").trim();
  if (!raw) return "";
  const direct = [...ALLOWED_EVENTS].find((name) => name.toLowerCase() === raw.toLowerCase());
  return direct || EVENT_ALIASES.get(raw.toLowerCase()) || raw;
}

function queueEnvelope(envelope) {
  deliveryQueue.push(envelope);
  void deliver();
}

async function deliver() {
  if (delivering) return;
  delivering = true;
  while (deliveryQueue.length) {
    const envelope = deliveryQueue[0];
    try {
      const response = await fetch(INGEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SECRET}` },
        body: JSON.stringify(envelope),
      });
      if (!response.ok) {
        const message = await response.text();
        const isUnsupportedEvent = response.status === 400 && message.includes("Tipo de evento no permitido");
        if (isUnsupportedEvent) {
          console.warn(`Event discarded by ingest API: ${envelope.event}`);
          deliveryQueue.shift();
          continue;
        }
        throw new Error(`${response.status} ${message}`);
      }
      deliveryQueue.shift();
    } catch (error) {
      console.error("Could not deliver event:", error instanceof Error ? error.message : error);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
  delivering = false;
}

function sendBridgeStatus(status, error = null) {
  queueEnvelope({
    event: "bridge_status",
    bridgeId: BRIDGE_ID,
    occurredAt: new Date().toISOString(),
    eventKey: `bridge-${status}-${Date.now()}`,
    data: { status, error, version: VERSION, connectedAt: status === "online" ? new Date().toISOString() : undefined, wsUrl: WS_URL },
  });
}

function flushLikes() {
  for (const [key, entry] of likeBuffer) {
    likeBuffer.delete(key);
    const occurredAt = new Date().toISOString();
    queueEnvelope({
      event: "like",
      bridgeId: BRIDGE_ID,
      occurredAt,
      eventKey: hash(`like:${key}:${entry.windowStart}:${entry.count}`),
      data: { ...entry.data, likeCount: entry.count },
    });
  }
}
setInterval(flushLikes, LIKE_FLUSH_MS).unref();

function handleTikFinityMessage(raw) {
  let payload;
  try {
    payload = JSON.parse(String(raw));
  } catch {
    console.warn("TikFinity sent invalid JSON.");
    return;
  }
  if (!payload || typeof payload.event !== "string" || !payload.data) return;
  const eventName = normalizeEventName(payload.event);
  if (!ALLOWED_EVENTS.has(eventName)) {
    console.warn(`TikFinity event ignored: ${payload.event}`);
    return;
  }
  const occurredAt = new Date().toISOString();
  if (eventName === "like") {
    const key = getUserKey(payload.data);
    const current = likeBuffer.get(key) || { count: 0, data: payload.data, windowStart: Date.now() };
    current.count += Math.max(1, Number(payload.data.likeCount || payload.data.count || 1));
    current.data = { ...current.data, ...payload.data };
    likeBuffer.set(key, current);
    return;
  }
  if (eventName === "gift") {
    const giftType = Number(payload.data.giftType ?? payload.data.giftDetails?.giftType ?? 0);
    const repeatEnd = Boolean(payload.data.repeatEnd ?? giftType !== 1);
    if (giftType === 1 && !repeatEnd) return;
  }
  const nativeId = payload.data.msgId || payload.data.messageId || payload.data.eventId || payload.data.logId || randomUUID();
  queueEnvelope({ event: eventName, data: payload.data, bridgeId: BRIDGE_ID, occurredAt, eventKey: `${eventName}:${nativeId}` });
}

function connect() {
  if (shuttingDown) return;
  console.log(`Connecting TikFinity: ${WS_URL}`);
  socket = new WebSocketClient(WS_URL);
  socket.addEventListener("open", () => {
    reconnectAttempt = 0;
    console.log("TikFinity connected. The bridge is listening for events.");
    sendBridgeStatus("online");
    clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => sendBridgeStatus("online"), 30000);
  });
  socket.addEventListener("message", (event) => handleTikFinityMessage(event.data));
  socket.addEventListener("error", () => sendBridgeStatus("error", "TikFinity WebSocket connection error"));
  socket.addEventListener("close", () => {
    clearInterval(heartbeatTimer);
    if (shuttingDown) return;
    sendBridgeStatus("offline");
    const delay = Math.min(30000, 1000 * 2 ** reconnectAttempt++);
    console.log(`TikFinity disconnected. Retrying in ${Math.round(delay / 1000)} s.`);
    reconnectTimer = setTimeout(connect, delay);
  });
}

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  clearTimeout(reconnectTimer);
  clearInterval(heartbeatTimer);
  flushLikes();
  sendBridgeStatus("offline");
  socket?.close();
  const limit = Date.now() + 3000;
  while ((deliveryQueue.length || delivering) && Date.now() < limit) await new Promise((resolve) => setTimeout(resolve, 100));
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
connect();
