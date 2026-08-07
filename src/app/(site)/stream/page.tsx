import type { Metadata } from "next";
import StreamCommunity from "@/components/live/StreamCommunity";

export const metadata: Metadata = { title: "Stream y comunidad" };

export default function StreamPage() {
  return <div className="container-page page-shell"><header className="page-hero stream-hero"><p className="eyebrow">LA HUELLA DEL DIRECTO</p><h1>Stream & comunidad</h1><p>Regalos, corazones y personas que hicieron especial el directo. Los datos llegan desde TikFinity y se guardan en Supabase.</p></header><StreamCommunity /></div>;
}
