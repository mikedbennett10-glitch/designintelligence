"use client";

import { useState } from "react";

import DrawingViewer from "@/components/guidelines/DrawingViewer";
import SpecPanel from "@/components/guidelines/SpecPanel";
import VersionHistory, {
  type VersionHistoryEntry,
} from "@/components/guidelines/VersionHistory";
import type {
  Room,
  RoomDecisionLogicItem,
  RoomDrawing,
  RoomEquipmentWithDetail,
  RoomFinishWithDetail,
  RoomFurnitureWithDetail,
  RoomIntentionalOmission,
} from "@/lib/types/rooms";

const TABS = ["Overview", "Decision Logic", "Specification", "Drawings", "Version History"] as const;
type Tab = (typeof TABS)[number];

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

function Badge({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "pink" | "neutral";
}) {
  const styles = {
    blue: { bg: "var(--csh-blue-lt)", fg: "var(--csh-blue-dk)" },
    pink: { bg: "var(--csh-pink-lt)", fg: "var(--csh-pink)" },
    neutral: { bg: "var(--csh-charcoal-lt)", fg: "var(--muted)" },
  }[tone];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.2rem 0.65rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        background: styles.bg,
        color: styles.fg,
      }}
    >
      {children}
    </span>
  );
}

export default function RoomDataSheet({
  room,
  editionName,
  decisionLogic,
  omissions,
  finishes,
  equipment,
  furniture,
  drawings,
  versionHistory,
}: {
  room: Room;
  editionName: string;
  decisionLogic: RoomDecisionLogicItem[];
  omissions: RoomIntentionalOmission[];
  finishes: RoomFinishWithDetail[];
  equipment: RoomEquipmentWithDetail[];
  furniture: RoomFurnitureWithDetail[];
  drawings: RoomDrawing[];
  versionHistory: VersionHistoryEntry[];
}) {
  const [tab, setTab] = useState<Tab>("Overview");
  const mepEntries = MEP_FIELDS.filter(({ key }) => Boolean(room[key]));

  return (
    <div>
      <header style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: "0.8rem",
            color: "var(--muted)",
            marginBottom: "0.35rem",
          }}
        >
          {room.taxonomy_id}
        </div>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>{room.name}</h1>
        {room.subtitle && (
          <p style={{ margin: "0 0 0.75rem", color: "var(--muted)" }}>{room.subtitle}</p>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          <Badge tone="blue">{room.zone}</Badge>
          <Badge tone="neutral">{room.section}</Badge>
          {room.same_handed && <Badge tone="neutral">Same-handed</Badge>}
          {room.size_display && <Badge tone="neutral">{room.size_display}</Badge>}
          {!room.is_published && <Badge tone="pink">Unpublished</Badge>}
          <span style={{ fontSize: "0.8rem", color: "var(--hint)", marginLeft: "0.25rem" }}>
            Current as of {editionName}
          </span>
        </div>
      </header>

      <nav
        style={{
          display: "flex",
          gap: "0.25rem",
          borderBottom: "1px solid var(--border)",
          marginBottom: "1.5rem",
        }}
        role="tablist"
      >
        {TABS.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t)}
              style={{
                appearance: "none",
                background: "none",
                border: "none",
                borderBottom: active ? "2px solid var(--csh-blue)" : "2px solid transparent",
                color: active ? "var(--csh-blue-dk)" : "var(--muted)",
                fontWeight: active ? 700 : 500,
                fontSize: "0.875rem",
                padding: "0.6rem 0.9rem",
                cursor: "pointer",
              }}
            >
              {t}
            </button>
          );
        })}
      </nav>

      {tab === "Overview" && (
        <div>
          {room.description && (
            <p style={{ maxWidth: "70ch", marginBottom: "1.5rem", lineHeight: 1.6 }}>
              {room.description}
            </p>
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
            <Fact
              label="Area"
              value={room.size_area_sf ? `${room.size_area_sf} SF` : null}
            />
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
      )}

      {tab === "Decision Logic" && (
        <div>
          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Why it&apos;s designed this way</h2>
            {decisionLogic.length === 0 ? (
              <p style={{ color: "var(--hint)", fontStyle: "italic" }}>
                No decision logic recorded yet.
              </p>
            ) : (
              decisionLogic.map((d) => (
                <div key={d.id} style={{ marginBottom: "1rem" }}>
                  {d.category && (
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--csh-blue-dk)", marginBottom: "0.2rem" }}>
                      {d.category}
                    </div>
                  )}
                  <p style={{ margin: 0 }}>{d.content}</p>
                </div>
              ))
            )}
          </section>
          <section>
            <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Intentionally omitted</h2>
            {omissions.length === 0 ? (
              <p style={{ color: "var(--hint)", fontStyle: "italic" }}>
                Nothing recorded as intentionally omitted for this room.
              </p>
            ) : (
              omissions.map((o) => (
                <div key={o.id} style={{ marginBottom: "1rem" }}>
                  <div style={{ fontWeight: 600, marginBottom: "0.15rem" }}>{o.item}</div>
                  <p style={{ margin: 0, color: "var(--muted)" }}>{o.rationale}</p>
                </div>
              ))
            )}
          </section>
        </div>
      )}

      {tab === "Specification" && (
        <SpecPanel finishes={finishes} equipment={equipment} furniture={furniture} />
      )}

      {tab === "Drawings" && <DrawingViewer drawings={drawings} axonType={room.axon_type} />}

      {tab === "Version History" && <VersionHistory entries={versionHistory} />}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <div
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: "0.2rem",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "0.9rem" }}>{value}</div>
    </div>
  );
}
