import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
export async function GET(){
  const {data,error}=await getSupabaseServerClient().from("commissions").select("id,tracking_code,public_alias,character_name,commission_type_label,status,updated_at").eq("show_in_public_queue",true).not("status","in",'("entregado","cancelado")').order("created_at",{ascending:true}).limit(30);
  if(error)return NextResponse.json({error:"No se pudo cargar la fila."},{status:500});
  return NextResponse.json({items:(data||[]).map(row=>({id:row.id,code:`Pedido • ${String(row.tracking_code||"").slice(-4)}`,title:row.public_alias||row.character_name||"Comisión",type:row.commission_type_label||"Comisión",status:row.status,updatedAt:row.updated_at}))});
}
