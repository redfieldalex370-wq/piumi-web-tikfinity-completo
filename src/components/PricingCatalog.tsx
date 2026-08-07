import type { PriceSetting } from "@/types/commission";

function formatPrice(price: PriceSetting) {
  const formatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: price.currency || "MXN", maximumFractionDigits: 2 });
  if (price.price_to != null && price.price_to !== price.price_from) return `${formatter.format(price.price_from)} – ${formatter.format(price.price_to)}`;
  return formatter.format(price.price_from);
}

export default function PricingCatalog({ prices }: { prices: PriceSetting[] }) {
  const groups = Object.entries(prices.reduce<Record<string, PriceSetting[]>>((acc, price) => {
    (acc[price.category] ||= []).push(price);
    return acc;
  }, {}));
  return <div className="pricing-catalog">{groups.map(([category, rows]) => <section className="pricing-category" key={category}><h3>{category}</h3><div>{rows.map((price) => <article key={price.id}><div><b>{price.style}</b>{price.description && <p>{price.description}</p>}</div><strong>{formatPrice(price)}</strong></article>)}</div></section>)}</div>;
}
