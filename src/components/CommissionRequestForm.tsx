"use client";

import { useState } from "react";
import Link from "next/link";
import type { CommissionType } from "@/types/commission";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/constants";

interface Props { commissionTypes: CommissionType[] }
interface FormState {
  client_name:string; client_email:string; client_contact:string; tiktok_username:string;
  commission_type_id:string; commission_type_label:string; character_name:string;
  character_description:string; reference_urls:string; pose_description:string;
  usage_type:"personal"|"comercial"; payment_method:string; additional_details:string;
  terms_accepted:boolean;
}
const INITIAL:FormState={client_name:"",client_email:"",client_contact:"",tiktok_username:"",commission_type_id:"",commission_type_label:"",character_name:"",character_description:"",reference_urls:"",pose_description:"",usage_type:"personal",payment_method:"",additional_details:"",terms_accepted:false};

export default function CommissionRequestForm({ commissionTypes }: Props) {
  const [form,setForm]=useState(INITIAL),[submitting,setSubmitting]=useState(false),[error,setError]=useState<string|null>(null),[trackingCode,setTrackingCode]=useState<string|null>(null);
  const update=<K extends keyof FormState>(key:K,value:FormState[K])=>setForm(prev=>({...prev,[key]:value}));
  function changeType(id:string){const type=commissionTypes.find(item=>item.id===id);setForm(prev=>({...prev,commission_type_id:id,commission_type_label:type?.name||""}))}
  async function submit(event:React.FormEvent){event.preventDefault();setError(null);if(!form.terms_accepted)return setError("Debes aceptar los términos para enviar la solicitud.");setSubmitting(true);try{const response=await fetch("/api/commissions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,reference_urls:form.reference_urls.split("\n").map(x=>x.trim()).filter(Boolean)})});const data=await response.json();if(!response.ok)throw new Error(data.error||"No se pudo enviar la solicitud.");setTrackingCode(data.tracking_code)}catch(reason){setError(reason instanceof Error?reason.message:"No se pudo conectar con el servidor.")}finally{setSubmitting(false)}}
  if(trackingCode)return <div className="success-card"><span>✓</span><h2>¡Solicitud enviada!</h2><p>Guarda este código. Es la llave para consultar tu avance sin mostrar tus datos personales.</p><strong>{trackingCode}</strong><div><Link className="btn-primary" href={`/seguimiento?code=${trackingCode}`}>Ver seguimiento</Link><Link className="btn-secondary" href="/">Volver al inicio</Link></div></div>;
  return <form className="commission-form" onSubmit={submit}>
    <div className="form-section"><h3>1. Sobre ti</h3><div className="form-grid">
      <Field label="Nombre *"><input className="input" required value={form.client_name} onChange={e=>update("client_name",e.target.value)}/></Field>
      <Field label="Correo *"><input className="input" type="email" required value={form.client_email} onChange={e=>update("client_email",e.target.value)}/></Field>
      <Field label="Contacto adicional"><input className="input" placeholder="Discord, Instagram o WhatsApp" value={form.client_contact} onChange={e=>update("client_contact",e.target.value)}/></Field>
      <Field label="Usuario de TikTok"><input className="input" placeholder="@usuario" value={form.tiktok_username} onChange={e=>update("tiktok_username",e.target.value)}/></Field>
    </div></div>
    <div className="form-section"><h3>2. Tu comisión</h3><div className="form-grid">
      <Field label="Servicio *"><select className="input" required value={form.commission_type_id} onChange={e=>changeType(e.target.value)}><option value="">Selecciona una opción</option>{commissionTypes.map(type=><option key={type.id} value={type.id}>{type.name}</option>)}</select></Field>
      <Field label="Personaje o título *"><input className="input" required value={form.character_name} onChange={e=>update("character_name",e.target.value)}/></Field>
      <Field label="Descripción" wide><textarea className="input min-h-28" placeholder="Apariencia, ropa, personalidad, colores..." value={form.character_description} onChange={e=>update("character_description",e.target.value)}/></Field>
      <Field label="Pose o escena" wide><textarea className="input min-h-24" value={form.pose_description} onChange={e=>update("pose_description",e.target.value)}/></Field>
      <Field label="Referencias (un enlace por línea)" wide><textarea className="input min-h-24 font-mono text-sm" placeholder={"https://...\nhttps://..."} value={form.reference_urls} onChange={e=>update("reference_urls",e.target.value)}/></Field>
      <Field label="Detalles adicionales" wide><textarea className="input min-h-24" value={form.additional_details} onChange={e=>update("additional_details",e.target.value)}/></Field>
    </div></div>
    <div className="form-section"><h3>3. Uso y pago</h3><div className="form-grid">
      <Field label="Tipo de uso"><select className="input" value={form.usage_type} onChange={e=>update("usage_type",e.target.value as FormState["usage_type"])}><option value="personal">Personal</option><option value="comercial">Comercial</option></select></Field>
      <Field label="Método de pago *"><select className="input" required value={form.payment_method} onChange={e=>update("payment_method",e.target.value)}><option value="">Selecciona</option>{PAYMENT_METHOD_OPTIONS.map(option=><option key={option}>{option}</option>)}</select></Field>
    </div>
    <label className="terms-check"><input type="checkbox" checked={form.terms_accepted} onChange={e=>update("terms_accepted",e.target.checked)}/><span>Leí y acepto los <Link href="/terminos" target="_blank">términos de servicio</Link>.</span></label></div>
    {error&&<p className="alert-error">{error}</p>}<button className="btn-primary submit-button" disabled={submitting}>{submitting?"Enviando...":"Enviar solicitud ♡"}</button>
  </form>;
}
function Field({label,wide=false,children}:{label:string;wide?:boolean;children:React.ReactNode}){return <label className={wide?"field wide":"field"}><span>{label}</span>{children}</label>}
