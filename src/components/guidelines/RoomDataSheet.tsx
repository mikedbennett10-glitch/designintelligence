"use client";

import { useState } from "react";

import DecisionLogicEditor from "@/components/guidelines/DecisionLogicEditor";
import DrawingViewer from "@/components/guidelines/DrawingViewer";
import OverviewEditor from "@/components/guidelines/OverviewEditor";
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

const TABS = ["Overview", "Decision Logic", "FFE", "Drawings", "Version History"] as const;
type Tab = (typeof TABS)[number];

function Badge({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "pink" | "neutral";
}) {
  const styles = {
    blue: { bg: "var(--brand-blue-lt)", fg: "var(--brand-blue-dk)" },
    pink: { bg: "var(--brand-pink-lt)", fg: "var(--brand-pink)" },
    neutral: { bg: "var(--brand-charcoal-lt)", fg: "var(--muted)" },
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
  actions,
  canEdit = false,
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
  actions?: React.ReactNode;
  canEdit?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("Overview");

  return (
    <div>
      <header style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
          <div>
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
          </div>
          {actions && (
            <div
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              {actions}
            </div>
          )}
        </div>
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
                borderBottom: active ? "2px solid var(--brand-blue)" : "2px solid transparent",
                color: active ? "var(--brand-blue-dk)" : "var(--muted)",
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

      {tab === "Overview" && <OverviewEditor room={room} canEdit={canEdit} />}

      {tab === "Decision Logic" && (
        <DecisionLogicEditor
          taxonomyId={room.taxonomy_id}
          decisionLogic={decisionLogic}
          omissions={omissions}
          canEdit={canEdit}
        />
      )}

      {tab === "FFE" && (
        <SpecPanel finishes={finishes} equipment={equipment} furniture={furniture} />
      )}

      {tab === "Drawings" && (
        <DrawingViewer
          drawings={drawings}
          axonType={room.axon_type}
          expectedTypes={room.expected_drawing_types}
          equipment={equipment}
          furniture={furniture}
        />
      )}

      {tab === "Version History" && <VersionHistory entries={versionHistory} />}
    </div>
  );
}
