import Link from "next/link";
import { notFound } from "next/navigation";

import ProductImageGallery from "@/components/guidelines/ProductImageGallery";
import { ProductExternalLinks, ProductFacts, UsedInRooms } from "@/components/guidelines/ProductMeta";
import { getEquipmentByTaxonomyId } from "@/lib/repository";
import { listProductImages } from "@/lib/productImages";

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ taxonomyId: string }>;
}) {
  const { taxonomyId } = await params;

  let equipment: Awaited<ReturnType<typeof getEquipmentByTaxonomyId>> = null;
  let images: string[] = [];
  let loadError: string | null = null;

  try {
    equipment = await getEquipmentByTaxonomyId(taxonomyId);
    if (equipment) images = await listProductImages("equipment", taxonomyId);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load this equipment item.";
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
        Couldn&apos;t load equipment {taxonomyId}: {loadError}
      </div>
    );
  }

  if (!equipment) notFound();

  return (
    <div>
      <Link href="/equipment" style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
        ← Equipment Repository
      </Link>

      <header style={{ margin: "0.75rem 0 1.5rem" }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.35rem" }}>
          {equipment.taxonomy_id}
        </div>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>{equipment.name}</h1>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        <ProductImageGallery images={images} alt={equipment.name} />

        <div>
          <ProductFacts
            facts={[
              { label: "Category", value: equipment.category },
              { label: "Manufacturer", value: equipment.manufacturer },
              { label: "Model", value: equipment.model },
              { label: "Responsibility", value: equipment.responsibility },
              { label: "Dimensions", value: equipment.dimensions },
              { label: "Power requirements", value: equipment.power_requirements },
              { label: "Notes", value: equipment.notes },
            ]}
          />
          <ProductExternalLinks productUrl={equipment.product_url} revitModelUrl={equipment.revit_model_url} />
          <UsedInRooms rooms={equipment.usedInRooms} />
        </div>
      </div>
    </div>
  );
}
