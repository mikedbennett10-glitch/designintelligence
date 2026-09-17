"use client";

import { useState } from "react";

export default function ProductImageGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "260px",
          background: "var(--brand-charcoal-lt)",
          border: "1px dashed var(--border-strong)",
          borderRadius: "8px",
          color: "var(--hint)",
          fontSize: "0.85rem",
        }}
      >
        No images on file yet
      </div>
    );
  }

  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element -- Storage public-bucket URLs, not a local/optimizable asset */}
      <img
        src={images[active]}
        alt={alt}
        style={{
          width: "100%",
          maxHeight: "420px",
          objectFit: "contain",
          borderRadius: "8px",
          border: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      />
      {images.length > 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              style={{
                padding: 0,
                border: i === active ? "2px solid var(--brand-blue)" : "1px solid var(--border)",
                borderRadius: "6px",
                overflow: "hidden",
                cursor: "pointer",
                background: "none",
                width: "64px",
                height: "64px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail of a Storage public-bucket URL */}
              <img
                src={src}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
