"use client";

import { useFormState } from "react-dom";

import { provisionExternalUser, type ProvisionResult } from "./actions";

export interface ProjectOption {
  id: number;
  procore_project_number: string;
}

const initialState: ProvisionResult | null = null;

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
  marginBottom: "0.3rem",
};

export default function ProvisionUserForm({ projects }: { projects: ProjectOption[] }) {
  const [state, formAction] = useFormState(provisionExternalUser, initialState);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label style={labelStyle} htmlFor="displayName">
          Full name
        </label>
        <input id="displayName" name="displayName" required style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle} htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" required style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle} htmlFor="organization">
          Firm / organization
        </label>
        <input id="organization" name="organization" style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle} htmlFor="tier">
          Access tier
        </label>
        <select id="tier" name="tier" required defaultValue="external_project" style={inputStyle}>
          <option value="external_project">External · Project (read + deviation submit)</option>
          <option value="external_review">External · Review (read + comments)</option>
          <option value="administrative">Administrative (full access)</option>
        </select>
      </div>

      <div>
        <label style={labelStyle} htmlFor="projectId">
          Project (optional)
        </label>
        <select id="projectId" name="projectId" defaultValue="" style={inputStyle}>
          <option value="">No project yet</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.procore_project_number}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle} htmlFor="procoreRole">
          Role on project
        </label>
        <input
          id="procoreRole"
          name="procoreRole"
          placeholder="e.g. Architect of Record"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="expiresInDays">
          Access expires in (days)
        </label>
        <input
          id="expiresInDays"
          name="expiresInDays"
          type="number"
          min={1}
          defaultValue={90}
          style={inputStyle}
        />
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
        Provision &amp; send invite
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
