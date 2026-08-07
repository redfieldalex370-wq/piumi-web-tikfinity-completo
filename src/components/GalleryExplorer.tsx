"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { PortfolioItem } from "@/types/commission";

export default function GalleryExplorer({ items }: { items: PortfolioItem[] }) {
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const tags = useMemo(() => ["Todos", ...Array.from(new Set(items.flatMap((item) => item.tags))).sort()], [items]);
  const visible = useMemo(() => items.filter((item) => {
    const tagMatch = filter === "Todos" || item.tags.includes(filter);
    const query = search.trim().toLowerCase();
    const searchMatch = !query || `${item.title} ${item.description || ""} ${item.tags.join(" ")}`.toLowerCase().includes(query);
    return tagMatch && searchMatch;
  }), [filter, items, search]);

  return (
    <>
      <div className="gallery-controls">
        <div className="filter-chips">{tags.map((tag) => <button key={tag} className={filter === tag ? "active" : ""} onClick={() => setFilter(tag)}>{tag}</button>)}</div>
        <input className="input gallery-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar dibujo o etiqueta..." />
      </div>
      <div className="gallery-grid">
        {visible.map((item) => (
          <article key={item.id} className="gallery-item">
            <div className="gallery-item-image"><Image src={item.thumbnail_url || item.image_url} alt={item.title} fill unoptimized className="object-cover" /></div>
            <div className="gallery-item-copy">
              <h2>{item.title}</h2>
              {item.description && <p>{item.description}</p>}
              <div className="portfolio-tags">{item.tags.map((tag) => <button key={tag} onClick={() => setFilter(tag)}>#{tag}</button>)}</div>
              {item.artist_name && <p className="artist-credit">Arte: {item.artist_url ? <a href={item.artist_url} target="_blank" rel="noreferrer">{item.artist_name}</a> : item.artist_name}</p>}
            </div>
          </article>
        ))}
      </div>
      {visible.length === 0 && <div className="empty-state"><h2>No encontramos dibujos con ese filtro</h2><p>Prueba otra etiqueta. La galería se nos escondió detrás de una nube rosa.</p></div>}
    </>
  );
}
