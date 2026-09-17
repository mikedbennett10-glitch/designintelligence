import Link from "next/link";
import { notFound } from "next/navigation";

import ProductImageGallery from "@/components/guidelines/ProductImageGallery";
import { ProductExternalLinks, ProductFacts, UsedInRooms } from "@/components/guidelines/ProductMeta";
import { getFinishByCode } from "@/lib/repository";
import { listProductImages } from "@/lib/productImages";

export default async function FinishDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  let finish: Awaited<ReturnType<typeof getFinishByCode>> = null;
  let images: string[] = [];
  let loadError: string | null = null;

  try {
    finish = await getFinishByCode(code);
    if (finish) images = await listProductImages("finishes", code);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load this finish.";
  }

  if (loadError) {
    return (
      <div
        style={{
          padding: "1rem 1.25rem",
          background: "var(--brand-pink-lt)",
          border: "1px solid var(--brand-pink)",
          borderRadius: "6px",
          fontSize: "0.875rem",
        }}
      >
        Couldn&apos;t load finish {code}: {loadError}
      </div>
    );
  }

  if (!finish) notFound();

  return (
    <div>
      <Link href="/finishes" style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
        ← Finishes Repository
      </Link>

      <header style={{ margin: "0.75rem 0 1.5rem" }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.35rem" }}>
          {finish.code}
        </div>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>
          {[finish.manufacturer, finish.product_name].filter(Boolean).join(" — ") || finish.product_type}
        </h1>
        <p style={{ margin: 0, color: "var(--muted)" }}>{finish.description}</p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        <ProductImageGallery images={images} alt={finish.product_name ?? finish.code} />

        <div>
          <ProductFacts
            facts={[
              { label: "Product type", value: finish.product_type },
              { label: "Manufacturer", value: finish.manufacturer },
              { label: "Product number", value: finish.product_number },
              { label: "Color", value: finish.color },
              { label: "Dimensions", value: finish.dimensions },
              { label: "Scope", value: finish.guideline_scope },
              { label: "Installation notes", value: finish.installation_notes },
              { label: "Sustainability", value: finish.sustainability },
            ]}
          />
          <ProductExternalLinks productUrl={finish.product_url} />
          <UsedInRooms rooms={finish.usedInRooms} />
        </div>
      </div>
    </div>
  );
}
