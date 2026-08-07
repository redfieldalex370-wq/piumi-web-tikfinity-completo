import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/verify";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { DEFAULT_SITE_SETTINGS, sanitizeSettings } from "@/lib/siteSettings";
export async function GET(){if(!(await isAdminAuthenticated()))return NextResponse.json({error:"No autorizado"},{status:401});const{data,error}=await getSupabaseServerClient().from("site_settings").select("content").eq("key","general").maybeSingle();if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({settings:sanitizeSettings(data?.content||DEFAULT_SITE_SETTINGS)})}
export async function PUT(request:NextRequest){if(!(await isAdminAuthenticated()))return NextResponse.json({error:"No autorizado"},{status:401});const settings=sanitizeSettings(await request.json().catch(()=>null));const{error}=await getSupabaseServerClient().from("site_settings").upsert({key:"general",content:settings});if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({ok:true,settings})}
