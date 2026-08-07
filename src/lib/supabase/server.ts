import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase para usar SOLO en el servidor (Route Handlers,
 * Server Components, Server Actions). Usa la Service Role Key, que
 * tiene permisos totales y NUNCA debe llegar al navegador.
 *
 * No lo importes desde ningún archivo marcado con "use client".
 */
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. " +
        "Revisa tu archivo .env.local (copia .env.example como base)."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
