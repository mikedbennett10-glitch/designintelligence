"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { attemptSendNotification } from "@/lib/notifications";

export interface RetryResult {
  ok: boolean;
  message: string;
}

export async function retrySendNotification(notificationId: number): Promise<RetryResult> {
  const admin = await requireAdmin();
  if (!admin) {
    return { ok: false, message: "Administrators only." };
  }

  const result = await attemptSendNotification(notificationId);
  revalidatePath("/admin/notifications");

  return result.ok
    ? { ok: true, message: "Sent." }
    : { ok: false, message: result.error ?? "Send failed." };
}
