// Sube este número (o cambia el texto) cada vez que edites de forma
// importante los Términos de servicio. El valor se guarda junto con
// cada comisión nueva, así sabes bajo qué versión aceptó cada cliente.
export const TERMS_VERSION = "v1";

export const USAGE_TYPE_OPTIONS = [
  { value: "personal", label: "Uso personal" },
  { value: "comercial", label: "Uso comercial" },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  "Transferencia bancaria",
  "PayPal",
  "Otro (especificar en detalles adicionales)",
];
