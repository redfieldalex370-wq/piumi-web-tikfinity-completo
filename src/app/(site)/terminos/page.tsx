import type { Metadata } from "next";
import FormattedContent from "@/components/FormattedContent";
import { getPublishedTerms } from "@/lib/siteContent";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Términos de servicio"};
export default async function TermsPage(){const terms=await getPublishedTerms();return <div className="container-page page-shell narrow-page"><header className="page-hero"><p className="eyebrow">VERSIÓN {terms.version}</p><h1>{terms.title}</h1><p>{terms.publishedAt?`Publicados el ${new Date(terms.publishedAt).toLocaleDateString("es-MX",{year:"numeric",month:"long",day:"numeric"})}`:"Contenido de respaldo"}</p></header><article className="formatted-card"><FormattedContent content={terms.content}/></article></div>}
