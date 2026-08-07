export const COMMISSION_STAGES = [
  "solicitud",
  "revisando",
  "cotizacion",
  "esperando_pago",
  "boceto",
  "esperando_aprobacion",
  "en_proceso",
  "detalles_finales",
  "terminado",
  "entregado",
  "cancelado",
] as const;

export type CommissionStage = (typeof COMMISSION_STAGES)[number];

export const STAGE_LABELS: Record<CommissionStage, string> = {
  solicitud: "Solicitud",
  revisando: "Revisando",
  cotizacion: "Cotización",
  esperando_pago: "Esperando pago",
  boceto: "Boceto",
  esperando_aprobacion: "Esperando aprobación",
  en_proceso: "En proceso",
  detalles_finales: "Detalles finales",
  terminado: "Terminada",
  entregado: "Entregada",
  cancelado: "Cancelada",
};

export const STAGE_DESCRIPTIONS: Record<CommissionStage, string> = {
  solicitud: "La solicitud fue recibida y entró a la fila.",
  revisando: "Se están revisando referencias, alcance y disponibilidad.",
  cotizacion: "La cotización está siendo preparada o confirmada.",
  esperando_pago: "La comisión está lista para continuar cuando se confirme el pago acordado.",
  boceto: "Se está preparando el primer boceto.",
  esperando_aprobacion: "El boceto espera comentarios o aprobación del cliente.",
  en_proceso: "La ilustración está en producción.",
  detalles_finales: "Se están afinando color, luces y últimos detalles.",
  terminado: "La pieza está terminada y pasa por revisión final.",
  entregado: "El archivo final ya fue entregado.",
  cancelado: "La solicitud fue cancelada.",
};

export type UsageType = "personal" | "comercial";

export interface PriceSetting {
  id: string;
  category: string;
  style: string;
  description: string | null;
  price_from: number;
  price_to: number | null;
  currency: string;
  image_url: string | null;
  active: boolean;
  sort_order: number;
}

export type CommissionType = PriceSetting & {
  name: string;
};

export interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  thumbnail_url?: string | null;
  artist_name?: string | null;
  artist_url?: string | null;
  featured: boolean;
  active: boolean;
  sort_order: number;
  tags: string[];
}

export interface ProgressNote {
  id: string;
  commission_id: string;
  note: string;
  image_url: string | null;
  visible_to_client: boolean;
  created_at: string;
}

export interface Commission {
  id: string;
  tracking_code: string;
  client_name: string;
  client_email: string;
  client_contact: string | null;
  tiktok_username: string | null;
  commission_type_id: string | null;
  commission_type_label: string;
  character_name: string;
  character_description: string | null;
  reference_urls: string[];
  pose_description: string | null;
  usage_type: UsageType;
  payment_method: string;
  additional_details: string | null;
  estimated_price: number | null;
  quoted_price: number | null;
  paid_amount: number;
  currency: string;
  deadline: string | null;
  priority: "baja" | "normal" | "alta" | "urgente";
  source: string;
  platform: string | null;
  show_in_public_queue: boolean;
  public_alias: string | null;
  terms_accepted: boolean;
  terms_accepted_at: string | null;
  terms_version: string;
  status: CommissionStage;
  created_at: string;
  updated_at: string;
}
