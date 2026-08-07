import type { Metadata } from "next";
import GalleryExplorer from "@/components/GalleryExplorer";
import { getPortfolioItems } from "@/lib/portfolioData";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Galería" };

export default async function GalleryPage() {
  const items = await getPortfolioItems();
  return (
    <div className="container-page page-shell">
      <header className="page-hero"><p className="eyebrow">DIBUJOS, DISEÑOS Y ANIMACIONES</p><h1>Galería de Piumi</h1><p>Filtra por tipo, acabado o tema. Cada etiqueta funciona como una pequeña puerta secreta.</p></header>
      <GalleryExplorer items={items} />
    </div>
  );
}
