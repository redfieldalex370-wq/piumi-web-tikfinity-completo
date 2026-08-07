"use client";
import { useEffect, useState } from "react";
import { STAGE_LABELS, type CommissionStage } from "@/types/commission";

interface QueueItem { id:string; code:string; title:string; type:string; status:CommissionStage; updatedAt:string }

export default function PublicCommissionQueue() {
  const [items,setItems]=useState<QueueItem[]>([]);
  useEffect(()=>{fetch("/api/commissions/queue").then(r=>r.ok?r.json():Promise.reject()).then(d=>setItems(d.items||[])).catch(()=>undefined)},[]);
  return <div className="public-queue">{items.length ? items.map(item=><article key={item.id}><div><span className="queue-code">{item.code}</span><h3>{item.title}</h3><p>{item.type}</p></div><span className={`queue-stage stage-${item.status}`}>{STAGE_LABELS[item.status]}</span></article>) : <div className="empty-state compact"><p>No hay comisiones públicas activas en este momento.</p></div>}</div>;
}
