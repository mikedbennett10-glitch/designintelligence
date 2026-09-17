import Link from "next/link";
import { notFound } from "next/navigation";

import ProductImageGallery from "@/components/guidelines/ProductImageGallery";
import { ProductExternalLinks, ProductFacts, UsedInRooms } from "@/components/guidelines/ProductMeta";
import { getFurnitureByTaxonomyId } from "@/lib/repository";
import { listProductImages } from "@/lib/productImages";

export default async function FurnitureDetailPage({
  params,
}: {
  params: Promise<{ taxonomyId: string }>;
}) {
  const { taxonomyId } = await params;

  let furniture: Awaited<ReturnType<typeof getFurnitureByTaxonomyId>> = null;
  let images: string[] = [];
  let loadError: string | null = null;

  try {
    furniture = await getFurnitureByTaxonomyId(taxonomyId);
    if (furniture) images = await listProductImages("furniture", taxonomyId);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unable to load this furniture item.";
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
        Couldn&apos;t load furniture {taxonomyId}: {loadError}
      </div>
    );
  }

  if (!furniture) notFound();

  return (
    <div>
      <Link href="/furniture" style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
        ← Furniture Repository
      </Link>

      <header style={{ margin: "0.75rem 0 1.5rem" }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.35rem" }}>
          {furniture.taxonomy_id}
        </div>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>{furniture.name}</h1>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        <ProductImageGallery images={images} alt={furniture.name} />

        <div>
          <ProductFacts
            facts={[
              { label: "Category", value: furniture.category },
              { label: "Subcategory", value: furniture.subcategory },
              { label: "Manufacturer", value: furniture.manufacturer },
              { label: "Model", value: furniture.model },
              { label: "Dimensions", value: furniture.dimensions },
              { label: "Weight capacity", value: furniture.weight_capacity },
              { label: "Frame finish", value: furniture.frame_finish },
              { label: "Upholstery spec", value: furniture.upholstery_spec },
              { label: "Responsibility", value: furniture.responsibility },
              { label: "Location", value: furniture.location },
              { label: "Notes", value: furniture.notes },
            ]}
          />
          <ProductExternalLinks productUrl={furniture.product_url} revitModelUrl={furniture.revit_model_url} />
          <UsedInRooms rooms={furniture.usedInRooms} />
        </div>
      </div>
    </div>
  );
}
