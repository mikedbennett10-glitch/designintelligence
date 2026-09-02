import { NextResponse } from "next/server";

// Server-side Anthropic API proxy for the Consultant Wizard and Spec Builder.
// Called server-side only — ANTHROPIC_API_KEY never reaches the browser.
//
// Placeholder — implemented in a later commit.
export async function POST() {
  return NextResponse.json(
    { error: "Not implemented" },
    { status: 501 }
  );
}
