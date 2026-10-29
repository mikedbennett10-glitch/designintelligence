"use server";

import { createClient } from "@/lib/supabase/server";

export interface MyNotification {
  id: number;
  notification_type: string;
  subject: string;
  created_at: string;
  read_at: string | null;
  project_id: number | null;
}

/** The signed-in user's own notifications (RLS: recipient_email = their email). */
export async function getMyNotifications(): Promise<MyNotification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, notification_type, subject, created_at, read_at, project_id")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return [];
  return (data ?? []) as MyNotification[];
}

/** Marks one of the signed-in user's own notifications as read. RLS (recipient_email = their email) scopes this to their own rows; only read_at is ever written. */
export async function markNotificationRead(id: number): Promise<void> {
  const supabase = await createClient();
  const table = supabase.from("notifications") as unknown as {
    update: (values: Record<string, unknown>) => {
      eq: (col: string, val: unknown) => Promise<{ error: unknown }>;
    };
  };
  await table.update({ read_at: new Date().toISOString() }).eq("id", id);
}
