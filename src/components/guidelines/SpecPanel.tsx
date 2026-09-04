import type {
  RoomEquipmentWithDetail,
  RoomFinishWithDetail,
  RoomFurnitureWithDetail,
} from "@/lib/types/rooms";

const th: React.CSSProperties = {
  textAlign: "left",
  fontSize: "0.72rem",
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "var(--muted)",
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid var(--border)",
};

const td: React.CSSProperties = {
  padding: "0.6rem 0.75rem",
  borderBottom: "1px solid var(--border)",
  fontSize: "0.875rem",
  verticalAlign: "top",
};

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ ...td, color: "var(--hint)", fontStyle: "italic" }}>
        {label}
      </td>
    </tr>
  );
}

function SectionTable({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <h3
        style={{
          fontSize: "0.95rem",
          fontWeight: 700,
          marginBottom: "0.6rem",
        }}
      >
        {title}
      </h3>
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "8px",
          overflow: "hidden",
          background: "var(--surface)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>{children}</table>
      </div>
    </div>
  );
}

export default function SpecPanel({
  finishes,
  equipment,
  furniture,
}: {
  finishes: RoomFinishWithDetail[];
  equipment: RoomEquipmentWithDetail[];
  furniture: RoomFurnitureWithDetail[];
}) {
  return (
    <div>
      <SectionTable title={`Finishes (${finishes.length})`}>
        <thead>
          <tr>
            <th style={th}>Location</th>
            <th style={th}>Code</th>
            <th style={th}>Product</th>
            <th style={th}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {finishes.length === 0 ? (
            <EmptyRow colSpan={4} label="No finishes assigned yet." />
          ) : (
            finishes.map((rf) => (
              <tr key={rf.id}>
                <td style={td}>{rf.location}</td>
                <td style={{ ...td, fontFamily: "monospace" }}>{rf.finish_code}</td>
                <td style={td}>
                  {rf.finish
                    ? [rf.finish.product_type, rf.finish.product_name, rf.finish.color]
                        .filter(Boolean)
                        .join(" · ")
                    : "—"}
                </td>
                <td style={{ ...td, color: "var(--muted)" }}>{rf.notes ?? ""}</td>
              </tr>
            ))
          )}
        </tbody>
      </SectionTable>

      <SectionTable title={`Equipment (${equipment.length})`}>
        <thead>
          <tr>
            <th style={th}>Qty</th>
            <th style={th}>Item</th>
            <th style={th}>Responsibility</th>
            <th style={th}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {equipment.length === 0 ? (
            <EmptyRow colSpan={4} label="No equipment assigned yet." />
          ) : (
            equipment.map((re) => (
              <tr key={re.id}>
                <td style={td}>{re.quantity}</td>
                <td style={td}>{re.equipment?.name ?? re.equipment_id}</td>
                <td style={{ ...td, color: "var(--muted)" }}>
                  {re.equipment?.responsibility ?? ""}
                </td>
                <td style={{ ...td, color: "var(--muted)" }}>{re.notes ?? ""}</td>
              </tr>
            ))
          )}
        </tbody>
      </SectionTable>

      <SectionTable title={`Furniture (${furniture.length})`}>
        <thead>
          <tr>
            <th style={th}>Qty</th>
            <th style={th}>Item</th>
            <th style={th}>Responsibility</th>
            <th style={th}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {furniture.length === 0 ? (
            <EmptyRow colSpan={4} label="No furniture assigned yet." />
          ) : (
            furniture.map((rf) => (
              <tr key={rf.id}>
                <td style={td}>{rf.quantity}</td>
                <td style={td}>{rf.furniture?.name ?? rf.furniture_id}</td>
                <td style={{ ...td, color: "var(--muted)" }}>
                  {rf.furniture?.responsibility ?? ""}
                </td>
                <td style={{ ...td, color: "var(--muted)" }}>{rf.notes ?? ""}</td>
              </tr>
            ))
          )}
        </tbody>
      </SectionTable>
    </div>
  );
}
