import { NextResponse } from "next/server";

// Server-side Procore API proxy. Procore is the system of record for all
// project data; DIP only ever reads it through this route, so
// PROCORE_CLIENT_ID / PROCORE_CLIENT_SECRET never reach the browser.
//
// Placeholder — implemented in a later commit.
export async function GET() {
  return NextResponse.json(
    { error: "Not implemented" },
    { status: 501 }
  );
}
