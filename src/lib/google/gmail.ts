import { google } from "googleapis";

export interface SendEmailResult {
  ok: boolean;
  error?: string;
}

/**
 * Sends via the Gmail API using a Google Cloud service account with
 * domain-wide delegation, impersonating a shared Workspace mailbox (the
 * "subject" on the JWT). This requires IT to approve and
 * configure domain-wide delegation for the service account in the
 * Workspace admin console — until that happens and the three env vars
 * below are set, this fails soft (returns ok: false with a clear reason)
 * rather than throwing, so the notification queue just accumulates
 * pending rows instead of crashing whatever triggered the send.
 *
 * Required env vars once IT approves:
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL     - the service account's client email
 *   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY - its private key (PEM, \n-escaped
 *                                        if stored as a single-line env var)
 *   GOOGLE_WORKSPACE_SENDER_EMAIL    - the shared mailbox to send as,
 *                                      e.g. dip-notifications@example.org
 */
function getGmailClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const senderEmail = process.env.GOOGLE_WORKSPACE_SENDER_EMAIL;

  if (!clientEmail || !rawKey || !senderEmail) return null;

  const privateKey = rawKey.replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/gmail.send"],
    subject: senderEmail,
  });

  return { gmail: google.gmail({ version: "v1", auth }), senderEmail };
}

function buildRawMessage(from: string, to: string, subject: string, body: string): string {
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].join("\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendEmail(to: string, subject: string, body: string): Promise<SendEmailResult> {
  const client = getGmailClient();
  if (!client) {
    return {
      ok: false,
      error:
        "Google Workspace integration isn't configured yet (pending IT approval of domain-wide delegation).",
    };
  }

  try {
    const raw = buildRawMessage(client.senderEmail, to, subject, body);
    await client.gmail.users.messages.send({ userId: "me", requestBody: { raw } });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown Gmail API error." };
  }
}
