"use client";

import { useEffect, useState } from "react";
import type { LivePublicPayload } from "@/types/live";

const EMPTY: LivePublicPayload = {
  period: "today",
  settings: { publicTitle: "La comunidad de Piumi", publicSubtitle: "Las huellas bonitas que dejó el directo de hoy.", showDailyGifts: true, showDailyLikes: true, showTopSupporter: true, showTopLiker: true, showRecentActivity: true, showUserAvatars: true, leaderboardLimit: 5 },
  bridge: { status: "offline", lastSeenAt: null },
  session: { isLive: false, currentViewers: 0, peakViewers: 0, startedAt: null },
  summary: { likes: 0, gifts: 0, diamonds: 0, shares: 0, followers: 0, subscribers: 0 },
  topSupporters: [], topLikers: [], recentActivity: [],
};

export default function StreamCommunity() {
  const [period, setPeriod] = useState<"today" | "month" | "all">("today");
  const [data, setData] = useState<LivePublicPayload>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = () => fetch(`/api/live/public?period=${period}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => { if (active) setData(payload); })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false); });
    load();
    const timer = window.setInterval(load, 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, [period]);

  return (
    <div className="stream-community">
      <div className="live-status-card">
        <div><span className={`status-dot ${data.session.isLive ? "live" : ""}`} /><b>{data.session.isLive ? "Piumi está en directo" : "El directo está descansando"}</b><p>{data.session.isLive ? `${data.session.currentViewers.toLocaleString("es-MX")} personas mirando ahora` : "Las estadísticas más recientes siguen aquí."}</p></div>
        <span className={`bridge-pill ${data.bridge.status}`}>TikFinity {data.bridge.status === "online" ? "conectado" : "desconectado"}</span>
      </div>

      <div className="period-tabs"><button className={period === "today" ? "active" : ""} onClick={() => setPeriod("today")}>Hoy</button><button className={period === "month" ? "active" : ""} onClick={() => setPeriod("month")}>Este mes</button><button className={period === "all" ? "active" : ""} onClick={() => setPeriod("all")}>Histórico</button></div>

      <section className="stream-stats-grid">
        {data.settings.showDailyLikes && <Stat icon="♡" label="Amor enviado" value={data.summary.likes} suffix="likes" />}
        {data.settings.showDailyGifts && <Stat icon="🎁" label="Regalos" value={data.summary.gifts} suffix="regalos" />}
        {data.settings.showDailyGifts && <Stat icon="✦" label="Apoyo" value={data.summary.diamonds} suffix="diamantes" />}
        <Stat icon="↗" label="Compartidos" value={data.summary.shares} suffix="veces" />
      </section>

      <div className="leaderboard-grid">
        {data.settings.showTopSupporter && <Leaderboard title="Mayor apoyo" icon="👑" rows={data.topSupporters} metric="diamonds" empty="Todavía no hay regalos registrados en este periodo." />}
        {data.settings.showTopLiker && <Leaderboard title="Más amor" icon="💗" rows={data.topLikers} metric="likes" empty="Todavía no hay likes registrados en este periodo." />}
      </div>

      {data.settings.showRecentActivity && <section className="activity-panel">
        <div className="section-heading"><div><p className="eyebrow">MOMENTOS RECIENTES</p><h2>Lo que pasó en el directo</h2></div></div>
        {loading ? <p>Cargando la constelación...</p> : data.recentActivity.length ? <div className="activity-list">{data.recentActivity.map((activity) => <article key={activity.id}><div className="avatar-fallback">{activity.user.slice(0, 1).toUpperCase()}</div><div><b>{activity.user}</b><p>{activity.detail}</p></div><time>{new Date(activity.occurredAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}</time></article>)}</div> : <div className="empty-state compact"><p>El próximo directo llenará este espacio de corazones, regalos y nombres conocidos.</p></div>}
      </section>}

      <section className="coming-soon-panel"><p className="eyebrow">PRONTO</p><h2>Más formas de jugar con el stream</h2><div><span>Comandos de chat</span><span>Ruletas</span><span>Metas comunitarias</span><span>Minijuegos</span><span>Puntos y recompensas</span></div></section>
    </div>
  );
}

function Stat({ icon, label, value, suffix }: { icon: string; label: string; value: number; suffix: string }) {
  return <article className="stream-stat"><span>{icon}</span><p>{label}</p><strong>{value.toLocaleString("es-MX")}</strong><small>{suffix}</small></article>;
}

function Leaderboard({ title, icon, rows, metric, empty }: { title: string; icon: string; rows: LivePublicPayload["topSupporters"]; metric: "likes" | "diamonds"; empty: string }) {
  return <section className="leaderboard"><h2><span>{icon}</span>{title}</h2>{rows.length ? <ol>{rows.map((row, index) => <li key={row.userId}><span className="rank">{index + 1}</span><div className="avatar-fallback">{row.nickname.slice(0, 1).toUpperCase()}</div><div><b>{row.nickname}</b><small>@{row.uniqueId}</small></div><strong>{row[metric].toLocaleString("es-MX")}</strong></li>)}</ol> : <p className="leaderboard-empty">{empty}</p>}</section>;
}
