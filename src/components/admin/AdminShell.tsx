"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS=[
  ["/admin","Resumen","⌂"],
  ["/admin/stream","Stream","◉"],
  ["/admin/galeria","Galería","▧"],
  ["/admin/comisiones","Comisiones","▤"],
  ["/admin/precios","Precios","$"],
  ["/admin/terminos","Términos","≡"],
  ["/admin/configuracion","Configuración","⚙"],
] as const;
export default function AdminShell({title,description,children,actions}:{title:string;description?:string;children:React.ReactNode;actions?:React.ReactNode}){
  const path=usePathname(),router=useRouter();
  async function logout(){await fetch("/api/admin/logout",{method:"POST"});router.push("/admin/login");router.refresh()}
  return <div className="admin-layout"><aside className="admin-sidebar"><Link href="/" className="admin-brand">Piumi<span>✦</span><small>ADMIN</small></Link><nav>{LINKS.map(([href,label,icon])=><Link key={href} href={href} className={path===href?"active":""}><span>{icon}</span>{label}</Link>)}</nav><button onClick={logout}>Cerrar sesión</button></aside><main className="admin-main"><header className="admin-page-header"><div><p className="eyebrow">PANEL DE CONTROL</p><h1>{title}</h1>{description&&<p>{description}</p>}</div>{actions&&<div className="admin-actions">{actions}</div>}</header>{children}</main></div>
}
