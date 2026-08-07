import "server-only";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin/session";

/**
 * Segunda capa de seguridad (además del Proxy) para las rutas del
 * admin: cada Route Handler vuelve a verificar la sesión antes de
 * tocar la base de datos, siguiendo la recomendación oficial de
 * Next.js de no confiar únicamente en el Proxy para autorización.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}
