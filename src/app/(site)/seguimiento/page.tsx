import type { Metadata } from "next";
import TrackingClient from "@/components/TrackingClient";

export const metadata: Metadata = {
  title: "Seguir mi pedido",
};

export default async function SeguimientoPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <div className="container-page py-14">
      <div className="max-w-xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-extrabold mb-3">Seguir mi pedido</h1>
        <p className="text-[var(--muted)]">
          Introduce el código privado que recibiste al enviar tu solicitud
          para ver en qué etapa va tu comisión.
        </p>
      </div>
      <TrackingClient initialCode={code} />
    </div>
  );
}
