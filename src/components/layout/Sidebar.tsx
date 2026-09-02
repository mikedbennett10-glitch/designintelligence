"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarRoomItem {
  taxonomy_id: string;
  name: string;
  section: string;
}

const ROOM_SECTION_ORDER = [
  "Prototype Plans",
  "Clinic Planning",
  "Standard Rooms",
  "Specialty / Ancillary Rooms",
];

interface StaticNavItem {
  label: string;
  href?: string;
}

const GUIDELINES_AND_STANDARDS: StaticNavItem[] = [
  { label: "Finish Schedule" },
  { label: "Equipment Schedule" },
];

const ABOUT_THIS_DOCUMENT: StaticNavItem[] = [{ label: "Version History" }];

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

  return (
    <nav
      aria-label="Guidelines navigation"
      style={{
        width: "var(--sidebar-width)",
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
        height: "calc(100vh - var(--header-height))",
        overflowY: "auto",
        padding: "1.25rem 0",
      }}
    >
      {groups.map(({ section, rooms: sectionRooms }) => (
        <div key={section} style={{ marginBottom: "1.5rem" }}>
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
            {section}
          </div>
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
                      color: active ? "var(--csh-blue-dk)" : "var(--text)",
                      background: active ? "var(--csh-blue-lt)" : "transparent",
                      borderLeft: active
                        ? "3px solid var(--csh-blue)"
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
        </div>
      ))}

      <StaticGroup title="Guidelines & Standards" items={GUIDELINES_AND_STANDARDS} />
      <StaticGroup title="About This Document" items={ABOUT_THIS_DOCUMENT} />
    </nav>
  );
}

function StaticGroup({ title, items }: { title: string; items: StaticNavItem[] }) {
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
                  color: "var(--text)",
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
