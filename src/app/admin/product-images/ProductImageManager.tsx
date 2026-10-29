"use client";

import { useEffect, useState, useTransition } from "react";
import { useFormState } from "react-dom";

import {
  deleteProductImage,
  getProductImages,
  uploadProductImage,
  type ActionResult,
  type ItemType,
  type ProductImageItem,
} from "./actions";

const inputStyle: React.CSSProperties = {
  padding: "0.55rem 0.7rem",
  borderRadius: "6px",
  border: "1px solid var(--border-strong)",
  fontSize: "0.9rem",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 700,
  letterSpacing: "0.02em",
  color: "var(--muted)",
  marginBottom: "0.35rem",
};

const initialUploadState: ActionResult | null = null;

export default function ProductImageManager({
  initialItemType,
  initialItemKey,
}: {
  initialItemType: ItemType;
  initialItemKey: string;
}) {
  const [itemType, setItemType] = useState<ItemType>(initialItemType);
  const [itemKey, setItemKey] = useState(initialItemKey);
  const [images, setImages] = useState<ProductImageItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [uploadState, uploadAction] = useFormState(uploadProductImage, initialUploadState);

  function loadImages(type: ItemType, key: string) {
    const trimmed = key.trim();
    if (!trimmed) {
      setImages([]);
      setLoaded(false);
      return;
    }
    startTransition(async () => {
      const rows = await getProductImages(type, trimmed);
      setImages(rows);
      setLoaded(true);
    });
  }

  useEffect(() => {
    if (initialItemKey) loadImages(initialItemType, initialItemKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (uploadState?.ok) {
      loadImages(itemType, itemKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadState]);

  async function handleDelete(path: string) {
    if (!confirm("Remove this image?")) return;
    setDeleteError(null);
    const result = await deleteProductImage(itemType, itemKey, path);
    if (!result.ok) {
      setDeleteError(result.message);
      return;
    }
    loadImages(itemType, itemKey);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label style={labelStyle} htmlFor="itemType">
            Item type
          </label>
          <select
            id="itemType"
            value={itemType}
            onChange={(e) => setItemType(e.target.value as ItemType)}
            style={inputStyle}
          >
            <option value="finishes">Finish</option>
            <option value="equipment">Equipment</option>
            <option value="furniture">Furniture</option>
          </select>
        </div>
        <div style={{ flex: "1 1 200px" }}>
          <label style={labelStyle} htmlFor="itemKey">
            {itemType === "finishes" ? "Finish code (e.g. ACT-2)" : "Taxonomy ID"}
          </label>
          <input
            id="itemKey"
            value={itemKey}
            onChange={(e) => setItemKey(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
          />
        </div>
        <button
          type="button"
          onClick={() => loadImages(itemType, itemKey)}
          disabled={isPending || !itemKey.trim()}
          style={{
            padding: "0.55rem 1rem",
            borderRadius: "6px",
            border: "1px solid var(--border-strong)",
            background: "var(--surface)",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: isPending ? "default" : "pointer",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? "Loading…" : "Load images"}
        </button>
      </div>

      {loaded && (
        <div>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.5rem" }}>
            CURRENT IMAGES ({images.length})
          </div>
          {images.length === 0 ? (
            <p style={{ color: "var(--hint)", fontStyle: "italic", fontSize: "0.85rem" }}>
              No images yet for {itemType}/{itemKey}.
            </p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {images.map((img) => (
                <div
                  key={img.path}
                  style={{
                    width: "120px",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    background: "var(--surface)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.name} style={{ width: "100%", height: "90px", objectFit: "cover", display: "block" }} />
                  <div style={{ padding: "0.4rem 0.5rem" }}>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginBottom: "0.35rem",
                      }}
                      title={img.name}
                    >
                      {img.name}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(img.path)}
                      style={{
                        width: "100%",
                        padding: "0.25rem 0",
                        borderRadius: "4px",
                        border: "1px solid var(--border-strong)",
                        background: "var(--surface)",
                        color: "var(--brand-pink)",
                        fontSize: "0.72rem",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {deleteError && (
            <p style={{ color: "var(--brand-pink)", fontSize: "0.82rem", marginTop: "0.5rem" }}>{deleteError}</p>
          )}
        </div>
      )}

      <form
        action={uploadAction}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          paddingTop: "1rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--muted)" }}>UPLOAD A NEW IMAGE</div>
        <input type="hidden" name="itemType" value={itemType} />
        <input type="hidden" name="itemKey" value={itemKey} />

        <div>
          <label style={labelStyle} htmlFor="orderPrefix">
            Display order (optional, 01 = first)
          </label>
          <input id="orderPrefix" name="orderPrefix" placeholder="01" style={{ ...inputStyle, width: "100px" }} />
        </div>

        <div>
          <label style={labelStyle} htmlFor="file">
            Image file
          </label>
          <input id="file" name="file" type="file" accept="image/*" required style={inputStyle} />
        </div>

        <button
          type="submit"
          disabled={!itemKey.trim()}
          style={{
            alignSelf: "flex-start",
            padding: "0.6rem 1.1rem",
            borderRadius: "6px",
            border: "none",
            background: "var(--brand-blue)",
            color: "#fff",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: itemKey.trim() ? "pointer" : "default",
            opacity: itemKey.trim() ? 1 : 0.6,
          }}
        >
          Upload
        </button>

        {uploadState && (
          <p
            style={{
              fontSize: "0.85rem",
              padding: "0.65rem 0.85rem",
              borderRadius: "6px",
              background: uploadState.ok ? "var(--brand-blue-lt)" : "var(--brand-pink-lt)",
              color: uploadState.ok ? "var(--brand-blue-dk)" : "var(--brand-pink)",
            }}
          >
            {uploadState.message}
          </p>
        )}
      </form>
    </div>
  );
}
