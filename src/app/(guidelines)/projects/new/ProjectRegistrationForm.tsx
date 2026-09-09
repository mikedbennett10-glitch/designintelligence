"use client";

import { useFormState } from "react-dom";

import { createProject, type CreateProjectResult } from "./actions";

export interface RoomOption {
  taxonomy_id: string;
  name: string;
  section: string;
}

const initialState: CreateProjectResult | null = null;

const inputStyle: React.CSSProperties = {
  width: "100%",
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
  marginBottom: "0.4rem",
};

export default function ProjectRegistrationForm({ rooms }: { rooms: RoomOption[] }) {
  const [state, formAction] = useFormState(createProject, initialState);

  const bySection = new Map<string, RoomOption[]>();
  for (const room of rooms) {
    const list = bySection.get(room.section) ?? [];
    list.push(room);
    bySection.set(room.section, list);
  }

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <label style={labelStyle} htmlFor="procoreProjectNumber">
          Procore project number
        </label>
        <input id="procoreProjectNumber" name="procoreProjectNumber" required style={inputStyle} />
      </div>

      <div>
        <span style={labelStyle}>Guideline type</span>
        <div style={{ display: "flex", gap: "1.25rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem" }}>
            <input type="checkbox" name="guidelineTypes" value="AMBULATORY" defaultChecked />
            Ambulatory
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem" }}>
            <input type="checkbox" name="guidelineTypes" value="ACUTE" />
            Acute
          </label>
        </div>
      </div>

      <div>
        <span style={labelStyle}>Room types in scope</span>
        <div
          style={{
            maxHeight: "280px",
            overflowY: "auto",
            border: "1px solid var(--border-strong)",
            borderRadius: "6px",
            padding: "0.75rem",
          }}
        >
          {Array.from(bySection.entries()).map(([section, sectionRooms]) => (
            <div key={section} style={{ marginBottom: "0.75rem" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.3rem" }}>
                {section}
              </div>
              {sectionRooms.map((room) => (
                <label
                  key={room.taxonomy_id}
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", padding: "0.15rem 0" }}
                >
                  <input type="checkbox" name="roomTypesInScope" value={room.taxonomy_id} />
                  {room.name}
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        style={{
          padding: "0.65rem 1rem",
          borderRadius: "6px",
          border: "none",
          background: "var(--csh-blue)",
          color: "#fff",
          fontSize: "0.9rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Register project
      </button>

      {state && (
        <p
          style={{
            fontSize: "0.85rem",
            padding: "0.75rem 1rem",
            borderRadius: "6px",
            background: state.ok ? "var(--csh-blue-lt)" : "var(--csh-pink-lt)",
            color: state.ok ? "var(--csh-blue-dk)" : "var(--csh-pink)",
          }}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
