import type { Metadata } from "next";
import Link from "next/link";
import CommissionRequestForm from "@/components/CommissionRequestForm";
import FormattedContent from "@/components/FormattedContent";
import PricingCatalog from "@/components/PricingCatalog";
import PublicCommissionQueue from "@/components/PublicCommissionQueue";
import { getCommissionTypes, getPriceSettings } from "@/lib/portfolioData";
import { getPublishedTerms } from "@/lib/siteContent";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Comisiones"};

export default async function CommissionsPage(){
  const [types,prices,terms]=await Promise.all([getCommissionTypes(),getPriceSettings(),getPublishedTerms()]);
  return <div className="container-page page-shell commissions-page"><header className="page-hero"><p className="eyebrow">ARTE HECHO PARA TI</p><h1>Comisiones</h1><p>Consulta precios, envía tu idea y sigue el proceso con un código privado.</p><div className="hero-actions"><a href="#solicitar" className="btn-primary">Solicitar comisión</a><Link href="/seguimiento" className="btn-secondary">Consultar mi pedido</Link></div></header>
    <section id="precios" className="content-section"><div className="section-heading"><div><p className="eyebrow">PRECIOS EDITABLES</p><h2>Tabla de servicios</h2></div></div><PricingCatalog prices={prices}/><p className="section-note">Los precios son base y pueden cambiar por complejidad, uso comercial, personajes adicionales o entrega urgente.</p></section>
    <section id="kanban" className="content-section"><div className="section-heading"><div><p className="eyebrow">FILA PÚBLICA</p><h2>Vista de comisiones</h2><p>Solo mostramos códigos parciales y etapas. Los datos del cliente permanecen privados.</p></div></div><PublicCommissionQueue/></section>
    <section id="solicitar" className="content-section"><div className="section-heading"><div><p className="eyebrow">CUÉNTAME TU IDEA</p><h2>Formulario de solicitud</h2></div></div><CommissionRequestForm commissionTypes={types}/></section>
    <section id="terminos" className="content-section terms-preview"><div className="section-heading"><div><p className="eyebrow">ANTES DE ENVIAR</p><h2>{terms.title}</h2><p>Versión {terms.version}{terms.publishedAt?` · publicada el ${new Date(terms.publishedAt).toLocaleDateString("es-MX")}`:""}</p></div><Link href="/terminos" className="btn-secondary">Abrir página completa</Link></div><FormattedContent content={terms.content}/></section>
  </div>
}
