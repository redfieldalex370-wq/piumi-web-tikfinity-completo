"use client";
import { useEffect, useState } from "react";

interface LiveAdminData {
  bridge: Record<string, unknown> | null;
  session: Record<string, unknown> | null;
  settings: Record<string, unknown> | null;
  events: Array<{ id:string; event_type:string; quantity:number; gift_name?:string|null; diamond_count:number; occurred_at:string; live_users?: {nickname?:string;unique_id?:string} | Array<{nickname?:string;unique_id?:string}> | null }>;
  totals: { likes:number; gifts:number; diamonds:number; shares:number; followers:number; subscriptions:number };
}

export default function LiveAdmin() {
  const [data, setData] = useState<LiveAdminData | null>(null);
  const [message, setMessage] = useState("");

  function load() {
    fetch("/api/admin/live", { cache: "no-store" }).then((response) => response.json()).then(setData);
  }
  useEffect(() => {
    load();
    const timer = window.setInterval(load, 15000);
    return () => window.clearInterval(timer);
  }, []);

  if (!data) return <p>Cargando datos del stream...</p>;
  const settings = data.settings || {};
  const bridge = data.bridge || {};
  const session = data.session || {};

  function change(key: string, value: unknown) {
    setData((current) => current ? { ...current, settings: { ...(current.settings || {}), [key]: value } } : current);
  }
  async function save() {
    const response = await fetch("/api/admin/live", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    const result = await response.json();
    setMessage(response.ok ? "Configuración pública actualizada." : result.error || "No se pudo guardar.");
  }
  async function endSession() {
    if (!confirm("¿Cerrar la sesión LIVE activa? El siguiente evento abrirá una nueva.")) return;
    await fetch("/api/admin/live", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "end_session" }),
    });
    load();
  }

  const lastSeen = bridge.last_seen_at ? new Date(String(bridge.last_seen_at)).toLocaleString("es-MX") : "Nunca";
  return <div className="admin-stack">
    {message && <p className="admin-message">{message}</p>}
    <section className="live-admin-status">
      <article><span className={`status-dot ${bridge.status === "online" ? "live" : ""}`} /><div><small>Puente TikFinity</small><h2>{String(bridge.status || "offline")}</h2><p>Último latido: {lastSeen}</p></div></article>
      <article><span>◉</span><div><small>Sesión</small><h2>{String(session.status || "Sin sesión")}</h2><p>{session.started_at ? new Date(String(session.started_at)).toLocaleString("es-MX") : "Esperando el primer evento"}</p></div></article>
      <button className="btn-secondary" onClick={endSession}>Cerrar sesión actual</button>
    </section>
    <section className="stream-stats-grid admin-live-stats">
      <Stat label="Likes" value={data.totals.likes}/><Stat label="Regalos" value={data.totals.gifts}/><Stat label="Diamantes" value={data.totals.diamonds}/><Stat label="Compartidos" value={data.totals.shares}/><Stat label="Seguidores" value={data.totals.followers}/><Stat label="Suscripciones" value={data.totals.subscriptions}/>
    </section>
    <section className="admin-card">
      <div className="admin-section-title"><h2>Configuración pública</h2><button className="btn-primary" onClick={save}>Guardar</button></div>
      <div className="form-grid">
        <Field label="Título" wide><input className="input" value={String(settings.public_title || "")} onChange={(event) => change("public_title", event.target.value)}/></Field>
        <Field label="Subtítulo" wide><textarea className="input" value={String(settings.public_subtitle || "")} onChange={(event) => change("public_subtitle", event.target.value)}/></Field>
        <Field label="Límite del ranking"><input className="input" type="number" min="1" max="20" value={Number(settings.leaderboard_limit || 5)} onChange={(event) => change("leaderboard_limit", Number(event.target.value))}/></Field>
        {[["show_daily_gifts","Mostrar regalos"],["show_daily_likes","Mostrar likes"],["show_top_supporter","Mostrar mejor donador"],["show_top_liker","Mostrar más likes"],["show_recent_activity","Mostrar actividad reciente"],["show_user_avatars","Mostrar avatares"]].map(([key,label]) => <label className="terms-check" key={key}><input type="checkbox" checked={settings[key] !== false} onChange={(event) => change(key, event.target.checked)}/><span>{label}</span></label>)}
      </div>
    </section>
    <section className="admin-card"><h2>Últimos eventos recibidos</h2><div className="event-table"><div className="event-row header"><span>Evento</span><span>Usuario</span><span>Valor</span><span>Fecha</span></div>{data.events.map((event) => { const user = Array.isArray(event.live_users) ? event.live_users[0] : event.live_users; return <div className="event-row" key={event.id}><span>{event.event_type}</span><span>{user?.nickname || user?.unique_id || "Anónimo"}</span><span>{event.event_type === "gift" ? `${event.quantity} × ${event.gift_name || "Regalo"} · ${event.diamond_count} 💎` : event.quantity}</span><span>{new Date(event.occurred_at).toLocaleString("es-MX")}</span></div>; })}</div></section>
    <section className="admin-card bridge-help"><h2>Cómo encender el puente</h2><ol><li>Abre TikFinity y activa Event API.</li><li>Inicia la web con <code>npm run dev</code>.</li><li>En otra terminal ejecuta <code>npm run tikfinity</code>.</li><li>Los eventos aparecerán aquí y en <code>/stream</code>.</li></ol></section>
  </div>;
}

function Stat({ label, value }: { label:string; value:number }) { return <article className="stream-stat"><p>{label}</p><strong>{Number(value || 0).toLocaleString("es-MX")}</strong></article>; }
function Field({ label, wide=false, children }: { label:string; wide?:boolean; children:React.ReactNode }) { return <label className={wide ? "field wide" : "field"}><span>{label}</span>{children}</label>; }
