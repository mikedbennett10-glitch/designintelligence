import { sendEmail } from "@/lib/google/gmail";
import { createClient } from "@/lib/supabase/server";

export interface NotificationRow {
  id: number;
  notification_type: "edition_change" | "deviation_decision";
  project_id: number | null;
  room_taxonomy_id: string | null;
  deviation_id: number | null;
  recipient_email: string;
  subject: string;
  body: string;
  status: "pending" | "sent" | "failed";
  error_message: string | null;
  created_at: string;
  sent_at: string | null;
}

/**
 * Attempts to send one queued notification via Gmail and records the
 * result. Runs under the caller's own (admin) session — notifications'
 * admin_manage_notifications RLS policy (is_admin(), FOR ALL) enforces
 * who can update the row.
 */
export async function attemptSendNotification(id: number): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();

  const rowTable = supabase.from("notifications") as unknown as {
    select: (cols: string) => {
      eq: (col: string, val: unknown) => {
        single: () => Promise<{ data: NotificationRow | null; error: { message: string } | null }>;
      };
    };
  };
  const { data: row, error: fetchError } = await rowTable.select("*").eq("id", id).single();
  if (fetchError || !row) {
    return { ok: false, error: fetchError?.message ?? "Notification not found." };
  }

  const result = await sendEmail(row.recipient_email, row.subject, row.body);

  const updateTable = supabase.from("notifications") as unknown as {
    update: (values: Record<string, unknown>) => {
      eq: (col: string, val: unknown) => Promise<{ error: { message: string } | null }>;
    };
  };
  await updateTable
    .update(
      result.ok
        ? { status: "sent", sent_at: new Date().toISOString(), error_message: null }
        : { status: "failed", error_message: result.error }
    )
    .eq("id", id);

  return result;
}

/**
 * Enqueues a notification tied to a deviation decision (WBS 7.2.2 — the
 * requester is notified of the outcome). Edition-change notifications
 * are enqueued automatically by the enqueue_edition_change_notifications
 * DB trigger; this is the one notification type with no natural DB
 * trigger point (a deviation UPDATE doesn't by itself imply "notify the
 * submitter" the way a room content change does), so it's enqueued
 * app-side instead.
 */
export async function enqueueDeviationDecisionNotification(params: {
  deviationId: number;
  recipientEmail: string;
  subject: string;
  body: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const table = supabase.from("notifications") as unknown as {
    insert: (values: Record<string, unknown>) => {
      select: (cols: string) => {
        single: () => Promise<{ data: { id: number } | null; error: { message: string } | null }>;
      };
    };
  };

  const { data, error } = await table
    .insert({
      notification_type: "deviation_decision",
      deviation_id: params.deviationId,
      recipient_email: params.recipientEmail,
      subject: params.subject,
      body: params.body,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Couldn't enqueue the notification." };
  }

  // Best-effort immediate send attempt; if Gmail isn't configured yet
  // (or the send fails), the row just stays queued at /admin/notifications.
  await attemptSendNotification(data.id);
  return { ok: true };
}
