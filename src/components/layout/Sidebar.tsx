"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const COLLAPSE_STORAGE_KEY = "dip-sidebar-collapsed";

export interface SidebarRoomItem {
  taxonomy_id: string;
  name: string;
  section: string;
}

// Matches DIP_WBS_v1.0.docx §2.1's five room-population work packages.
const ROOM_SECTION_ORDER = [
  "Clinic Planning",
  "Standard Rooms — Exam and Procedure",
  "Standard Rooms — Consult and Office",
  "Clinical Support Spaces",
  "Staff Support Spaces",
];

interface StaticNavItem {
  label: string;
  href?: string;
}

// WBS §2.3: whole-clinic plan-level content (its own 6 drawing types),
// not individual room taxonomy entries — no content model yet.
const PROTOTYPE_PLANS: StaticNavItem[] = [
  { label: "Standard Flow" },
  { label: "Convergent Flow" },
];

const GUIDELINES_AND_STANDARDS: StaticNavItem[] = [
  { label: "Finish Schedule", href: "/finishes" },
  { label: "Equipment Schedule", href: "/equipment" },
  { label: "Furniture / FF&E Schedule", href: "/furniture" },
  { label: "Code Reference", href: "/code-reference" },
];

const ABOUT_THIS_DOCUMENT: StaticNavItem[] = [
  { label: "Version History", href: "/version-history" },
  { label: "Training & Certifications", href: "/certifications" },
];

function groupRoomsBySection(rooms: SidebarRoomItem[]) {
  const bySection = new Map<string, SidebarRoomItem[]>();
  for (const room of rooms) {
    const list = bySection.get(room.section) ?? [];
    list.push(room);
    bySection.set(room.section, list);
  }

  const orderedSections = [
    ...ROOM_SECTION_ORDER.filter((s) => bySection.has(s)),
    ...Array.from(bySection.keys()).filter((s) => !ROOM_SECTION_ORDER.includes(s)),
  ];

  return orderedSections.map((section) => ({
    section,
    rooms: bySection.get(section) ?? [],
  }));
}

export default function Sidebar({ rooms }: { rooms: SidebarRoomItem[] }) {
  const pathname = usePathname();
  const groups = groupRoomsBySection(rooms);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Starts expanded on the server and every first client render, then syncs
  // from localStorage right after mount -- avoids a hydration mismatch,
  // at the cost of one visible frame at full width for a returning user
  // who had it collapsed.
  const [navCollapsed, setNavCollapsed] = useState(false);
  useEffect(() => {
    setNavCollapsed(localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true");
  }, []);

  function toggleNavCollapsed() {
    setNavCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next));
      return next;
    });
  }

  function toggleSection(section: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }

  if (navCollapsed) {
    return (
      <nav
        aria-label="Guidelines navigation (collapsed)"
        className="dip-sidebar"
        style={{
          width: "2.5rem",
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          background: "var(--surface)",
          height: "100%",
          padding: "1.25rem 0",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          onClick={toggleNavCollapsed}
          aria-label="Expand navigation"
          title="Expand navigation"
          style={{
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            cursor: "pointer",
            width: "1.75rem",
            height: "1.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted)",
            fontSize: "0.75rem",
          }}
        >
          &#9656;
        </button>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Guidelines navigation"
      className="dip-sidebar"
      style={{
        width: "var(--sidebar-width)",
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
        height: "100%",
        overflowY: "auto",
        padding: "1.25rem 0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "0 1.25rem",
          marginBottom: "0.75rem",
        }}
      >
        <button
          type="button"
          onClick={toggleNavCollapsed}
          aria-label="Collapse navigation"
          title="Collapse navigation"
          style={{
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            cursor: "pointer",
            width: "1.75rem",
            height: "1.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted)",
            fontSize: "0.75rem",
          }}
        >
          &#9666;
        </button>
      </div>

      <StaticGroup title="Prototype Plans" items={PROTOTYPE_PLANS} />

      {groups.map(({ section, rooms: sectionRooms }) => {
        const isOpen = !collapsed.has(section);
        return (
          <div key={section} style={{ marginBottom: "1.5rem" }}>
            <button
              type="button"
              onClick={() => toggleSection(section)}
              aria-expanded={isOpen}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                width: "100%",
                padding: "0 1.25rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: "0.5rem",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  transition: "transform 0.15s ease",
                  transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                  fontSize: "0.65rem",
                  flexShrink: 0,
                }}
              >
                &#9656;
              </span>
              <span style={{ textAlign: "left" }}>{section}</span>
            </button>
            {isOpen && (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {sectionRooms.map((room) => {
                  const href = `/ambulatory/rooms/${room.taxonomy_id}`;
                  const active = pathname === href;
                  return (
                    <li key={room.taxonomy_id}>
                      <Link
                        href={href}
                        style={{
                          display: "block",
                          padding: "0.4rem 1.25rem",
                          fontSize: "0.875rem",
                          color: active ? "var(--brand-blue-dk)" : "var(--text)",
                          background: active ? "var(--brand-blue-lt)" : "transparent",
                          borderLeft: active
                            ? "3px solid var(--brand-blue)"
                            : "3px solid transparent",
                          textDecoration: "none",
                        }}
                      >
                        {room.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}

      <StaticGroup title="Guidelines & Standards" items={GUIDELINES_AND_STANDARDS} />
      <StaticGroup title="About This Document" items={ABOUT_THIS_DOCUMENT} />
    </nav>
  );
}

function StaticGroup({ title, items }: { title: string; items: StaticNavItem[] }) {
  const pathname = usePathname();
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div
        style={{
          padding: "0 1.25rem",
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: "0.5rem",
        }}
      >
        {title}
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <Link
                href={item.href}
                style={{
                  display: "block",
                  padding: "0.4rem 1.25rem",
                  fontSize: "0.875rem",
                  color: pathname === item.href ? "var(--brand-blue-dk)" : "var(--text)",
                  background: pathname === item.href ? "var(--brand-blue-lt)" : "transparent",
                  borderLeft:
                    pathname === item.href
                      ? "3px solid var(--brand-blue)"
                      : "3px solid transparent",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                style={{
                  display: "block",
                  padding: "0.4rem 1.25rem",
                  fontSize: "0.875rem",
                  color: "var(--hint)",
                }}
                title="Not yet available"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
