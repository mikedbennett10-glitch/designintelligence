import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

export interface SearchResult {
  type: "Room" | "Finish" | "Equipment" | "Furniture";
  code: string;
  name: string;
  href: string;
}

const RESULTS_PER_TABLE = 5;

// Quick "I already know what I'm looking for" lookup across the four
// item types a mobile visit is most likely to want (WBS: mobile-first
// top nav search). Goes through the request's own Supabase session, so
// results are scoped by RLS exactly like every other page — no separate
// access check needed here.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const supabase = await createClient();
    const like = `%${q}%`;

    const [rooms, finishes, equipment, furniture] = await Promise.all([
      supabase
        .from("rooms")
        .select("taxonomy_id, name")
        .or(`taxonomy_id.ilike.${like},name.ilike.${like}`)
        .limit(RESULTS_PER_TABLE),
      supabase
        .from("finishes")
        .select("code, product_type, manufacturer, product_name")
        .or(`code.ilike.${like},product_name.ilike.${like},manufacturer.ilike.${like}`)
        .limit(RESULTS_PER_TABLE),
      supabase
        .from("equipment")
        .select("taxonomy_id, name")
        .or(`taxonomy_id.ilike.${like},name.ilike.${like}`)
        .limit(RESULTS_PER_TABLE),
      supabase
        .from("furniture")
        .select("taxonomy_id, name")
        .or(`taxonomy_id.ilike.${like},name.ilike.${like}`)
        .limit(RESULTS_PER_TABLE),
    ]);

    type RoomRow = { taxonomy_id: string; name: string };
    type FinishRow = { code: string; product_type: string; manufacturer: string | null; product_name: string | null };
    type ItemRow = { taxonomy_id: string; name: string };

    const results: SearchResult[] = [
      ...((rooms.data ?? []) as RoomRow[]).map((r) => ({
        type: "Room" as const,
        code: r.taxonomy_id,
        name: r.name,
        href: `/ambulatory/rooms/${r.taxonomy_id}`,
      })),
      ...((finishes.data ?? []) as FinishRow[]).map((f) => ({
        type: "Finish" as const,
        code: f.code,
        name: [f.manufacturer, f.product_name].filter(Boolean).join(" — ") || f.product_type,
        href: `/finishes/${f.code}`,
      })),
      ...((equipment.data ?? []) as ItemRow[]).map((e) => ({
        type: "Equipment" as const,
        code: e.taxonomy_id,
        name: e.name,
        href: `/equipment/${e.taxonomy_id}`,
      })),
      ...((furniture.data ?? []) as ItemRow[]).map((f) => ({
        type: "Furniture" as const,
        code: f.taxonomy_id,
        name: f.name,
        href: `/furniture/${f.taxonomy_id}`,
      })),
    ];

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
