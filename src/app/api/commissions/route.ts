import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { generateTrackingCode } from "@/lib/trackingCode";
import { getPublishedTerms } from "@/lib/siteContent";

interface Payload {client_name:string;client_email:string;client_contact?:string;tiktok_username?:string;commission_type_id?:string;commission_type_label:string;character_name:string;character_description?:string;reference_urls?:string[];pose_description?:string;usage_type:"personal"|"comercial";payment_method:string;additional_details?:string;terms_accepted:boolean}
function valid(value:unknown):value is Payload{if(!value||typeof value!=="object")return false;const body=value as Record<string,unknown>;return typeof body.client_name==="string"&&body.client_name.trim().length>1&&typeof body.client_email==="string"&&/^\S+@\S+\.\S+$/.test(body.client_email)&&typeof body.commission_type_label==="string"&&body.commission_type_label.trim().length>0&&typeof body.character_name==="string"&&body.character_name.trim().length>0&&(body.usage_type==="personal"||body.usage_type==="comercial")&&typeof body.payment_method==="string"&&body.payment_method.trim().length>0&&body.terms_accepted===true}
export async function POST(request:NextRequest){
  const body=await request.json().catch(()=>null);if(!valid(body))return NextResponse.json({error:"Revisa los campos obligatorios y la aceptación de términos."},{status:400});
  const supabase=getSupabaseServerClient();let tracking=generateTrackingCode();for(let i=0;i<5;i++){const{data}=await supabase.from("commissions").select("id").eq("tracking_code",tracking).maybeSingle();if(!data)break;tracking=generateTrackingCode()}
  const terms=await getPublishedTerms();
  const {data,error}=await supabase.from("commissions").insert({tracking_code:tracking,client_name:body.client_name.trim(),client_email:body.client_email.trim().toLowerCase(),client_contact:body.client_contact?.trim()||null,tiktok_username:body.tiktok_username?.trim().replace(/^@/,"")||null,commission_type_id:body.commission_type_id||null,commission_type_label:body.commission_type_label.trim(),character_name:body.character_name.trim(),character_description:body.character_description?.trim()||null,reference_urls:(body.reference_urls||[]).slice(0,20),pose_description:body.pose_description?.trim()||null,usage_type:body.usage_type,payment_method:body.payment_method.trim(),additional_details:body.additional_details?.trim()||null,source:"web",platform:"sitio",show_in_public_queue:true,terms_accepted:true,terms_accepted_at:new Date().toISOString(),terms_version:terms.version,status:"solicitud"}).select("tracking_code").single();
  if(error){console.error(error);return NextResponse.json({error:"No se pudo guardar la solicitud. Revisa la migración de Supabase."},{status:500})}
  return NextResponse.json({tracking_code:data.tracking_code},{status:201});
}
