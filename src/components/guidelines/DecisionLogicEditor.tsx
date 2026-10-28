"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import {
  deleteDecisionLogicItem,
  deleteOmissionItem,
  saveDecisionLogicItem,
  saveOmissionItem,
  type EditResult,
} from "@/app/(guidelines)/ambulatory/rooms/[taxonomyId]/edit-actions";
import type { RoomDecisionLogicItem, RoomIntentionalOmission } from "@/lib/types/rooms";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.65rem",
  borderRadius: "6px",
  border: "1px solid var(--border-strong)",
  fontSize: "0.85rem",
  boxSizing: "border-box",
  font: "inherit",
};

function SmallButton({
  children,
  onClick,
  type = "button",
  tone = "neutral",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  tone?: "neutral" | "pink";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={pending}
      style={{
        padding: "0.3rem 0.7rem",
        borderRadius: "6px",
        border: "1px solid " + (tone === "pink" ? "var(--brand-pink)" : "var(--border-strong)"),
        background: "var(--surface)",
        color: tone === "pink" ? "var(--brand-pink)" : "inherit",
        fontSize: "0.75rem",
        fontWeight: 600,
        cursor: pending ? "default" : "pointer",
        opacity: pending ? 0.7 : 1,
      }}
    >
      {children}
    </button>
  );
}

