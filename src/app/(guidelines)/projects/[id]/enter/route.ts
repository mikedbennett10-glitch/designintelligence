import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { PROJECT_CONTEXT_COOKIE } from "@/lib/projectContext";

// Switches the signed-in user into Project mode (WBS 6.4.1) for this
// project. RLS still governs what they can actually see under it — this
// route just remembers which project they picked.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  cookieStore.set(PROJECT_CONTEXT_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return NextResponse.redirect(new URL("/ambulatory", request.url));
}
