import Header, { type HeaderUser } from "@/components/layout/Header";
import Sidebar, { type SidebarRoomItem } from "@/components/layout/Sidebar";
import { createClient } from "@/lib/supabase/server";

async function getSidebarRooms(): Promise<SidebarRoomItem[]> {
  // Sidebar nav only ever needs the Ambulatory room list today (Acute has
  // no rooms yet). Fails soft to an empty list — e.g. before Supabase env
  // vars are configured, or before a signed-in user exists for RLS to
  // resolve — rather than breaking the whole guidelines shell.
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("rooms")
      .select("taxonomy_id, name, section, sort_order")
      .eq("guideline_type", "AMBULATORY")
      .order("section")
      .order("sort_order");

    if (error) throw error;
    return (data ?? []) as SidebarRoomItem[];
  } catch {
    return [];
  }
}

async function getCurrentUser(): Promise<HeaderUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser?.email) return null;

    const { data: profile } = await supabase
      .from("users")
      .select("email, display_name, tier")
      .eq("email", authUser.email)
      .single();

    const row = profile as { email: string; display_name: string; tier: string } | null;
    if (!row) return null;

    return { email: row.email, displayName: row.display_name, tier: row.tier };
  } catch {
    return null;
  }
}

export default async function GuidelinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [rooms, user] = await Promise.all([getSidebarRooms(), getCurrentUser()]);

  return (
    <div>
      <Header user={user} />
      <div style={{ display: "flex" }}>
        <Sidebar rooms={rooms} />
        <main style={{ flex: 1, minWidth: 0, padding: "2rem" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
