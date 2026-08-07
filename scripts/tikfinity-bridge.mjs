/**
 * TikFinity -> Piumi Event Ingest bridge
 * Ejecuta: npm run tikfinity
 * Requiere TikFinity abierto y su Event API en ws://localhost:21213/
 */
import { createHash, randomUUID } from "node:crypto";

const VERSION = "1.0.0";
const WS_URL = process.env.TIKFINITY_WS_URL || "ws://localhost:21213/";
const INGEST_URL = process.env.PIUMI_EVENT_INGEST_URL || "http://localhost:3000/api/live/events/ingest";
const SECRET = process.env.PIUMI_EVENT_INGEST_SECRET || process.env.LIVE_EVENT_INGEST_SECRET;
const BRIDGE_ID = process.env.TIKFINITY_BRIDGE_ID || `piumi-${process.platform}`;
const LIKE_FLUSH_MS = Math.max(1000, Number(process.env.TIKFINITY_LIKE_FLUSH_MS || 4000));

if (!SECRET) {
  console.error("Falta PIUMI_EVENT_INGEST_SECRET o LIVE_EVENT_INGEST_SECRET.");
  process.exit(1);
}
if (typeof WebSocket === "undefined") {
  console.error("Este puente requiere Node.js 22 o superior, que incluye WebSocket global.");
  process.exit(1);
}

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
      if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
      deliveryQueue.shift();
    } catch (error) {
      console.error("No se pudo entregar un evento:", error instanceof Error ? error.message : error);
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
  try { payload = JSON.parse(String(raw)); } catch { return console.warn("TikFinity envió JSON inválido."); }
  if (!payload || typeof payload.event !== "string" || !payload.data) return;
  const occurredAt = new Date().toISOString();
  if (payload.event === "like") {
    const key = getUserKey(payload.data);
    const current = likeBuffer.get(key) || { count: 0, data: payload.data, windowStart: Date.now() };
    current.count += Math.max(1, Number(payload.data.likeCount || payload.data.count || 1));
    current.data = { ...current.data, ...payload.data };
    likeBuffer.set(key, current);
    return;
  }
  if (payload.event === "gift") {
    const giftType = Number(payload.data.giftType ?? payload.data.giftDetails?.giftType ?? 0);
    const repeatEnd = Boolean(payload.data.repeatEnd ?? giftType !== 1);
    if (giftType === 1 && !repeatEnd) return;
  }
  const nativeId = payload.data.msgId || payload.data.messageId || payload.data.eventId || payload.data.logId || randomUUID();
  queueEnvelope({ event: payload.event, data: payload.data, bridgeId: BRIDGE_ID, occurredAt, eventKey: `${payload.event}:${nativeId}` });
}

function connect() {
  if (shuttingDown) return;
  console.log(`Conectando TikFinity: ${WS_URL}`);
  socket = new WebSocket(WS_URL);
  socket.addEventListener("open", () => {
    reconnectAttempt = 0;
    console.log("TikFinity conectado. El puente está escuchando eventos.");
    sendBridgeStatus("online");
    clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => sendBridgeStatus("online"), 30000);
  });
  socket.addEventListener("message", (event) => handleTikFinityMessage(event.data));
  socket.addEventListener("error", () => sendBridgeStatus("error", "Error de conexión WebSocket con TikFinity"));
  socket.addEventListener("close", () => {
    clearInterval(heartbeatTimer);
    if (shuttingDown) return;
    sendBridgeStatus("offline");
    const delay = Math.min(30000, 1000 * 2 ** reconnectAttempt++);
    console.log(`TikFinity desconectado. Reintento en ${Math.round(delay / 1000)} s.`);
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
