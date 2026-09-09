import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { PROJECT_CONTEXT_COOKIE } from "@/lib/projectContext";

// Returns to Reference mode.
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete(PROJECT_CONTEXT_COOKIE);
  const referer = request.headers.get("referer");
  return NextResponse.redirect(referer ?? new URL("/ambulatory", request.url));
}
