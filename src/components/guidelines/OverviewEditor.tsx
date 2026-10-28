"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { updateRoomOverview, type EditResult } from "@/app/(guidelines)/ambulatory/rooms/[taxonomyId]/edit-actions";
import type { Room } from "@/lib/types/rooms";

const MEP_FIELDS: { key: keyof Room; label: string }[] = [
  { key: "mep_lighting", label: "Lighting" },
  { key: "mep_hvac", label: "HVAC" },
  { key: "mep_plumbing", label: "Plumbing" },
  { key: "mep_power_data", label: "Power / Data" },
  { key: "mep_security", label: "Security" },
  { key: "mep_av", label: "AV" },
  { key: "mep_acoustic", label: "Acoustic" },
  { key: "mep_nurse_call", label: "Nurse Call" },
  { key: "mep_notes", label: "Additional Notes" },
];

function Fact({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.15rem" }}>
        {label}
      </div>
      <div style={{ fontSize: "0.9rem" }}>{value}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.65rem",
  borderRadius: "6px",
  border: "1px solid var(--border-strong)",
  fontSize: "0.85rem",
  boxSizing: "border-box",
  font: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.72rem",
  fontWeight: 700,
  color: "var(--muted)",
  marginBottom: "0.25rem",
};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: "0.5rem 1rem",
        borderRadius: "6px",
        border: "none",
        background: "var(--brand-blue)",
        color: "#fff",
        fontSize: "0.85rem",
        fontWeight: 600,
        cursor: pending ? "default" : "pointer",
        opacity: pending ? 0.7 : 1,
      }}
    >
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export default function OverviewEditor({ room, canEdit }: { room: Room; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const initialState: EditResult | null = null;
  const [state, formAction] = useFormState(updateRoomOverview.bind(null, room.taxonomy_id), initialState);

  useEffect(() => {
    if (state?.ok) setEditing(false);
  }, [state]);

  const mepEntries = MEP_FIELDS.filter(({ key }) => Boolean(room[key]));

  if (!editing) {
    return (
      <div>
        {canEdit && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.75rem" }}>
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: "6px",
                border: "1px solid var(--border-strong)",
                background: "var(--surface)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Edit Overview
            </button>
          </div>
        )}

        {room.description && (
          <p style={{ maxWidth: "70ch", marginBottom: "1.5rem", lineHeight: 1.6 }}>{room.description}</p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <Fact label="Zone" value={room.zone} />
          <Fact label="Same-handed" value={room.same_handed ? "Yes" : "No"} />
          <Fact label="Ratio" value={room.ratio_note} />
          <Fact label="Size" value={room.size_display} />
          <Fact label="Area" value={room.size_area_sf ? `${room.size_area_sf} SF` : null} />
          <Fact label="Sizing note" value={room.size_notes} />
        </div>

        {mepEntries.length > 0 && (
          <>
            <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>MEP / Systems</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
              }}
            >
              {mepEntries.map(({ key, label }) => (
                <Fact key={key} label={label} value={room[key] as string} />
              ))}
            </div>
          </>
        )}

        {(room.adjacency_labels?.length ?? 0) > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Adjacencies</h2>
            <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
              {room.adjacency_labels?.map((label, i) => (
                <li key={i} style={{ marginBottom: "0.25rem" }}>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <form action={formAction}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1rem", margin: 0 }}>Editing Overview</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => setEditing(false)}
            style={{
              padding: "0.5rem 0.9rem",
              borderRadius: "6px",
              border: "1px solid var(--border-strong)",
              background: "var(--surface)",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <SaveButton />
        </div>
      </div>

      {state && !state.ok && (
        <p
          style={{
            fontSize: "0.82rem",
            padding: "0.6rem 0.85rem",
            borderRadius: "6px",
            background: "var(--brand-pink-lt)",
            color: "var(--brand-pink)",
            marginBottom: "1rem",
          }}
        >
          {state.message}
        </p>
      )}

      <div style={{ marginBottom: "1.25rem" }}>
        <label style={labelStyle} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={room.description ?? ""}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.25rem",
        }}
      >
        <div>
          <label style={labelStyle} htmlFor="size_display">
            Size
          </label>
          <input id="size_display" name="size_display" defaultValue={room.size_display ?? ""} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle} htmlFor="size_area_sf">
            Area (SF)
          </label>
          <input
            id="size_area_sf"
            name="size_area_sf"
            type="number"
            defaultValue={room.size_area_sf ?? ""}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="ratio_note">
            Ratio
          </label>
          <input id="ratio_note" name="ratio_note" defaultValue={room.ratio_note ?? ""} style={inputStyle} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "0.5rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}>
            <input type="checkbox" name="same_handed" defaultChecked={room.same_handed} />
            Same-handed
          </label>
        </div>
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <label style={labelStyle} htmlFor="size_notes">
          Sizing note
        </label>
        <textarea
          id="size_notes"
          name="size_notes"
          rows={2}
          defaultValue={room.size_notes ?? ""}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={labelStyle} htmlFor="adjacency_labels">
          Adjacencies (one per line)
        </label>
        <textarea
          id="adjacency_labels"
          name="adjacency_labels"
          rows={4}
          defaultValue={(room.adjacency_labels ?? []).join("\n")}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <h3 style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>MEP / Systems</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
        }}
      >
        {MEP_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <label style={labelStyle} htmlFor={key}>
              {label}
            </label>
            <textarea
              id={key}
              name={key}
              rows={2}
              defaultValue={(room[key] as string) ?? ""}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
        ))}
      </div>
    </form>
  );
}
