"use client";

import { useEffect, useState } from "react";
import StageTracker from "@/components/StageTracker";
import type { CommissionStage } from "@/types/commission";

interface TrackedCommission {
  tracking_code: string;
  character_name: string;
  commission_type_label: string;
  status: CommissionStage;
  created_at: string;
  updated_at: string;
}

interface TrackedNote {
  id: string;
  note: string;
  image_url: string | null;
  created_at: string;
}

export default function TrackingClient({
  initialCode,
}: {
  initialCode?: string;
}) {
  const [code, setCode] = useState(initialCode ?? "");
  // Si llegamos con ?code= en la URL, arrancamos ya "cargando" para que
  // el efecto de montaje no necesite hacer setState de forma síncrona.
  const [loading, setLoading] = useState(() => Boolean(initialCode));
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    commission: TrackedCommission;
    notes: TrackedNote[];
  } | null>(null);

  // Usa una cadena de promesas (en vez de async/await) para que todo el
  // setState quede dentro de callbacks (.then/.catch/.finally) y así
  // pueda llamarse directamente desde el efecto de montaje sin disparar
  // "setState síncrono dentro de un efecto".
  function fetchTracking(codeToLookup: string) {
    fetch(`/api/track?code=${encodeURIComponent(codeToLookup.trim())}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setError(data.error || "No se encontró tu comisión.");
          setResult(null);
          return;
        }
        setResult(data);
        setError(null);
      })
      .catch(() => {
        setError("No se pudo conectar con el servidor. Intenta de nuevo.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // Usado por el formulario: aquí sí es seguro hacer setState de forma
  // síncrona porque se dispara desde un evento del usuario.
  function lookup(codeToLookup: string) {
    if (!codeToLookup.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    fetchTracking(codeToLookup);
  }

  // Auto-lookup si llegamos con ?code= en la URL.
  useEffect(() => {
    if (initialCode) {
      fetchTracking(initialCode);
    }
  }, [initialCode]);

  return (
    <div className="max-w-xl mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup(code);
        }}
        className="card p-6 flex flex-col sm:flex-row gap-3 mb-8"
      >
        <input
          className="input font-mono uppercase"
          placeholder="PIU-2026-XXXX"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="submit" className="btn-primary sm:w-auto w-full" disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error && (
        <p className="alert-error mb-6">
          {error}
        </p>
      )}

      {result && (
        <div className="space-y-8">
          <div className="card p-6">
            <p className="text-xs text-[var(--muted)] uppercase tracking-wide font-semibold mb-1">
              {result.commission.commission_type_label}
            </p>
            <h2 className="text-xl font-bold mb-1">
              {result.commission.character_name}
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Código: <span className="font-mono">{result.commission.tracking_code}</span>
            </p>
          </div>

          <div className="card p-6">
            <h3 className="font-bold mb-6">Progreso</h3>
            <StageTracker currentStage={result.commission.status} />
          </div>

          {result.notes.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold mb-4">Notas de progreso</h3>
              <ul className="space-y-4">
                {result.notes.map((note) => (
                  <li key={note.id} className="border-l-2 border-[var(--accent)] pl-4">
                    <p className="text-sm text-[var(--muted)] mb-1">
                      {new Date(note.created_at).toLocaleString("es-MX")}
                    </p>
                    <p>{note.note}</p>
                    {note.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={note.image_url}
                        alt="Actualización de progreso"
                        className="mt-2 rounded-lg max-h-64 object-contain"
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