function DecisionLogicItemRow({
  taxonomyId,
  item,
}: {
  taxonomyId: string;
  item: RoomDecisionLogicItem;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useFormState(saveDecisionLogicItem.bind(null, taxonomyId), null as EditResult | null);

  useEffect(() => {
    if (state?.ok) setEditing(false);
  }, [state]);

  if (!editing) {
    return (
      <div style={{ marginBottom: "1rem" }}>
        {item.category && (
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-blue-dk)", marginBottom: "0.2rem" }}>
            {item.category}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
          <p style={{ margin: 0, flex: 1 }}>{item.content}</p>
          <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
            <button
              onClick={() => setEditing(true)}
              style={{ padding: "0.3rem 0.7rem", borderRadius: "6px", border: "1px solid var(--border-strong)", background: "var(--surface)", fontSize: "0.75rem", cursor: "pointer" }}
            >
              Edit
            </button>
            <button
              onClick={async () => {
                if (confirm("Delete this item?")) await deleteDecisionLogicItem(taxonomyId, item.id);
              }}
              style={{ padding: "0.3rem 0.7rem", borderRadius: "6px", border: "1px solid var(--brand-pink)", background: "var(--surface)", color: "var(--brand-pink)", fontSize: "0.75rem", cursor: "pointer" }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} style={{ marginBottom: "1rem", padding: "0.75rem", border: "1px solid var(--border)", borderRadius: "8px" }}>
      <input type="hidden" name="id" value={item.id} />
      <input name="category" defaultValue={item.category ?? ""} placeholder="Category (optional)" style={{ ...inputStyle, marginBottom: "0.5rem" }} />
      <textarea name="content" defaultValue={item.content} rows={3} required style={{ ...inputStyle, resize: "vertical", marginBottom: "0.5rem" }} />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <SmallButton type="submit">Save</SmallButton>
        <SmallButton onClick={() => setEditing(false)}>Cancel</SmallButton>
      </div>
    </form>
  );
}

function AddDecisionLogicForm({ taxonomyId }: { taxonomyId: string }) {
  const [adding, setAdding] = useState(false);
  const [state, formAction] = useFormState(saveDecisionLogicItem.bind(null, taxonomyId), null as EditResult | null);

  useEffect(() => {
    if (state?.ok) setAdding(false);
  }, [state]);

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        style={{ padding: "0.4rem 0.85rem", borderRadius: "6px", border: "1px solid var(--border-strong)", background: "var(--surface)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
      >
        + Add decision logic item
      </button>
    );
  }

  return (
    <form action={formAction} style={{ padding: "0.75rem", border: "1px solid var(--border)", borderRadius: "8px" }}>
      <input name="category" placeholder="Category (optional)" style={{ ...inputStyle, marginBottom: "0.5rem" }} />
      <textarea name="content" placeholder="Why it's designed this way…" rows={3} required style={{ ...inputStyle, resize: "vertical", marginBottom: "0.5rem" }} />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <SmallButton type="submit">Add</SmallButton>
        <SmallButton onClick={() => setAdding(false)}>Cancel</SmallButton>
      </div>
    </form>
  );
}

function OmissionItemRow({ taxonomyId, item }: { taxonomyId: string; item: RoomIntentionalOmission }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useFormState(saveOmissionItem.bind(null, taxonomyId), null as EditResult | null);

  useEffect(() => {
    if (state?.ok) setEditing(false);
  }, [state]);

  if (!editing) {
    return (
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: "0.15rem" }}>{item.item}</div>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>{item.rationale}</p>
          </div>
          <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
            <button
              onClick={() => setEditing(true)}
              style={{ padding: "0.3rem 0.7rem", borderRadius: "6px", border: "1px solid var(--border-strong)", background: "var(--surface)", fontSize: "0.75rem", cursor: "pointer" }}
            >
              Edit
            </button>
            <button
              onClick={async () => {
                if (confirm("Delete this item?")) await deleteOmissionItem(taxonomyId, item.id);
              }}
              style={{ padding: "0.3rem 0.7rem", borderRadius: "6px", border: "1px solid var(--brand-pink)", background: "var(--surface)", color: "var(--brand-pink)", fontSize: "0.75rem", cursor: "pointer" }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} style={{ marginBottom: "1rem", padding: "0.75rem", border: "1px solid var(--border)", borderRadius: "8px" }}>
      <input type="hidden" name="id" value={item.id} />
      <input name="item" defaultValue={item.item} placeholder="What was omitted" required style={{ ...inputStyle, marginBottom: "0.5rem" }} />
      <textarea name="rationale" defaultValue={item.rationale} rows={3} required style={{ ...inputStyle, resize: "vertical", marginBottom: "0.5rem" }} />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <SmallButton type="submit">Save</SmallButton>
        <SmallButton onClick={() => setEditing(false)}>Cancel</SmallButton>
      </div>
    </form>
  );
}

function AddOmissionForm({ taxonomyId }: { taxonomyId: string }) {
  const [adding, setAdding] = useState(false);
  const [state, formAction] = useFormState(saveOmissionItem.bind(null, taxonomyId), null as EditResult | null);

  useEffect(() => {
    if (state?.ok) setAdding(false);
  }, [state]);

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        style={{ padding: "0.4rem 0.85rem", borderRadius: "6px", border: "1px solid var(--border-strong)", background: "var(--surface)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
      >
        + Add intentional omission
      </button>
    );
  }

  return (
    <form action={formAction} style={{ padding: "0.75rem", border: "1px solid var(--border)", borderRadius: "8px" }}>
      <input name="item" placeholder="What was omitted" required style={{ ...inputStyle, marginBottom: "0.5rem" }} />
      <textarea name="rationale" placeholder="Why it was left out…" rows={3} required style={{ ...inputStyle, resize: "vertical", marginBottom: "0.5rem" }} />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <SmallButton type="submit">Add</SmallButton>
        <SmallButton onClick={() => setAdding(false)}>Cancel</SmallButton>
      </div>
    </form>
  );
}

export default function DecisionLogicEditor({
  taxonomyId,
  decisionLogic,
  omissions,
  canEdit,
}: {
  taxonomyId: string;
  decisionLogic: RoomDecisionLogicItem[];
  omissions: RoomIntentionalOmission[];
  canEdit: boolean;
}) {
  return (
    <div>
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Why it&apos;s designed this way</h2>
        {decisionLogic.length === 0 ? (
          <p style={{ color: "var(--hint)", fontStyle: "italic" }}>No decision logic recorded yet.</p>
        ) : (
          decisionLogic.map((d) =>
            canEdit ? (
              <DecisionLogicItemRow key={d.id} taxonomyId={taxonomyId} item={d} />
            ) : (
              <div key={d.id} style={{ marginBottom: "1rem" }}>
                {d.category && (
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--brand-blue-dk)", marginBottom: "0.2rem" }}>
                    {d.category}
                  </div>
                )}
                <p style={{ margin: 0 }}>{d.content}</p>
              </div>
            )
          )
        )}
        {canEdit && (
          <div style={{ marginTop: "0.75rem" }}>
            <AddDecisionLogicForm taxonomyId={taxonomyId} />
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Intentionally omitted</h2>
        {omissions.length === 0 ? (
          <p style={{ color: "var(--hint)", fontStyle: "italic" }}>
            Nothing recorded as intentionally omitted for this room.
          </p>
        ) : (
          omissions.map((o) =>
            canEdit ? (
              <OmissionItemRow key={o.id} taxonomyId={taxonomyId} item={o} />
            ) : (
              <div key={o.id} style={{ marginBottom: "1rem" }}>
                <div style={{ fontWeight: 600, marginBottom: "0.15rem" }}>{o.item}</div>
                <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>{o.rationale}</p>
              </div>
            )
          )
        )}
        {canEdit && (
          <div style={{ marginTop: "0.75rem" }}>
            <AddOmissionForm taxonomyId={taxonomyId} />
          </div>
        )}
      </section>
    </div>
  );
}
