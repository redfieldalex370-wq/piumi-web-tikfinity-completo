import type { Metadata } from "next";
import "./globals.css";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Piumi";

export const metadata: Metadata = {
  title: { default: `${SITE_NAME} · VTuber, arte y comunidad`, template: `%s · ${SITE_NAME}` },
  description: "Página oficial de Piumi: streams, comunidad, galería y comisiones con seguimiento en línea.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
