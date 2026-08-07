"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import type { SiteSettings, SocialLink } from "@/lib/siteSettings";

const TEXT_FIELDS: [keyof SiteSettings, string, boolean][] = [
  ["brand","Marca",false],["heroKicker","Saludo",false],["heroTitle","Título principal",false],
  ["heroSubtitle","Subtítulo",true],["heroIntro","Presentación",true],["primaryCta","Botón principal",false],
  ["secondaryCta","Botón secundario",false],["scheduleTitle","Título del horario",false],["scheduleNote","Nota del horario",true],
  ["aboutTitle","Título Quiénes somos",false],["aboutText","Texto Quiénes somos",true],["teamTitle","Título del equipo",false],
  ["teamText","Texto del equipo",true],["footerText","Texto del pie",true],["footerThanks","Agradecimiento",true],
];

export default function SettingsEditor() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetch("/api/admin/site-settings").then((r) => r.json()).then((d) => setSettings(d.settings)); }, []);
  if (!settings) return <p>Cargando configuración...</p>;
  const resolved = settings;

  function change(key: keyof SiteSettings, value: unknown) {
    setSettings((current) => current ? { ...current, [key]: value } : current);
  }
  function social(index: number, key: keyof SocialLink, value: string) {
    change("socials", resolved.socials.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  }
  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.set("file", file);
    const response = await fetch("/api/admin/site-settings/image", { method: "POST", body: form });
    const result = await response.json();
    setUploading(false);
    if (!response.ok) return setMessage(result.error || "No se pudo subir.");
    change("scheduleImageUrl", result.url);
    setMessage("Imagen lista. Pulsa Guardar configuración.");
  }
  async function save() {
    const response = await fetch("/api/admin/site-settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(resolved) });
    const result = await response.json();
    setMessage(response.ok ? "Configuración publicada." : result.error || "No se pudo guardar.");
  }

  return <div className="admin-stack">
    {message && <p className="admin-message">{message}</p>}
    <section className="admin-card">
      <div className="admin-section-title"><h2>Contenido general</h2><button className="btn-primary" onClick={save}>Guardar configuración</button></div>
      <div className="form-grid">{TEXT_FIELDS.map(([key,label,multi]) => <Field key={key} label={label} wide={multi}>{multi ? <textarea className="input min-h-20" value={String(resolved[key])} onChange={(event) => change(key,event.target.value)}/> : <input className="input" value={String(resolved[key])} onChange={(event) => change(key,event.target.value)}/>}</Field>)}</div>
    </section>
    <section className="admin-card"><h2>Imagen de horario</h2><div className="schedule-admin-preview"><img src={resolved.scheduleImageUrl} alt="Horario actual"/><div><input className="input" value={resolved.scheduleImageUrl} onChange={(event) => change("scheduleImageUrl",event.target.value)}/><input className="input" type="file" accept="image/*" onChange={(event) => upload(event.target.files?.[0])}/><p>{uploading ? "Subiendo..." : "Puedes pegar una URL o subir una imagen de hasta 8 MB."}</p></div></div></section>
    <section className="admin-card"><div className="admin-section-title"><h2>Redes sociales</h2><button className="btn-secondary" onClick={() => change("socials", [...resolved.socials,{name:"Nueva red",label:"Nueva red",icon:"✦",href:"https://"}])}>+ Agregar red</button></div><div className="social-admin-list">{resolved.socials.map((item,index) => <article key={`${index}-${item.name}`}><input className="input" value={item.label} onChange={(event) => social(index,"label",event.target.value)} placeholder="Nombre"/><input className="input" value={item.icon} onChange={(event) => social(index,"icon",event.target.value)} placeholder="Icono"/><input className="input" value={item.href} onChange={(event) => social(index,"href",event.target.value)} placeholder="https://..."/><button onClick={() => change("socials",resolved.socials.filter((_,itemIndex) => itemIndex !== index))}>✕</button></article>)}</div></section>
    <button className="btn-primary" onClick={save}>Guardar configuración</button>
  </div>;
}
function Field({label,wide=false,children}:{label:string;wide?:boolean;children:React.ReactNode}){return <label className={wide?"field wide":"field"}><span>{label}</span>{children}</label>}
