import { requireAdmin } from "@/lib/auth";

import ProductImageManager from "./ProductImageManager";

export default async function AdminProductImagesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; key?: string }>;
}) {
  const admin = await requireAdmin();
  const { type, key } = await searchParams;

  if (!admin) {
    return (
      <div>
        <h1 style={{ fontSize: "1.25rem" }}>Administrators only</h1>
        <p style={{ color: "var(--muted)" }}>You need administrative access to manage product images.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>Product images</h1>
      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        Upload or remove photos for a finish, equipment, or furniture item. Files appear on that
        item&apos;s product page automatically, in filename order.
      </p>
      <ProductImageManager
        initialItemType={type === "equipment" || type === "furniture" ? type : "finishes"}
        initialItemKey={key ?? ""}
      />
    </div>
  );
}
